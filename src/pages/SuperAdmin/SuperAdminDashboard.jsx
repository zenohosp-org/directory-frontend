import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllHospitals, getAllModules } from '../../api/client';
import './SuperAdminDashboard.css';

function StatCard({ label, value, sub, color }) {
    return (
        <div className="stat-card" style={{ '--card-accent': color }}>
            <div className="stat-card__value">{value ?? '—'}</div>
            <div className="stat-card__label">{label}</div>
            {sub && <div className="stat-card__sub">{sub}</div>}
        </div>
    );
}

function ModuleUsageRow({ module, hospitals }) {
    const count = hospitals.filter((h) =>
        h.modules?.some((m) => m.code === module.code && m.isActive)
    ).length;
    const pct = hospitals.length ? Math.round((count / hospitals.length) * 100) : 0;

    return (
        <tr className="table-row">
            <td className="td">{module.name}</td>
            <td className="td">{module.code}</td>
            <td className="td">
                <div className="usage-bar">
                    <div className="usage-bar__fill" style={{ width: `${pct}%` }} />
                </div>
            </td>
            <td className="td td--right">{count} / {hospitals.length}</td>
        </tr>
    );
}

export default function SuperAdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [hospitals, setHospitals] = useState([]);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getAllHospitals(), getAllModules()])
            .then(([hRes, mRes]) => {
                setHospitals(hRes.data.data ?? []);
                setModules(mRes.data.data ?? []);
            })
            .finally(() => setLoading(false));
    }, []);

    const activeHospitals = hospitals.filter((h) => h.isActive).length;
    const totalModuleActivations = hospitals.reduce(
        (acc, h) => acc + (h.modules?.filter((m) => m.isActive).length ?? 0),
        0
    );

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-sub">Welcome back, {user?.firstName}. Here's the platform overview.</p>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">Loading...</div>
            ) : (
                <>
                    <div className="stat-grid">
                        <StatCard label="Total Hospitals" value={hospitals.length} sub={`${activeHospitals} active`} color="#0f62fe" />
                        <StatCard label="Module Activations" value={totalModuleActivations} sub="Across all hospitals" color="#198038" />
                        <StatCard label="Available Modules" value={modules.length} color="#6929c4" />
                        <StatCard label="Inactive Hospitals" value={hospitals.length - activeHospitals} color="#da1e28" />
                    </div>

                    <div className="section">
                        <div className="section-header">
                            <h2 className="section-title">Module Usage</h2>
                            <button className="btn-outline" onClick={() => navigate('/hospitals')}>
                                Manage Hospitals →
                            </button>
                        </div>
                        <div className="table-wrap">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className="th">Module</th>
                                        <th className="th">Code</th>
                                        <th className="th">Adoption</th>
                                        <th className="th th--right">Hospitals</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {modules.map((m) => (
                                        <ModuleUsageRow key={m.id} module={m} hospitals={hospitals} />
                                    ))}
                                    {modules.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="td empty-state">No modules configured.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="section">
                        <div className="section-header">
                            <h2 className="section-title">Recent Hospitals</h2>
                        </div>
                        <div className="table-wrap">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className="th">Name</th>
                                        <th className="th">City</th>
                                        <th className="th">Plan</th>
                                        <th className="th">Status</th>
                                        <th className="th">Modules</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hospitals.slice(0, 6).map((h) => (
                                        <tr
                                            key={h.id}
                                            className="table-row table-row--clickable"
                                            onClick={() => navigate(`/hospitals/${h.id}`)}
                                        >
                                            <td className="td td--bold">{h.name}</td>
                                            <td className="td">{h.city}, {h.state}</td>
                                            <td className="td"><span className="badge badge--plan">{h.subscriptionPlan}</span></td>
                                            <td className="td">
                                                <span className={`badge ${h.isActive ? 'badge--active' : 'badge--inactive'}`}>
                                                    {h.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="td">{h.modules?.filter((m) => m.isActive).length ?? 0} active</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
