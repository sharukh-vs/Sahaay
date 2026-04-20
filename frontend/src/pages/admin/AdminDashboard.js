import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    Users, Shield, FileText, AlertTriangle, CreditCard,
    IndianRupee, TrendingUp, ArrowUpRight, Activity,
    CheckCircle2, Clock, Loader2,
} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import axiosInstance from '../../axios/axiosInstance';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon: Icon, color, sub, to }) => {
    const inner = (
        <div className="card p-5 flex flex-col gap-2 hover:border-white/20 transition-all cursor-pointer">
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
                <div className={`p-2 rounded-xl bg-white/5 ${color}`}><Icon className="w-4 h-4" /></div>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            {sub && <p className="text-xs text-slate-500">{sub}</p>}
        </div>
    );
    return to ? <Link to={to}>{inner}</Link> : inner;
};

const MiniBar = ({ data }) => {
    if (!data?.length) return <div className="h-16 flex items-center justify-center text-slate-600 text-xs">No data</div>;
    const max = Math.max(...data.map((d) => d.amount), 1);
    return (
        <div className="flex items-end gap-1 h-16">
            {data.map((d) => (
                <div key={d.date} title={`${d.date}: ₹${d.amount?.toLocaleString()}`}
                    className="flex-1 rounded-t-sm"
                    style={{ height: `${Math.max((d.amount / max) * 100, 4)}%`, background: 'linear-gradient(to top,#ef4444,#fb923c)' }} />
            ))}
        </div>
    );
};

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            const res = await axiosInstance.get('/admin/dashboard');
            setData(res.data);
        } catch { toast.error('Failed to load dashboard'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    if (loading) return (
        <AdminLayout><div className="flex items-center justify-center h-80"><Loader2 className="w-8 h-8 text-red-500 animate-spin" /></div></AdminLayout>
    );

    const { stats, revenueByDay, usersByRole, recentPayments } = data || {};

    return (
        <AdminLayout>
            <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">

                {/* Hero */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-red-800 via-red-700 to-orange-700 p-6 md:p-8">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                    <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">Platform Overview</h1>
                            <p className="text-red-200 text-sm mt-1">Sahaay Admin Dashboard</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2">
                            <Activity className="w-4 h-4 text-white" />
                            <span className="text-white text-sm font-semibold">
                                ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')} Revenue
                            </span>
                        </div>
                    </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard label="Total Users"     value={stats?.totalUsers || 0}     icon={Users}        color="text-blue-400"    sub={`+${stats?.newUsersThisMonth || 0} this month`}  to="/admin/users" />
                    <StatCard label="Providers"       value={stats?.totalProviders || 0}  icon={Shield}       color="text-violet-400"  sub={`+${stats?.newProvidersThisMonth || 0} this month`} to="/admin/providers" />
                    <StatCard label="Total Requests"  value={stats?.totalRequests || 0}   icon={FileText}     color="text-sky-400"     sub={`${stats?.openRequests || 0} open`}             to="/admin/requests" />
                    <StatCard label="Total Revenue"   value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`} icon={IndianRupee} color="text-amber-400" to="/admin/payments" />
                    <StatCard label="Active Disputes" value={stats?.activeDisputes || 0}  icon={AlertTriangle} color={stats?.activeDisputes > 0 ? 'text-red-400' : 'text-emerald-400'} sub="Needs attention" to="/admin/disputes" />
                    <StatCard label="Open Tickets"    value={stats?.openTickets || 0}     icon={Clock}        color="text-orange-400"  to="/admin/tickets" />
                    <StatCard label="Pending Verify"  value={stats?.pendingVerifications || 0} icon={CheckCircle2} color={stats?.pendingVerifications > 0 ? 'text-amber-400' : 'text-emerald-400'} to="/admin/providers" />
                    <StatCard label="Active Services" value={stats?.totalServices || 0}   icon={TrendingUp}   color="text-emerald-400" />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 card p-5">
                        <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-red-400" />Revenue — last 7 days
                        </h2>
                        <MiniBar data={revenueByDay} />
                        <div className="flex gap-4 mt-3 flex-wrap">
                            {revenueByDay?.slice(-5).map((d) => (
                                <span key={d.date} className="text-xs text-slate-500">{d.date?.slice(5)}: <span className="text-slate-300">₹{d.amount?.toLocaleString()}</span></span>
                            ))}
                        </div>
                    </div>

                    <div className="card p-5">
                        <h2 className="font-bold text-white mb-4">Users by Role</h2>
                        <div className="space-y-2">
                            {usersByRole?.map((r) => (
                                <div key={r.role} className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/8">
                                    <span className="text-sm text-slate-300 capitalize">{r.role}</span>
                                    <span className="text-sm font-bold text-white">{r.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Payments */}
                <div className="card">
                    <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/8">
                        <h2 className="font-bold text-white">Recent Payments</h2>
                        <Link to="/admin/payments" className="text-red-400 hover:text-red-300 text-sm">View all</Link>
                    </div>
                    {!recentPayments?.length ? (
                        <p className="p-8 text-center text-slate-500 text-sm">No payments yet</p>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {recentPayments.map((p) => (
                                <div key={p._id} className="flex items-center gap-4 px-5 py-3">
                                    <div className="p-2 rounded-xl bg-emerald-500/10 flex-shrink-0">
                                        <IndianRupee className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white capitalize">{p.type} Payment</p>
                                        <p className="text-xs text-slate-500">{p.paidAt && new Date(p.paidAt).toLocaleDateString('en-IN')}</p>
                                    </div>
                                    <p className="font-bold text-white flex items-center gap-0.5">
                                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />₹{p.amount?.toLocaleString('en-IN')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
