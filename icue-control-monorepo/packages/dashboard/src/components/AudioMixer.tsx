import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { AudioSession } from '../types';
import { glassStyle } from '../styles';
import { AGENT_URL } from '../config';
import { sendCommand } from '../api';

interface AudioMixerProps {
    sessions: AudioSession[];
    pinnedApps: string[];
    onRefresh: () => void;
    onVolumeOptimisticUpdate: (appName: string, vol: number) => void;
}

export const AudioMixer: React.FC<AudioMixerProps> = ({ sessions, pinnedApps, onRefresh, onVolumeOptimisticUpdate }) => {
    // Volume Swipe State
    const [dragging, setDragging] = useState<{ name: string, startX: number, startVol: number, currentVol: number } | null>(null);

    const parseVolume = (volStr: string): number => {
        return parseFloat(volStr.replace('%', '')) || 0;
    };

    const handleTouchStart = (e: React.TouchEvent, s: AudioSession) => {
        const touch = e.touches[0];
        setDragging({
            name: s.Name,
            startX: touch.clientX,
            startVol: parseVolume(s["Volume Percent"]),
            currentVol: parseVolume(s["Volume Percent"])
        });
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!dragging) return;
        const touch = e.touches[0];
        const deltaX = touch.clientX - dragging.startX;

        // Sensitivity: 1px = 0.5% volume
        const deltaVol = deltaX * 0.5;

        let newVol = Math.max(0, Math.min(100, dragging.startVol + deltaVol));

        setDragging(prev => prev ? { ...prev, currentVol: newVol } : null);
    };

    const handleTouchEnd = async () => {
        if (!dragging) return;

        // Commit Volume
        await fetch(`${AGENT_URL}/api/audio/volume`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appName: dragging.name, level: Math.round(dragging.currentVol) }),
        });

        // Update parent state immediately
        onVolumeOptimisticUpdate(dragging.name, dragging.currentVol);

        setDragging(null);
    };

    const displaySessions = sessions.filter(s => pinnedApps.includes(s.Name));

    return (
        <div
            style={{ ...glassStyle, flex: 1, padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' }}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <h2 style={{ margin: 0, fontSize: '1.5rem', opacity: 0.8 }}>Audio Mixer</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {displaySessions.length === 0 && <div style={{ opacity: 0.4, padding: '20px', textAlign: 'center' }}>No apps pinned.</div>}
                {displaySessions.map((s, i) => {
                    const isDragging = dragging?.name === s.Name;
                    const volumeVal = isDragging ? dragging.currentVol : parseVolume(s["Volume Percent"]);

                    return (
                        <div
                            key={i}
                            onTouchStart={(e) => handleTouchStart(e, s)}
                            style={{
                                position: 'relative',
                                display: 'flex', alignItems: 'center', gap: '20px', padding: '15px',
                                background: 'rgba(255,255,255,0.03)', borderRadius: '16px',
                                overflow: 'hidden',
                                userSelect: 'none'
                            }}
                        >
                            {/* Volume Bar Background */}
                            <div style={{
                                position: 'absolute', top: 0, bottom: 0, left: 0,
                                width: `${volumeVal}%`,
                                background: 'rgba(255,255,255,0.08)',
                                zIndex: 0,
                                transition: isDragging ? 'none' : 'width 0.3s ease'
                            }} />

                            <div style={{ flex: 1, overflow: 'hidden', zIndex: 1 }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{s.Name}</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{Math.round(volumeVal)}% Volume</div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    sendCommand('/api/audio/mute', { appName: s.Name, mute: s.Muted !== 'Yes' })
                                        .then(onRefresh);
                                }}
                                onTouchStart={(e) => e.stopPropagation()}
                                style={{
                                    zIndex: 2,
                                    width: '50px', height: '50px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                                    background: s.Muted === 'Yes' ? '#ef4444' : 'rgba(255,255,255,0.1)',
                                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                {s.Muted === 'Yes' ? <VolumeX /> : <Volume2 />}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
