import React from 'react';
import { Settings } from 'lucide-react';

interface BeszelFrameProps {
    iframeScale: number;
    showDebug: boolean;
    showHeader: boolean;
    onOpenSettings: () => void;
}

export const BeszelFrame: React.FC<BeszelFrameProps> = ({ iframeScale, showHeader, onOpenSettings }) => {
    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    // Send visibility checks to the iframe
    React.useEffect(() => {
        const sendUpdate = () => {
            if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage({
                    type: 'BESZEL_UPDATE',
                    showHeader
                }, '*');
            }
        };

        sendUpdate();
        const interval = setInterval(sendUpdate, 1000); // Keep attempting until loaded/ready
        return () => clearInterval(interval);
    }, [showHeader]);

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
                ref={iframeRef}
                onLoad={() => {
                    // Send immediate update on load
                    iframeRef.current?.contentWindow?.postMessage({
                        type: 'BESZEL_UPDATE',
                        showHeader
                    }, '*');
                }}
                // Use dedicated port 9443 (HTTPS) on the same host to avoid Mixed Content
                src={`https://${window.location.hostname}:9443/`}
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
