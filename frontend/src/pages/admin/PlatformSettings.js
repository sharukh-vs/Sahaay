import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, CreditCard, Shield, Globe, Bell } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import toast from 'react-hot-toast';

export default function PlatformSettings() {
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        siteName: 'Sahaay',
        supportEmail: 'support@sahaay.com',
        maintenanceMode: false,
        allowNewProviders: true,
        commissionRate: 10,
        currency: 'INR',
        autoApproveReviews: false,
    });

    const handleSave = () => {
        setLoading(true);
        setTimeout(() => {
            toast.success('Platform settings updated successfully');
            setLoading(false);
        }, 800);
    };

    return (
        <AdminLayout>
            <div className="p-4 md:p-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="page-title">Platform Settings</h1>
                        <p className="page-subtitle">Manage global configuration for Sahaay</p>
                    </div>
                    <button onClick={handleSave} disabled={loading} className="btn btn-md bg-red-500 text-white hover:bg-red-600">
                        {loading ? <span className="animate-pulse">Saving...</span> : <><Save className="w-4 h-4" /> Save Changes</>}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Nav */}
                    <div className="md:col-span-1 space-y-2">
                        {[
                            { icon: Globe, label: 'General' },
                            { icon: CreditCard, label: 'Billing & Fees' },
                            { icon: Shield, label: 'Security & Access' },
                            { icon: Bell, label: 'Notifications' }
                        ].map((item, idx) => (
                            <button key={idx} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${idx === 0 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                <item.icon className="w-4 h-4" /> {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="md:col-span-2 space-y-6">
                        
                        <div className="card p-6 space-y-5">
                            <h3 className="font-bold text-white flex items-center gap-2"><Globe className="w-5 h-5 text-slate-400" /> General Settings</h3>
                            <div className="divider my-0" />
                            <div>
                                <label className="label">Platform Name</label>
                                <input type="text" value={settings.siteName} onChange={e => setSettings({...settings, siteName: e.target.value})} className="input" />
                            </div>
                            <div>
                                <label className="label">Support Email</label>
                                <input type="email" value={settings.supportEmail} onChange={e => setSettings({...settings, supportEmail: e.target.value})} className="input" />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                <div>
                                    <p className="font-semibold text-white text-sm">Maintenance Mode</p>
                                    <p className="text-xs text-slate-400">Disable access for users and providers</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={settings.maintenanceMode} onChange={e => setSettings({...settings, maintenanceMode: e.target.checked})} />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                                </label>
                            </div>
                        </div>

                        <div className="card p-6 space-y-5">
                            <h3 className="font-bold text-white flex items-center gap-2"><CreditCard className="w-5 h-5 text-slate-400" /> Billing & Fees</h3>
                            <div className="divider my-0" />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Platform Commission Rate (%)</label>
                                    <input type="number" value={settings.commissionRate} onChange={e => setSettings({...settings, commissionRate: Number(e.target.value)})} className="input" />
                                </div>
                                <div>
                                    <label className="label">Default Currency</label>
                                    <select value={settings.currency} onChange={e => setSettings({...settings, currency: e.target.value})} className="input">
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="card p-6 space-y-5">
                            <h3 className="font-bold text-white flex items-center gap-2"><Shield className="w-5 h-5 text-slate-400" /> Security & Access</h3>
                            <div className="divider my-0" />
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                <div>
                                    <p className="font-semibold text-white text-sm">Allow New Provider Registrations</p>
                                    <p className="text-xs text-slate-400">If disabled, new providers cannot sign up</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={settings.allowNewProviders} onChange={e => setSettings({...settings, allowNewProviders: e.target.checked})} />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                                <div>
                                    <p className="font-semibold text-white text-sm">Auto-Approve Reviews</p>
                                    <p className="text-xs text-slate-400">Skip manual moderation for feedback</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={settings.autoApproveReviews} onChange={e => setSettings({...settings, autoApproveReviews: e.target.checked})} />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                                </label>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
