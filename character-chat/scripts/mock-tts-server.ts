import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 8000;

// Create a simple HTTP server
const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Health check
    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', model: 'mock-pocket-tts' }));
        console.log('💚 Health check received');
        return;
    }

    // TTS Endpoint
    if (req.method === 'POST' && req.url === '/tts') {
        let body: any[] = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            const bodyBuffer = Buffer.concat(body);

            // Check if it's multipart (cloning) or JSON
            const isMultipart = req.headers['content-type']?.includes('multipart/form-data');

            console.log(`🎤 TTS Request received. Streaming audio...`);
            if (isMultipart) {
                console.log(`   ✨ Voice Cloning Detected (Multipart request)`);
            }

            // Generate a dummy WAV file (1 second of silence/noise) 
            // Header for 16-bit PCM, 24kHz, Mono
            const wavHeader = Buffer.alloc(44);
            wavHeader.write('RIFF', 0);
            wavHeader.writeUInt32LE(24000 * 2 + 36, 4);
            wavHeader.write('WAVE', 8);
            wavHeader.write('fmt ', 12);
            wavHeader.writeUInt32LE(16, 16);
            wavHeader.writeUInt16LE(1, 20);
            wavHeader.writeUInt16LE(1, 22);
            wavHeader.writeUInt32LE(24000, 24);
            wavHeader.writeUInt32LE(48000, 28);
            wavHeader.writeUInt16LE(2, 32);
            wavHeader.writeUInt16LE(16, 34);
            wavHeader.write('data', 36);
            wavHeader.writeUInt32LE(24000 * 2, 40);

            // Dummy audio data (silence)
            const audioData = Buffer.alloc(24000 * 2);

            res.writeHead(200, { 'Content-Type': 'audio/wav' });
            res.write(wavHeader);
            res.write(audioData);
            res.end();
        });
        return;
    }

    res.writeHead(404);
    res.end('Not Found');
});

server.listen(PORT, () => {
    console.log(`🚀 Mock Pocket TTS Server running on http://localhost:${PORT}`);
    console.log(`   - /health : Health check`);
    console.log(`   - /tts    : Speech synthesis`);
});
