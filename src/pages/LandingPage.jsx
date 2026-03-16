import { useNavigate } from 'react-router-dom';
import {
    Shield,
    Activity,
    Package,
    FlaskConical,
    Stethoscope,
    ChevronRight,
    Monitor,
    CheckCircle2,
    Mail,
    Smartphone,
    Zap,
    LayoutDashboard
} from 'lucide-react';
import './LandingPage.css';

const products = [
    { id: 'hms', name: 'ZenoHosp Core HMS', desc: 'Comprehensive hospital management for patients, OPD, and surgeries.', icon: Stethoscope },
    { id: 'assets', name: 'Asset Management', desc: 'Institutional level tracking for equipment and high-value medical hardware.', icon: Monitor, highlight: true },
    { id: 'lab', name: 'Lab Info System (LIS)', desc: 'Automated diagnostic reports and lab sample tracking workflows.', icon: FlaskConical },
    { id: 'pharmacy', name: 'Pharmacy Management', desc: 'Real-time inventory and billing for retail and indoor pharmacies.', icon: Package },
    { id: 'inventory', name: 'Central Inventory', desc: 'Bulk procurement and department-wise consumption monitoring.', icon: Activity },
];

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            {/* Navbar */}
            <nav className="landing-nav">
                <div className="nav-brand">
                    <div className="brand-logo">Z</div>
                    <span className="brand-name">ZenoHosp Enterprise</span>
                </div>
                <div className="nav-links">
                    <a href="#products">Products</a>
                    <a href="#assets">Asset MS Focus</a>
                    <a href="#contact">Contact</a>
                    <button className="btn-nav-login" onClick={() => navigate('/login')}>Sign In</button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="landing-hero">
                <div className="hero-content">
                    <div className="hero-badge">Next-Generation Healthcare OS</div>
                    <h1>Unified Intelligence for <br /><span>Modern Hospitals</span></h1>
                    <p>
                        Streamline your medical institution with ZenoHosp's integrated suite of products.
                        From patient care to advanced asset logistics, we provide the digital backbone for elite healthcare.
                    </p>
                    <div className="hero-actions">
                        <button className="btn-primary-landing" onClick={() => navigate('/login')}>
                            Get Started <ChevronRight size={18} />
                        </button>
                        <button className="btn-secondary-landing">Request Demo</button>
                    </div>
                </div>
                <div className="hero-image-placeholder">
                    <div className="glass-card main-stats">
                        <Zap className="icon-pulse" color="#3B82F6" />
                        <div>
                            <div className="stat-val">99.9%</div>
                            <div className="stat-label">Uptime Directory</div>
                        </div>
                    </div>
                    <div className="glass-card live-feed">
                        <Activity size={16} color="#EC4899" />
                        <span>Real-time Sync Active</span>
                    </div>
                </div>
            </header>

            {/* Our Products */}
            <section id="products" className="landing-section">
                <div className="section-header">
                    <h2>The Product Suite</h2>
                    <p>Five interconnected modules designed for departmental excellence.</p>
                </div>
                <div className="product-grid">
                    {products.map(p => (
                        <div key={p.id} className={`product-card ${p.highlight ? 'card-highlight' : ''}`}>
                            <div className="product-icon-wrap">
                                <p.icon size={28} />
                            </div>
                            <h3>{p.name}</h3>
                            <p>{p.desc}</p>
                            <div className="card-footer">
                                <span>Learn more</span>
                                <ChevronRight size={14} />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Asset MS Spotlight */}
            <section id="assets" className="asset-spotlight">
                <div className="spotlight-grid">
                    <div className="spotlight-text">
                        <div className="spotlight-tag">Module Spotlight</div>
                        <h2>Enterprise Asset Management</h2>
                        <p className="spotlight-intro">
                            Medical equipment is the heart of a hospital. Our Asset MS ensures
                            your high-value hardware is always ready, tracked, and maintained.
                        </p>
                        <div className="feature-list">
                            <div className="feature-item">
                                <CheckCircle2 color="#10B981" />
                                <div>
                                    <h4>Zero Downtime Strategy</h4>
                                    <p>Automated maintenance schedules prevent unexpected equipment failure during critical procedures.</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <CheckCircle2 color="#10B981" />
                                <div>
                                    <h4>Secure Transfer Logs</h4>
                                    <p>Blockchain-inspired tracking ensures every movement of equipment between departments is signed off.</p>
                                </div>
                            </div>
                            <div className="feature-item">
                                <CheckCircle2 color="#10B981" />
                                <div>
                                    <h4>Cost Efficient Scaling</h4>
                                    <p>Track ROI and depreciation to make smart procurement decisions for your institution.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="spotlight-visual">
                        <div className="asset-mockup">
                            <div className="mockup-header border-b border-gray-100 flex items-center justify-between p-3">
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                </div>
                                <div className="text-[10px] font-bold text-gray-400">ZENOHOSP ASSET MS</div>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white"><Monitor size={14} /></div>
                                        <div className="text-xs font-bold text-slate-800">MRI - Scanner X1</div>
                                    </div>
                                    <div className="text-[10px] px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold">ACTIVE</div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                                        <div className="text-[8px] text-gray-500 uppercase font-black">Transfer ID</div>
                                        <div className="text-xs font-bold">#TR-8821</div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                                        <div className="text-[8px] text-gray-500 uppercase font-black">Condition</div>
                                        <div className="text-xs font-bold">Pristine</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer / Contact */}
            <footer id="contact" className="landing-footer">
                <div className="footer-top">
                    <div className="footer-brand">
                        <div className="brand-logo">Z</div>
                        <span>ZenoHosp</span>
                    </div>
                    <div className="footer-contact">
                        <div className="contact-item">
                            <Mail size={16} /> <span>solutions@zenohosp.com</span>
                        </div>
                        <div className="contact-item">
                            <Smartphone size={16} /> <span>+91 88229 11022</span>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    &copy; 2026 ZenoHosp Integrated Medical Systems. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
