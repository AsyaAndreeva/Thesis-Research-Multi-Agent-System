const http = require('http');
const fs = require('fs');

// Load .env automatically (mimic Vercel)
if (fs.existsSync('.env')) {
    fs.readFileSync('.env', 'utf8').split('\n').forEach(line => {
        if (line.trim() && !line.startsWith('#')) {
            const [key, ...val] = line.split('=');
            if (key && !process.env[key.trim()]) {
                process.env[key.trim()] = val.join('=').trim().replace(/(^"|"$)/g, '');
            }
        }
    });
}

const apiGenerate = require('./api/generate.js');

const server = http.createServer((req, res) => {
    // Basic CORS (though vite proxy handles this, good to have)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Shim for Vercel's res.status()
    res.status = (statusCode) => {
        res.statusCode = statusCode;
        return res;
    };

    // Shim for Vercel's res.json()
    res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
    };

    if (req.method === 'OPTIONS') {
        res.statusCode = 200;
        return res.end();
    }

    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                req.body = JSON.parse(body);
            } catch (e) {
                req.body = {};
            }
            // Add require('./api/generate.js') wrapper
            apiGenerate(req, res);
        });
    } else {
        apiGenerate(req, res);
    }
});

const PORT = 8000;
server.listen(PORT, () => {
    console.log(`[Local API] Server simulating Vercel running on http://127.0.0.1:${PORT}`);
});
