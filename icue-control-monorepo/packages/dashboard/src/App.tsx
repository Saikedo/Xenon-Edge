import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Monitor, X, Settings } from 'lucide-react';

const AGENT_URL = window.location.protocol === 'https:'
    ? ''
    : (import.meta.env.VITE_AGENT_URL || 'http://localhost:4000');

interface AudioSession {
    Name: string;
    "Device Name": string;
    "Volume Percent": string;
    Muted: string;
    ProcessID: string;
}

function App() {
    const [status, setStatus] = useState<string>('Initializing...');
    const [sessions, setSessions] = useState<AudioSession[]>([]);
    const [connected, setConnected] = useState<boolean>(true);
    const [pinnedApps, setPinnedApps] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    // Config
    const IFRAME_URL = "https://bfoziodo4xibb3bu0c5lwz7nfk5h5t0y.ui.nabu.casa/ac-units/0";

    const fetchData = async () => {
        try {
            // Ping for debug (keep visible in console)
            fetch(`${AGENT_URL}/api/ping`)
                .catch(e => console.error("Ping Fail", e));

            const [sessionRes, configRes] = await Promise.all([
                fetch(`${AGENT_URL}/api/audio/sessions`),
                fetch(`${AGENT_URL}/api/config/pinned-apps`)
            ]);

            if (sessionRes.ok && configRes.ok) {
                const sData = await sessionRes.json();
                const cData = await configRes.json();

                if (sData.success) setSessions(sData.sessions);
                if (cData.success) setPinnedApps(cData.apps);

                setConnected(true);
                setStatus('Ready');
            } else {
                throw new Error("API Error");
            }

        } catch (err) {
            console.error(err);
            setConnected(false);
            setStatus('Agent Offline');
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Faster polling for UI responsiveness
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
        } catch (err) { console.error(err); }
    };

    const sendCommand = async (endpoint: string, body: any) => {
        try {
            await fetch(`${AGENT_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            fetchData();
        } catch (err) { console.error(err); }
    };

    const displaySessions = sessions.filter(s => pinnedApps.includes(s.Name));

    // --- STYLES ---
    const glassStyle = {
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)',
        borderRadius: '24px',
        color: '#fff'
    };

    return (
        <div style={{
            display: 'flex',
            width: '100vw',
            height: '100vh',
            background: 'radial-gradient(circle at top left, #1e1e24, #000)',
            overflow: 'hidden',
            fontFamily: '"Inter", sans-serif'
        }}>

            {/* LEFT COLUMN: Controls */}
            <div style={{
                flex: '0 0 50%',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                gap: '30px',
                boxSizing: 'border-box'
            }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-1px' }}>Xeneon</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px', opacity: 0.5 }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: connected ? '#4ade80' : '#ef4444' }} />
                            <span style={{ fontSize: '0.9rem' }}>{status} v1.3</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <button
                        onClick={() => sendCommand('/api/system/hdr', { enable: true })}
                        style={{ ...glassStyle, padding: '24px', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', transition: 'all 0.2s', textAlign: 'left' }}
                    >
                        <Monitor size={32} strokeWidth={1.5} />
                        <div>
                            <div style={{ fontWeight: 600 }}>Toggle HDR</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>System Display</div>
                        </div>
                    </button>

                    <button
                        onClick={() => setIsEditing(true)}
                        style={{ ...glassStyle, padding: '24px', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', transition: 'all 0.2s', textAlign: 'left' }}
                    >
                        <Settings size={32} strokeWidth={1.5} />
                        <div>
                            <div style={{ fontWeight: 600 }}>Manage Apps</div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>Pin Audio Sources</div>
                        </div>
                    </button>
                </div>

                {/* Audio Mixer */}
                <div style={{ ...glassStyle, flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', opacity: 0.8 }}>Audio Mixer</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {displaySessions.length === 0 && <div style={{ opacity: 0.4, padding: '20px', textAlign: 'center' }}>No apps pinned.</div>}
                        {displaySessions.map((s, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px' }}>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{s.Name}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{s["Volume Percent"]} Volume</div>
                                </div>

                                <button
                                    onClick={() => sendCommand('/api/audio/mute', { appName: s.Name, mute: s.Muted !== 'Yes' })}
                                    style={{
                                        width: '50px', height: '50px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                                        background: s.Muted === 'Yes' ? '#ef4444' : 'rgba(255,255,255,0.1)',
                                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    {s.Muted === 'Yes' ? <VolumeX /> : <Volume2 />}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Home Assistant */}
            <div style={{ flex: '0 0 50%', boxSizing: 'border-box', position: 'relative' }}>
                <iframe
                    src={IFRAME_URL}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        // Optional: If you want to dim the iframe to match theme, requires CSS hacks inside iframe usually
                        // but we can try overlaying a blend mode if user wants later
                    }}
                />
            </div>

            {/* Modal */}
            {isEditing && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ ...glassStyle, width: '500px', padding: '30px', background: '#18181b' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0 }}>Select Apps</h2>
                            <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X /></button>
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {sessions.map((s, i) => (
                                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={pinnedApps.includes(s.Name)}
                                        onChange={(e) => {
                                            const newSet = e.target.checked ? [...pinnedApps, s.Name] : pinnedApps.filter(p => p !== s.Name);
                                            savePinnedApps(newSet);
                                        }}
                                        style={{ width: '20px', height: '20px' }}
                                    />
                                    <span style={{ fontSize: '1.1rem' }}>{s.Name}</span>
                                </label>
                            ))}
                        </div>
                        <div style={{ marginTop: '20px', textAlign: 'right' }}>
                            <button onClick={() => setIsEditing(false)} style={{ padding: '10px 30px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Done</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default App;
