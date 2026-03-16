import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute, GuestRoute } from './components/RouteGuards';

// Layout
import AppLayout from './components/AppLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Login/Login';
import SuperAdminDashboard from './pages/SuperAdmin/SuperAdminDashboard';
import HospitalsListPage from './pages/SuperAdmin/HospitalsListPage';
import HospitalDetailPage from './pages/SuperAdmin/HospitalDetailPage';
import HospitalDashboard from './pages/Hospital/HospitalDashboard';
import ModuleNotActivated from './pages/Hospital/ModuleNotActivated';
import UsersRolesPage from './pages/Hospital/UsersRolesPage';
import {
  PatientsPage,
  PatientCreatePage,
  PharmacyPage,
  OTPage,
  AssetPage,
  InventoryPage,
} from './pages/Hospital/ModulePages';

/**
 * Smart Dashboard — routes to the right dashboard based on role.
 */
function DashboardRouter() {
  const { isSuperAdmin, user } = useAuth();
  // For hospital users we'd normally fetch active modules; pass empty for now
  // (module data can be lifted up later when the hospital-admin API is ready)
  if (isSuperAdmin) return <SuperAdminDashboard />;
  return <HospitalDashboard activeModules={user?.modules ?? []} />;
}

/**
 * Module guard — checks if module is active; if not, shows ModuleNotActivated.
 * When hospital-admin modules API is ready, replace the placeholder check.
 */
function ModuleRoute({ moduleCode, moduleName, children }) {
  const { user, isSuperAdmin } = useAuth();
  // Super admins bypass module guard
  if (isSuperAdmin) return children;
  // For now, allow access (will be gated once modules API is wired)
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />

          {/* ── Protected — all authenticated users ── */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard — role-aware */}
            <Route path="/dashboard" element={<DashboardRouter />} />

            {/* Super Admin pages */}
            <Route
              path="/hospitals"
              element={
                <ProtectedRoute roles={['super_admin']}>
                  <HospitalsListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/hospitals/:id"
              element={
                <ProtectedRoute roles={['super_admin']}>
                  <HospitalDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Hospital portal — HMS */}
            <Route
              path="/patients"
              element={
                <ModuleRoute moduleCode="HMS" moduleName="HMS">
                  <PatientsPage />
                </ModuleRoute>
              }
            />
            <Route
              path="/patients/create"
              element={
                <ModuleRoute moduleCode="HMS" moduleName="HMS">
                  <PatientCreatePage />
                </ModuleRoute>
              }
            />

            {/* Hospital portal — other modules */}
            <Route path="/pharmacy" element={<ModuleRoute moduleCode="PHARMACY" moduleName="Pharmacy"><PharmacyPage /></ModuleRoute>} />
            <Route path="/ot" element={<ModuleRoute moduleCode="OT" moduleName="OT"><OTPage /></ModuleRoute>} />
            <Route path="/asset" element={<ModuleRoute moduleCode="ASSET" moduleName="Assets"><AssetPage /></ModuleRoute>} />
            <Route path="/inventory" element={<ModuleRoute moduleCode="INVENTORY" moduleName="Inventory"><InventoryPage /></ModuleRoute>} />

            {/* Users & Roles Management */}
            <Route path="/users" element={<UsersRolesPage />} />

            {/* Module not activated */}
            <Route path="/module-not-activated" element={<ModuleNotActivated />} />
          </Route>

          {/* Default redirects */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
