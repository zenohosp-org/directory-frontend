import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import './UsersRolesPage.css';

const BLANK_USER = {
    firstName: '', lastName: '', email: '', password: '', roleId: '',
    employeeCode: '', designation: '', gender: 'MALE', dateOfJoining: ''
};

const BLANK_ROLE = {
    name: '', displayName: '', description: ''
};

const BLANK_MODULES = {
    canAccessHms: true, canAccessAsset: true, canAccessInventory: true,
    canAccessOt: true, canAccessPharmacy: true
};

export default function UsersRolesPage() {
    const { id: urlHospitalId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users');

    // State
    const [roles, setRoles] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [showUserModal, setShowUserModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showModuleModal, setShowModuleModal] = useState(false);

    // Editing State
    const [editingUser, setEditingUser] = useState(null);
    const [editingRole, setEditingRole] = useState(null);
    const [selectedUserForModules, setSelectedUserForModules] = useState(null);
    const [moduleAccess, setModuleAccess] = useState(BLANK_MODULES);

    const queryParams = urlHospitalId ? `?hospitalId=${urlHospitalId}` : '';

    useEffect(() => {
        fetchData();
    }, [urlHospitalId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rRes, uRes] = await Promise.all([
                api.get(`/api/admin/roles${queryParams}`),
                api.get(`/api/admin/users${queryParams}`)
            ]);
            setRoles(rRes.data.data || []);
            setUsers(uRes.data.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveUser = async (formData) => {
        try {
            if (editingUser) {
                // await api.put(`/api/admin/users/${editingUser.id}${queryParams}`, formData);
                alert('User update not fully implemented in backend yet, but UI is ready');
            } else {
                await api.post(`/api/admin/users${queryParams}`, formData);
                alert('User created successfully');
            }
            setShowUserModal(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving user');
        }
    };

    const handleSaveRole = async (formData) => {
        try {
            if (editingRole) {
                await api.put(`/api/admin/roles/${editingRole.id}${queryParams}`, formData);
                alert('Role updated successfully');
            } else {
                await api.post(`/api/admin/roles${queryParams}`, formData);
                alert('Role created successfully');
            }
            setShowRoleModal(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving role');
        }
    };

    const handleUpdateModules = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/api/admin/users/${selectedUserForModules.id}/modules${queryParams}`, moduleAccess);
            setShowModuleModal(false);
            fetchData();
            alert('User modules updated successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating modules');
        }
    };

    const openModuleModal = (user) => {
        setSelectedUserForModules(user);
        setModuleAccess({
            canAccessHms: user.canAccessHms ?? true,
            canAccessAsset: user.canAccessAsset ?? true,
            canAccessInventory: user.canAccessInventory ?? true,
            canAccessOt: user.canAccessOt ?? true,
            canAccessPharmacy: user.canAccessPharmacy ?? true
        });
        setShowModuleModal(true);
    };

    return (
        <div className="users-roles-page">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {urlHospitalId && (
                        <button className="btn-secondary" onClick={() => navigate(`/hospitals/${urlHospitalId}`)} style={{ padding: '0.5rem', minWidth: 0 }}>
                            ←
                        </button>
                    )}
                    <div>
                        <h1 className="page-title">Users & Roles</h1>
                        <p className="page-sub">Manage staff accounts and custom permissions.</p>
                    </div>
                </div>
                <div className="page-actions">
                    {activeTab === 'users' ? (
                        <button className="btn-primary" onClick={() => { setEditingUser(null); setShowUserModal(true); }}>
                            + Add User
                        </button>
                    ) : (
                        <button className="btn-primary" onClick={() => { setEditingRole(null); setShowRoleModal(true); }}>
                            + Add Role
                        </button>
                    )}
                </div>
            </div>

            <div className="tabs-container">
                <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
                <button className={`tab-btn ${activeTab === 'roles' ? 'active' : ''}`} onClick={() => setActiveTab('roles')}>Roles</button>
            </div>

            {loading ? (
                <div className="loading-state">Loading data...</div>
            ) : (
                <main className="content-area">
                    {activeTab === 'users' ? (
                        <div className="table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>User Info</th>
                                        <th>Employee Code</th>
                                        <th>Designation</th>
                                        <th>Role</th>
                                        <th>Access</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td>
                                                <div className="user-info">
                                                    <span className="user-name">{u.firstName} {u.lastName}</span>
                                                    <span className="user-email">{u.email}</span>
                                                </div>
                                            </td>
                                            <td>{u.employeeCode || '—'}</td>
                                            <td>{u.designation || '—'}</td>
                                            <td><span className="role-tag">{u.role?.displayName}</span></td>
                                            <td>
                                                <button className="btn-icon-link" onClick={() => openModuleModal(u)}>
                                                    Manage Modules
                                                </button>
                                            </td>
                                            <td>
                                                <button className="btn-icon-link" onClick={() => { setEditingUser(u); setShowUserModal(true); }}>Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Role Name</th>
                                        <th>Description</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.map(r => (
                                        <tr key={r.id}>
                                            <td className="user-name">{r.displayName}</td>
                                            <td>{r.description || '—'}</td>
                                            <td>
                                                <button className="btn-icon-link" onClick={() => { setEditingRole(r); setShowRoleModal(true); }}>Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            )}

            {/* Modals */}
            {showUserModal && (
                <UserFormModal 
                    initialData={editingUser || BLANK_USER} 
                    roles={roles} 
                    onClose={() => setShowUserModal(false)} 
                    onSave={handleSaveUser} 
                />
            )}

            {showRoleModal && (
                <RoleFormModal 
                    initialData={editingRole || BLANK_ROLE} 
                    onClose={() => setShowRoleModal(false)} 
                    onSave={handleSaveRole} 
                />
            )}

            {showModuleModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModuleModal(false)}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">Module Access: {selectedUserForModules?.firstName}</h3>
                            <button className="close-btn" onClick={() => setShowModuleModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleUpdateModules}>
                            <div className="modal-body">
                                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
                                    Override default role permissions for this specific user.
                                </p>
                                <div className="module-access-grid">
                                    <Checkbox label="HMS Module" checked={moduleAccess.canAccessHms} onChange={val => setModuleAccess({ ...moduleAccess, canAccessHms: val })} />
                                    <Checkbox label="Asset Manager" checked={moduleAccess.canAccessAsset} onChange={val => setModuleAccess({ ...moduleAccess, canAccessAsset: val })} />
                                    <Checkbox label="Inventory" checked={moduleAccess.canAccessInventory} onChange={val => setModuleAccess({ ...moduleAccess, canAccessInventory: val })} />
                                    <Checkbox label="OT Module" checked={moduleAccess.canAccessOt} onChange={val => setModuleAccess({ ...moduleAccess, canAccessOt: val })} />
                                    <Checkbox label="Pharmacy" checked={moduleAccess.canAccessPharmacy} onChange={val => setModuleAccess({ ...moduleAccess, canAccessPharmacy: val })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowModuleModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Access</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Modal Components ── */

function UserFormModal({ initialData, roles, onClose, onSave }) {
    const [form, setForm] = useState(initialData);
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                <div className="modal-header">
                    <h3 className="modal-title">{initialData.id ? 'Edit User' : 'Add New User'}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
                    <div className="modal-body">
                        <div className="form-grid">
                            <div className="form-group"><label className="form-label">First Name</label><input className="form-input" name="firstName" value={form.firstName} onChange={handleChange} required /></div>
                            <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" name="lastName" value={form.lastName} onChange={handleChange} required /></div>
                            <div className="form-group full"><label className="form-label">Email Address</label><input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} required /></div>
                            {!initialData.id && <div className="form-group full"><label className="form-label">Password</label><input className="form-input" type="password" name="password" value={form.password} onChange={handleChange} required /></div>}
                            <div className="form-group"><label className="form-label">Employee Code</label><input className="form-input" name="employeeCode" value={form.employeeCode} onChange={handleChange} /></div>
                            <div className="form-group"><label className="form-label">Designation</label><input className="form-input" name="designation" value={form.designation} onChange={handleChange} /></div>
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select className="form-input" name="roleId" value={form.roleId} onChange={handleChange} required>
                                    <option value="">Select Role</option>
                                    {roles.map(r => <option key={r.id} value={r.id}>{r.displayName}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Gender</label>
                                <select className="form-input" name="gender" value={form.gender} onChange={handleChange}>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">{initialData.id ? 'Update User' : 'Create User'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function RoleFormModal({ initialData, onClose, onSave }) {
    const [form, setForm] = useState(initialData);
    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-content">
                <div className="modal-header">
                    <h3 className="modal-title">{initialData.id ? 'Edit Role' : 'Create Custom Role'}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSave(form); }}>
                    <div className="modal-body">
                        <div className="form-grid">
                            <div className="form-group full"><label className="form-label">Internal Name (e.g. ward_nurse)</label><input className="form-input" name="name" value={form.name} onChange={handleChange} disabled={!!initialData.id} required /></div>
                            <div className="form-group full"><label className="form-label">Display Name (e.g. Ward Nurse)</label><input className="form-input" name="displayName" value={form.displayName} onChange={handleChange} required /></div>
                            <div className="form-group full"><label className="form-label">Description</label><textarea className="form-input" name="description" value={form.description} onChange={handleChange} rows="2" /></div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary">{initialData.id ? 'Save Changes' : 'Create Role'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Checkbox({ label, checked, onChange }) {
    return (
        <label className="checkbox-label">
            <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
            {label}
        </label>
    );
}
