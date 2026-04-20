import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Loader2, Send, CheckCircle2 } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import axiosInstance from '../../axios/axiosInstance';
import toast from 'react-hot-toast';

const STATUS_BADGE = { open:'badge-warning', under_review:'badge-primary', resolved:'badge-success', closed:'badge-neutral' };

export default function DisputeManagement() {
    const [disputes, setDisputes] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [detail, setDetail] = useState(null);
    const [resolution, setResolution] = useState('');
    const [comment, setComment] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams({ page, limit: 15 });
            if (statusFilter) p.set('status', statusFilter);
            const res = await axiosInstance.get(`/admin/disputes?${p}`);
            setDisputes(res.data.disputes || []);
            setTotal(res.data.total || 0);
        } catch { toast.error('Failed to load disputes'); }
        finally { setLoading(false); }
    }, [statusFilter, page]);

    useEffect(() => { load(); }, [load]);

    const openDetail = async (d) => {
        try {
            const res = await axiosInstance.get(`/disputes/${d._id}`);
            setDetail(res.data.dispute);
        } catch { toast.error('Failed to load details'); }
    };

    const handleComment = async () => {
        if (!comment.trim()) return;
        try {
            await axiosInstance.patch(`/disputes/${detail._id}/comment`, { text: comment });
            setComment('');
            const res = await axiosInstance.get(`/disputes/${detail._id}`);
            setDetail(res.data.dispute);
        } catch { toast.error('Failed'); }
    };

    const handleResolve = async () => {
        if (!resolution.trim()) { toast.error('Resolution required'); return; }
        try {
            await axiosInstance.patch(`/disputes/${detail._id}/resolve`, { resolution, resolutionType: 'resolved' });
            toast.success('Dispute resolved');
            setDetail(null); setResolution('');
            load();
        } catch { toast.error('Failed'); }
    };

    return (
        <AdminLayout>
            <div className="p-4 md:p-6 max-w-5xl mx-auto">
                <div className="mb-6">
                    <h1 className="page-title">Dispute Management</h1>
                    <p className="page-subtitle">{total} disputes</p>
                </div>

                <div className="flex gap-2 mb-6 flex-wrap">
                    {['','open','under_review','resolved','closed'].map((s) => (
                        <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400 border border-white/10 hover:text-white'}`}>
                            {s || 'All'}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 text-red-500 animate-spin" /></div>
                ) : !disputes.length ? (
                    <div className="card p-12 text-center">
                        <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white">No disputes — all clear! 🎉</h3>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {disputes.map((d) => (
                            <div key={d._id} onClick={() => openDetail(d)}
                                className="card p-5 hover:border-white/15 transition-all cursor-pointer">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <h3 className="font-bold text-white">{d.title || d.reason}</h3>
                                            <span className={`badge text-xs ${STATUS_BADGE[d.status] || 'badge-neutral'}`}>{d.status}</span>
                                            {d.status === 'open' && <span className="badge badge-danger text-xs animate-pulse">Needs Action</span>}
                                        </div>
                                        <p className="text-sm text-slate-400 line-clamp-1">{d.description}</p>
                                        <div className="flex gap-4 mt-2 text-xs text-slate-500">
                                            <span>By: {d.raisedBy?.name}</span>
                                            <span>Against: {d.raisedAgainst?.name || 'N/A'}</span>
                                            <span>{new Date(d.createdAt).toLocaleDateString('en-IN')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {detail && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDetail(null)} />
                    <div className="relative card p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto animate-slide-up">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">{detail.title || detail.reason}</h3>
                                <span className={`badge text-xs mt-1 ${STATUS_BADGE[detail.status]}`}>{detail.status}</span>
                            </div>
                            <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-white text-xl">✕</button>
                        </div>

                        <p className="text-sm text-slate-300 mb-4">{detail.description}</p>
                        <div className="flex gap-4 text-xs text-slate-500 mb-4 pb-4 border-b border-white/8">
                            <span>By: <strong className="text-white">{detail.raisedBy?.name}</strong></span>
                            <span>Against: <strong className="text-white">{detail.raisedAgainst?.name || 'N/A'}</strong></span>
                        </div>

                        <h4 className="text-sm font-semibold text-white mb-3">Comments</h4>
                        <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                            {detail.comments?.map((c, i) => (
                                <div key={i} className="flex gap-2 text-sm">
                                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.author?.name || 'U')}&size=24&background=6366f1&color=fff`}
                                        alt="" className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-slate-400"><strong className="text-white">{c.author?.name}</strong> · {new Date(c.createdAt).toLocaleDateString('en-IN')}</p>
                                        <p className="text-slate-300">{c.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 mb-4">
                            <input type="text" value={comment} onChange={(e) => setComment(e.target.value)}
                                placeholder="Add comment…" className="input flex-1 text-sm py-2"
                                onKeyDown={(e) => { if (e.key === 'Enter') handleComment(); }} />
                            <button onClick={handleComment} className="btn btn-sm bg-red-500 text-white hover:bg-red-600">
                                <Send className="w-3 h-3" />
                            </button>
                        </div>

                        {!['resolved','closed'].includes(detail.status) && (
                            <div className="border-t border-white/8 pt-4">
                                <label className="label">Resolution</label>
                                <textarea rows={3} value={resolution} onChange={(e) => setResolution(e.target.value)}
                                    placeholder="Describe the resolution…" className="input resize-none mb-3" />
                                <button onClick={handleResolve} className="btn btn-md w-full bg-emerald-600 text-white hover:bg-emerald-700">
                                    <CheckCircle2 className="w-4 h-4" />Mark Resolved
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
