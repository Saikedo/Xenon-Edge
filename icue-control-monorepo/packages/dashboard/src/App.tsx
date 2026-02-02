import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Monitor, Plus, X } from 'lucide-react';

// Smart URL: If we are on HTTPS, assume we are proxying (empty string = relative).
// If on HTTP, try the Env Var, or default to localhost.
const AGENT_URL = window.location.protocol === 'https:'
    ? ''
    : (import.meta.env.VITE_AGENT_URL || 'http://localhost:4000');

interface AudioSession {
    Name: string;
    "Device Name": string;
    "Volume Percent": string;
    Muted: string; // "Yes" or "No"
    ProcessID: string;
}

function App() {
    const [status, setStatus] = useState<string>('Ready');
    const [sessions, setSessions] = useState<AudioSession[]>([]);
    const [connected, setConnected] = useState<boolean>(true);
    const [pinnedApps, setPinnedApps] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [showToolbar, setShowToolbar] = useState<boolean>(false);

    // Fetch both live sessions and pinned config
    const fetchData = async () => {
        try {
            // 1. Get Live Sessions
            const sessionRes = await fetch(`${AGENT_URL}/api/audio/sessions`);
            if (!sessionRes.ok) throw new Error("Unreachable");
            const sessionData = await sessionRes.json();

            // 2. Get Pinned Config
            const configRes = await fetch(`${AGENT_URL}/api/config/pinned-apps`);
            const configData = await configRes.json();

            if (sessionData.success) {
                setSessions(sessionData.sessions);
                setConnected(true);
            }

            if (configData.success) {
                setPinnedApps(configData.apps);
            }

            // 3. Explicit Ping Logging (Debug)
            console.log(`[${new Date().toLocaleTimeString()}] Sending Ping...`);
            fetch(`${AGENT_URL}/api/ping`)
                .then(r => r.json())
                .then(d => console.log(`[${new Date().toLocaleTimeString()}] Ping Response:`, d))
                .catch(e => console.error(`[${new Date().toLocaleTimeString()}] Ping Failed:`, e));

        } catch (err: any) {
            console.error("Failed to fetch data", err);
            setConnected(false);
            setStatus("Agent Offline - Is Node running?");
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const savePinnedApps = async (newPinned: string[]) => {
        try {
            await fetch(`${AGENT_URL}/api/config/pinned-apps`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apps: newPinned }),
            });
            setPinnedApps(newPinned);
        } catch (err) {
            console.error("Failed to save pinned apps", err);
        }
    };

    const sendCommand = async (endpoint: string, body: any) => {
        try {
            setStatus(`Sending to ${endpoint}...`);
            await fetch(`${AGENT_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            fetchData();
            setStatus('Ready');
        } catch (err: any) {
            setStatus(`Error: ${err.message}`);
            setConnected(false);
        }
    };

    const toggleMute = (session: AudioSession) => {
        const isMuted = session.Muted === 'Yes';
        const appName = session.Name || session.ProcessID;
        sendCommand('/api/audio/mute', { appName, mute: !isMuted });
    };

    // Filter sessions: Show only pinned ones (unless editing, then that's handled in modal)
    const displaySessions = sessions.filter(s => pinnedApps.includes(s.Name));

    return (
        <div style={containerStyle}>
            <h1>Xeneon Control</h1>

            {!connected && (
                <div style={errorBannerStyle}>
                    <span>⚠️ Agent Offline</span>
                    <button onClick={fetchData} style={retryBtnStyle}>Retry</button>
                </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => sendCommand('/api/system/hdr', { enable: true })} style={btnStyle}>
                    <Monitor /> Toggle HDR
                </button>
                <button onClick={() => setIsEditing(true)} style={btnStyle}>
                    <Plus /> Add App
                </button>
            </div>

            <div style={listContainerStyle}>
                <h3>Audio Mixer</h3>
                {displaySessions.length === 0 && <p style={{ opacity: 0.5 }}>No pinned apps active.</p>}

                {displaySessions.map((s, i) => (
                    <div key={i} style={rowStyle}>
                        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {s.Name}
                        </div>
                        <div style={{ marginRight: '10px', fontSize: '0.8em', opacity: 0.7 }}>{s["Volume Percent"]}</div>
                        <button
                            onClick={() => toggleMute(s)}
                            style={{ ...btnStyle, background: s.Muted === 'Yes' ? '#ef4444' : 'rgba(255,255,255,0.1)' }}
                        >
                            {s.Muted === 'Yes' ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal for Selecting Apps */}
            {isEditing && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2>Select Apps</h2>
                            <button onClick={() => setIsEditing(false)} style={iconBtnStyle}><X /></button>
                        </div>

                        <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {sessions.length === 0 && <p>No active apps found to pin.</p>}
                            {sessions.map((s, i) => {
                                const isPinned = pinnedApps.includes(s.Name);
                                return (
                                    <label key={i} style={{ ...rowStyle, cursor: 'pointer', justifyContent: 'flex-start' }}>
                                        <input
                                            type="checkbox"
                                            checked={isPinned}
                                            onChange={(e) => {
                                                const newSet = e.target.checked
                                                    ? [...pinnedApps, s.Name]
                                                    : pinnedApps.filter(p => p !== s.Name);
                                                savePinnedApps(newSet);
                                            }}
                                            style={{ marginRight: '10px' }}
                                        />
                                        {s.Name}
                                    </label>
                                )
                            })}
                        </div>
                        <div style={{ marginTop: '20px', textAlign: 'right' }}>
                            <button onClick={() => setIsEditing(false)} style={{ ...btnStyle, background: '#3b82f6', justifyContent: 'center' }}>Done</button>
                        </div>
                    </div>
                </div>
            )}


            <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>Home Control</h3>
                    <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', opacity: 0.7 }}>
                        <input type="checkbox" checked={showToolbar} onChange={e => setShowToolbar(e.target.checked)} />
                        Show Header
                    </label>
                </div>
                <div style={{ height: '395px', width: '752px', overflow: 'hidden', borderRadius: '12px' }}>
                    <iframe
                        src="https://bfoziodo4xibb3bu0c5lwz7nfk5h5t0y.ui.nabu.casa/ac-units/0"
                        style={{
                            width: '100%',
                            height: showToolbar ? '100%' : 'calc(100% + 56px)', // Compensate for crop
                            marginTop: showToolbar ? '0px' : '-56px',          // Crop top toolbar (~56px)
                            border: 'none',
                            background: '#1e293b'
                        }}
                        title="Home Assistant AC Control"
                    />
                </div>
            </div>


            <div style={statusStyle}>
                STATUS: {status} <span style={{ opacity: 0.5, marginLeft: '10px' }}>v1.3</span>
            </div>
        </div>
    );
}

const containerStyle: React.CSSProperties = {
    padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', minHeight: '100vh', width: '100%'
};
const errorBannerStyle: React.CSSProperties = {
    background: '#ef4444', color: 'white', padding: '10px', borderRadius: '8px',
    width: '100%', maxWidth: '400px', textAlign: 'center', marginBottom: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
};
const retryBtnStyle: React.CSSProperties = {
    border: 'none', background: 'rgba(0,0,0,0.2)', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer'
};
const listContainerStyle: React.CSSProperties = {
    width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '10px'
};
const rowStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px', gap: '10px'
};
const btnStyle: React.CSSProperties = {
    padding: '12px 24px', borderRadius: '12px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', backdropFilter: 'blur(10px)', transition: 'background 0.2s',
};
const iconBtnStyle: React.CSSProperties = {
    background: 'none', border: 'none', color: 'white', cursor: 'pointer'
};
const statusStyle: React.CSSProperties = {
    marginTop: '20px', padding: '10px', background: '#1e293b', borderRadius: '8px', width: '100%', maxWidth: '400px', fontSize: '0.8rem', fontFamily: 'monospace'
};
const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};
const modalContentStyle: React.CSSProperties = {
    background: '#1e293b', padding: '20px', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
};

export default App;
