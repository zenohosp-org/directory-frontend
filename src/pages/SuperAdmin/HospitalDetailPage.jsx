import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getHospitalById,
    getAllModules,
    activateModule,
    deactivateModule,
    updateHospital,
} from '../../api/client';
import '../../styles/shared.css';
import './HospitalDetailPage.css';

export default function HospitalDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hospital, setHospital] = useState(null);
    const [allModules, setAllModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState({});
    const [editing, setEditing] = useState(false);
    const [showAssignAdmin, setShowAssignAdmin] = useState(false);

    const refresh = () =>
        Promise.all([getHospitalById(id), getAllModules()])
            .then(([hRes, mRes]) => {
                setHospital(hRes.data.data);
                setAllModules(mRes.data.data ?? []);
            })
            .finally(() => setLoading(false));

    useEffect(() => { refresh(); }, [id]);

    const activeModuleIds = new Set(
        hospital?.modules?.filter((m) => m.isActive).map((m) => m.id) ?? []
    );

    const handleToggle = async (moduleId, isCurrentlyActive) => {
        setToggling((t) => ({ ...t, [moduleId]: true }));
        try {
            if (isCurrentlyActive) {
                await deactivateModule(id, moduleId);
            } else {
                await activateModule(id, moduleId);
            }
            await refresh();
        } finally {
            setToggling((t) => ({ ...t, [moduleId]: false }));
        }
    };

    if (loading) return <div className="page"><div className="loading-state">Loading…</div></div>;
    if (!hospital) return <div className="page"><div className="empty-state">Hospital not found.</div></div>;

    const activeCount = hospital.modules?.filter((m) => m.isActive).length ?? 0;

    return (
        <div className="page">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button className="btn-ghost btn--icon" onClick={() => navigate('/hospitals')}>←</button>
                    <div>
                        <h1 className="page-title">{hospital.name}</h1>
                        <p className="page-sub">
                            <span className="code-tag">{hospital.code}</span>&nbsp;·&nbsp;
                            {hospital.city}, {hospital.state}&nbsp;·&nbsp;
                            <span className={`badge ${hospital.isActive ? 'badge--active' : 'badge--inactive'}`}>
                                {hospital.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </p>
                    </div>
                </div>
                <button className="btn-outline" onClick={() => setEditing(true)}>Edit Hospital</button>
            </div>

            {/* Info cards */}
            <div className="detail-meta-grid">
                <MetaCard label="Email" value={hospital.email} />
                <MetaCard label="Phone" value={hospital.phone || '—'} />
                <MetaCard label="Plan" value={hospital.subscriptionPlan} badge />
                <MetaCard label="Active Modules" value={`${activeCount} / ${allModules.length}`} />
            </div>

            {hospital.description && (
                <p className="detail-desc">{hospital.description}</p>
            )}

            {/* Modules */}
            <div className="section">
                <div className="section-header">
                    <h2 className="section-title">Modules</h2>
                    <span className="section-sub">{activeCount} active</span>
                </div>
                <div className="module-grid">
                    {allModules.map((mod) => {
                        const isActive = activeModuleIds.has(mod.id);
                        const isLoading = toggling[mod.id];
                        return (
                            <div key={mod.id} className={`module-card${isActive ? ' module-card--active' : ''}`}>
                                <div className="module-card__top">
                                    <span className="module-card__icon">{mod.icon || '⬡'}</span>
                                    <span className={`badge ${isActive ? 'badge--active' : 'badge--inactive'}`}>
                                        {isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="module-card__name">{mod.name}</div>
                                <div className="module-card__code">{mod.code}</div>
                                {mod.description && (
                                    <div className="module-card__desc">{mod.description}</div>
                                )}
                                <button
                                    className={`module-card__btn ${isActive ? 'module-card__btn--deactivate' : 'module-card__btn--activate'}`}
                                    onClick={() => handleToggle(mod.id, isActive)}
                                    disabled={isLoading}
                                >
                                    {isLoading ? '…' : isActive ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Management Section */}
            <div className="section" style={{ marginTop: 40, borderTop: '1px solid #eee', paddingTop: 30 }}>
                <h2 className="section-title">Administration</h2>
                <div className="admin-actions" style={{ marginTop: 20 }}>
                    <div className="admin-card">
                        <div className="admin-card__info">
                            <div className="admin-card__title">Hospital Administrator</div>
                            <p className="admin-card__desc">Assign or update the main administrator for this hospital.</p>
                        </div>
                        <button className="btn-outline" onClick={() => setShowAssignAdmin(true)}>
                            Assign Admin
                        </button>
                    </div>
                </div>
            </div>

            {editing && (
                <EditHospitalModal
                    hospital={hospital}
                    onClose={() => setEditing(false)}
                    onSaved={() => { setEditing(false); refresh(); }}
                />
            )}

            {showAssignAdmin && (
                <AssignAdminModal
                    hospitalId={id}
                    onClose={() => setShowAssignAdmin(false)}
                    onSaved={() => { setShowAssignAdmin(false); refresh(); }}
                />
            )}
        </div>
    );
}

function AssignAdminModal({ hospitalId, onClose, onSaved }) {
    const [form, setForm] = useState({
        adminEmail: '', adminPassword: '', adminFirstName: '', adminLastName: '',
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { assignAdmin } = await import('../../api/client');
            await assignAdmin(hospitalId, form);
            onSaved();
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to assign admin.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal" style={{ maxWidth: 500 }}>
                <div className="modal-header">
                    <h2 className="modal-title">Assign Administrator</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                {error && <div className="alert alert--error">{error}</div>}
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="fg">
                        <label className="form-label">First Name</label>
                        <input className="form-input" name="adminFirstName" value={form.adminFirstName} onChange={set} required />
                    </div>
                    <div className="fg">
                        <label className="form-label">Last Name</label>
                        <input className="form-input" name="adminLastName" value={form.adminLastName} onChange={set} required />
                    </div>
                    <div className="fg">
                        <label className="form-label">Email</label>
                        <input className="form-input" name="adminEmail" type="email" value={form.adminEmail} onChange={set} required />
                    </div>
                    <div className="fg">
                        <label className="form-label">Password</label>
                        <input className="form-input" name="adminPassword" type="password" value={form.adminPassword} onChange={set} required />
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Assigning…' : 'Assign Administrator'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function MetaCard({ label, value, badge }) {
    return (
        <div className="meta-card">
            <div className="meta-card__label">{label}</div>
            <div className="meta-card__value">
                {badge ? <span className="badge badge--plan">{value}</span> : value}
            </div>
        </div>
    );
}

function EditHospitalModal({ hospital, onClose, onSaved }) {
    const [form, setForm] = useState({
        name: hospital.name, email: hospital.email, phone: hospital.phone || '',
        address: hospital.address || '', city: hospital.city || '', state: hospital.state || '',
        description: hospital.description || '', subscriptionPlan: hospital.subscriptionPlan || 'basic',
        logoUrl: hospital.logoUrl || '',
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateHospital(hospital.id, { ...form, code: hospital.code });
            onSaved();
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to update.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h2 className="modal-title">Edit — {hospital.name}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                {error && <div className="alert alert--error">{error}</div>}
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid-2">
                        {['name', 'email', 'phone', 'address', 'city', 'state', 'description', 'subscriptionPlan', 'logoUrl'].map((k) => (
                            <div key={k} className="fg">
                                <label className="form-label">{k.charAt(0).toUpperCase() + k.slice(1)}</label>
                                <input className="form-input" name={k} value={form[k]} onChange={set} />
                            </div>
                        ))}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
