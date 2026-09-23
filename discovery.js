import { spawn } from 'node:child_process';

// Discovers d&b OCA devices (D80, D40, ...) via mDNS/Bonjour (_oca._tcp), the
// same mechanism d&b's own R1 software uses to find amps on the network.
// No IPs to type in by hand: every amp on the LAN advertises itself.
//
// Implementation note: this shells out to the macOS `dns-sd` binary rather
// than using a JS mDNS library. A couple of Node multicast-dns libraries were
// tried against the real rig and never received a single multicast packet
// back (likely a multi-homed-interface quirk), while `dns-sd` — which talks
// to the system's mDNSResponder daemon instead of opening its own multicast
// socket — worked immediately and gives host/port/firmware/serial in one
// query (`-Z`, zone-file output). On Linux, `avahi-browse -r -p _oca._tcp`
// would be the equivalent and this module would need a small parser swap.

const SERVICE = '_oca._tcp';
const SCAN_MS = 3000; // how long to let `dns-sd -Z` collect responses
const RESCAN_MS = 20000; // how often to re-scan for new/departed amps

function parseZoneDump(text) {
  // Each record block looks like:
  //   _oca._tcp    PTR   <instance>._oca._tcp
  //   <instance>._oca._tcp   SRV   0 0 <port> <hostname>.
  //   <instance>._oca._tcp   TXT   "txtvers=1" ... "db_devicename=D80 1.12" "db_serialnumber=Z27..."
  const found = new Map(); // instance -> record

  const srvRe = /^(\S+)\._oca\._tcp\s+SRV\s+\d+\s+\d+\s+(\d+)\s+(\S+?)\.?\s*(?:;.*)?$/;
  const txtRe = /^(\S+)\._oca\._tcp\s+TXT\s+(.*)$/;

  for (const line of text.split('\n')) {
    let m = srvRe.exec(line.trim());
    if (m) {
      const [, instance, port, hostname] = m;
      const rec = found.get(instance) || {};
      rec.port = parseInt(port, 10);
      rec.hostname = hostname;
      found.set(instance, rec);
      continue;
    }
    m = txtRe.exec(line.trim());
    if (m) {
      const [, instance, rest] = m;
      const rec = found.get(instance) || {};
      rec.txt = rec.txt || {};
      const pairRe = /"([^"=]+)=([^"]*)"/g;
      let p;
      while ((p = pairRe.exec(rest))) {
        rec.txt[p[1]] = p[2];
      }
      found.set(instance, rec);
    }
  }

  return found;
}

// Resolves a `.local` mDNS hostname to an IPv4 address by asking
// mDNSResponder directly (`dns-sd -G v4`). Node's built-in dns.lookup() also
// resolves `.local` names on macOS, but it goes through the regular
// getaddrinfo path first and only falls back to mDNS after a ~5s stall per
// name (and getaddrinfo's threadpool caps concurrency at 4 by default) —
// with ~35 amps on the rig that added up to 40+ seconds. dns-sd talks
// straight to mDNSResponder over a local socket and answers in milliseconds.
function resolveHost(hostname, timeoutMs = 2000) {
  return new Promise((resolve) => {
    const child = spawn('dns-sd', ['-G', 'v4', hostname]);
    let done = false;
    const finish = (addr) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      child.kill();
      resolve(addr);
    };
    let buf = '';
    child.stdout.on('data', (d) => {
      buf += d;
      const m = /Add\s+\S+\s+\S+\s+\S+\s+(\d+\.\d+\.\d+\.\d+)/.exec(buf);
      if (m) finish(m[1]);
    });
    child.on('error', () => finish(null));
    const timer = setTimeout(() => finish(null), timeoutMs);
  });
}

async function scanOnce() {
  const text = await new Promise((resolve, reject) => {
    const child = spawn('dns-sd', ['-Z', SERVICE, 'local.']);
    let out = '';
    child.stdout.on('data', (d) => (out += d));
    child.on('error', reject);
    const timer = setTimeout(() => {
      child.kill();
    }, SCAN_MS);
    child.on('close', () => {
      clearTimeout(timer);
      resolve(out);
    });
  });

  const records = parseZoneDump(text);

  const results = await Promise.all(
    [...records].map(async ([instance, rec]) => {
      const txt = rec.txt || {};
      if (!txt.db_serialnumber || !rec.hostname || !rec.port) return null; // not a real d&b device (e.g. R1 running on a laptop)

      const ip = await resolveHost(rec.hostname);
      if (!ip) return null; // couldn't resolve right now, skip until next scan

      // Prefer the model from the firmware string (e.g. "D80 V2.28.04") since
      // db_devicename is user-renamable in R1 (seen on this rig as e.g.
      // "Delay IN 4.03" or just "4.05") and would otherwise mislabel the tile.
      const model = (txt.db_firmwarevers || txt.db_devicename || instance).trim().split(/\s+/)[0];

      return {
        serial: txt.db_serialnumber,
        instance,
        model,
        deviceName: txt.db_devicename || instance,
        firmware: txt.db_firmwarevers || '',
        host: ip,
        port: rec.port,
      };
    })
  );

  return results.filter(Boolean);
}

/**
 * Starts periodic discovery. `onUpdate(amps)` is called after every scan
 * with the full current list of discovered d&b OCA devices.
 * Returns a stop() function.
 */
export function startDiscovery(onUpdate) {
  let stopped = false;

  async function loop() {
    while (!stopped) {
      try {
        const amps = await scanOnce();
        onUpdate(amps);
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.error(
            "[discovery] the 'dns-sd' command isn't available on this system " +
              '(discovery only works on macOS right now). Set D80_HOSTS to a ' +
              'comma-separated list of amp IPs and NO_DISCOVERY=1 to skip this. ' +
              'Stopping discovery.'
          );
          return;
        }
        console.error('[discovery] scan failed:', err.message);
      }
      await new Promise((r) => setTimeout(r, RESCAN_MS));
    }
  }

  loop();

  return () => {
    stopped = true;
  };
}
