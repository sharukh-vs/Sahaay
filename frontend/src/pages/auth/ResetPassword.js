import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, CheckCircle } from 'lucide-react';
import axiosInstance from '../../axios/axiosInstance';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!password) e.password = 'Password is required';
        else if (password.length < 8) e.password = 'At least 8 characters';
        else if (!/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
            e.password = 'Must contain letters and numbers';
        }
        if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        if (!token) { toast.error('Invalid reset link'); return; }
        setLoading(true);
        try {
            await axiosInstance.post('/auth/reset-password', { token, password });
            setDone(true);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Reset failed. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 bg-dots flex items-center justify-center px-4">
            <div className="relative w-full max-w-sm animate-slide-up">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-glow mb-4">
                        <span className="text-white text-xl font-black">S</span>
                    </div>
                </div>
                <div className="card p-8 shadow-card">
                    {!done ? (
                        <>
                            <h2 className="text-xl font-bold text-white mb-2">Reset your password</h2>
                            <p className="text-slate-400 text-sm mb-6">Enter a new strong password for your account.</p>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label htmlFor="reset-pwd" className="label">
                                        <Lock className="inline w-3.5 h-3.5 mr-1" />New password
                                    </label>
                                    <div className="relative">
                                        <input id="reset-pwd" type={showPwd ? 'text' : 'password'} value={password}
                                            onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({...p, password:''})); }}
                                            placeholder="At least 8 characters"
                                            className={`input pr-11 ${errors.password ? 'input-error' : ''}`} />
                                        <button type="button" onClick={() => setShowPwd(!showPwd)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                                            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="form-error">{errors.password}</p>}
                                </div>
                                <div>
                                    <label htmlFor="reset-confirm" className="label">Confirm password</label>
                                    <input id="reset-confirm" type="password" value={confirmPassword}
                                        onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({...p, confirmPassword:''})); }}
                                        placeholder="Repeat password"
                                        className={`input ${errors.confirmPassword ? 'input-error' : ''}`} />
                                    {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
                                </div>
                                <button id="reset-submit" type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Resetting...</> : 'Reset Password'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4 animate-fade-in">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 mb-4">
                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Password reset!</h2>
                            <p className="text-slate-400 text-sm">Your password has been updated successfully.</p>
                            <button onClick={() => navigate('/login')} className="btn btn-primary btn-md mt-6 w-full">
                                Go to Login
                            </button>
                        </div>
                    )}
                    {!done && (
                        <div className="mt-6 pt-6 border-t border-white/10 text-center">
                            <Link to="/login" className="text-sm text-slate-400 hover:text-white">Back to login</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
