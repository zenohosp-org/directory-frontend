import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const SUPER_ADMIN_NAV = [
    { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
    { to: '/hospitals', icon: '🏥', label: 'Hospitals' },
    { to: '/users', icon: '🛡️', label: 'Roles' },
];

const HOSPITAL_ADMIN_NAV = [
    { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
    { to: '/users', icon: '👥', label: 'Users & Roles' },
];

const DOCTOR_STAFF_NAV = [
    { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
];

// Module routes are injected dynamically based on active modules
const MODULE_NAV_MAP = {
    HMS: { to: '/patients', icon: '🩺', label: 'Patients' },
    PHARMACY: { to: '/pharmacy', icon: '💊', label: 'Pharmacy' },
    OT: { to: '/ot', icon: '🔬', label: 'OT' },
    ASSET: { to: '/asset', icon: '🗂️', label: 'Assets' },
    INVENTORY: { to: '/inventory', icon: '📦', label: 'Inventory' },
};

export default function Sidebar({ activeModules = [] }) {
    const { user, isSuperAdmin, isHospitalAdmin, logout } = useAuth();
    const navigate = useNavigate();

    let baseNav = isSuperAdmin
        ? SUPER_ADMIN_NAV
        : isHospitalAdmin
            ? HOSPITAL_ADMIN_NAV
            : DOCTOR_STAFF_NAV;

    // For hospital users, append module nav items based on active modules
    // Extract module list. If user object has modules, use that (for hospital users)
    const userModules = user?.modules ?? activeModules;

    const moduleNav = !isSuperAdmin
        ? userModules
            .filter((m) => m.isActive && MODULE_NAV_MAP[m.code])
            .map((m) => MODULE_NAV_MAP[m.code])
        : [];

    const navItems = [...baseNav, ...moduleNav];

    const handleLogout = async () => {
        logout();
    };

    return (
        <aside className="sidebar">
            <div className="sidebar__brand">
                <span className="sidebar__logo">Z</span>
                <span className="sidebar__name">ZenoHosp</span>
            </div>

            {user?.hospitalName && (
                <div className="sidebar__hospital">
                    <span className="sidebar__hospital-label">HOSPITAL</span>
                    <span className="sidebar__hospital-name">{user.hospitalName}</span>
                </div>
            )}

            <nav className="sidebar__nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
                        }
                    >
                        <span className="sidebar__icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar__footer">
                <div className="sidebar__user">
                    <div className="sidebar__avatar">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div className="sidebar__user-info">
                        <span className="sidebar__user-name">
                            {user?.firstName} {user?.lastName}
                        </span>
                        <span className="sidebar__user-role">{user?.role?.replace('_', ' ')}</span>
                    </div>
                </div>
                <button className="sidebar__logout" onClick={handleLogout} title="Sign out">
                    ⎋
                </button>
            </div>
        </aside>
    );
}
