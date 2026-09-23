#!/bin/bash
# Builds a double-clickable standalone macOS app (+ .dmg) for people who
# don't want to install Node.js or use npm — everything's embedded.
#
# The app is a menu bar utility, not a Dock app: a small native Swift
# launcher (packaging/MenuBarApp.swift) is the actual CFBundleExecutable —
# it shows an icon in the menu bar, spawns the real Node server as a child
# process, opens the dashboard in the default browser once it's ready, and
# offers "Open Dashboard" / "Quit" from a right-click menu. (A bare Node
# binary standing in as CFBundleExecutable never registers with the window
# server, so LaunchServices treats it as a hung app — endless Dock bounce,
# then "Not Responding" — even though the server itself is fine. A real
# AppKit app with a run loop is the actual fix, not a workaround.)
#
# Apple Silicon only — both the Node executable (via pkg) and the Swift
# launcher (via swiftc, which targets the host arch) are arm64-only here.
# Windows isn't a quick add either: the menu bar piece is native AppKit,
# and discovery already depends on macOS's `dns-sd`.
#
# Requires: this project's normal `npm install` to have been run first
# (needs the @yao-pkg/pkg and esbuild devDependencies), plus Xcode Command
# Line Tools (for swiftc/codesign/SetFile — already needed for signing).
#
# Optional signing/notarization (needs a paid Apple Developer account).
# Leave these unset to build an unsigned app (works fine, just needs a
# one-time right-click > Open the first time, per Gatekeeper).
#
#   CODESIGN_IDENTITY="Developer ID Application: Name (TEAMID)" \
#     npm run build:app          # signs only
#
# ...and for notarization (on top of signing), either:
#   NOTARY_PROFILE=<name>          # a profile saved via:
#     xcrun notarytool store-credentials <name> \
#       --apple-id you@example.com --team-id TEAMID --password <app-specific password>
# or:
#   NOTARY_KEY_PATH=./AuthKey.p8 NOTARY_KEY_ID=... NOTARY_ISSUER_ID=...
#
# Output: dist/dmg-root/D80 Panel.app (what people run directly) and
#         dist/D80-Panel-<version>-macos-arm64.dmg (what you'd distribute).
set -euo pipefail
cd "$(dirname "$0")"

VERSION=$(node -p "require('./package.json').version")
DIST=dist
DMG_ROOT="$DIST/dmg-root"
APP_BUNDLE="$DMG_ROOT/D80 Panel.app"
CONTENTS="$APP_BUNDLE/Contents"
SERVER_BIN="$CONTENTS/Resources/d80-panel-server"
LAUNCHER_BIN="$CONTENTS/MacOS/D80Panel"

echo "==> Cleaning dist/"
rm -rf "$DIST"
mkdir -p "$CONTENTS/MacOS" "$CONTENTS/Resources"

echo "==> Bundling server.js + dependencies into a single CJS file"
npx esbuild server.js --bundle --platform=node --format=cjs \
  --outfile="$DIST/bundle.cjs" --target=node20

echo "==> Copying static assets"
cp -r public "$DIST/public"

echo "==> Writing dist/package.json (pkg needs its own, so asset paths and
    the snapshot root stay relative to dist/, not the project root)"
cat > "$DIST/package.json" <<EOF
{
  "name": "d80-panel-app",
  "version": "$VERSION",
  "bin": "bundle.cjs",
  "pkg": { "assets": ["public/**/*"] }
}
EOF

echo "==> Building standalone Node server executable (Apple Silicon)"
(cd "$DIST" && npx pkg -t node24-macos-arm64 -o "dmg-root/D80 Panel.app/Contents/Resources/d80-panel-server" .)
chmod +x "$SERVER_BIN"

echo "==> Compiling the menu bar launcher"
# -target is not optional here: swiftc defaults to embedding whatever macOS
# version the BUILD machine happens to be running as the binary's minimum
# supported OS (confirmed: no flag -> minos 28.0 on this machine) — anyone
# on an older real-world macOS then gets a hard "Can't use this version of
# the application... with this version of macOS" refusal, found by the user
# actually trying to launch it. Pin it to match LSMinimumSystemVersion
# instead of whatever this machine happens to be running.
swiftc -target arm64-apple-macos11 packaging/MenuBarApp.swift -o "$LAUNCHER_BIN"

