import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const PORT = 9227;
const HTML_PATH = 'file:///' + path.resolve('design_research/visual_explorations/index.html').replace(/\\/g, '/');
const OUTPUT_DIR = path.resolve('design_research/visual_explorations');

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getPageWsUrl() {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await new Promise((resolve, reject) => {
        const req = http.request({
          host: '127.0.0.1',
          port: PORT,
          path: `/json/new?${encodeURIComponent(HTML_PATH)}`,
          method: 'PUT'
        }, resp => {
          let data = '';
          resp.on('data', chunk => data += chunk);
          resp.on('end', () => resolve(JSON.parse(data)));
        });
        req.on('error', reject);
        req.end();
      });
      if (res && res.webSocketDebuggerUrl) return res.webSocketDebuggerUrl;
    } catch (e) {
      await wait(300);
    }
  }
  throw new Error('Failed to create and connect to target page');
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    return new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
      this.ws.onmessage = event => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.ws.close();
  }
}

async function run() {
  const chromeProcess = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--hide-scrollbars',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1280,1024'
  ]);

  try {
    const pageWs = await getPageWsUrl();
    const client = new CDPClient(pageWs);
    await client.connect();

    await client.send('Page.enable');
    await client.send('DOM.enable');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 1280,
      height: 1024,
      deviceScaleFactor: 2,
      mobile: false
    });

    await wait(2500); // Allow fonts to load

    const configurations = [
      { dir: 'chronicle', theme: 'dark', filename: 'exploration_01_chronicle_dark.png' },
      { dir: 'chronicle', theme: 'light', filename: 'exploration_01_chronicle_light.png' },
      { dir: 'monolith', theme: 'dark', filename: 'exploration_02_monolith_dark.png' },
      { dir: 'monolith', theme: 'light', filename: 'exploration_02_monolith_light.png' },
      { dir: 'telemetry', theme: 'dark', filename: 'exploration_03_telemetry_dark.png' },
      { dir: 'telemetry', theme: 'light', filename: 'exploration_03_telemetry_light.png' },
      { dir: 'horizon', theme: 'dark', filename: 'exploration_04_horizon_dark.png' },
      { dir: 'horizon', theme: 'light', filename: 'exploration_04_horizon_light.png' },
    ];

    for (const config of configurations) {
      await client.send('Runtime.evaluate', {
        expression: `setDirection('${config.dir}'); setTheme('${config.theme}');`
      });
      await wait(400);

      const evalBox = await client.send('Runtime.evaluate', {
        expression: `
          (() => {
            const el = document.getElementById('deviceViewport');
            if (!el) return null;
            const rect = el.getBoundingClientRect();
            return JSON.stringify({ x: rect.left, y: rect.top, width: rect.width, height: rect.height });
          })()
        `,
        returnByValue: true
      });

      const clipRect = JSON.parse(evalBox?.result?.value || '{"x":445,"y":88,"width":390,"height":844}');

      const shot = await client.send('Page.captureScreenshot', {
        format: 'png',
        clip: {
          x: clipRect.x,
          y: clipRect.y,
          width: clipRect.width,
          height: clipRect.height,
          scale: 1
        }
      });

      const outPath = path.join(OUTPUT_DIR, config.filename);
      fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
      console.log(`Saved screenshot: ${config.filename}`);
    }

    client.close();
  } finally {
    chromeProcess.kill();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
