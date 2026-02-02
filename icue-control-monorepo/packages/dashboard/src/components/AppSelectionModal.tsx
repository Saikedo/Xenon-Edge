import React from 'react';
import { X } from 'lucide-react';
import { AudioSession } from '../types';
import { glassStyle } from '../styles';
import { AGENT_URL } from '../config';

interface AppSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessions: AudioSession[];
    pinnedApps: string[];
    setPinnedApps: (apps: string[]) => void;
}

export const AppSelectionModal: React.FC<AppSelectionModalProps> = ({
    isOpen, onClose, sessions, pinnedApps, setPinnedApps
}) => {
    if (!isOpen) return null;

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

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ ...glassStyle, width: '500px', padding: '30px', background: '#18181b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>Select Apps</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X /></button>
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
                    <button onClick={onClose} style={{ padding: '10px 30px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Done</button>
                </div>
            </div>
        </div>
    );
};
