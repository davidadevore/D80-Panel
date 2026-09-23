D80 Panel — quick start
========================

1. Drag "D80 Panel.app" into the Applications folder (or run it right from
   here — either works).

2. Double-click it. Your browser opens the dashboard automatically once
   it's ready. There's no window of its own — look for it in the Dock
   while it's running.

3. To stop it: right-click (or Control-click) its Dock icon and choose
   Quit, or select it and press Cmd+Q.

If this copy isn't signed/notarized, the FIRST time you open it macOS will
say it's from an unidentified developer and refuse to open it normally.
To get past that (only needed once):
  - Right-click (or Control-click) "D80 Panel.app"
  - Choose "Open"
  - Click "Open" again in the dialog that appears

Requirements: a Mac with Apple Silicon (M1 or newer), on the same network
as your d&b amps. No installation, no Node.js, nothing else needed.

By default it looks for amps automatically on your network. If none show
up, you can point it at one directly instead — open Terminal and run:

    PORT=8080 D80_HOSTS=192.168.1.50 "/Applications/D80 Panel.app/Contents/MacOS/D80Panel"

Full documentation: https://github.com/<your-repo>/d80-panel
