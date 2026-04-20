import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, MapPin, Calendar, IndianRupee, AlertCircle, Loader2, Filter, ChevronRight, Tag, Clock } from 'lucide-react';
import ProviderLayout from '../../components/layout/ProviderLayout';
import axiosInstance from '../../axios/axiosInstance';
import toast from 'react-hot-toast';

const CATEGORIES = ['All','Plumbing','Electrical','Carpentry','Painting','Cleaning','Landscaping','HVAC','IT Support','Medical','Legal','Accounting','Beauty & Wellness','Automotive','Moving'];

const MatchBadge = ({ score }) => {
    const color = score >= 70 ? 'badge-success' : score >= 40 ? 'badge-warning' : 'badge-neutral';
    return <span className={`badge ${color} text-xs font-bold`}>🎯 {score}% match</span>;
};

const RequestCard = ({ request }) => (
    <div className="card p-5 hover:border-violet-500/30 hover:shadow-glow-sm transition-all duration-200 animate-fade-in">
        <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white line-clamp-1">{request.title}</h3>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{request.description}</p>
            </div>
            {request.myMatchScore > 0 && <MatchBadge score={request.myMatchScore} />}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
            <span className="flex items-center gap-1 text-xs text-slate-400"><AlertCircle className="w-3 h-3 text-violet-400" />{request.category}</span>
            {request.address?.city && <span className="flex items-center gap-1 text-xs text-slate-400"><MapPin className="w-3 h-3 text-emerald-400" />{request.address.city}</span>}
            {request.preferredDate && <span className="flex items-center gap-1 text-xs text-slate-400"><Calendar className="w-3 h-3 text-blue-400" />{new Date(request.preferredDate).toLocaleDateString('en-IN')}</span>}
            {request.budgetMax > 0 && <span className="flex items-center gap-1 text-xs text-slate-400"><IndianRupee className="w-3 h-3 text-amber-400" />up to ₹{request.budgetMax?.toLocaleString()}</span>}
        </div>

        {request.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
                {request.tags.slice(0, 4).map((t) => (
                    <span key={t} className="text-xs bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-slate-400">{t}</span>
                ))}
            </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-white/8">
            <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="w-3 h-3" />{new Date(request.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
            <div className="flex items-center gap-2">
                <Link to={`/provider/requests/${request._id}`} className="btn btn-outline btn-sm text-xs">
                    View <ChevronRight className="w-3 h-3" />
                </Link>
                <Link to={`/provider/quotes/new?requestId=${request._id}`} className="btn btn-sm text-xs"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff' }}>
                    Submit Quote
                </Link>
            </div>
        </div>
    </div>
);

export default function RequestFeed() {
    const [requests, setRequests] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('All');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 12 });
            if (category !== 'All') params.set('category', category);
            const res = await axiosInstance.get(`/provider/requests?${params}`);
            setRequests(res.data.requests || []);
            setTotal(res.data.total || 0);
            setPages(res.data.pages || 1);
        } catch { toast.error('Failed to load requests'); }
        finally { setLoading(false); }
    }, [category, page]);

    useEffect(() => { load(); }, [load]);

    return (
        <ProviderLayout>
            <div className="p-4 md:p-6 max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="page-title">Request Feed</h1>
                    <p className="page-subtitle">{total} service requests matched to your profile</p>
                </div>

                {/* Category filter */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                    <Filter className="w-4 h-4 text-slate-400 mt-1.5 flex-shrink-0" />
                    {CATEGORIES.map((c) => (
                        <button key={c} onClick={() => { setCategory(c); setPage(1); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${category === c ? 'text-white' : 'bg-slate-800 text-slate-400 hover:text-white border border-white/10'}`}
                            style={category === c ? { background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff' } : {}}>
                            {c}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-violet-500 animate-spin" /></div>
                ) : requests.length === 0 ? (
                    <div className="card p-12 text-center">
                        <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">No requests yet</h3>
                        <p className="text-slate-400 text-sm">Complete your profile and add services to start getting matched with clients.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {requests.map((r) => <RequestCard key={r._id} request={r} />)}
                        </div>
                        {pages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                                    <button key={p} onClick={() => setPage(p)}
                                        className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === p ? '' : 'bg-slate-800 text-slate-400 hover:text-white border border-white/10'}`}
                                        style={page === p ? { background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff' } : {}}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </ProviderLayout>
    );
}
