import React, { useState, useEffect, useCallback } from 'react';
import { Search, Users, Shield, UserX, UserCheck, Loader2, X, ChevronDown } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import axiosInstance from '../../axios/axiosInstance';
import toast from 'react-hot-toast';

const ROLES = ['user','serviceProvider','superAdmin','subAdmin','staff','helpSupport','contentManager','accountant'];
const ROLE_COLOR = { user:'badge-neutral', serviceProvider:'badge-primary', superAdmin:'bg-red-500/15 text-red-400 border border-red-500/20' };

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const [modal, setModal] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams({ page, limit: 20 });
            if (search) p.set('q', search);
            if (roleFilter) p.set('role', roleFilter);
            const res = await axiosInstance.get(`/admin/users?${p}`);
            setUsers(res.data.users || []);
            setTotal(res.data.total || 0);
            setPages(res.data.pages || 1);
        } catch { toast.error('Failed to load users'); }
        finally { setLoading(false); }
    }, [search, roleFilter, page]);

    useEffect(() => { load(); }, [load]);

    const toggleActive = async (id, isActive) => {
        try {
            await axiosInstance.patch(`/admin/users/${id}`, { isActive: !isActive });
            toast.success(isActive ? 'Deactivated' : 'Activated');
            load();
        } catch { toast.error('Failed'); }
    };

    const saveRole = async () => {
        try {
            await axiosInstance.patch(`/admin/users/${modal.user._id}`, { role: modal.editRole });
            toast.success('Role updated'); setModal(null); load();
        } catch { toast.error('Failed'); }
    };

    return (
        <AdminLayout>
            <div className="p-4 md:p-6 max-w-6xl mx-auto">
                <div className="mb-6">
                    <h1 className="page-title">User Management</h1>
                    <p className="page-subtitle">{total} total users</p>
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="flex-1 min-w-52 flex items-center gap-2 input">
                        <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <input type="text" value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search name or email…"
                            className="bg-transparent border-none outline-none text-white placeholder:text-slate-500 text-sm w-full" />
                        {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-slate-500" /></button>}
                    </div>
                    <div className="relative">
                        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                            className="appearance-none input pr-8 py-2.5 text-sm">
                            <option value="">All Roles</option>
                            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 text-red-500 animate-spin" /></div>
                ) : !users.length ? (
                    <div className="card p-12 text-center">
                        <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white">No users found</h3>
                    </div>
                ) : (
                    <>
                        <div className="card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/8">
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">User</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Role</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Joined</th>
                                            <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {users.map((u) => (
                                            <tr key={u._id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=6366f1&color=fff&size=32`}
                                                            alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                                                        <div>
                                                            <p className="font-medium text-white">{u.name}</p>
                                                            <p className="text-xs text-slate-500">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`badge text-xs ${ROLE_COLOR[u.role] || 'badge-neutral'}`}>{u.role}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`badge text-xs ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                                                        {u.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-400 text-xs">
                                                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'2-digit' })}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button onClick={() => setModal({ user: u, editRole: u.role })}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5">
                                                            <Shield className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => toggleActive(u._id, u.isActive)}
                                                            className={`p-1.5 rounded-lg transition-all ${u.isActive ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10'}`}>
                                                            {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        {pages > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                                {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map((pg) => (
                                    <button key={pg} onClick={() => setPage(pg)}
                                        className={`w-9 h-9 rounded-xl text-sm font-medium ${page === pg ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400 border border-white/10'}`}>{pg}</button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)} />
                    <div className="relative card p-6 w-full max-w-sm animate-slide-up">
                        <h3 className="text-lg font-bold text-white mb-1">Change Role</h3>
                        <p className="text-sm text-slate-400 mb-5">{modal.user.name}</p>
                        <select value={modal.editRole}
                            onChange={(e) => setModal((m) => ({ ...m, editRole: e.target.value }))}
                            className="input mb-4">
                            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <div className="flex gap-3">
                            <button onClick={() => setModal(null)} className="btn btn-secondary btn-md flex-1">Cancel</button>
                            <button onClick={saveRole} className="btn btn-md flex-1 bg-red-500 text-white hover:bg-red-600">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
