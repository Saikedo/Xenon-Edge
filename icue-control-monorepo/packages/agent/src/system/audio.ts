import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

// Path to bundled SoundVolumeView (svcl.exe)
// User must place svcl.exe in bin/ just like nircmd
const BIN_PATH = path.resolve(__dirname, '../../bin/svcl.exe');

function getSvclCmd(): string {
    if (fs.existsSync(BIN_PATH)) {
        return `"${BIN_PATH}"`;
    }
    return 'svcl'; // Fallback to global path
}

export interface AudioSession {
    Name: string;
    Type: string;
    "Device Name": string;
    "Volume Percent": string;
    Muted: string; // "Yes" or "No"
    ProcessID: string;
}

export function getAudioSessions(): Promise<AudioSession[]> {
    return new Promise((resolve, reject) => {
        // /sjson [Filename]
        // We can output to a temp file and read it, or try stdout if supported.
        // svcl /sjson doesn't support stdout easily, it writes to file.
        const tempFile = path.resolve(__dirname, '../../temp_sessions.json');
        const cmd = `${getSvclCmd()} /sjson "${tempFile}"`;

        exec(cmd, (error) => {
            if (error) {
                console.warn('[Audio] Failed to get sessions', error);
                return resolve([]);
            }

            if (fs.existsSync(tempFile)) {
                try {
                    const data = fs.readFileSync(tempFile, 'utf8');
                    // Remove BOM and parse
                    const rawJson = JSON.parse(data.replace(/^\uFEFF/, ''));

                    // Filter: Only "Application" type.
                    // Deduplicate: If multiple rows have same Name/ProcessID, pick the one with "Render" or just first one.
                    // Often "Application" entries are what we want.
                    // Let's filter strictly for Type == "Application"

                    const apps = rawJson.filter((item: any) => item.Type === "Application");

                    // Deduplicate by Name (Process Name)
                    // Chrome, Discord, etc. often spawn multiple audio sessions.
                    // We will take the first occurrence of each unique Name.
                    const uniqueApps = [];
                    const seenNames = new Set();

                    for (const app of apps) {
                        if (!seenNames.has(app.Name)) {
                            seenNames.add(app.Name);
                            uniqueApps.push(app);
                        }
                    }

                    resolve(uniqueApps);
                } catch (err) {
                    console.error('[Audio] JSON Parse Error', err);
                    resolve([]);
                }
            } else {
                resolve([]);
            }
        });
    });
}

export function muteApp(appName: string, mute: boolean): Promise<void> {
    return new Promise((resolve, reject) => {
        // svcl /Mute [Name]
        // svcl /Unmute [Name]
        const action = mute ? '/Mute' : '/Unmute';
        const cmd = `${getSvclCmd()} ${action} "${appName}"`;

        console.log(`[Audio] Executing: ${cmd}`);

        exec(cmd, (error) => {
            if (error) {
                console.warn(`[Audio] Failed to ${action} ${appName}`, error);
            }
            resolve();
        });
    });
}

export function setAppVolume(appName: string, level: number): Promise<void> {
    return new Promise((resolve, reject) => {
        // svcl /SetVolume [Name] [Percent]
        const cmd = `${getSvclCmd()} /SetVolume "${appName}" ${level}`;

        console.log(`[Audio] Executing: ${cmd}`);

        exec(cmd, (error) => {
            if (error) {
                console.warn(`[Audio] Failed to set volume for ${appName}`, error);
            }
            resolve();
        });
    });
}
