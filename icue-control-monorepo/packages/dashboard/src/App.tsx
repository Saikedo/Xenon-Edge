import { useState, useEffect } from 'react';
import { Monitor, Settings } from 'lucide-react';
import { AudioSession } from './types';
import { AGENT_URL } from './config';
import { glassStyle } from './styles';
import { sendCommand } from './api';
import { AudioMixer } from './components/AudioMixer';
import { SettingsModal } from './components/SettingsModal';
import { AppSelectionModal } from './components/AppSelectionModal';
import { HomeAssistantFrame } from './components/HomeAssistantFrame';

function App() {
    const [status, setStatus] = useState<string>('Initializing...');
    const [sessions, setSessions] = useState<AudioSession[]>([]);
    const [connected, setConnected] = useState<boolean>(true);
    const [pinnedApps, setPinnedApps] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    // Settings State
    const [showSettings, setShowSettings] = useState<boolean>(false);

    // Persisted Settings
    const [showToolbar, setShowToolbar] = useState<boolean>(() => {
        return localStorage.getItem('showToolbar') === 'true';
    });

    const [showLeftPanel, setShowLeftPanel] = useState<boolean>(() => {
        const stored = localStorage.getItem('showLeftPanel');
        return stored !== 'false'; // Default to true
    });

    // Persistence Effects
    useEffect(() => {
        localStorage.setItem('showToolbar', String(showToolbar));
    }, [showToolbar]);

    useEffect(() => {
        localStorage.setItem('showLeftPanel', String(showLeftPanel));
    }, [showLeftPanel]);

    const fetchData = async () => {
        try {
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
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    // Optimistic update handler for AudioMixer
    const handleVolumeOptimisticUpdate = (appName: string, vol: number) => {
        setSessions(prev => prev.map(s =>
            s.Name === appName
                ? { ...s, "Volume Percent": `${vol.toFixed(1)}%` }
                : s
        ));
    };

    return (
        <div style={{
            display: 'flex',
            width: '100vw',
            height: '100vh',
            background: 'radial-gradient(circle at top left, #1e1e24, #000)',
            overflow: 'hidden',
            fontFamily: '"Inter", sans-serif',
            touchAction: 'none'
        }}>

            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                showToolbar={showToolbar}
                setShowToolbar={setShowToolbar}
                showLeftPanel={showLeftPanel}
                setShowLeftPanel={setShowLeftPanel}
            />

            <AppSelectionModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                sessions={sessions}
                pinnedApps={pinnedApps}
                setPinnedApps={setPinnedApps}
            />

            {/* LEFT COLUMN: Controls */}
            {showLeftPanel && (
                <div style={{
                    flex: 1,
                    padding: '40px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '30px',
                    boxSizing: 'border-box'
                }}>
                    {/* Header Section */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px', opacity: 0.5 }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: connected ? '#4ade80' : '#ef4444' }} />
                                <span style={{ fontSize: '0.9rem' }}>{status} v1.4</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <button
                            onClick={() => sendCommand('/api/system/hdr', { enable: true }).then(fetchData)}
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
                    <AudioMixer
                        sessions={sessions}
                        pinnedApps={pinnedApps}
                        onRefresh={fetchData}
                        onVolumeOptimisticUpdate={handleVolumeOptimisticUpdate}
                    />
                </div>
            )}

            {/* RIGHT COLUMN: Home Assistant */}
            <HomeAssistantFrame
                showToolbar={showToolbar}
                showLeftPanel={showLeftPanel}
                onOpenSettings={() => setShowSettings(true)}
            />

        </div>
    );
}

export default App;
