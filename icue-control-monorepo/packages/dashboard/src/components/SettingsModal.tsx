import React from 'react';
import { X } from 'lucide-react';
import { glassStyle } from '../styles';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    activeTab: string;
    currentSettings: {
        showToolbar?: boolean;
        showLeftPanel?: boolean;
        showDebug?: boolean;
        iframeScale?: number;
    };
    updateSetting: (key: any, value: any) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen, onClose, activeTab, currentSettings, updateSetting
}) => {
    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(3px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ ...glassStyle, width: '400px', padding: '30px', background: 'rgba(24, 24, 27, 0.85)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>Settings ({activeTab === 'home' ? 'Home' : 'Beszel'})</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {activeTab === 'home' && (
                        <>
                            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', cursor: 'pointer' }}>
                                <span>Show Header (Crop)</span>
                                <input
                                    type="checkbox"
                                    checked={currentSettings.showToolbar ?? true}
                                    onChange={(e) => updateSetting('showToolbar', e.target.checked)}
                                    style={{ width: '20px', height: '20px' }}
                                />
                            </label>

                            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', cursor: 'pointer' }}>
                                <span>Show Left Controls</span>
                                <input
                                    type="checkbox"
                                    checked={currentSettings.showLeftPanel ?? true}
                                    onChange={(e) => updateSetting('showLeftPanel', e.target.checked)}
                                    style={{ width: '20px', height: '20px' }}
                                />
                            </label>
                        </>
                    )}

                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', cursor: 'pointer' }}>
                        <span>Show Debug Info</span>
                        <input
                            type="checkbox"
                            checked={currentSettings.showDebug ?? false}
                            onChange={(e) => updateSetting('showDebug', e.target.checked)}
                            style={{ width: '20px', height: '20px' }}
                        />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Iframe Scale</span>
                            <span style={{ opacity: 0.5 }}>{Math.round((currentSettings.iframeScale ?? 1.0) * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0.5"
                            max="1.5"
                            step="0.01"
                            value={currentSettings.iframeScale ?? 1.0}
                            onChange={(e) => updateSetting('iframeScale', parseFloat(e.target.value))}
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
