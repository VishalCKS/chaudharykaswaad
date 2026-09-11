const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const DIR = __dirname;
const PORTS = [3000, 8080, 5000];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Scan and sort all frame files
function getFrames() {
  try {
    const files = fs.readdirSync(DIR);
    const frameFiles = files.filter(f => /^ezgif-frame-\d+\.jpg$/i.test(f));
    frameFiles.sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)[0], 10);
      const numB = parseInt(b.match(/\d+/)[0], 10);
      return numA - numB;
    });
    return frameFiles;
  } catch (err) {
    console.error('Error reading frames directory:', err);
    return [];
  }
}

const frames = getFrames();

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

const localIp = getLocalIp();

function handleRequest(req, res) {
  let reqUrl = decodeURIComponent(req.url.split('?')[0]);

  // API endpoint for frame metadata
  if (reqUrl === '/api/info') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(JSON.stringify({
      frameCount: frames.length,
      width: 3840,
      height: 2160,
      fpsDefault: 30,
      frames: frames
    }));
  }

  if (reqUrl === '/' || reqUrl === '') {
    reqUrl = '/index.html';
  }

  const filePath = path.join(DIR, reqUrl);

  // Security check: ensure within DIR
  if (!filePath.startsWith(DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      return res.end('404 Not Found: ' + reqUrl);
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const headers = {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Access-Control-Allow-Origin': '*'
    };

    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.webp') {
      headers['Cache-Control'] = 'public, max-age=86400';
    } else {
      headers['Cache-Control'] = 'no-cache';
    }

    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  });
}

function createAndListen(port) {
  const s = http.createServer(handleRequest);
  s.listen(port, '0.0.0.0', () => {
    console.log(`[Ready] Port ${port}: http://localhost:${port} | http://${localIp}:${port}`);
  });
  s.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} in use, skipping...`);
    } else {
      console.error(`Port ${port} error:`, err);
    }
  });
  return s;
}

console.log('\n======================================================');
console.log('  Chaudhary Almond Slice Cookies 4K Animation Server');
console.log(`  Total Frames: ${frames.length} (3840x2160 UHD)`);
console.log('======================================================');

// Start listeners on multiple ports (e.g. 3000 and 8080)
PORTS.forEach(p => createAndListen(p));
