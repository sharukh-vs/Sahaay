import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, IndianRupee, Clock, CheckCircle2, XCircle, Loader2, Star, ChevronRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserLayout from '../../components/layout/UserLayout';
import axiosInstance from '../../axios/axiosInstance';
import toast from 'react-hot-toast';

const STATUS_BADGE = { pending:'badge-warning', accepted:'badge-success', rejected:'badge-danger', withdrawn:'badge-neutral', expired:'badge-neutral' };

export default function UserQuotations() {
    const [quotations, setQuotations] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [actionLoading, setActionLoading] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams({ limit: 30 });
            if (statusFilter) p.set('status', statusFilter);
            const res = await axiosInstance.get(`/quotations/my?${p}`);
            setQuotations(res.data.quotations || []);
            setTotal(res.data.total || 0);
        } catch { toast.error('Failed to load quotations'); }
        finally { setLoading(false); }
    }, [statusFilter]);

    useEffect(() => { load(); }, [load]);

    const handleAction = async (id, action) => {
        setActionLoading(id + action);
        try {
            await axiosInstance.patch(`/quotations/${id}/${action}`);
            toast.success(action === 'accept' ? 'Quote accepted!' : 'Quote rejected');
            load();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed');
        } finally { setActionLoading(''); }
    };

    return (
        <UserLayout>
            <div className="p-4 md:p-6 max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="page-title">My Quotations</h1>
                    <p className="page-subtitle">Quotes received from service providers ({total})</p>
                </div>

                <div className="flex gap-2 mb-6 flex-wrap">
                    {['','pending','accepted','rejected'].map((s) => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 border border-white/10 hover:text-white'}`}>
                            {s || 'All'}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 text-indigo-500 animate-spin" /></div>
                ) : !quotations.length ? (
                    <div className="card p-12 text-center">
                        <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">No quotes yet</h3>
                        <p className="text-slate-400 text-sm mb-6">Post a service request to receive quotes from providers.</p>
                        <Link to="/user/requests/new" className="btn btn-primary btn-md mx-auto">Post a Request</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {quotations.map((q) => (
                            <div key={q._id} className={`card p-5 transition-all ${q.status === 'pending' ? 'border-indigo-500/20' : ''}`}>
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                        <img src={q.provider?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(q.provider?.businessName || 'P')}&background=8b5cf6&color=fff&size=40`}
                                            alt="" className="w-10 h-10 rounded-xl object-cover border border-white/10 flex-shrink-0" />
                                        <div>
                                            <p className="font-bold text-white">{q.provider?.businessName}</p>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                <span className="text-xs text-slate-400">{q.provider?.averageRating?.toFixed(1) || 'New'} · {q.provider?.totalJobsCompleted || 0} jobs</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`badge text-xs ${STATUS_BADGE[q.status] || 'badge-neutral'}`}>{q.status}</span>
                                </div>

                                <div className="bg-white/5 rounded-xl p-3 mb-3">
                                    <p className="text-sm text-slate-300">{q.description}</p>
                                </div>

                                <div className="flex flex-wrap gap-4 text-sm mb-3">
                                    <div className="flex items-center gap-1">
                                        <IndianRupee className="w-4 h-4 text-emerald-400" />
                                        <span className="font-bold text-white">{q.amount?.toLocaleString('en-IN')}</span>
                                        <span className="text-slate-400 text-xs">total</span>
                                    </div>
                                    {q.advanceAmount > 0 && (
                                        <div className="flex items-center gap-1">
                                            <IndianRupee className="w-4 h-4 text-amber-400" />
                                            <span className="text-white">{q.advanceAmount?.toLocaleString('en-IN')}</span>
                                            <span className="text-slate-400 text-xs">advance</span>
                                        </div>
                                    )}
                                    {q.estimatedDuration && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-blue-400" />
                                            <span className="text-slate-300 text-xs">{q.estimatedDuration}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Breakdown */}
                                {q.breakdownItems?.length > 0 && (
                                    <div className="rounded-xl border border-white/8 divide-y divide-white/5 mb-3">
                                        {q.breakdownItems.map((item, i) => (
                                            <div key={i} className="flex justify-between px-3 py-2 text-xs">
                                                <span className="text-slate-400">{item.label}</span>
                                                <span className="text-white font-medium">₹{Number(item.amount)?.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-3 border-t border-white/8">
                                    <span className="text-xs text-slate-500">
                                        For: <span className="text-slate-300">{q.request?.title}</span> ·{' '}
                                        {new Date(q.createdAt).toLocaleDateString('en-IN', {day:'numeric',month:'short'})}
                                    </span>
                                    {q.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button onClick={() => handleAction(q._id, 'reject')}
                                                disabled={!!actionLoading}
                                                className="btn btn-sm text-xs bg-red-500/15 text-red-400 border border-red-500/20 hover:bg-red-500/25">
                                                {actionLoading === q._id + 'reject' ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}Reject
                                            </button>
                                            <button onClick={() => handleAction(q._id, 'accept')}
                                                disabled={!!actionLoading}
                                                className="btn btn-sm text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25">
                                                {actionLoading === q._id + 'accept' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}Accept
                                            </button>
                                        </div>
                                    )}
                                    {q.status === 'accepted' && (
                                        <Link to={`/user/requests/${q.request?._id}`}
                                            className="btn btn-primary btn-sm text-xs">
                                            View Request <ChevronRight className="w-3 h-3" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </UserLayout>
    );
}
