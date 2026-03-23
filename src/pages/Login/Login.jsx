import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL, googleLogin } from '../../api/client';
import ApiDebugBar from '../../components/ApiDebugBar';
import './Login.css';

export default function LoginPage() {
    const { doLogin } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState(() => searchParams.get('error') || '');
    const [loading, setLoading] = useState(false);

    // OAuth SSO Parameters
    const isSSO = searchParams.has('client_id') && searchParams.has('redirect_uri');
    const clientId = searchParams.get('client_id');
    const redirectUri = searchParams.get('redirect_uri');
    const state = searchParams.get('state');

    const handleChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        if (isSSO) {
            // Standard form submission to the backend endpoint for SSO
            const formObj = document.createElement('form');
            formObj.method = 'POST';
            formObj.action = `${API_BASE_URL}/oauth2/login`;

            const addField = (name, value) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = name;
                input.value = value || '';
                formObj.appendChild(input);
            };

            addField('email', form.email);
            addField('password', form.password);
            addField('client_id', clientId);
            addField('redirect_uri', redirectUri);
            document.body.appendChild(formObj);
            formObj.submit();
        } else {
            // Standard Direct Login
            try {
                await doLogin(form.email, form.password);
                navigate('/dashboard');
            } catch (err) {
                setError(
                    err?.response?.data?.message || 'Invalid email or password.'
                );
                setLoading(false);
            }
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError('');

        if (isSSO) {
            const formObj = document.createElement('form');
            formObj.method = 'POST';
            formObj.action = `${API_BASE_URL}/oauth2/google`;

            const addField = (name, value) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = name;
                input.value = value || '';
                formObj.appendChild(input);
            };

            addField('idToken', credentialResponse.credential);
            addField('client_id', clientId);
            addField('redirect_uri', redirectUri);
            addField('state', state);

            document.body.appendChild(formObj);
            formObj.submit();
        } else {
            // Basic fallback for direct Google login
            try {
                const res = await googleLogin({ idToken: credentialResponse.credential });
                const data = res.data;

                const userData = data.data.user || data.data;
                const { token: _TOKEN, ...userWithoutToken } = userData || {};
                sessionStorage.setItem('zeno_user', JSON.stringify(userWithoutToken));
                window.location.href = '/dashboard';
            } catch (err) {
                let errorMsg = 'Google Auth failed';
                if (err?.response?.status === 404) {
                    errorMsg = 'API endpoint not found. Check backend connection.';
                } else if (err?.response?.data?.message) {
                    errorMsg = err.response.data.message;
                } else if (err?.message) {
                    errorMsg = err.message;
                }
                setError(errorMsg);
                setLoading(false);
            }
        }
    };

    return (
        <div className="login-page">
            <ApiDebugBar />
            <div className="login-card">
                {/* Brand */}
                <div className="login-brand">
                    <div className="login-brand__logo">Z</div>
                    <div>
                        <h1 className="login-brand__title">ZenoHosp</h1>
                        <p className="login-brand__sub">Hospital Management Platform</p>
                    </div>
                </div>

                <h2 className="login-heading">Sign in to your account</h2>

                {error && (
                    <div className="login-error" role="alert">
                        <span>⚠</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="form-input"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="form-input"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Signing in…' : 'Sign in'}
                    </button>

                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Authentication Failed')}
                            useOneTap
                        />
                    </div>
                </form>

                <p className="login-footer">
                    ZenoHosp &copy; 2025 — For authorised personnel only
                </p>
            </div>
        </div>
    );
}
