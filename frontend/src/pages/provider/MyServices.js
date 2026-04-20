import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Briefcase, Eye, Edit2, ToggleLeft, ToggleRight, Loader2, IndianRupee, Tag, ChevronRight, Trash2 } from 'lucide-react';
import ProviderLayout from '../../components/layout/ProviderLayout';
import axiosInstance from '../../axios/axiosInstance';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
    active:   'badge-success',
    inactive: 'badge-neutral',
    draft:    'badge-warning',
};

const PRICING_LABELS = { fixed: 'Fixed', hourly: 'Per Hour', daily: 'Per Day', quote_based: 'Quote Based' };

export default function MyServices() {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = statusFilter ? `?status=${statusFilter}` : '';
            const res = await axiosInstance.get(`/provider/services${params}`);
            setServices(res.data.services || []);
            setTotal(res.data.total || 0);
        } catch { toast.error('Failed to load services'); }
        finally { setLoading(false); }
    }, [statusFilter]);

    useEffect(() => { load(); }, [load]);

    const toggleStatus = async (id, current) => {
        const newStatus = current === 'active' ? 'inactive' : 'active';
        try {
            await axiosInstance.patch(`/services/${id}/status`, { status: newStatus });
            toast.success(`Service ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
            load();
        } catch { toast.error('Failed to update'); }
    };

    const deleteService = async (id) => {
        if (!window.confirm('Delete this service listing?')) return;
        try {
            await axiosInstance.delete(`/services/${id}`);
            toast.success('Service deleted');
            load();
        } catch { toast.error('Failed to delete'); }
    };

    return (
        <ProviderLayout>
            <div className="p-4 md:p-6 max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="page-title">My Services</h1>
                        <p className="page-subtitle">{total} listing{total !== 1 ? 's' : ''}</p>
                    </div>
                    <button onClick={() => navigate('/provider/services/new')}
                        className="btn btn-md"
                        style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff' }}>
                        <Plus className="w-4 h-4" />Add Service
                    </button>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 mb-6">
                    {[{ val: '', label: 'All' }, { val: 'active', label: 'Active' }, { val: 'inactive', label: 'Inactive' }, { val: 'draft', label: 'Draft' }].map(({ val, label }) => (
                        <button key={val} onClick={() => setStatusFilter(val)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === val ? '' : 'bg-slate-800 text-slate-400 hover:text-white border border-white/10'}`}
                            style={statusFilter === val ? { background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff' } : {}}>
                            {label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 text-violet-500 animate-spin" /></div>
                ) : services.length === 0 ? (
                    <div className="card p-12 text-center">
                        <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">No services yet</h3>
                        <p className="text-slate-400 text-sm mb-6">Create your first service listing to appear in search results and get matched with clients.</p>
                        <button onClick={() => navigate('/provider/services/new')} className="btn btn-md mx-auto"
                            style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff' }}>
                            <Plus className="w-4 h-4" />Create First Service
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {services.map((s) => (
                            <div key={s._id} className="card p-5 hover:border-violet-500/20 transition-all">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <h3 className="font-bold text-white">{s.name}</h3>
                                            <span className={`badge ${STATUS_BADGE[s.status] || 'badge-neutral'}`}>{s.status}</span>
                                        </div>
                                        <p className="text-sm text-slate-400 line-clamp-2">{s.description}</p>
                                    </div>
                                    {/* Pricing */}
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-bold text-white flex items-center gap-0.5 justify-end">
                                            <IndianRupee className="w-3.5 h-3.5" />
                                            {s.pricingType === 'quote_based' ? 'Quote' : `${s.priceMin?.toLocaleString()}${s.priceMax ? '–' + s.priceMax?.toLocaleString() : ''}`}
                                        </p>
                                        <p className="text-xs text-slate-500">{PRICING_LABELS[s.pricingType]}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/8">
                                    <span className="badge badge-neutral text-xs">{s.category}</span>
                                    {s.tags?.slice(0, 3).map((t) => (
                                        <span key={t} className="text-xs bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-slate-500">{t}</span>
                                    ))}
                                    <div className="ml-auto flex items-center gap-2">
                                        <span className="text-xs text-slate-500">{s.viewCount || 0} views · {s.requestCount || 0} inquiries</span>
                                        <button onClick={() => toggleStatus(s._id, s.status)}
                                            className="text-slate-400 hover:text-violet-400 transition-colors" title={s.status === 'active' ? 'Deactivate' : 'Activate'}>
                                            {s.status === 'active' ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5" />}
                                        </button>
                                        <button onClick={() => navigate(`/provider/services/${s._id}/edit`)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => deleteService(s._id)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </ProviderLayout>
    );
}
