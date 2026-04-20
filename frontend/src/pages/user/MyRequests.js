import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, FileText, Clock, CheckCircle2, XCircle, AlertCircle, ChevronRight, Loader2, MapPin, Calendar, MessageSquare, RefreshCw } from 'lucide-react';
import UserLayout from '../../components/layout/UserLayout';
import axiosInstance from '../../axios/axiosInstance';
import toast from 'react-hot-toast';

const STATUS = {
    open:        { label: 'Open',        badge: 'badge-warning' },
    quoted:      { label: 'Quoted',      badge: 'badge-primary' },
    accepted:    { label: 'Accepted',    badge: 'badge-success' },
    in_progress: { label: 'In Progress', badge: 'badge-primary' },
    completed:   { label: 'Completed',   badge: 'badge-success' },
    cancelled:   { label: 'Cancelled',   badge: 'badge-danger'  },
    disputed:    { label: 'Disputed',    badge: 'badge-danger'  },
};

export default function MyRequests() {
    const [requests, setRequests] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const navigate = useNavigate();

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = statusFilter ? `?status=${statusFilter}` : '';
            const res = await axiosInstance.get(`/requests${params}`);
            setRequests(res.data.requests || []);
            setTotal(res.data.total || 0);
        } catch { toast.error('Failed to load requests'); }
        finally { setLoading(false); }
    }, [statusFilter]);

    useEffect(() => { load(); }, [load]);

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this request?')) return;
        try {
            await axiosInstance.patch(`/requests/${id}/status`, { status: 'cancelled' });
            toast.success('Cancelled'); load();
        } catch { toast.error('Failed'); }
    };

    return (
        <UserLayout>
            <div className="p-4 md:p-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div><h1 className="page-title">My Requests</h1><p className="page-subtitle">{total} total</p></div>
                    <button onClick={() => navigate('/user/requests/new')} className="btn btn-primary btn-md">
                        <Plus className="w-4 h-4" />New Request
                    </button>
                </div>

                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                    {[{ val: '', label: 'All' }, ...Object.entries(STATUS).map(([val, { label }]) => ({ val, label }))].map(({ val, label }) => (
                        <button key={val} onClick={() => setStatusFilter(val)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${statusFilter === val ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white border border-white/10'}`}>
                            {label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 text-indigo-500 animate-spin" /></div>
                ) : requests.length === 0 ? (
                    <div className="card p-12 text-center">
                        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">No requests yet</h3>
                        <p className="text-slate-400 text-sm mb-6">Post your first service request to get matched with providers.</p>
                        <button onClick={() => navigate('/user/requests/new')} className="btn btn-primary btn-md mx-auto">
                            <Plus className="w-4 h-4" />Post a Request
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((r) => {
                            const cfg = STATUS[r.status] || STATUS.open;
                            return (
                                <div key={r._id} className="card p-5 hover:border-white/15 transition-all">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="font-bold text-white">{r.title}</h3>
                                        <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                                    </div>
                                    <p className="text-sm text-slate-400 mb-3 line-clamp-2">{r.description}</p>
                                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
                                        <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3 text-indigo-400" />{r.category}</span>
                                        {r.address?.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-400" />{r.address.city}</span>}
                                        {r.preferredDate && <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-violet-400" />{new Date(r.preferredDate).toLocaleDateString('en-IN')}</span>}
                                    </div>
                                    {r.matchedProviders?.length > 0 && <p className="text-xs text-indigo-400 mb-3">🎯 {r.matchedProviders.length} providers matched</p>}
                                    <div className="flex gap-2 pt-3 border-t border-white/8">
                                        <Link to={`/user/requests/${r._id}`} className="btn btn-outline btn-sm text-xs">View Details</Link>
                                        {r.status === 'quoted' && (
                                            <Link to={`/user/requests/${r._id}/quotes`} className="btn btn-primary btn-sm text-xs"><MessageSquare className="w-3 h-3" />Quotes</Link>
                                        )}
                                        {r.status === 'open' && (
                                            <button onClick={() => handleCancel(r._id)} className="btn btn-sm text-xs text-red-400 hover:bg-red-500/10 ml-auto">Cancel</button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </UserLayout>
    );
}
