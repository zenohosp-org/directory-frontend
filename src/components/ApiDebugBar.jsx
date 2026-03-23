import { useState } from 'react';
import { API_BASE_URL } from '../api/client';

export default function ApiDebugBar() {
    const [isVisible, setIsVisible] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('zenohosp_debug') === 'true';
        }
        return false;
    });

    if (!isVisible) {
        return (
            <div style={{
                position: 'fixed',
                bottom: 0,
                right: 0,
                padding: '8px 12px',
                fontSize: '11px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '4px 4px 0 0',
                cursor: 'pointer',
                zIndex: 9999,
            }} onClick={() => setIsVisible(true)}>
                🔍 Debug
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#1e1e1e',
            color: '#00ff00',
            padding: '12px',
            fontSize: '12px',
            fontFamily: 'monospace',
            borderTop: '2px solid #00ff00',
            maxHeight: '120px',
            overflowY: 'auto',
            zIndex: 9999,
        }}>
            <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
                [DEBUG] ZenoHosp API Configuration
            </div>
            <div>API_BASE_URL: <strong>{API_BASE_URL}</strong></div>
            <div style={{ fontSize: '11px', marginTop: '8px', opacity: 0.7 }}>
                (localStorage.setItem('zenohosp_debug', 'false') to hide)
            </div>
            <button
                onClick={() => {
                    localStorage.setItem('zenohosp_debug', 'false');
                    setIsVisible(false);
                }}
                style={{
                    marginTop: '8px',
                    padding: '4px 8px',
                    backgroundColor: '#00ff00',
                    color: '#000',
                    border: 'none',
                    borderRadius: '3px',
                    fontSize: '11px',
                    cursor: 'pointer',
                }}
            >
                Hide Debug
            </button>
        </div>
    );
}
