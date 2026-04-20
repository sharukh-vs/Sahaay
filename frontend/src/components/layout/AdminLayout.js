import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, Shield, FileText, AlertTriangle,
    CreditCard, Megaphone, HelpCircle, Settings, Bell,
    Menu, X, ChevronRight, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users',     icon: Users,           label: 'Users' },
    { path: '/admin/providers', icon: Shield,          label: 'Providers' },
    { path: '/admin/requests',  icon: FileText,        label: 'Requests' },
    { path: '/admin/disputes',  icon: AlertTriangle,   label: 'Disputes' },
    { path: '/admin/payments',  icon: CreditCard,      label: 'Payments' },
    { path: '/admin/ads',       icon: Megaphone,       label: 'Ads' },
    { path: '/admin/tickets',   icon: HelpCircle,      label: 'Support' },
    { path: '/admin/settings',  icon: Settings,        label: 'Settings' },
];

const AdminLayout = ({ children }) => {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => { await logout(); navigate('/login'); };
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'A')}&background=ef4444&color=fff&size=64`;

    const Sidebar = ({ mobile = false }) => (
        <aside className={`flex flex-col h-full bg-slate-950 border-r border-white/8 ${mobile ? 'w-72' : 'w-60'}`}>
            <div className="flex items-center gap-3 px-5 py-5 border-b border-white/8">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg flex-shrink-0">
                    <Shield className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <span className="font-bold text-white text-sm">Admin Panel</span>
                    <p className="text-xs text-slate-500 capitalize truncate">{user?.role}</p>
                </div>
                {mobile && <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>}
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
                {NAV.map(({ path, icon: Icon, label }) => {
                    const active = location.pathname === path || location.pathname.startsWith(path + '/');
                    return (
                        <Link key={path} to={path} onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1">{label}</span>
                            {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-white/8 p-4 space-y-1">
                <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
                    <img src={avatar} alt={user?.name} className="w-8 h-8 rounded-full border-2 border-white/10" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-xs text-red-400">{user?.role}</p>
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
            <div className="hidden lg:flex flex-shrink-0"><Sidebar /></div>

            {open && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
                    <div className="relative flex h-full"><Sidebar mobile /></div>
                </div>
            )}

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="flex items-center gap-4 px-4 md:px-6 py-3.5 border-b border-white/8 bg-slate-950/80 backdrop-blur-sm flex-shrink-0 z-10">
                    <button onClick={() => setOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
                        <Menu className="w-5 h-5" />
                    </button>
                    <h2 className="text-sm font-semibold text-white">
                        {NAV.find((n) => location.pathname.startsWith(n.path))?.label || 'Admin'}
                    </h2>
                    <div className="ml-auto flex items-center gap-2">
                        <Link to="/admin/tickets" className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                            <Bell className="w-5 h-5" />
                        </Link>
                        <img src={avatar} alt={user?.name} className="w-8 h-8 rounded-full border-2 border-white/10" />
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
};

export default AdminLayout;
