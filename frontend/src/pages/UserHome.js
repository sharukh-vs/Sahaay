import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Search, MapPin, Star, ChevronRight, Zap, TrendingUp,
    Shield, Clock, Wrench, Plug, Paintbrush, Leaf, Wind,
    Building2, Laptop, Scissors, Car, Package,
    ArrowRight, Flame, CheckCircle2, Bell, Briefcase,
} from 'lucide-react';
import UserLayout from '../components/layout/UserLayout';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axios/axiosInstance';

// Category icons map
const CATEGORY_ICONS = {
    'Plumbing': Wrench, 'Electrical': Plug, 'Painting': Paintbrush,
    'Landscaping': Leaf, 'HVAC': Wind, 'Carpentry': Building2,
    'IT Support': Laptop, 'Beauty & Wellness': Scissors,
    'Automotive': Car, 'Moving': Package,
};

const CATEGORY_COLORS = [
    'from-blue-500 to-cyan-400', 'from-indigo-500 to-purple-400',
    'from-emerald-500 to-teal-400', 'from-rose-500 to-pink-400',
    'from-amber-500 to-orange-400', 'from-violet-500 to-fuchsia-400',
    'from-sky-500 to-blue-400', 'from-green-500 to-emerald-400',
    'from-red-500 to-rose-400', 'from-purple-500 to-violet-400',
];

