import React, { useState, useEffect, useCallback } from 'react';
import { Search, Shield, Loader2, X, CheckCircle, XCircle, Star, MapPin } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import axiosInstance from '../../axios/axiosInstance';
import toast from 'react-hot-toast';

const STATUS_BADGE = { pending:'badge-warning', approved:'badge-success', rejected:'badge-danger' };

export default function ProviderManagement() {
    const [providers, setProviders] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [rejectModal, setRejectModal] = useState(null);
    const [reason, setReason] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams({ page, limit: 20 });
            if (search) p.set('q', search);
            if (statusFilter) p.set('verificationStatus', statusFilter);
            const res = await axiosInstance.get(`/admin/providers?${p}`);
            setProviders(res.data.providers || []);
            setTotal(res.data.total || 0);
            setPages(res.data.pages || 1);
        } catch { toast.error('Failed to load providers'); }
        finally { setLoading(false); }
    }, [search, statusFilter, page]);

    useEffect(() => { load(); }, [load]);

    const handleVerify = async (id, status, rejReason) => {
        try {
            await axiosInstance.patch(`/admin/providers/${id}/verify`, { status, rejectionReason: rejReason });
            toast.success(status === 'approved' ? 'Provider approved!' : 'Provider rejected');
            setRejectModal(null); setReason('');
            load();
        } catch { toast.error('Failed'); }
    };

    return (
        <AdminLayout>
            <div className="p-4 md:p-6 max-w-5xl mx-auto">
                <div className="mb-6">
                    <h1 className="page-title">Provider Management</h1>
                    <p className="page-subtitle">{total} providers</p>
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="flex-1 min-w-52 flex items-center gap-2 input">
                        <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Search business name…"
                            className="bg-transparent border-none outline-none text-white placeholder:text-slate-500 text-sm w-full" />
                        {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-slate-500" /></button>}
                    </div>
                    <div className="flex gap-2">
                        {['','pending','approved','rejected'].map((s) => (
                            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${statusFilter === s ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400 border border-white/10 hover:text-white'}`}>
                                {s || 'All'}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 text-red-500 animate-spin" /></div>
                ) : !providers.length ? (
                    <div className="card p-12 text-center">
                        <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white">No providers found</h3>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {providers.map((p) => (
                            <div key={p._id} className="card p-5 hover:border-white/15 transition-all">
                                <div className="flex items-start gap-4">
                                    <img src={p.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.businessName || 'P')}&background=8b5cf6&color=fff&size=48`}
                                        alt={p.businessName} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-white/10" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <h3 className="font-bold text-white">{p.businessName}</h3>
                                            <span className={`badge text-xs ${STATUS_BADGE[p.verificationStatus] || 'badge-neutral'}`}>{p.verificationStatus}</span>
                                            <span className="badge badge-neutral text-xs capitalize">{p.collarType} collar</span>
                                        </div>
                                        <p className="text-sm text-slate-400">{p.user?.name} · {p.user?.email}</p>
                                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                                            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{p.averageRating?.toFixed(1) || '—'}</span>
                                            <span>{p.totalJobsCompleted || 0} jobs</span>
                                            {p.businessAddress?.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.businessAddress.city}</span>}
                                        </div>
                                    </div>
                                    {p.verificationStatus === 'pending' && (
                                        <div className="flex gap-2 flex-shrink-0">
                                            <button onClick={() => handleVerify(p._id, 'approved')}
                                                className="btn btn-sm text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25">
                                                <CheckCircle className="w-3 h-3" />Approve
                                            </button>
                                            <button onClick={() => setRejectModal(p)}
                                                className="btn btn-sm text-xs bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25">
                                                <XCircle className="w-3 h-3" />Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {pages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map((pg) => (
                            <button key={pg} onClick={() => setPage(pg)}
                                className={`w-9 h-9 rounded-xl text-sm font-medium ${page === pg ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400 border border-white/10'}`}>{pg}</button>
                        ))}
                    </div>
                )}
            </div>

            {rejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRejectModal(null)} />
                    <div className="relative card p-6 w-full max-w-sm animate-slide-up">
                        <h3 className="text-lg font-bold text-white mb-1">Reject Provider</h3>
                        <p className="text-sm text-slate-400 mb-4">{rejectModal.businessName}</p>
                        <label className="label">Reason</label>
                        <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
                            placeholder="Explain why the application was rejected…" className="input resize-none mb-4" />
                        <div className="flex gap-3">
                            <button onClick={() => setRejectModal(null)} className="btn btn-secondary btn-md flex-1">Cancel</button>
                            <button onClick={() => handleVerify(rejectModal._id, 'rejected', reason)} className="btn btn-md flex-1 bg-red-500 text-white">Reject</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
