# d80-panel

A read-only mobile/web fleet dashboard for d&b audiotechnik amplifiers (D80, D40, and likely
other models in the same OCA/AES70 firmware family). Built for the case where you have a rack —
or a whole venue — of these amps and want a single page that makes overload and gain-reduction
alerts impossible to miss, without opening R1 or walking the racks.

![status](https://img.shields.io/badge/status-v0.1-blue)

## Features

- **Zero-config discovery** — amps are found automatically via mDNS/Bonjour (the same mechanism
  d&b's own R1 software uses), no IP addresses to type in. New amps appear within one scan cycle
  of being plugged into the network.
- **Fleet view** — every discovered amp as a tile, grouped by model, with a per-channel signal
  light (green = signal, yellow = gain reduction, red = clip) and a red background the moment
  any device-level fault (SMPS, general, program, amp error) appears.
- **Meters page** — a compact meter-bridge view of true output wattage per channel across the
  whole fleet, laid out in columns that adapt to your screen: one column on a phone, several
  side by side on a wide monitor.
- **Per-amp detail view** — full channel-by-channel breakdown: mute state, gain, output power,
  temperature, impedance, headroom.
- **Alert suppression** — acknowledge ("ignore") a specific known fault on a specific amp so it
  stops contributing to the alert count, without hiding *new* faults on that same amp or masking
  the same fault on other amps. Suppression lives in server memory only and resets the moment the
  server restarts.
- **Strictly read-only.** This tool only ever calls getters and subscribes to property changes.
  It never calls a `Set*` method on any amp — it cannot mute, unmute, change gain, or touch
  presets. Safe to point at a live show system.

## Requirements

- Node.js 18+
- macOS, for automatic discovery (it shells out to the built-in `dns-sd` command). On other
  platforms, use the `D80_HOSTS` manual override below — see [Linux support](#linux-support) for
  what it would take to add native discovery there.
- One or more d&b amps on the same network, reachable over OCA/AES70 (this is usually on by
  default — check the amp's Ethernet/Remote settings if it isn't showing up).

## Quick start

```bash
git clone <this-repo>
cd d80-panel
npm install
npm start
```

Then open `http://localhost:8080` — from the same machine, or from a phone/tablet on the same
network using that machine's LAN IP instead of `localhost`.

On macOS, amps on the local network are discovered automatically. If you don't see any within
a few seconds, confirm the amp's OCA/AES70 remote control is enabled and that this machine is on
the same network/VLAN as the amps.

## Prebuilt app (no Node.js, no Terminal)

If you don't want to install Node.js or use `npm`, there's a self-contained `.dmg` build for
Apple Silicon Macs — see [Releases](../../releases) if one's been published there, or build it
yourself (one command, see below).

1. Open the `.dmg` and drag **D80 Panel.app** into Applications (or just run it from there).
2. Double-click it. Your browser opens the dashboard automatically once it's ready — the app has
   no window of its own, so look for it in the Dock while it's running.
3. To stop it: right-click its Dock icon and choose Quit, or select it and press Cmd+Q.
4. If this build isn't signed/notarized, the first time only macOS will block it as unsigned.
   Right-click the app, choose **Open**, then **Open** again in the dialog. (One-time step —
   plain double-click works after that.)

Intel Macs aren't built yet — see [Known limitations](#known-limitations-v01).

To build this yourself from source: `npm install && npm run build:app` produces
`dist/D80-Panel-<version>-macos-arm64.dmg`, unsigned. If you have a paid Apple Developer account,
`build-app.sh` will also sign and notarize it (giving a zero-warning install):

```bash
# Signing alone (needs a "Developer ID Application" certificate in your Keychain):
CODESIGN_IDENTITY="Developer ID Application: Your Name (TEAMID)" npm run build:app

# ...plus notarization, with a keychain profile (set up once):
xcrun notarytool store-credentials d80panel-notary \
  --apple-id you@example.com --team-id TEAMID --password <app-specific password>
CODESIGN_IDENTITY="Developer ID Application: Your Name (TEAMID)" \
NOTARY_PROFILE=d80panel-notary \
  npm run build:app
```

Note that signing alone (without notarizing) doesn't get you a warning-free install — macOS
Gatekeeper rejects a signed-but-unnotarized Developer ID app just like an unsigned one
(`spctl --assess` reports `rejected: Unnotarized Developer ID`), so it's only really worth
signing if you're also going to notarize.

## Configuration

Environment variables, set before `npm start`:

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `8080` | HTTP/WebSocket port for the dashboard itself. |
| `D80_HOSTS` | *(unset)* | Comma-separated list of `ip` or `ip:port` to connect to manually, bypassing discovery — e.g. `D80_HOSTS=192.168.1.50,192.168.1.51`. Useful on non-macOS hosts, or to pin a specific amp regardless of what mDNS reports. Defaults to port `30013` if a host is given without one. |
| `NO_DISCOVERY` | *(unset)* | Set to any value to disable mDNS discovery entirely and rely only on `D80_HOSTS`. |

## How it works

d&b amps don't expose a REST/JSON API. They speak **OCA/AES70** — an open, object-oriented
pro-audio control protocol (d&b is a founding member of the OCA Alliance) — over a raw TCP
connection, typically port 30013. This is the same protocol d&b's own R1 software, and
third-party integrations (Crestron, Beckhoff, QLab), use to control and monitor these amps.

Since a browser can't open a raw TCP socket, this project is a small Node backend
(`server.js`) that:

1. Discovers amps via mDNS (`discovery.js`, shells out to `dns-sd` on macOS).
2. Opens a persistent OCA/AES70 connection to each one using the
   [`aes70`](https://www.npmjs.com/package/aes70) library, and resolves the objects it cares
   about (mute, gain, per-channel signal/overload/gain-reduction flags, output power, device
   error flags) **by role name**, not hardcoded object numbers — so it works unmodified against
   different amp models and firmware versions, as long as they use the same role naming.
3. Subscribes to live push updates on those objects (no polling) and re-publishes changes to
   every connected browser over a single WebSocket, debounced to a handful of broadcasts a
   second so a large fleet's worth of property-change events doesn't overwhelm the server or the
   client.
4. Serves a single-file mobile-first dashboard (`public/index.html`) — no build step, no
   framework, just HTML/CSS/vanilla JS.

## Security notes

- The dashboard has **no authentication** and listens on all network interfaces, by design —
  it's meant to be reachable from any phone/laptop on the same trusted network. Don't expose the
  port to the open internet or an untrusted network; put it behind a VPN or firewall rule if you
  need remote access.
- It's read-only towards the amps (no `Set*` calls), but the dashboard's own alert-suppression
  endpoint (`/api/suppress-flag`) has no auth either — anyone who can reach the dashboard can
  acknowledge/unacknowledge alerts for any amp.

## Linux support

Discovery currently shells out to macOS's `dns-sd`, which talks directly to the system's
mDNSResponder daemon and is very fast (sub-100ms). A Linux port would need `discovery.js`'s
`scanOnce()`/`resolveHost()` swapped for an equivalent using `avahi-browse -r -p _oca._tcp` (or
a pure-JS mDNS library — note that a couple of the common ones didn't reliably receive multicast
traffic in testing on a multi-homed Mac; verify carefully if you go that route). Until then, use
`D80_HOSTS` with `NO_DISCOVERY=1` on non-macOS hosts.

## Known limitations (v0.1)

- Channel names show as "Channel N" until the amp itself has a name configured
  (`Config_ChannelName` in OCA terms) — this dashboard doesn't set names, only reads them.
- No alert history — a fault that triggers and clears before you happen to look leaves no trace.
- Reconnect-after-network-drop is implemented (5s retry backoff) but hasn't been stress-tested
  against a real mid-show cable pull.
- Discovery is macOS-only; see [Linux support](#linux-support) above.
- Tested against d&b D80 and D40 units; other models in the same firmware family will likely
  work (the OCA role names are the same across at least these two), but haven't been verified.
- The prebuilt `.dmg` is Apple Silicon (arm64) only — building an Intel (x64) version needs
  Rosetta 2 on the build machine (`softwareupdate --install-rosetta`) since `pkg` cross-compiles
  by running the target architecture's Node binary during the build.
- Unless you build it yourself with a Developer ID (see above), the prebuilt app is unsigned, so
  macOS Gatekeeper blocks it until you right-click → Open once. See the app's own README.txt.
- `packaging/Info.plist.template`'s bundle identifier (`com.d80panel.app`) is a placeholder —
  change it to something under a domain you actually control before signing/distributing this
  under your own name.

## License

MIT — see [LICENSE](LICENSE).
