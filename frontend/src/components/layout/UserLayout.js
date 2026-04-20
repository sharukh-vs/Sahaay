import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Home, Search, Briefcase, FileText, MessageSquare,
    Star, HelpCircle, Users, Bell, Menu, X, LogOut,
    ChevronRight, Settings, Newspaper, Heart,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../axios/axiosInstance';

const NAV_ITEMS = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/user/search', icon: Search, label: 'Find Services' },
    { path: '/user/services', icon: Briefcase, label: 'Service List' },
    { path: '/user/requests', icon: FileText, label: 'My Requests' },
    { path: '/user/quotations', icon: MessageSquare, label: 'Quotations' },
    { path: '/user/feedback', icon: Star, label: 'My Reviews' },
    { path: '/user/disputes', icon: HelpCircle, label: 'Disputes' },
    { path: '/user/community', icon: Users, label: 'Community' },
    { path: '/user/help', icon: Heart, label: 'Help & Support' },
];

const UserLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [notifCount, setNotifCount] = useState(0);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        axiosInstance.get('/users/me/notifications?limit=1')
            .then((res) => setNotifCount(res.data.unreadCount || 0))
            .catch(() => {});
    }, [location.pathname]);

    const handleLogout = async () => { await logout(); navigate('/login'); };

    const Sidebar = ({ mobile = false }) => (
        <aside className={`flex flex-col h-full bg-slate-900 border-r border-white/8 ${mobile ? 'w-72' : 'w-64'}`}>
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-white/8">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-glow-sm flex-shrink-0">
                    <span className="text-white font-black text-base">S</span>
                </div>
                <span className="font-bold text-white text-lg">Sahaay</span>
                {mobile && (
                    <button onClick={() => setSidebarOpen(false)} className="ml-auto text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
                {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
                    const active = location.pathname === path || (path !== '/home' && location.pathname.startsWith(path));
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

            {/* User footer */}
            <div className="border-t border-white/8 p-4">
                <Link to="/user/profile" onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all group">
                    <img
                        src={user?.photo?.startsWith('/') ? `http://localhost:5000${user.photo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff`}
                        alt={user?.name}
                        className="w-9 h-9 rounded-full object-cover border-2 border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <Settings className="w-4 h-4 text-slate-500 group-hover:text-slate-300 flex-shrink-0" />
                </Link>
                <button onClick={handleLogout}
                    className="flex items-center gap-2 w-full mt-1 px-2 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-sm transition-all">
                    <LogOut className="w-4 h-4" />
                    Sign out
                </button>
            </div>
        </aside>
    );

    return (
        <div className="flex h-screen bg-slate-900 overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden lg:flex flex-shrink-0">
                <Sidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
                    <div className="relative flex h-full">
                        <Sidebar mobile />
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top header */}
                <header className="flex items-center gap-4 px-4 md:px-6 py-3.5 border-b border-white/8 bg-slate-900/80 backdrop-blur-sm flex-shrink-0 z-10">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Search bar */}
                    <div className="flex-1 max-w-md hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-400 cursor-pointer hover:border-indigo-500/40 transition-colors"
                        onClick={() => navigate('/user/search')}>
                        <Search className="w-4 h-4 flex-shrink-0" />
                        <span>Search services, providers...</span>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        {/* Notifications */}
                        <Link to="/user/notifications" className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                            <Bell className="w-5 h-5" />
                            {notifCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            )}
                        </Link>

                        {/* Profile */}
                        <Link to="/user/profile" className="flex items-center gap-2 pl-2">
                            <img
                                src={user?.photo?.startsWith('/') ? `http://localhost:5000${user.photo}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff&size=64`}
                                alt={user?.name}
                                className="w-8 h-8 rounded-full object-cover border-2 border-white/10"
                            />
                        </Link>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default UserLayout;
