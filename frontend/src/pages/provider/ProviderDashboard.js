import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    TrendingUp, Briefcase, MessageSquare, Star, Clock,
    CheckCircle2, AlertCircle, ArrowRight, Loader2,
    IndianRupee, MapPin, Zap, Award, Shield, ChevronRight,
} from 'lucide-react';
import ProviderLayout from '../../components/layout/ProviderLayout';
import axiosInstance from '../../axios/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
    <div className="card p-5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
            <div className={`p-2 rounded-xl bg-white/5 ${color}`}><Icon className="w-4 h-4" /></div>
        </div>
        <p className="text-2xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
);

const RequestRow = ({ request }) => (
    <Link to={`/provider/requests/${request._id}`}
        className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group">
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-semibold text-white group-hover:text-violet-300 truncate">{request.title}</h4>
                {request.myMatchScore > 0 && (
                    <span className="badge badge-primary text-xs flex-shrink-0">
                        🎯 {request.myMatchScore}% match
                    </span>
                )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{request.description}</p>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                <span className="flex items-center gap-0.5"><AlertCircle className="w-3 h-3 text-violet-400" />{request.category}</span>
                {request.address?.city && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-emerald-400" />{request.address.city}</span>}
                {request.budgetMax > 0 && <span className="flex items-center gap-0.5"><IndianRupee className="w-3 h-3 text-amber-400" />up to ₹{request.budgetMax?.toLocaleString()}</span>}
            </div>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 flex-shrink-0 mt-1 transition-colors" />
    </Link>
);

const FeedbackRow = ({ fb }) => (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all">
        <img src={fb.user?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(fb.user?.name || 'U')}&background=6366f1&color=fff&size=32`}
            alt={fb.user?.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-white">{fb.user?.name}</span>
                <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${s <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                    ))}
                </div>
            </div>
            {fb.review && <p className="text-xs text-slate-400 line-clamp-2">{fb.review}</p>}
        </div>
    </div>
);

export default function ProviderDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [noProfile, setNoProfile] = useState(false);

    const firstName = user?.name?.split(' ')[0] || 'there';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const load = useCallback(async () => {
        try {
            const res = await axiosInstance.get('/provider/dashboard');
            setData(res.data);
        } catch (err) {
            if (err.response?.status === 404) setNoProfile(true);
            else toast.error('Failed to load dashboard');
        } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    if (loading) return (
        <ProviderLayout>
            <div className="flex items-center justify-center h-80">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
        </ProviderLayout>
    );

    if (noProfile) return (
        <ProviderLayout>
            <div className="flex items-center justify-center min-h-[80vh] p-6">
                <div className="card p-10 max-w-md w-full text-center animate-slide-up">
                    <div className="w-20 h-20 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="w-10 h-10 text-violet-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Complete Your Profile</h2>
                    <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                        Set up your provider profile to start receiving service requests and quotes.
                    </p>
                    <button onClick={() => navigate('/provider/onboard')} className="btn btn-md w-full" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff' }}>
                        <Zap className="w-4 h-4" />Start Onboarding
                    </button>
                </div>
            </div>
        </ProviderLayout>
    );

    const { stats, recentRequests, recentFeedback, provider } = data || {};

    return (
        <ProviderLayout>
            <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">

                {/* Hero */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 p-6 md:p-8">
                    <div className="absolute inset-0 bg-dots opacity-20" />
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                    <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
                        <div>
                            <p className="text-violet-200 text-sm font-medium mb-1">{greeting} 👋</p>
                            <h1 className="text-2xl md:text-3xl font-bold text-white">{firstName}'s Dashboard</h1>
                            <p className="text-violet-200 text-sm mt-1">{provider?.businessName}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            {provider?.isVerified ? (
                                <span className="badge badge-success"><Shield className="w-3 h-3" />Verified</span>
                            ) : (
                                <span className="badge badge-warning"><Clock className="w-3 h-3" />Pending Verification</span>
                            )}
                            <span className="badge badge-neutral capitalize">{provider?.collarType} collar</span>
                            <div className="flex items-center gap-1 bg-white/10 rounded-xl px-3 py-1.5">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                <span className="text-white font-bold text-sm">{stats?.averageRating?.toFixed(1) || 'New'}</span>
                                <span className="text-violet-200 text-xs">({stats?.totalRatings || 0})</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard label="Total Earnings" value={`₹${stats?.totalEarnings?.toLocaleString('en-IN') || '0'}`}
                        icon={IndianRupee} color="text-emerald-400" sub="Lifetime" />
                    <StatCard label="Jobs Completed" value={stats?.totalJobsCompleted || 0}
                        icon={CheckCircle2} color="text-indigo-400" sub={`${stats?.completionRate || 100}% rate`} />
                    <StatCard label="Active Quotes" value={stats?.pendingQuotes || 0}
                        icon={MessageSquare} color="text-violet-400" sub="Awaiting response" />
                    <StatCard label="My Services" value={stats?.totalServices || 0}
                        icon={Briefcase} color="text-amber-400" sub="Active listings" />
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Recent Requests */}
                    <div className="lg:col-span-2 card">
                        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/8">
                            <h2 className="font-bold text-white">Matched Requests</h2>
                            <Link to="/provider/requests" className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1">
                                View all <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="p-2">
                            {recentRequests?.length === 0 ? (
                                <div className="py-10 text-center text-slate-500 text-sm">
                                    <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                    No matched requests yet. Complete your profile to get matched.
                                </div>
                            ) : (
                                recentRequests?.map((r) => <RequestRow key={r._id} request={r} />)
                            )}
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="space-y-4">
                        {/* Quick actions */}
                        <div className="card p-4">
                            <h3 className="font-semibold text-white mb-3">Quick Actions</h3>
                            <div className="space-y-2">
                                {[
                                    { to: '/provider/services/new', label: 'Add New Service', icon: Briefcase },
                                    { to: '/provider/requests', label: 'Browse Requests', icon: MessageSquare },
                                    { to: '/provider/subscription', label: 'Upgrade Plan', icon: Award },
                                    { to: '/provider/profile', label: 'Edit Profile', icon: CheckCircle2 },
                                ].map(({ to, label, icon: Icon }) => (
                                    <Link key={to} to={to}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-all text-sm">
                                        <Icon className="w-4 h-4 text-violet-400 flex-shrink-0" />{label}
                                        <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Recent feedback */}
                        <div className="card">
                            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/8">
                                <h3 className="font-semibold text-white">Recent Reviews</h3>
                                <Link to="/provider/reviews" className="text-violet-400 hover:text-violet-300 text-xs">All</Link>
                            </div>
                            <div className="p-2">
                                {recentFeedback?.length === 0 ? (
                                    <p className="text-center text-slate-500 text-xs py-6">No reviews yet</p>
                                ) : (
                                    recentFeedback?.map((fb) => <FeedbackRow key={fb._id} fb={fb} />)
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProviderLayout>
    );
}
