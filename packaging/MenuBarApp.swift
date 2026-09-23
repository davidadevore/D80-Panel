import Cocoa

// Minimal menu bar launcher. This is the app's actual CFBundleExecutable —
// it's what LaunchServices/the Dock track — precisely because a bare Node
// binary never registers with the window server and macOS ends up treating
// it as a hung app (bouncing forever, then "Not Responding"). A real
// AppKit app with a run loop fixes that; LSUIElement (+ setActivationPolicy
// below) keeps it out of the Dock/Cmd-Tab so it only lives in the menu bar,
// where it manages the actual Node server as a child process.

let resourcesURL = Bundle.main.resourceURL!
let serverPath = resourcesURL.appendingPathComponent("d80-panel-server").path
let port = ProcessInfo.processInfo.environment["PORT"] ?? "8080"
let dashboardURL = URL(string: "http://localhost:\(port)")!

final class AppDelegate: NSObject, NSApplicationDelegate {
    var statusItem: NSStatusItem!
    var serverProcess: Process?

    var sigtermSource: DispatchSourceSignal?

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.accessory)
        setupMenuBar()
        startServer()
        openDashboardOnceReady()
        installSignalHandler()
    }

    // Without this, an external SIGTERM (e.g. a plain `kill`, as opposed to
    // Force Quit's SIGKILL) uses the default disposition and kills this
    // process immediately, with no chance to run cleanup — confirmed
    // directly: doing exactly that left the child server process orphaned
    // and still holding the port open. Ignoring the default disposition and
    // routing it through a dispatch source lets quitApp() actually run.
    func installSignalHandler() {
        signal(SIGTERM, SIG_IGN)
        let source = DispatchSource.makeSignalSource(signal: SIGTERM, queue: .main)
        source.setEventHandler { [weak self] in self?.quitApp() }
        source.resume()
        sigtermSource = source
    }

    // Backstop for the standard Cocoa termination path (e.g. Cmd+Q's Apple
    // Event), in case something ever terminates the app without going
    // through quitApp() directly.
    func applicationWillTerminate(_ notification: Notification) {
        if let proc = serverProcess, proc.isRunning {
            proc.terminate()
        }
    }

    func setupMenuBar() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        if let button = statusItem.button {
            let iconPath = resourcesURL.appendingPathComponent("tray-icon.png").path
            let image = NSImage(contentsOfFile: iconPath)
            image?.size = NSSize(width: 18, height: 18)
            image?.isTemplate = true
            button.image = image
        }
        let menu = NSMenu()
        let openItem = NSMenuItem(title: "Open Dashboard", action: #selector(openDashboard), keyEquivalent: "o")
        openItem.target = self
        menu.addItem(openItem)
        menu.addItem(NSMenuItem.separator())
        let quitItem = NSMenuItem(title: "Quit D80 Panel", action: #selector(quitApp), keyEquivalent: "q")
        quitItem.target = self
        menu.addItem(quitItem)
        statusItem.menu = menu
    }

    func startServer() {
        let process = Process()
        // Launched this way (via a GUI app's Process(), under launchd's
        // Aqua session) rather than from an interactive Terminal shell, this
        // process does NOT inherit `ulimit -v unlimited` the way a
        // Terminal-launched one does — it gets a much lower default virtual
        // address space cap instead. Node's V8 reserves a large virtual
        // (not physical) address range for its JIT code on startup and
        // aborts if that reservation fails: confirmed by an actual crash
        // report here ("Fatal process out of memory: Failed to reserve
        // virtual memory for CodeRange", v8::base::FatalOOM) that only
        // happened when launched this way — every direct Terminal run
        // during development never hit it. Routing through a shell to
        // explicitly reset the limit before exec'ing the real binary is the
        // standard fix for this class of GUI-launched-process issue.
        process.executableURL = URL(fileURLWithPath: "/bin/sh")
        process.arguments = ["-c", "ulimit -v unlimited 2>/dev/null; exec \"$1\"", "sh", serverPath]
        process.environment = ProcessInfo.processInfo.environment
        process.terminationHandler = { proc in
            if proc.terminationStatus != 0 {
                DispatchQueue.main.async {
                    let alert = NSAlert()
                    alert.messageText = "D80 Panel server stopped unexpectedly"
                    alert.informativeText = "Exit code \(proc.terminationStatus). Check Console.app for details."
                    alert.runModal()
                    NSApp.terminate(nil)
                }
            }
        }
        do {
            try process.run()
            serverProcess = process
        } catch {
            let alert = NSAlert()
            alert.messageText = "D80 Panel failed to start"
            alert.informativeText = "\(error)"
            alert.runModal()
            NSApp.terminate(nil)
        }
    }

    @objc func openDashboard() {
        NSWorkspace.shared.open(dashboardURL)
    }

    @objc func quitApp() {
        if let proc = serverProcess, proc.isRunning {
            proc.terminate()
        }
        NSApp.terminate(nil)
    }

    // Polls the dashboard's own HTTP port rather than guessing a fixed
    // delay, then opens it automatically — same idea as the old shell
    // launcher, just living here now instead of in server.js (one place
    // should own "open the browser on startup", not two).
    func openDashboardOnceReady() {
        DispatchQueue.global().async {
            for _ in 0..<40 {
                if let url = URL(string: "http://localhost:\(port)/"),
                   let data = try? Data(contentsOf: url), !data.isEmpty {
                    DispatchQueue.main.async { self.openDashboard() }
                    return
                }
                Thread.sleep(forTimeInterval: 0.5)
            }
        }
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
