import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2, LogIn, Users, Briefcase, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ROLES = [
    {
        id: 'user',
        label: 'User',
        description: 'Find & book services',
        icon: Users,
        color: 'indigo',
    },
    {
        id: 'serviceProvider',
        label: 'Service Provider',
        description: 'Offer your services',
        icon: Briefcase,
        color: 'violet',
    },
    {
        id: 'admin',
        label: 'Admin',
        description: 'Platform management',
        icon: ShieldCheck,
        color: 'emerald',
    },
];

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [selectedRole, setSelectedRole] = useState('user');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email';
        if (!formData.password) newErrors.password = 'Password is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const data = await login(formData.email, formData.password);
            const role = data.user?.role;
            toast.success(`Welcome back, ${data.user?.name?.split(' ')[0]}!`);

            // Navigate based on role
            const from = location.state?.from;
            if (from) return navigate(from, { replace: true });
            if (role === 'user') navigate('/home');
            else if (role === 'serviceProvider') navigate('/provider/dashboard');
            else navigate('/admin/dashboard');
        } catch (err) {
            const msg = err.response?.data?.error || 'Invalid email or password';
            toast.error(msg);
            if (msg.toLowerCase().includes('email')) {
                setErrors({ email: msg });
            } else if (msg.toLowerCase().includes('password')) {
                setErrors({ password: msg });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 bg-dots flex flex-col items-center justify-center px-4 py-12">
            {/* Gradient orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md animate-slide-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-glow mb-4">
                        <span className="text-white text-2xl font-black">S</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back</h1>
                    <p className="text-slate-400 mt-2">Sign in to your Sahaay account</p>
                </div>

                <div className="card p-8 shadow-card">
                    {/* Role Selector */}
                    <div className="mb-6">
                        <p className="label">Sign in as</p>
                        <div className="grid grid-cols-3 gap-2">
                            {ROLES.map((role) => {
                                const Icon = role.icon;
                                const isSelected = selectedRole === role.id;
                                return (
                                    <button
                                        key={role.id}
                                        type="button"
                                        id={`role-${role.id}`}
                                        onClick={() => setSelectedRole(role.id)}
                                        className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200 ${
                                            isSelected
                                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                                                : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-300'
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-xs font-semibold">{role.label}</span>
                                        <span className="text-xs opacity-70 hidden sm:block">{role.description}</span>
                                        {isSelected && (
                                            <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        {/* Email */}
                        <div>
                            <label htmlFor="login-email" className="label">Email address</label>
                            <input
                                id="login-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className={`input ${errors.email ? 'input-error' : ''}`}
                            />
                            {errors.email && <p className="form-error">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="login-password" className="label !mb-0">Password</label>
                                <Link
                                    to="/forgot-password"
                                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={`input pr-11 ${errors.password ? 'input-error' : ''}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="form-error">{errors.password}</p>}
                        </div>

                        {/* Submit */}
                        <button
                            id="login-submit"
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary btn-lg w-full mt-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    Sign in
                                </>
                            )}
                        </button>
                    </form>

                    {/* Social Login */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-slate-800 px-3 text-slate-500">or continue with</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            id="google-login"
                            className="mt-4 btn btn-secondary btn-md w-full"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continue with Google
                        </button>
                    </div>

                    {/* Register link */}
                    <p className="text-center text-sm text-slate-400 mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                            Create one free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;