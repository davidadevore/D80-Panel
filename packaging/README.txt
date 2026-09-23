D80 Panel — quick start
========================

1. Drag "D80 Panel" into the Applications folder (or run it right from
   here — either works).

2. Double-click it. The app has no window and no Dock icon: look for its
   icon in the MENU BAR at the top right of your screen. Your browser
   opens the dashboard automatically once it's ready.

3. Click the menu bar icon for:
     Open Dashboard   - re-opens the dashboard page in your browser
     Quit D80 Panel   - stops the app

To see the dashboard from a phone or tablet on the same network, open
http://<this Mac's IP address>:8080 in its browser.

If this copy isn't signed/notarized, the FIRST time you open it macOS will
say it's from an unidentified developer and refuse to open it normally.
To get past that (only needed once):
  - Right-click (or Control-click) "D80 Panel"
  - Choose "Open"
  - Click "Open" again in the dialog that appears

Requirements: a Mac with Apple Silicon (M1 or newer) running macOS 11 or
later, on the same network as your d&b amps. Nothing else to install.

D80 Panel only reads from your amps — it never changes any setting.

By default it looks for amps automatically on your network. If none show
up, you can point it at one directly instead — open Terminal and run:

    D80_HOSTS=192.168.1.50 "/Applications/D80 Panel.app/Contents/MacOS/D80Panel"

(D40 amps: add the port, e.g. 192.168.1.50:50014)

Full documentation and source: see the project's page on GitHub.
