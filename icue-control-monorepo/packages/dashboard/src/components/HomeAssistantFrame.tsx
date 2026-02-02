import React from 'react';
import { Settings } from 'lucide-react';
import { IFRAME_URL } from '../config';

interface HomeAssistantFrameProps {
    showToolbar: boolean;
    showLeftPanel: boolean;
    onOpenSettings: () => void;
    iframeScale: number;
}

export const HomeAssistantFrame: React.FC<HomeAssistantFrameProps> = ({
    showToolbar, showLeftPanel, onOpenSettings, iframeScale
}) => {
    return (
        <div style={{ flex: showLeftPanel ? '0 0 60%' : 1, minWidth: showLeftPanel ? '752px' : '100%', boxSizing: 'border-box', position: 'relative', overflow: 'hidden', transition: 'flex 0.3s ease' }}>
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
                src={IFRAME_URL}
                style={{
                    width: `${100 / iframeScale}%`,
                    height: showToolbar ? `${100 / iframeScale}%` : `calc(${100 / iframeScale}% + 56px)`,
                    marginTop: showToolbar ? '0px' : '-56px',
                    border: 'none',
                    transform: `scale(${iframeScale})`,
                    transformOrigin: 'top left',
                }}
            />
        </div >
    );
};
