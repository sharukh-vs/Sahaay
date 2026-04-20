import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Inbox, Briefcase, MessageSquare,
    TrendingUp, Star, Settings, Bell, Menu, X,
    ChevronRight, LogOut, CreditCard, HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
    { path: '/provider/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/provider/requests', icon: Inbox, label: 'Request Feed' },
    { path: '/provider/services', icon: Briefcase, label: 'My Services' },
    { path: '/provider/quotes', icon: MessageSquare, label: 'My Quotes' },
    { path: '/provider/earnings', icon: TrendingUp, label: 'Earnings' },
    { path: '/provider/reviews', icon: Star, label: 'Reviews' },
    { path: '/provider/subscription', icon: CreditCard, label: 'Subscription' },
    { path: '/provider/profile', icon: Settings, label: 'Business Profile' },
    { path: '/provider/help', icon: HelpCircle, label: 'Help' },
];

const ProviderLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => { await logout(); navigate('/login'); };

    const avatarSrc = user?.photo?.startsWith('/')
        ? `http://localhost:5000${user.photo}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'P')}&background=8b5cf6&color=fff&size=64`;

    const Sidebar = ({ mobile = false }) => (
        <aside className={`flex flex-col h-full border-r border-white/8 bg-slate-900 ${mobile ? 'w-72' : 'w-64'}`}>
            {/* Brand */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-white/8">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg flex-shrink-0">
                    <Briefcase className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                    <span className="font-bold text-white text-sm">Provider Portal</span>
                    <p className="text-xs text-slate-500">Sahaay</p>
                </div>
                {mobile && (
                    <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
                {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
                    const active = location.pathname === path || location.pathname.startsWith(path + '/');
                    return (
                        <Link key={path} to={path} onClick={() => setSidebarOpen(false)}
                            className={active ? 'nav-item-active' : 'nav-item'}>
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span>{label}</span>
                            {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="border-t border-white/8 p-4">
                <div className="flex items-center gap-3 p-2 rounded-xl mb-1">
                    <img src={avatarSrc} alt={user?.name} className="w-9 h-9 rounded-full object-cover border-2 border-white/10" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-violet-400">Service Provider</p>
                    </div>
                </div>
                <button onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-2 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-sm transition-all">
                    <LogOut className="w-4 h-4" />Sign out
                </button>
            </div>
        </aside>
    );

    return (
        <div className="flex h-screen bg-slate-900 overflow-hidden">
            {/* Desktop sidebar */}
            <div className="hidden lg:flex flex-shrink-0"><Sidebar /></div>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <div className="relative flex h-full"><Sidebar mobile /></div>
                </div>
            )}

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="flex items-center gap-4 px-4 md:px-6 py-3.5 border-b border-white/8 bg-slate-900/80 backdrop-blur-sm flex-shrink-0 z-10">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                        <h2 className="text-sm font-semibold text-white capitalize">
                            {NAV_ITEMS.find((n) => location.pathname.startsWith(n.path))?.label || 'Provider Portal'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link to="/provider/notifications" className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                            <Bell className="w-5 h-5" />
                        </Link>
                        <Link to="/provider/profile">
                            <img src={avatarSrc} alt={user?.name} className="w-8 h-8 rounded-full object-cover border-2 border-white/10" />
                        </Link>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
};

export default ProviderLayout;