echo "==> Writing Info.plist + icons"
sed "s/__VERSION__/$VERSION/g" packaging/Info.plist.template > "$CONTENTS/Info.plist"
cp packaging/icon.icns "$CONTENTS/Resources/icon.icns"
cp packaging/tray-icon.png "$CONTENTS/Resources/tray-icon.png"

if [ -n "${CODESIGN_IDENTITY:-}" ]; then
  echo "==> Code-signing with: $CODESIGN_IDENTITY"
  # --entitlements on the server binary is required: under the hardened
  # runtime (--options runtime, itself required for notarization), Node's
  # V8 JIT can't allocate executable memory without these, and it crashes
  # on launch ("Fatal process out of memory: Failed to reserve virtual
  # memory for CodeRange") — confirmed by actually launching a signed
  # build without them. The Swift launcher doesn't run any JIT, so it
  # doesn't need them, but it still needs the hardened runtime itself.
  codesign --force --sign "$CODESIGN_IDENTITY" --options runtime --timestamp \
    --entitlements packaging/entitlements.plist \
    "$SERVER_BIN"
  codesign --force --sign "$CODESIGN_IDENTITY" --options runtime --timestamp \
    "$LAUNCHER_BIN"
  codesign --force --sign "$CODESIGN_IDENTITY" --options runtime --timestamp \
    "$APP_BUNDLE"
  codesign --verify --deep --strict "$APP_BUNDLE"
  echo "    codesign OK"
else
  echo "==> Skipping code signing (CODESIGN_IDENTITY not set) — app will be unsigned"
fi

echo "==> Adding drag-to-Applications shortcut + first-run instructions"
ln -s /Applications "$DMG_ROOT/Applications"
cp packaging/README.txt "$DMG_ROOT/"
cp packaging/icon.icns "$DMG_ROOT/.VolumeIcon.icns"

echo "==> Building DMG"
rm -f "$DIST"/D80-Panel-*.dmg
DMG_PATH="$DIST/D80-Panel-$VERSION-macos-arm64.dmg"
# A custom volume icon has to be set on the *mounted* volume (the "has
# custom icon" Finder flag doesn't carry over from a plain source folder
# through `hdiutil create -srcfolder` — confirmed by building it that way
# first and checking with GetFileInfo -aC, which came back 0/unset) — so
# build read-write first, mount it, set the flag there, then convert to
# the compressed read-only format actually distributed.
RW_DMG="$DIST/rw.dmg"
hdiutil create -volname "D80 Panel" -srcfolder "$DMG_ROOT" -ov -format UDRW "$RW_DMG"
MOUNT_DIR=$(mktemp -d)
hdiutil attach "$RW_DMG" -mountpoint "$MOUNT_DIR" -nobrowse -quiet
SetFile -a C "$MOUNT_DIR"
hdiutil detach "$MOUNT_DIR" -quiet
rmdir "$MOUNT_DIR"
hdiutil convert "$RW_DMG" -format UDZO -ov -o "$DMG_PATH"
rm -f "$RW_DMG"

if [ -n "${CODESIGN_IDENTITY:-}" ]; then
  # The disk image itself needs a signature too, not just the app inside it —
  # `spctl --assess --type open` reports the DMG as "no usable signature"
  # otherwise, even with a valid notarization ticket stapled on.
  codesign --force --sign "$CODESIGN_IDENTITY" --timestamp "$DMG_PATH"
fi

if [ -n "${NOTARY_PROFILE:-}" ] || [ -n "${NOTARY_KEY_PATH:-}" ]; then
  echo "==> Submitting for notarization (this can take a few minutes)"
  if [ -n "${NOTARY_PROFILE:-}" ]; then
    xcrun notarytool submit "$DMG_PATH" --keychain-profile "$NOTARY_PROFILE" --wait
  else
    xcrun notarytool submit "$DMG_PATH" \
      --key "$NOTARY_KEY_PATH" --key-id "$NOTARY_KEY_ID" --issuer "$NOTARY_ISSUER_ID" \
      --wait
  fi
  echo "==> Stapling notarization ticket to the DMG"
  xcrun stapler staple "$DMG_PATH"
  echo "    notarization OK — this build will open with zero Gatekeeper warnings"
else
  echo "==> Skipping notarization (NOTARY_PROFILE / NOTARY_KEY_PATH not set)"
fi

echo ""
echo "Done: $DMG_PATH"
