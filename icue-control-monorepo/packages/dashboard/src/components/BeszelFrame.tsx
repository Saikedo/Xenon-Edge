import React from 'react';
import { Settings } from 'lucide-react';

interface BeszelFrameProps {
    iframeScale: number;
    showDebug: boolean; // Just in case we want to show debug overlay specific to this view later
    onOpenSettings: () => void;
}

export const BeszelFrame: React.FC<BeszelFrameProps> = ({ iframeScale, onOpenSettings }) => {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            flex: 1
        }}>
            {/* Floating Settings Button */}
            <button
                onClick={onOpenSettings}
                style={{
                    position: 'absolute', top: '10px', right: '10px', zIndex: 10,
                    width: '40px', height: '40px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.5)', color: 'white', backdropFilter: 'blur(4px)'
                }}
                title="Settings"
            >
                <Settings size={16} />
            </button>

            <iframe
                // Use dedicated port 8443 (HTTPS) on the same host to avoid Mixed Content
                src={`https://${window.location.hostname}:8443/`}
                style={{
                    width: `${100 / iframeScale}%`,
                    height: `${100 / iframeScale}%`,
                    border: 'none',
                    transform: `scale(${iframeScale})`,
                    transformOrigin: 'top left',
                }}
            />
        </div>
    );
};
