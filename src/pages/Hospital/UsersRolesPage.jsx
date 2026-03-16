import { useState, useEffect } from 'react';
import api from '../../api/client';
import './UsersRolesPage.css';

export default function UsersRolesPage() {
    const [activeTab, setActiveTab] = useState('users');

    // Roles State
    const [roles, setRoles] = useState([]);
    const [newRole, setNewRole] = useState({ name: '', displayName: '', canAccessHms: false, canAccessAsset: false, canAccessInventory: false, canAccessOt: false, canAccessPharmacy: false });
    const [editingRoleId, setEditingRoleId] = useState(null);
    const [loadingRoles, setLoadingRoles] = useState(false);

    // Users State
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        roleId: '',
        employeeCode: '',
        designation: '',
        gender: 'MALE',
        dateOfJoining: ''
    });
    const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
        fetchRoles();
        fetchUsers();
    }, []);

    const fetchRoles = async () => {
        setLoadingRoles(true);
        try {
            const res = await api.get('/api/admin/roles');
            setRoles(res.data.data || []);
        } catch (error) {
            console.error('Error fetching roles:', error);
        } finally {
            setLoadingRoles(false);
        }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const res = await api.get('/api/admin/users');
            setUsers(res.data.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleSaveRole = async (e) => {
        e.preventDefault();
        try {
            if (editingRoleId) {
                await api.put(`/api/admin/roles/${editingRoleId}`, newRole);
                setEditingRoleId(null);
                setNewRole({ name: '', displayName: '', canAccessHms: false, canAccessAsset: false, canAccessInventory: false, canAccessOt: false, canAccessPharmacy: false });
                fetchRoles();
                alert('Role updated successfully');
            } else {
                await api.post('/api/admin/roles', newRole);
                setNewRole({ name: '', displayName: '', canAccessHms: false, canAccessAsset: false, canAccessInventory: false, canAccessOt: false, canAccessPharmacy: false });
                fetchRoles();
                alert('Role created successfully');
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving role');
        }
    };

    const startEditRole = (role) => {
        setEditingRoleId(role.id);
        setNewRole({
            name: role.name || '',
            displayName: role.displayName || '',
            canAccessHms: role.canAccessHms || false,
            canAccessAsset: role.canAccessAsset || false,
            canAccessInventory: role.canAccessInventory || false,
            canAccessOt: role.canAccessOt || false,
            canAccessPharmacy: role.canAccessPharmacy || false
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEditRole = () => {
        setEditingRoleId(null);
        setNewRole({ name: '', displayName: '', canAccessHms: false, canAccessAsset: false, canAccessInventory: false, canAccessOt: false, canAccessPharmacy: false });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/admin/users', newUser);
            setNewUser({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                roleId: '',
                employeeCode: '',
                designation: '',
                gender: 'MALE',
                dateOfJoining: ''
            });
            fetchUsers();
            alert('User created successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating user');
        }
    };

    return (
        <div className="users-roles-page">
            <h1 style={{ marginBottom: '20px' }}>User & Role Management</h1>

            <main className="main-content">
                <div className="tabs">
                    <button className={`tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
                    <button className={`tab ${activeTab === 'roles' ? 'active' : ''}`} onClick={() => setActiveTab('roles')}>Roles</button>
                </div>

                {activeTab === 'users' && (
                    <div className="tab-pane">
                        <h2>Add User</h2>
                        <form className="admin-form" onSubmit={handleCreateUser}>
                            <div className="form-group">
                                <label>First Name</label>
                                <input required type="text" value={newUser.firstName} onChange={e => setNewUser({ ...newUser, firstName: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Last Name</label>
                                <input required type="text" value={newUser.lastName} onChange={e => setNewUser({ ...newUser, lastName: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input required type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input required type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Employee Code</label>
                                <input type="text" value={newUser.employeeCode} onChange={e => setNewUser({ ...newUser, employeeCode: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Designation</label>
                                <input type="text" value={newUser.designation} onChange={e => setNewUser({ ...newUser, designation: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Gender</label>
                                <select value={newUser.gender} onChange={e => setNewUser({ ...newUser, gender: e.target.value })}>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Date of Joining</label>
                                <input type="date" value={newUser.dateOfJoining} onChange={e => setNewUser({ ...newUser, dateOfJoining: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select required value={newUser.roleId} onChange={e => setNewUser({ ...newUser, roleId: e.target.value })}>
                                    <option value="">Select Role</option>
                                    {roles?.map(r => (
                                        <option key={r.id} value={r.id}>{r.displayName}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="btn-primary">Create User</button>
                        </form>

                        <h3>Existing Users</h3>
                        {loadingUsers ? <p>Loading...</p> : (
                            <table className="admin-table">
                                <thead><tr><th>Name</th><th>Email</th><th>Code</th><th>Role</th></tr></thead>
                                <tbody>
                                    {users?.map(u => (
                                        <tr key={u.id}>
                                            <td>{u.firstName} {u.lastName}</td>
                                            <td>{u.email}</td>
                                            <td>{u.employeeCode}</td>
                                            <td>{u.role?.displayName}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {activeTab === 'roles' && (
                    <div className="tab-pane">
                        <h2>{editingRoleId ? 'Edit Role' : 'Create Role'}</h2>
                        <form className="admin-form" onSubmit={handleSaveRole}>
                            <div className="form-group">
                                <label>Internal Name (e.g. ward_nurse)</label>
                                <input required type="text" value={newRole.name} onChange={e => setNewRole({ ...newRole, name: e.target.value })} disabled={editingRoleId !== null} />
                            </div>
                            <div className="form-group">
                                <label>Display Name (e.g. Ward Nurse)</label>
                                <input required type="text" value={newRole.displayName} onChange={e => setNewRole({ ...newRole, displayName: e.target.value })} />
                            </div>

                            <h3>Module Access</h3>
                            <div className="module-checkboxes">
                                <label><input type="checkbox" checked={newRole.canAccessHms} onChange={e => setNewRole({ ...newRole, canAccessHms: e.target.checked })} /> HMS</label>
                                <label><input type="checkbox" checked={newRole.canAccessAsset} onChange={e => setNewRole({ ...newRole, canAccessAsset: e.target.checked })} /> Asset</label>
                                <label><input type="checkbox" checked={newRole.canAccessInventory} onChange={e => setNewRole({ ...newRole, canAccessInventory: e.target.checked })} /> Inventory</label>
                                <label><input type="checkbox" checked={newRole.canAccessOt} onChange={e => setNewRole({ ...newRole, canAccessOt: e.target.checked })} /> OT</label>
                                <label><input type="checkbox" checked={newRole.canAccessPharmacy} onChange={e => setNewRole({ ...newRole, canAccessPharmacy: e.target.checked })} /> Pharmacy</label>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn-primary mt-4">{editingRoleId ? 'Save Changes' : 'Create Role'}</button>
                                {editingRoleId && (
                                    <button type="button" className="btn-secondary mt-4" style={{ backgroundColor: '#6c757d', color: 'white', padding: '10px 15px', borderRadius: '4px', border: 'none', cursor: 'pointer' }} onClick={cancelEditRole}>Cancel</button>
                                )}
                            </div>
                        </form>

                        <h3>Existing Roles</h3>
                        {loadingRoles ? <p>Loading...</p> : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Role</th>
                                        <th>HMS</th>
                                        <th>Asset</th>
                                        <th>Inventory</th>
                                        <th>OT</th>
                                        <th>Pharmacy</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles?.map(r => (
                                        <tr key={r.id}>
                                            <td>{r.displayName}</td>
                                            <td>{r.canAccessHms ? '✅' : '❌'}</td>
                                            <td>{r.canAccessAsset ? '✅' : '❌'}</td>
                                            <td>{r.canAccessInventory ? '✅' : '❌'}</td>
                                            <td>{r.canAccessOt ? '✅' : '❌'}</td>
                                            <td>{r.canAccessPharmacy ? '✅' : '❌'}</td>
                                            <td>
                                                <button
                                                    onClick={() => startEditRole(r)}
                                                    style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
