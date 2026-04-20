import React, { useState, useEffect, useCallback } from 'react';
import { Search, Megaphone, Loader2, Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import axiosInstance from '../../axios/axiosInstance';
import toast from 'react-hot-toast';

const STATUS_BADGE = { active: 'badge-success', inactive: 'badge-neutral', scheduled: 'badge-warning' };

export default function AdsManagement() {
    const [ads, setAds] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    
    const [modal, setModal] = useState(null); // { type: 'create'|'edit', ad: {} }
    const [form, setForm] = useState({ title: '', imageUrl: '', link: '', status: 'active', placement: 'home_banner', startDate: '', endDate: '' });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams({ page, limit: 10 });
            if (statusFilter) p.set('status', statusFilter);
            const res = await axiosInstance.get(`/admin/ads?${p}`);
            setAds(res.data.ads || []);
            setTotal(res.data.total || 0);
            setPages(res.data.pages || 1);
        } catch { toast.error('Failed to load ads'); }
        finally { setLoading(false); }
    }, [statusFilter, page]);

    useEffect(() => { load(); }, [load]);

    const openModal = (ad = null) => {
        if (ad) {
            setForm({
                title: ad.title, imageUrl: ad.imageUrl, link: ad.link || '', status: ad.status, placement: ad.placement,
                startDate: ad.startDate ? new Date(ad.startDate).toISOString().split('T')[0] : '',
                endDate: ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : ''
            });
            setModal({ type: 'edit', ad });
        } else {
            setForm({ title: '', imageUrl: '', link: '', status: 'active', placement: 'home_banner', startDate: '', endDate: '' });
            setModal({ type: 'create' });
        }
    };

    const handleSave = async () => {
        if (!form.title || !form.imageUrl) return toast.error('Title and Image URL are required');
        
        try {
            if (modal.type === 'create') {
                await axiosInstance.post('/admin/ads', form);
                toast.success('Ad created successfully');
            } else {
                await axiosInstance.patch(`/admin/ads/${modal.ad._id}`, form);
                toast.success('Ad updated successfully');
            }
            setModal(null);
            load();
        } catch { toast.error('Failed to save ad'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this ad?')) return;
        try {
            await axiosInstance.delete(`/admin/ads/${id}`);
            toast.success('Ad deleted');
            load();
        } catch { toast.error('Failed to delete ad'); }
    };

    return (
        <AdminLayout>
            <div className="p-4 md:p-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div>
                        <h1 className="page-title">Ads Management</h1>
                        <p className="page-subtitle">{total} advertisements</p>
                    </div>
                    <button onClick={() => openModal()} className="btn btn-md bg-red-500 text-white hover:bg-red-600">
                        <Plus className="w-4 h-4" /> Create Ad
                    </button>
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="flex gap-2">
                        {['', 'active', 'inactive', 'scheduled'].map((s) => (
                            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${statusFilter === s ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400 border border-white/10 hover:text-white'}`}>
                                {s || 'All'}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 text-red-500 animate-spin" /></div>
                ) : !ads.length ? (
                    <div className="card p-12 text-center">
                        <Megaphone className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white">No ads found</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ads.map((ad) => (
                            <div key={ad._id} className="card overflow-hidden hover:border-white/15 transition-all">
                                <div className="h-32 bg-slate-800 relative group">
                                    {ad.imageUrl ? (
                                        <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-slate-600" /></div>
                                    )}
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => openModal(ad)} className="p-1.5 bg-black/50 text-white rounded hover:bg-black/80"><Edit2 className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => handleDelete(ad._id)} className="p-1.5 bg-red-500/80 text-white rounded hover:bg-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-white truncate pr-2">{ad.title}</h3>
                                        <span className={`badge text-xs flex-shrink-0 ${STATUS_BADGE[ad.status] || 'badge-neutral'}`}>{ad.status}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-1">Placement: <span className="text-slate-300 capitalize">{ad.placement.replace('_', ' ')}</span></p>
                                    {ad.startDate && <p className="text-xs text-slate-500">From: {new Date(ad.startDate).toLocaleDateString()}</p>}
                                    {ad.endDate && <p className="text-xs text-slate-500">Until: {new Date(ad.endDate).toLocaleDateString()}</p>}
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

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)} />
                    <div className="relative card p-6 w-full max-w-lg animate-slide-up">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">{modal.type === 'create' ? 'Create Ad' : 'Edit Ad'}</h3>
                            <button onClick={() => setModal(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="label">Title</label>
                                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input" placeholder="Summer Sale Banner" />
                            </div>
                            <div>
                                <label className="label">Image URL</label>
                                <input type="text" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="input" placeholder="https://..." />
                            </div>
                            <div>
                                <label className="label">Target Link (Optional)</label>
                                <input type="text" value={form.link} onChange={e => setForm({...form, link: e.target.value})} className="input" placeholder="https://..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Placement</label>
                                    <select value={form.placement} onChange={e => setForm({...form, placement: e.target.value})} className="input">
                                        <option value="home_banner">Home Banner</option>
                                        <option value="search_sidebar">Search Sidebar</option>
                                        <option value="provider_dashboard">Provider Dashboard</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Status</label>
                                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input">
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="scheduled">Scheduled</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Start Date</label>
                                    <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="input" />
                                </div>
                                <div>
                                    <label className="label">End Date</label>
                                    <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="input" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setModal(null)} className="btn btn-secondary btn-md flex-1">Cancel</button>
                            <button onClick={handleSave} className="btn btn-md flex-1 bg-red-500 text-white hover:bg-red-600">Save Ad</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
