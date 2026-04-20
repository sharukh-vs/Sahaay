import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import axiosInstance from '../../axios/axiosInstance';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) { setError('Email is required'); return; }
        if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address'); return; }

        setLoading(true);
        try {
            await axiosInstance.post('/auth/forgot-password', { email });
            setSent(true);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 bg-dots flex items-center justify-center px-4">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-sm animate-slide-up">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-glow mb-4">
                        <span className="text-white text-xl font-black">S</span>
                    </div>
                </div>

                <div className="card p-8 shadow-card">
                    {!sent ? (
                        <>
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-white">Forgot your password?</h2>
                                <p className="text-slate-400 text-sm mt-2">
                                    Enter your email address and we'll send you a reset link.
                                </p>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="forgot-email" className="label">
                                        <Mail className="inline w-3.5 h-3.5 mr-1" />Email address
                                    </label>
                                    <input
                                        id="forgot-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                        placeholder="you@example.com"
                                        className={`input ${error ? 'input-error' : ''}`}
                                    />
                                    {error && <p className="form-error">{error}</p>}
                                </div>
                                <button
                                    id="forgot-submit"
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary btn-lg w-full"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" />Sending...</>
                                    ) : (
                                        <>Send Reset Link</>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4 animate-fade-in">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 mb-4">
                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                If <span className="text-white font-medium">{email}</span> is registered,
                                you'll receive a password reset link shortly.
                            </p>
                            <p className="text-slate-500 text-xs mt-4">
                                Didn't get it?{' '}
                                <button
                                    onClick={() => { setSent(false); }}
                                    className="text-indigo-400 hover:text-indigo-300"
                                >
                                    Try again
                                </button>
                            </p>
                        </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-white/10">
                        <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
