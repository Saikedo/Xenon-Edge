import { AGENT_URL } from './config';

export const sendCommand = async (endpoint: string, body: any) => {
    try {
        await fetch(`${AGENT_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
    } catch (err) { console.error(err); }
};
