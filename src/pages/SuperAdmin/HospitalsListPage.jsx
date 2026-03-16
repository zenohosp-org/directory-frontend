import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllHospitals, createHospital } from '../../api/client';
import '../../styles/shared.css';

export default function HospitalsListPage() {
    const navigate = useNavigate();
    const [hospitals, setHospitals] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    useEffect(() => {
        getAllHospitals()
            .then((r) => setHospitals(r.data.data ?? []))
            .finally(() => setLoading(false));
    }, []);

    const filtered = hospitals.filter(
        (h) =>
            h.name.toLowerCase().includes(search.toLowerCase()) ||
            h.city?.toLowerCase().includes(search.toLowerCase()) ||
            h.code?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Hospitals</h1>
                    <p className="page-sub">{hospitals.length} hospitals registered on the platform</p>
                </div>
                <div className="page-actions">
                    <button className="btn-primary" onClick={() => setShowCreate(true)}>
                        + New Hospital
                    </button>
                </div>
            </div>

            <div className="toolbar">
                <input
                    className="search-input"
                    type="search"
                    placeholder="Search by name, city, or code…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="loading-state">Loading hospitals…</div>
            ) : (
                <div className="table-wrap">
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="th">Hospital</th>
                                <th className="th">Code</th>
                                <th className="th">Location</th>
                                <th className="th">Plan</th>
                                <th className="th">Active Modules</th>
                                <th className="th">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((h) => (
                                <tr
                                    key={h.id}
                                    className="table-row table-row--clickable"
                                    onClick={() => navigate(`/hospitals/${h.id}`)}
                                >
                                    <td className="td">
                                        <div className="td--bold">{h.name}</div>
                                        <div className="td--muted">{h.email}</div>
                                    </td>
                                    <td className="td"><span className="code-tag">{h.code}</span></td>
                                    <td className="td">{h.city}, {h.state}</td>
                                    <td className="td">
                                        <span className="badge badge--plan">{h.subscriptionPlan ?? '—'}</span>
                                    </td>
                                    <td className="td">
                                        {h.modules?.filter((m) => m.isActive).length ?? 0} active
                                    </td>
                                    <td className="td">
                                        <span className={`badge ${h.isActive ? 'badge--active' : 'badge--inactive'}`}>
                                            {h.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="td empty-state">
                                        {search ? 'No hospitals match your search.' : 'No hospitals yet.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showCreate && (
                <CreateHospitalModal
                    onClose={() => setShowCreate(false)}
                    onCreated={(h) => { setHospitals((prev) => [h, ...prev]); setShowCreate(false); }}
                />
            )}
        </div>
    );
}

/* ── Inline Create Modal ── */
const BLANK = {
    name: '', code: '', email: '', phone: '',
    address: '', city: '', state: '', description: '', subscriptionPlan: 'basic',
    adminEmail: '', adminPassword: '', adminFirstName: '', adminLastName: '',
};

function CreateHospitalModal({ onClose, onCreated }) {
    const [form, setForm] = useState(BLANK);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            const res = await createHospital(form);
            onCreated(res.data.data);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to create hospital.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <h2 className="modal-title">New Hospital</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                {error && <div className="alert alert--error">{error}</div>}
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid-2">
                        <Field label="Hospital Name *" name="name" value={form.name} onChange={set} required />
                        <Field label="Code (e.g. SRM) *" name="code" value={form.code} onChange={set} required />
                        <Field label="Email *" name="email" type="email" value={form.email} onChange={set} required />
                        <Field label="Phone" name="phone" value={form.phone} onChange={set} />
                        <div className="fg">
                            <label className="form-label">Subscription Plan</label>
                            <select name="subscriptionPlan" value={form.subscriptionPlan} onChange={set} className="form-input">
                                <option value="basic">Basic</option>
                                <option value="standard">Standard</option>
                                <option value="enterprise">Enterprise</option>
                            </select>
                        </div>
                        <Field label="Address" name="address" value={form.address} onChange={set} />
                        <Field label="City" name="city" value={form.city} onChange={set} />
                        <Field label="State" name="state" value={form.state} onChange={set} />
                        <Field label="Description" name="description" value={form.description} onChange={set} />
                    </div>

                    <div className="modal-section-title">Initial Admin (optional)</div>
                    <div className="form-grid-2">
                        <Field label="Admin First Name" name="adminFirstName" value={form.adminFirstName} onChange={set} />
                        <Field label="Admin Last Name" name="adminLastName" value={form.adminLastName} onChange={set} />
                        <Field label="Admin Email" name="adminEmail" type="email" value={form.adminEmail} onChange={set} />
                        <Field label="Admin Password" name="adminPassword" type="password" value={form.adminPassword} onChange={set} />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Creating…' : 'Create Hospital'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Field({ label, name, type = 'text', value, onChange, required }) {
    return (
        <div className="fg">
            <label className="form-label">{label}</label>
            <input
                className="form-input"
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
            />
        </div>
    );
}
