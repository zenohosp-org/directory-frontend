/* Stub pages for HMS/module routes — to be built in the next phase */
import { Link } from 'react-router-dom';
import '../../styles/shared.css';

function StubPage({ title, sub }) {
    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">{title}</h1>
                    <p className="page-sub">{sub}</p>
                </div>
            </div>
            <div className="table-wrap" style={{ padding: 40, textAlign: 'center' }}>
                <p style={{ color: 'var(--color-text-muted)' }}>This page will be implemented in the next phase.</p>
            </div>
        </div>
    );
}

export const PatientsPage = () => (
    <StubPage title="Patients" sub="HMS module — patient records and visits" />
);

export const PatientCreatePage = () => (
    <StubPage title="New Patient" sub="HMS module — create patient record" />
);

export const PharmacyPage = () => (
    <StubPage title="Pharmacy" sub="Drug inventory and dispensing" />
);

export const OTPage = () => (
    <StubPage title="Operation Theatre" sub="OT schedule and procedures" />
);

export const AssetPage = () => (
    <StubPage title="Assets" sub="Hospital equipment tracking" />
);

export const InventoryPage = () => (
    <StubPage title="Inventory" sub="General supply management" />
);
