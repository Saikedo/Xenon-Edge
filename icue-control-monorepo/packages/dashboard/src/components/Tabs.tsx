import React from 'react';
import { glassStyle } from '../styles';

interface TabsProps {
    tabs: { id: string; label: string }[];
    activeTab: string;
    onTabChange: (id: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div style={{
            ...glassStyle,
            padding: '4px',
            display: 'inline-flex',
            borderRadius: '12px',
            background: 'rgba(0, 0, 0, 0.4)',
            gap: '4px'
        }}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        style={{
                            background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '6px 20px',
                            color: isActive ? '#fff' : '#aaa',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s ease',
                            boxShadow: isActive ? '0 2px 10px rgba(0,0,0,0.2)' : 'none',
                        }}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};
