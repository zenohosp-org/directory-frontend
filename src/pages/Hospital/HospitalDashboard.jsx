import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getActiveModules, getAllModules } from '../../api/client';
import '../../styles/shared.css';
import './HospitalDashboard.css';

const MODULE_META = {
    HMS:       { icon: '🩺', label: 'Patients',           route: '/patients',  desc: 'Manage patient records and visits' },
    PHARMACY:  { icon: '💊', label: 'Pharmacy',           route: '/pharmacy',  desc: 'Drug inventory and dispensing' },
    OT:        { icon: '🔬', label: 'Operation Theatre',  route: '/ot',        desc: 'Schedule and track OT procedures' },
    ASSET:     { icon: '🗂️', label: 'Assets',             route: '/asset',     desc: 'Track hospital equipment and assets' },
    INVENTORY: { icon: '📦', label: 'Inventory',          route: '/inventory', desc: 'General supply management' },
};

export default function HospitalDashboard() {
    const { user, isHospitalAdmin, loading: authLoading } = useAuth();
    const [hospitalModules, setHospitalModules] = useState([]);
    const [allModules, setAllModules]           = useState([]);
    const [loading, setLoading]                 = useState(true);
    const [error, setError]                     = useState(null); // was missing — caused ReferenceError

    useEffect(() => {
        // Wait for auth to resolve before doing anything
        if (authLoading) return;

        // No user = session invalid, nothing to fetch
        if (!user?.hospitalId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        Promise.all([
            getActiveModules(user.hospitalId),
            getAllModules()
        ])
            .then(([activeRes, allRes]) => {
                setHospitalModules(activeRes.data.data ?? []);
                setAllModules(allRes.data.data ?? []);
            })
            .catch(err => {
                console.error('Failed to load modules:', err);
                if (err.response?.status === 401) {
                    setError('Your session has expired. Please log in again.');
                } else {
                    setError('Failed to load modules. Please refresh the page.');
                }
            })
            .finally(() => setLoading(false));
    }, [user?.hospitalId, authLoading]);

    const activeCodes = new Set(hospitalModules.map(m => m.code.toUpperCase()));

    const items = allModules.map(m => {
        const code = m.code.toUpperCase();
        const meta = MODULE_META[code] || {
            icon: '📦',
            label: m.name,
            route: `#/${m.code}`,
            desc: m.description
        };
        return { ...m, ...meta, isActive: activeCodes.has(code) };
    });

    // Still waiting for auth cookie validation
    if (authLoading) {
        return (
            <div className="page">
                <div className="no-modules">
                    <p className="no-modules__text">🔄 Verifying session...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-sub">
                        Welcome back, {user?.firstName}.{' '}
                        {hospitalModules.length} module{hospitalModules.length !== 1 ? 's' : ''} currently active.
                    </p>
                </div>
                <div className="hosp-role-badge">
                    <span className="badge badge--plan">{user?.role?.replace('_', ' ')}</span>
                </div>
            </div>

            {error && (
                <div className="error-banner" style={{
                    padding: '12px 16px',
                    marginBottom: '16px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#991b1b',
                    fontSize: '0.9rem'
                }}>
                    ⚠️ {error}
                    {error.includes('session') && (
                        <a href="/login" style={{ marginLeft: 8, textDecoration: 'underline' }}>
                            Log in again
                        </a>
                    )}
                </div>
            )}

            <div className="section">
                <div className="section-header">
                    <h2 className="section-title">Institutional Suite</h2>
                    <span className="section-sub">Activated features and available options</span>
                </div>

                {loading ? (
                    <div className="no-modules">
                        <p className="no-modules__text">🔄 Updating your workspace...</p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="no-modules">
                        <p className="no-modules__text">No modules configured for your hospital.</p>
                    </div>
                ) : (
                    <div className="app-grid">
                        {items.map((m) => (
                            <a
                                key={m.code}
                                href={m.isActive ? m.route : '#'}
                                className={`app-tile ${!m.isActive ? 'app-tile--locked' : ''}`}
                                onClick={(e) => !m.isActive && e.preventDefault()}
                            >
                                <div className="app-tile__top">
                                    <div className="app-tile__icon">{m.icon}</div>
                                    <span className={`badge ${m.isActive ? 'badge--active' : 'badge--inactive'}`}>
                                        {m.isActive ? 'Activated' : 'Locked'}
                                    </span>
                                </div>
                                <div className="app-tile__label">{m.label}</div>
                                <div className="app-tile__desc">{m.desc}</div>
                                {m.isActive ? (
                                    <div className="app-tile__arrow">Launch →</div>
                                ) : (
                                    <div className="app-tile__status-msg">Contact Super Admin to activate</div>
                                )}
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {isHospitalAdmin && (
                <div className="section">
                    <h2 className="section-title" style={{ marginBottom: 14 }}>Administration</h2>
                    <div className="app-grid">
                        <a href="/users" className="app-tile app-tile--admin">
                            <div className="app-tile__icon">👥</div>
                            <div className="app-tile__label">Users</div>
                            <div className="app-tile__desc">Manage doctors and staff accounts</div>
                            <div className="app-tile__arrow">→</div>
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}