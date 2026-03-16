import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './AppLayout.css';

export default function AppLayout({ activeModules }) {
    return (
        <div className="app-layout">
            <Sidebar activeModules={activeModules} />
            <main className="app-main">
                <Outlet />
            </main>
        </div>
    );
}
