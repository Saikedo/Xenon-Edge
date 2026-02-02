import React from 'react';
import { X } from 'lucide-react';
import { glassStyle } from '../styles';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    showToolbar: boolean;
    setShowToolbar: (val: boolean) => void;
    showLeftPanel: boolean;
    setShowLeftPanel: (val: boolean) => void;
    showDebug: boolean;
    setShowDebug: (val: boolean) => void;
    iframeScale: number;
    setIframeScale: (val: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen, onClose, showToolbar, setShowToolbar, showLeftPanel, setShowLeftPanel, showDebug, setShowDebug, iframeScale, setIframeScale
}) => {
    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(3px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ ...glassStyle, width: '400px', padding: '30px', background: 'rgba(24, 24, 27, 0.6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>Settings</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', cursor: 'pointer' }}>
                        <span>Show Header (Crop)</span>
                        <input
                            type="checkbox"
                            checked={showToolbar}
                            onChange={(e) => setShowToolbar(e.target.checked)}
                            style={{ width: '20px', height: '20px' }}
                        />
                    </label>

                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', cursor: 'pointer' }}>
                        <span>Show Left Controls</span>
                        <input
                            type="checkbox"
                            checked={showLeftPanel}
                            onChange={(e) => setShowLeftPanel(e.target.checked)}
                            style={{ width: '20px', height: '20px' }}
                        />
                    </label>

                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', cursor: 'pointer' }}>
                        <span>Show Debug Info</span>
                        <input
                            type="checkbox"
                            checked={showDebug}
                            onChange={(e) => setShowDebug(e.target.checked)}
                            style={{ width: '20px', height: '20px' }}
                        />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Iframe Scale</span>
                            <span style={{ opacity: 0.5 }}>{Math.round(iframeScale * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0.5"
                            max="1.5"
                            step="0.01"
                            value={iframeScale}
                            onChange={(e) => setIframeScale(parseFloat(e.target.value))}
                            style={{ width: '100%', cursor: 'pointer' }}
                        />
                    </label>
                </div>

                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button onClick={onClose} style={{ padding: '10px 30px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Done</button>
                </div>
            </div>
        </div>
    );
};
