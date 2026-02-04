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
import { Tabs } from './components/Tabs';
import { BeszelFrame } from './components/BeszelFrame';

interface TabSettings {
    showToolbar?: boolean;
    showLeftPanel?: boolean;
    showDebug?: boolean;
    iframeScale?: number;
}

interface AppSettings {
    home: TabSettings;
    beszel: TabSettings;
}

const DEFAULT_SETTINGS: AppSettings = {
    home: { showToolbar: true, showLeftPanel: true, iframeScale: 1.0, showDebug: false },
    beszel: { iframeScale: 1.0, showDebug: false }
};

function App() {
    const [status, setStatus] = useState<string>('Initializing...');
    const [sessions, setSessions] = useState<AudioSession[]>([]);
    const [connected, setConnected] = useState<boolean>(true);
    const [pinnedApps, setPinnedApps] = useState<string[]>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    // Tab State
    const [activeTab, setActiveTab] = useState<string>('home');

    // Settings State
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [settings, setSettings] = useState<AppSettings>(() => {
        const stored = localStorage.getItem('appSettings');
        if (stored) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        }

        // Migration: Check for legacy keys
        const legacyToolbar = localStorage.getItem('showToolbar');
        const legacyLeftPanel = localStorage.getItem('showLeftPanel');
        const legacyDebug = localStorage.getItem('showDebug');
        const legacyScale = localStorage.getItem('iframeScale');

        if (legacyToolbar || legacyLeftPanel || legacyDebug || legacyScale) {
            const migrated: AppSettings = { ...DEFAULT_SETTINGS };
            migrated.home.showToolbar = legacyToolbar === 'true';
            // Default to true if not present, but check specifically for 'false' string for legacy
            migrated.home.showLeftPanel = legacyLeftPanel !== 'false';
            migrated.home.showDebug = legacyDebug === 'true';
            migrated.home.iframeScale = legacyScale ? parseFloat(legacyScale) : 1.0;

            // Clear legacy keys
            localStorage.removeItem('showToolbar');
            localStorage.removeItem('showLeftPanel');
            localStorage.removeItem('showDebug');
            localStorage.removeItem('iframeScale');

            return migrated;
        }

        return DEFAULT_SETTINGS;
    });

    // Validated active settings helper
    const currentSettings = settings[activeTab as keyof AppSettings] || {};

    const updateSetting = (key: keyof TabSettings, value: any) => {
        setSettings(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab as keyof AppSettings],
                [key]: value
            }
        }));
    };

    // Debug Dimensions
    const [windowDim, setWindowDim] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const handleResize = () => setWindowDim({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Persistence
    useEffect(() => {
        localStorage.setItem('appSettings', JSON.stringify(settings));
    }, [settings]);

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
            flexDirection: 'column',
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
                activeTab={activeTab}
                currentSettings={currentSettings}
                updateSetting={updateSetting}
            />

            <AppSelectionModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                sessions={sessions}
                pinnedApps={pinnedApps}
                setPinnedApps={setPinnedApps}
            />

            {/* Top Navigation Bar */}
            <div style={{
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center', // Center tabs
                padding: '0 20px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                position: 'relative',
                zIndex: 100
            }}>
                <Tabs
                    tabs={[
                        { id: 'home', label: 'Home' },
                        { id: 'beszel', label: 'Beszel' }
                    ]}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {activeTab === 'home' && (
                    <>
                        {/* LEFT COLUMN: Controls */}
                        {currentSettings.showLeftPanel && (
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
                            showToolbar={!!currentSettings.showToolbar}
                            showLeftPanel={!!currentSettings.showLeftPanel}
                            onOpenSettings={() => setShowSettings(true)}
                            iframeScale={currentSettings.iframeScale || 1.0}
                        />
                    </>
                )}

                {activeTab === 'beszel' && (
                    <BeszelFrame
                        iframeScale={currentSettings.iframeScale || 1.0}
                        showDebug={!!currentSettings.showDebug}
                        onOpenSettings={() => setShowSettings(true)}
                    />
                )}

            </div>

            {/* Debug Overlay */}
            {currentSettings.showDebug && (
                <div style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0,
                    background: 'rgba(0, 0, 0, 0.8)', color: '#0f0',
                    fontFamily: 'monospace', fontSize: '12px',
                    padding: '5px 10px', zIndex: 9999, pointerEvents: 'none',
                    textAlign: 'center', borderTop: '1px solid #333'
                }}>
                    DEBUG: Width: {windowDim.width}px | Height: {windowDim.height}px
                </div>
            )}

        </div>
    );
}

export default App;
