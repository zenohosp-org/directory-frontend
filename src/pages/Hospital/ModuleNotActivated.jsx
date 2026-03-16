import { useNavigate } from 'react-router-dom';
import '../../styles/shared.css';

export default function ModuleNotActivated({ moduleName = 'This module' }) {
    const navigate = useNavigate();
    return (
        <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center', maxWidth: 400 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
                <h2 className="page-title" style={{ marginBottom: 8 }}>Module Not Activated</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)', marginBottom: 24, lineHeight: 1.6 }}>
                    <strong>{moduleName}</strong> is not activated for your hospital. Contact your Super Admin to enable it.
                </p>
                <button className="btn-primary" onClick={() => navigate('/dashboard')}>
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}
