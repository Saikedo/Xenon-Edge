import fs from 'fs';
import path from 'path';

// Store data in a 'data' folder next to src or in root of package
const DATA_DIR = path.resolve(__dirname, '../../data');
const PINNED_APPS_FILE = path.join(DATA_DIR, 'pinned_apps.json');

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const Store = {
    getPinnedApps: (): string[] => {
        if (!fs.existsSync(PINNED_APPS_FILE)) {
            return [];
        }
        try {
            const data = fs.readFileSync(PINNED_APPS_FILE, 'utf8');
            const json = JSON.parse(data);
            return Array.isArray(json.apps) ? json.apps : [];
        } catch (err) {
            console.error('[Store] Failed to read pinned apps', err);
            return [];
        }
    },

    setPinnedApps: (apps: string[]) => {
        try {
            const data = JSON.stringify({ apps }, null, 2);
            fs.writeFileSync(PINNED_APPS_FILE, data, 'utf8');
        } catch (err) {
            console.error('[Store] Failed to write pinned apps', err);
            throw err;
        }
    }
};
