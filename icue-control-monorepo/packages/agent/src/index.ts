import express from 'express';
import cors from 'cors';
import { toggleHDR } from './system/hdr';
import { muteApp, setAppVolume, getAudioSessions } from './system/audio';
import { Store } from './store';
import path from 'path';

const app = express();
const PORT = 4000;

// Enable CORS for Private Network Access (Home Server -> Local PC)
app.use(cors({
    origin: '*', // In production, lock this down to your Home Server IP if desired
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// PNA Preflight Support
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Private-Network', 'true');
    res.send(200);
});

app.use(express.json());

// Health Check
app.get('/api/ping', (req, res) => {
    res.json({ status: 'online', hostname: UserHostname() });
});

// --- System Control Endpoints ---

// HDR Control
app.post('/api/system/hdr', async (req, res) => {
    try {
        const { enable } = req.body; // true/false/toggle
        const result = await toggleHDR(enable);
        res.json({ success: true, message: result });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Audio Control
app.get('/api/audio/sessions', async (req, res) => {
    try {
        const sessions = await getAudioSessions();
        res.json({ success: true, sessions });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/audio/mute', async (req, res) => {
    try {
        const { appName, mute } = req.body; // appName: 'spotify.exe', mute: true/false
        await muteApp(appName, mute);
        res.json({ success: true, app: appName, muted: mute });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Config - Pinned Apps
app.get('/api/config/pinned-apps', (req, res) => {
    try {
        const apps = Store.getPinnedApps();
        res.json({ success: true, apps });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/config/pinned-apps', (req, res) => {
    try {
        const { apps } = req.body; // { apps: string[] }
        if (!Array.isArray(apps)) {
            return res.status(400).json({ success: false, error: "Invalid format. 'apps' must be an array." });
        }
        Store.setPinnedApps(apps);
        res.json({ success: true, apps });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/audio/volume', async (req, res) => {
    try {
        const { appName, level } = req.body; // level: 0-100
        await setAppVolume(appName, level);
        res.json({ success: true, app: appName, level });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

function UserHostname() {
    return process.env.COMPUTERNAME || 'Unknown PC';
}

app.listen(PORT, () => {
    console.log(`[Agent] Listening on port ${PORT}`);
    console.log(`[Agent] Allow PNA enabled. Home Server can connect.`);
});
