import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Camera, Loader2, Save, Lock, Eye, EyeOff } from 'lucide-react';
import UserLayout from '../../components/layout/UserLayout';
import axiosInstance from '../../axios/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function UserProfile() {
    const { user, updateUser } = useAuth();
    const [tab, setTab] = useState('profile');
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', bio: '', address: { city: '', state: '', pincode: '' } });
    const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [showPwd, setShowPwd] = useState(false);

    useEffect(() => {
        if (user) setForm({ name: user.name || '', phone: user.phone || '', bio: user.bio || '', address: { city: user.address?.city || '', state: user.address?.state || '', pincode: user.address?.pincode || '' } });
    }, [user]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await axiosInstance.put('/users/me', form);
            updateUser(res.data.user);
            toast.success('Profile updated!');
        } catch (err) { toast.error(err.response?.data?.error || 'Failed to update'); }
        finally { setSaving(false); }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (pwd.newPassword !== pwd.confirmPassword) { toast.error('Passwords do not match'); return; }
        setSaving(true);
        try {
            await axiosInstance.post('/users/me/change-password', { currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
            toast.success('Password changed successfully');
            setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
        finally { setSaving(false); }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('avatar', file);
        try {
            const res = await axiosInstance.patch('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            updateUser({ ...user, photo: res.data.photo });
            toast.success('Avatar updated!');
        } catch { toast.error('Failed to upload avatar'); }
    };

    const avatarSrc = user?.photo?.startsWith('/') ? `http://localhost:5000${user.photo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff&size=128`;

    return (
        <UserLayout>
            <div className="p-4 md:p-6 max-w-3xl mx-auto">
                <h1 className="page-title mb-6">My Profile</h1>

                {/* Avatar */}
                <div className="card p-6 mb-6">
                    <div className="flex items-center gap-5">
                        <div className="relative group">
                            <img src={avatarSrc} alt={user?.name} className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10" />
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <Camera className="w-5 h-5 text-white" />
                                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                            </label>
                        </div>
                        <div>
                            <h2 className="font-bold text-white text-xl">{user?.name}</h2>
                            <p className="text-slate-400 text-sm">{user?.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`badge ${user?.isVerified ? 'badge-success' : 'badge-warning'}`}>
                                    {user?.isVerified ? '✓ Verified' : 'Unverified'}
                                </span>
                                <span className="badge badge-neutral capitalize">{user?.role}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-slate-800 rounded-xl p-1 border border-white/8 mb-6 w-fit">
                    {[{ id: 'profile', label: 'Profile' }, { id: 'security', label: 'Security' }].map((t) => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {tab === 'profile' && (
                    <div className="card p-6 animate-fade-in">
                        <form onSubmit={handleSaveProfile} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label"><User className="inline w-3.5 h-3.5 mr-1" />Full Name</label>
                                    <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input" />
                                </div>
                                <div>
                                    <label className="label"><Phone className="inline w-3.5 h-3.5 mr-1" />Phone</label>
                                    <input type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" className="input" />
                                </div>
                            </div>
                            <div>
                                <label className="label">Bio <span className="text-slate-500">(optional)</span></label>
                                <textarea rows={3} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} placeholder="Tell providers a little about yourself..." className="input resize-none" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="label"><MapPin className="inline w-3.5 h-3.5 mr-1" />City</label>
                                    <input type="text" value={form.address.city} onChange={(e) => setForm((f) => ({ ...f, address: { ...f.address, city: e.target.value } }))} placeholder="Mumbai" className="input" />
                                </div>
                                <div>
                                    <label className="label">State</label>
                                    <input type="text" value={form.address.state} onChange={(e) => setForm((f) => ({ ...f, address: { ...f.address, state: e.target.value } }))} placeholder="Maharashtra" className="input" />
                                </div>
                                <div>
                                    <label className="label">Pincode</label>
                                    <input type="text" value={form.address.pincode} onChange={(e) => setForm((f) => ({ ...f, address: { ...f.address, pincode: e.target.value } }))} placeholder="400001" className="input" />
                                </div>
                            </div>
                            <div>
                                <label className="label"><Mail className="inline w-3.5 h-3.5 mr-1" />Email</label>
                                <input type="email" value={user?.email} disabled className="input opacity-50 cursor-not-allowed" />
                                <p className="text-xs text-slate-500 mt-1">Email cannot be changed here</p>
                            </div>
                            <button type="submit" disabled={saving} className="btn btn-primary btn-md">
                                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : <><Save className="w-4 h-4" />Save Changes</>}
                            </button>
                        </form>
                    </div>
                )}

                {tab === 'security' && (
                    <div className="card p-6 animate-fade-in">
                        <h3 className="font-semibold text-white mb-5">Change Password</h3>
                        <form onSubmit={handleChangePassword} className="space-y-5">
                            <div>
                                <label className="label"><Lock className="inline w-3.5 h-3.5 mr-1" />Current Password</label>
                                <div className="relative">
                                    <input type={showPwd ? 'text' : 'password'} value={pwd.currentPassword} onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))} className="input pr-11" />
                                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">{showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                                </div>
                            </div>
                            <div>
                                <label className="label">New Password</label>
                                <input type="password" value={pwd.newPassword} onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))} placeholder="Min 8 chars with letters & numbers" className="input" />
                            </div>
                            <div>
                                <label className="label">Confirm New Password</label>
                                <input type="password" value={pwd.confirmPassword} onChange={(e) => setPwd((p) => ({ ...p, confirmPassword: e.target.value }))} className="input" />
                            </div>
                            <button type="submit" disabled={saving} className="btn btn-primary btn-md">
                                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Updating...</> : 'Update Password'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </UserLayout>
    );
}