const STATS = [
    { label: 'Verified Providers', value: '2,400+', icon: Shield, color: 'text-emerald-400' },
    { label: 'Services Completed', value: '18,000+', icon: CheckCircle2, color: 'text-indigo-400' },
    { label: 'Avg Response Time', value: '< 2 hrs', icon: Clock, color: 'text-amber-400' },
    { label: 'Happy Clients', value: '9,800+', icon: Star, color: 'text-rose-400' },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

const ProviderCard = ({ provider }) => (
    <Link to={`/user/providers/${provider._id}`}
        className="card p-4 hover:border-indigo-500/30 hover:shadow-glow-sm transition-all duration-300 group animate-fade-in">
        <div className="flex items-start gap-3 mb-3">
            <img
                src={provider.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.businessName)}&background=6366f1&color=fff&size=80`}
                alt={provider.businessName}
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-white/10"
            />
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm truncate group-hover:text-indigo-300 transition-colors">
                    {provider.businessName}
                </h3>
                <p className="text-xs text-slate-400 truncate">
                    {provider.categories?.slice(0, 2).join(', ')}
                </p>
            </div>
            {provider.isVerified && (
                <div title="Verified" className="flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
            )}
        </div>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-xs font-semibold text-white">{provider.averageRating?.toFixed(1) || 'New'}</span>
                <span className="text-xs text-slate-500">({provider.totalRatings || 0})</span>
            </div>
            <span className={`badge ${provider.collarType === 'white' ? 'badge-primary' : provider.collarType === 'blue' ? 'badge-neutral' : 'badge-warning'} text-xs`}>
                {provider.collarType} collar
            </span>
        </div>
        {provider.businessAddress?.city && (
            <p className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                <MapPin className="w-3 h-3" />{provider.businessAddress.city}
            </p>
        )}
    </Link>
);

const CategoryCard = ({ name, index, count }) => {
    const Icon = CATEGORY_ICONS[name] || Wrench;
    const gradient = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
    return (
        <Link to={`/user/search?category=${encodeURIComponent(name)}`}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-800 border border-white/8 hover:border-indigo-500/30 hover:bg-slate-750 transition-all duration-200 group cursor-pointer">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-medium text-slate-300 text-center leading-tight group-hover:text-white transition-colors">{name}</span>
            {count > 0 && <span className="text-xs text-slate-500">{count} providers</span>}
        </Link>
    );
};

const QuickRequestCard = () => {
    const navigate = useNavigate();
    return (
        <div className="card p-6 bg-gradient-to-br from-indigo-900/40 to-violet-900/40 border-indigo-500/20">
            <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white">Quick Request</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">Post your service need and get matched with the best providers instantly.</p>
            <button onClick={() => navigate('/user/requests/new')}
                className="btn btn-primary btn-md w-full">
                Post a Request <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────────

export default function UserHome() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState([]);
    const [providers, setProviders] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loadingProviders, setLoadingProviders] = useState(true);
    const [activeRequests, setActiveRequests] = useState(0);

    const firstName = user?.name?.split(' ')[0] || 'there';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    const fetchData = useCallback(async () => {
        try {
            const [catRes, provRes, notifRes, reqRes] = await Promise.allSettled([
                axiosInstance.get('/services/categories'),
                axiosInstance.get('/services/providers/search?limit=8'),
                axiosInstance.get('/users/me/notifications?limit=4'),
                axiosInstance.get('/requests?status=open&limit=1'),
            ]);

            if (catRes.status === 'fulfilled') setCategories(catRes.value.data.categories?.slice(0, 12) || []);
            if (provRes.status === 'fulfilled') setProviders(provRes.value.data.providers?.slice(0, 8) || []);
            if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data.notifications?.slice(0, 4) || []);
            if (reqRes.status === 'fulfilled') setActiveRequests(reqRes.value.data.total || 0);
        } catch (err) {
            console.error('Home data error:', err);
        } finally {
            setLoadingProviders(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/user/search?q=${encodeURIComponent(searchQuery)}`);
    };

    return (
        <UserLayout>
            <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">

                {/* ── Hero Section ──────────────────────────────────────────── */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 md:p-10">
                    <div className="absolute inset-0 bg-dots opacity-20" />
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-300/10 rounded-full blur-3xl" />

                    <div className="relative z-10">
                        <p className="text-indigo-200 text-sm font-medium mb-1">{greeting} 👋</p>
                        <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
                            Hello, {firstName}!
                        </h1>
                        <p className="text-indigo-200 mb-6 text-sm md:text-base">
                            What service are you looking for today?
                        </p>

                        {/* Search bar */}
                        <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
                            <div className="flex-1 flex items-center gap-3 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3">
                                <Search className="w-4 h-4 text-white/70 flex-shrink-0" />
                                <input
                                    id="home-search"
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search plumbing, electrical, cleaning..."
                                    className="bg-transparent border-none outline-none text-white placeholder:text-white/50 text-sm w-full"
                                />
                            </div>
                            <button type="submit" className="btn bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-5 py-3 rounded-2xl flex-shrink-0">
                                Search
                            </button>
                        </form>

                        {/* Quick stats */}
                        {activeRequests > 0 && (
                            <div className="mt-4 inline-flex items-center gap-2 bg-white/15 rounded-xl px-4 py-2 text-sm text-white">
                                <Flame className="w-4 h-4 text-amber-300" />
                                You have <strong>{activeRequests} active request{activeRequests > 1 ? 's' : ''}</strong>
                                <Link to="/user/requests" className="underline underline-offset-2 hover:text-indigo-200">View</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Stats Row ─────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {STATS.map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="card p-4 flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl bg-white/5 ${color}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-white text-lg leading-tight">{value}</p>
                                <p className="text-xs text-slate-400">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Main Grid ─────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left — categories + providers */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Categories */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-white text-lg">Browse by Category</h2>
                                <Link to="/user/services" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1">
                                    All <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                {categories.length === 0
                                    ? Array(12).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)
                                    : categories.map((cat, i) => (
                                        <CategoryCard key={cat.name} name={cat.name} index={i} count={cat.count} />
                                    ))
                                }
                            </div>
                        </section>

                        {/* Nearby / Featured Providers */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-white text-lg flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-indigo-400" />Top Providers
                                </h2>
                                <Link to="/user/search" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1">
                                    See all <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>

                            {loadingProviders ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
                                </div>
                            ) : providers.length === 0 ? (
                                <div className="card p-8 text-center text-slate-400">
                                    <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                    <p>No providers available yet. Check back soon!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {providers.map((p) => <ProviderCard key={p._id} provider={p} />)}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right — quick actions + notifications */}
                    <div className="space-y-4">
                        <QuickRequestCard />

                        {/* Recent Notifications */}
                        <div className="card p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-indigo-400" />Notifications
                                </h3>
                                <Link to="/user/notifications" className="text-xs text-indigo-400 hover:text-indigo-300">View all</Link>
                            </div>
                            {notifications.length === 0 ? (
                                <p className="text-slate-500 text-sm text-center py-4">You're all caught up!</p>
                            ) : (
                                <div className="space-y-3">
                                    {notifications.map((n) => (
                                        <div key={n._id} className={`flex gap-3 p-2 rounded-xl transition-colors ${!n.isRead ? 'bg-indigo-500/8' : ''}`}>
                                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.isRead ? 'bg-indigo-500' : 'bg-transparent'}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{n.title}</p>
                                                <p className="text-xs text-slate-400 truncate">{n.body}</p>
                                                <p className="text-xs text-slate-600 mt-0.5">
                                                    {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* How it works */}
                        <div className="card p-4">
                            <h3 className="font-semibold text-white mb-4">How Sahaay Works</h3>
                            <div className="space-y-4">
                                {[
                                    { step: '1', title: 'Post a Request', desc: 'Tell us what service you need', color: 'bg-indigo-500' },
                                    { step: '2', title: 'Get Matched', desc: 'AI finds the best providers', color: 'bg-violet-500' },
                                    { step: '3', title: 'Compare Quotes', desc: 'Review and accept the best offer', color: 'bg-emerald-500' },
                                    { step: '4', title: 'Service Done', desc: 'Pay securely through the app', color: 'bg-amber-500' },
                                ].map(({ step, title, desc, color }) => (
                                    <div key={step} className="flex items-start gap-3">
                                        <div className={`${color} w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5`}>
                                            {step}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{title}</p>
                                            <p className="text-xs text-slate-400">{desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}