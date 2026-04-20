import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, IndianRupee, Clock, CheckCircle2, XCircle, Loader2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProviderLayout from '../../components/layout/ProviderLayout';
import axiosInstance from '../../axios/axiosInstance';
import toast from 'react-hot-toast';

const STATUS_BADGE = { pending:'badge-warning', accepted:'badge-success', rejected:'badge-danger', withdrawn:'badge-neutral', expired:'badge-neutral' };
const STATUS_ICON = { pending: Clock, accepted: CheckCircle2, rejected: XCircle };

export default function MyQuotes() {
    const [quotations, setQuotations] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams({ page, limit: 12 });
            if (statusFilter) p.set('status', statusFilter);
            const res = await axiosInstance.get(`/provider/quotes?${p}`);
            setQuotations(res.data.quotations || []);
            setTotal(res.data.total || 0);
        } catch { toast.error('Failed to load quotes'); }
        finally { setLoading(false); }
    }, [statusFilter, page]);

    useEffect(() => { load(); }, [load]);

    return (
        <ProviderLayout>
            <div className="p-4 md:p-6 max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="page-title">My Quotes</h1>
                    <p className="page-subtitle">{total} quotes submitted</p>
                </div>

                <div className="flex gap-2 mb-6 flex-wrap">
                    {['','pending','accepted','rejected','withdrawn'].map((s) => (
                        <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? '' : 'bg-slate-800 text-slate-400 border border-white/10 hover:text-white'}`}
                            style={statusFilter === s ? { background:'linear-gradient(135deg,#8b5cf6,#7c3aed)',color:'#fff' } : {}}>
                            {s || 'All'}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 text-violet-500 animate-spin" /></div>
                ) : !quotations.length ? (
                    <div className="card p-12 text-center">
                        <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">No quotes yet</h3>
                        <p className="text-slate-400 text-sm mb-6">Browse requests and submit quotes to get started.</p>
                        <Link to="/provider/requests" className="btn btn-md mx-auto"
                            style={{ background:'linear-gradient(135deg,#8b5cf6,#7c3aed)',color:'#fff' }}>
                            Browse Requests
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {quotations.map((q) => {
                            const Icon = STATUS_ICON[q.status] || Clock;
                            return (
                                <div key={q._id} className="card p-5 hover:border-violet-500/20 transition-all">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <h3 className="font-bold text-white truncate">{q.request?.title || 'Service Request'}</h3>
                                                <span className={`badge text-xs ${STATUS_BADGE[q.status] || 'badge-neutral'}`}>{q.status}</span>
                                            </div>
                                            <p className="text-sm text-slate-400 line-clamp-1">{q.description}</p>
                                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                                                <span className="badge badge-neutral text-xs">{q.request?.category}</span>
                                                {q.estimatedDuration && <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{q.estimatedDuration}</span>}
                                                <span>{new Date(q.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'2-digit'})}</span>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-bold text-white text-lg flex items-center gap-0.5 justify-end">
                                                <IndianRupee className="w-4 h-4 text-emerald-400" />{q.amount?.toLocaleString('en-IN')}
                                            </p>
                                            {q.advanceAmount > 0 && (
                                                <p className="text-xs text-slate-400">₹{q.advanceAmount?.toLocaleString()} advance</p>
                                            )}
                                        </div>
                                    </div>

                                    {q.status === 'accepted' && (
                                        <div className="mt-3 pt-3 border-t border-white/8 flex items-center justify-between">
                                            <span className="flex items-center gap-1 text-xs text-emerald-400">
                                                <CheckCircle2 className="w-3.5 h-3.5" />Quote accepted — proceed to deliver!
                                            </span>
                                            <Link to={`/provider/requests/${q.request?._id}`}
                                                className="btn btn-sm text-xs"
                                                style={{ background:'linear-gradient(135deg,#8b5cf6,#7c3aed)',color:'#fff' }}>
                                                View Request <ChevronRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </ProviderLayout>
    );
}
