import { TCPConnection, RemoteDevice, observeProperty } from 'aes70';
import { WebSocketServer } from 'ws';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startDiscovery } from './discovery.js';

// Works both as a normal ESM module (`npm start`) and inside the esbuild
// CJS bundle used to build the packaged standalone app (see build-app.sh),
// where __filename is provided natively and import.meta is unavailable.
const __dirname = typeof __filename !== 'undefined'
  ? path.dirname(__filename)
  : path.dirname(fileURLToPath(import.meta.url));

// Read-only fleet dashboard: this process only ever calls getters/
// observeProperty on amps. It never calls a Set* method, so it can't mute,
// unmute, or change gain/presets/on real, possibly-live gear.
const HTTP_PORT = process.env.PORT || 8080;
const MAX_CONCURRENT_DISCOVERY = 4; // how many amps may be mid-tree-walk at once

// Manual override / fallback for environments without `dns-sd` (non-macOS):
// D80_HOSTS=192.168.1.50,192.168.1.51 npm start
const MANUAL_HOSTS = (process.env.D80_HOSTS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const amps = new Map(); // serial -> amp state
const connecting = new Set(); // serials currently mid-connect (for logging only)
let activeDiscoverySlots = 0;
const discoveryQueue = [];

function makeAmpState({ serial, model, deviceName, host, port }) {
  return {
    serial,
    model: model || '?',
    deviceName: deviceName || serial,
    host,
    port,
    connected: false,
    status: {},
    channels: [],
    // Alert flags the user has told us to stop flagging on this specific
    // amp (e.g. a known SMPS fault). In-memory only, on purpose — restarting
    // the server is the only way to clear it, so a new session starts with
    // every current fault visible again rather than silently carrying old
    // acknowledgements forward.
    suppressedFlags: [],
  };
}

const KNOWN_ERROR_FLAGS = ['generalError', 'deviceError', 'ampError', 'smpsError'];

function setFlagSuppressed(serial, flag, suppressed) {
  const amp = amps.get(serial);
  if (!amp || !KNOWN_ERROR_FLAGS.includes(flag)) return false;
  const has = amp.suppressedFlags.includes(flag);
  if (suppressed && !has) amp.suppressedFlags.push(flag);
  if (!suppressed && has) amp.suppressedFlags = amp.suppressedFlags.filter((f) => f !== flag);
  broadcast();
  return true;
}

let wss;
let broadcastPending = false;
// Coalesce bursts of property-change callbacks (thousands of them land in
// the first second or two after connecting to a fleet of amps, and level
// meters can update rapidly during a show) into a few broadcasts a second
// instead of re-serializing the whole fleet's state on every single one.
function broadcast() {
  if (broadcastPending || !wss) return;
  broadcastPending = true;
  setTimeout(() => {
    broadcastPending = false;
    const msg = JSON.stringify({ type: 'state', amps: Object.fromEntries(amps) });
    for (const client of wss.clients) {
      if (client.readyState === 1) client.send(msg);
    }
  }, 250);
}

function normalize(value) {
  if (value && typeof value === 'object') {
    if (typeof value.item === 'function' && Array.isArray(value.values)) {
      value = value.item(0);
    }
  }
  if (value && typeof value === 'object' && value.isEnum) {
    value = value.name;
  }
  return value;
}

async function withDiscoverySlot(fn) {
  if (activeDiscoverySlots >= MAX_CONCURRENT_DISCOVERY) {
    await new Promise((resolve) => discoveryQueue.push(resolve));
  }
  activeDiscoverySlots++;
  try {
    return await fn();
  } finally {
    activeDiscoverySlots--;
    const next = discoveryQueue.shift();
    if (next) next();
  }
}

async function connectAmp(serial) {
  for (;;) {
    const amp = amps.get(serial);
    if (!amp) return; // amp was removed

    try {
      connecting.add(serial);
      const { device, roles, channelCount } = await withDiscoverySlot(async () => {
        console.log(`[${amp.deviceName}] connecting to ${amp.host}:${amp.port}...`);
        const connection = await TCPConnection.connect({ host: amp.host, port: amp.port });
        const d = new RemoteDevice(connection);
        d.set_keepalive_interval(5);
        const r = await d.get_role_map();
        const count = [...r.keys()].filter((k) => /^ChStatus\/ChStatus_Isp\d*$/.test(k)).length;
        return { device: d, roles: r, channelCount: count };
      });
      connecting.delete(serial);

      console.log(`[${amp.deviceName}] connected, ${roles.size} objects, ${channelCount} channels`);
      amp.connected = true;
      amp.channels = Array.from({ length: channelCount }, () => ({}));
      broadcast();

      const closed = new Promise((resolve) => {
        device.connection.on('close', resolve);
        device.connection.on('error', (err) => {
          console.error(`[${amp.deviceName}] connection error:`, err.message);
        });
      });

      const watch = (roleName, target, key, prop = 'Reading') => {
        const obj = roles.get(roleName);
        if (!obj) return;
        try {
          observeProperty(obj, prop, (ok, value) => {
            if (!ok) return;
            target[key] = normalize(value);
            broadcast();
          });
        } catch (err) {
          console.warn(`[${amp.deviceName}] cannot observe ${roleName}.${prop}:`, err.message);
        }
      };

      // Same as watch(), but also captures the property's max (e.g. a
      // channel's true rated output power) instead of discarding it — the
      // meters page needs that per-channel ceiling to scale correctly, since
      // it isn't the same across amp models.
      const watchWithMax = (roleName, target, key, maxKey) => {
        const obj = roles.get(roleName);
        if (!obj) return;
        try {
          observeProperty(obj, 'Reading', (ok, value) => {
            if (!ok) return;
            if (value && typeof value.item === 'function' && Array.isArray(value.values)) {
              target[key] = normalize(value.item(0));
              target[maxKey] = normalize(value.item(2));
            } else {
              target[key] = normalize(value);
            }
            broadcast();
          });
        } catch (err) {
          console.warn(`[${amp.deviceName}] cannot observe ${roleName}.Reading:`, err.message);
        }
      };

      watch('Status/Status_DeviceStatus', amp.status, 'deviceStatus', 'Position');
      watch('Status/Status_StatusText', amp.status, 'firmware');
      watch('Status/Status_PwrOk', amp.status, 'pwrOk');
      watch('Status/Status_SmpsTemperature', amp.status, 'smpsTempC');
      watch('Error/Error_GnrlErr', amp.status, 'generalError');
      watch('Error/Error_DeviceErr', amp.status, 'deviceError');
      watch('Error/Error_AmpErr', amp.status, 'ampError');
      watch('Error/Error_SmpsErr', amp.status, 'smpsError');
      watch('Error/Error_ErrorText', amp.status, 'errorText');

      for (let i = 1; i <= channelCount; i++) {
        const ch = amp.channels[i - 1];
        watch(`Config/Config_Mute${i}`, ch, 'muted', 'State');
        watch(`Config/Config_PotiLevel${i}`, ch, 'gainDb', 'Gain');
        watch(`Config/Config_ChannelName${i}`, ch, 'name', 'Setting');

        watch(`ChStatus/ChStatus_Isp${i}`, ch, 'isp');
        watch(`ChStatus/ChStatus_Osp${i}`, ch, 'osp');
        watch(`ChStatus/ChStatus_AmpOn${i}`, ch, 'ampOn');
        watch(`ChStatus/ChStatus_Ovl${i}`, ch, 'overload');
        watch(`ChStatus/ChStatus_InputOverload${i}`, ch, 'inputOverload');
        watch(`ChStatus/ChStatus_OutputOverload${i}`, ch, 'outputOverload');
        watch(`ChStatus/ChStatus_Gr${i}`, ch, 'limiting');
        watch(`ChStatus/ChStatus_GrHead${i}`, ch, 'headroomDb');
        watch(`ChStatus/ChStatus_InputVoltage${i}`, ch, 'inputLevelDbu');
        watchWithMax(`ChStatus/ChStatus_OutputPower${i}`, ch, 'outputPowerW', 'outputPowerMaxW');
        watch(`ChStatus/ChStatus_SpeakerImpedance${i}`, ch, 'impedanceOhm');
        watch(`ChStatus/ChStatus_AmpTemperature${i}`, ch, 'tempC');
        watch(`ChStatus/ChStatus_StatusText${i}`, ch, 'statusText');
      }

      await closed;
      console.log(`[${amp.deviceName}] connection closed`);
    } catch (err) {
      connecting.delete(serial);
      console.error(`[${amp.deviceName || serial}] ${err.message}`);
    }

    const stillTracked = amps.get(serial);
    if (!stillTracked) return;
    stillTracked.connected = false;
    broadcast();
    await new Promise((r) => setTimeout(r, 5000));
  }
}

// --- Manual hosts (fallback / non-macOS) --- accepts "host" or "host:port";
// defaults to 30013 (the D80's default) since ports do vary by model/config —
// a D40 on the same network, for example, may listen on a different port.
for (const entry of MANUAL_HOSTS) {
  const [host, portStr] = entry.split(':');
  const port = portStr ? parseInt(portStr, 10) : 30013;
  const serial = `manual:${entry}`;
  amps.set(serial, makeAmpState({ serial, model: '?', deviceName: entry, host, port }));
  connectAmp(serial);
}

// --- mDNS discovery (macOS `dns-sd`) ---
if (!process.env.NO_DISCOVERY) {
  startDiscovery((discovered) => {
    for (const d of discovered) {
      const existing = amps.get(d.serial);
      if (!existing) {
        amps.set(d.serial, makeAmpState(d));
        broadcast();
        connectAmp(d.serial);
      } else {
        // keep display info current (e.g. renamed in R1); host/port changes
        // take effect on the next reconnect rather than forcing one now.
        existing.model = d.model;
        existing.deviceName = d.deviceName;
        if (!existing.connected) {
          existing.host = d.host;
          existing.port = d.port;
        }
      }
    }
  });
}

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const PUBLIC_DIR = path.join(__dirname, 'public');

const server = http.createServer(async (req, res) => {
  const urlPath = req.url.split('?')[0];

  if (urlPath === '/state') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ amps: Object.fromEntries(amps) }, null, 2));
    return;
  }

  if (req.method === 'POST' && urlPath === '/api/suppress-flag') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        const { serial, flag, suppressed } = JSON.parse(body);
        const ok = setFlagSuppressed(serial, flag, !!suppressed);
        res.writeHead(ok ? 200 : 404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok }));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'bad request' }));
      }
    });
    return;
  }

  // Serve static files, but never outside PUBLIC_DIR — req.url is
  // attacker-controlled, and without this a request like
  // `/../../../../etc/passwd` would otherwise resolve outside it.
  let decoded;
  try {
    decoded = decodeURIComponent(urlPath === '/' ? '/index.html' : urlPath);
  } catch {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }
  const full = path.normalize(path.join(PUBLIC_DIR, decoded));
  if (full !== PUBLIC_DIR && !full.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  try {
    const data = await readFile(full);
    const ext = path.extname(full);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

wss = new WebSocketServer({ server });
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'state', amps: Object.fromEntries(amps) }));
});

server.listen(HTTP_PORT, () => {
  console.log(`D80 panel: http://localhost:${HTTP_PORT}`);
});

// The packaged app's menu bar launcher (packaging/MenuBarApp.swift) owns
// opening the browser and quits this process by sending SIGTERM — make
// sure that actually stops the process instead of relying on default
// behavior.
for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, () => process.exit(0));
}
