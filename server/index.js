import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import { API_BASE_URL, PORT } from '../src/utils/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.static(path.join(__dirname, '../dist')));

let cachedData = null;
let lastFetchTime = null;

async function fetchServerData() {
    try {
        console.log(`[API] Fetching data from ${API_BASE_URL}/servers`);
        const response = await fetch(`${API_BASE_URL}/servers`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        cachedData = data;
        lastFetchTime = new Date().toISOString();
        console.log(`[API] Successfully fetched and cached data (${data.servers?.length || 0} servers)`);
    } catch (error) {
        console.error('[API] Failed to fetch data, keeping cached data:', error.message);
    }
}

fetchServerData();

setInterval(fetchServerData, 2000);

app.get('/api/servers', (req, res) => {
    if (cachedData) {
        res.json(cachedData);
    } else {
        res.json({ servers: [] });
    }
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        cachedDataExists: !!cachedData,
        lastFetchTime,
        serverCount: cachedData?.servers?.length || 0
    });
});

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`[Server] Server running on :${PORT}`);
    console.log(`[Server] Health check: :${PORT}/api/health`);
});


