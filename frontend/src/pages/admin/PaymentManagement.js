import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, IndianRupee, Loader2, ChevronDown, ArrowUpRight } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import axiosInstance from '../../axios/axiosInstance';
import toast from 'react-hot-toast';

const TYPE_BADGE = { advance:'badge-primary', final:'badge-success', subscription:'badge-warning', ad:'badge-neutral' };
const STATUS_BADGE = { paid:'badge-success', pending:'badge-warning', failed:'badge-danger', refunded:'badge-neutral' };

export default function PaymentManagement() {
    const [payments, setPayments] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams({ page, limit: 20 });
            if (typeFilter) p.set('type', typeFilter);
            if (statusFilter) p.set('status', statusFilter);
            const res = await axiosInstance.get(`/admin/payments?${p}`);
            setPayments(res.data.payments || []);
            setTotal(res.data.total || 0);
            setPages(res.data.pages || 1);
            setTotalRevenue(res.data.totalRevenue || 0);
        } catch { toast.error('Failed to load payments'); }
        finally { setLoading(false); }
    }, [typeFilter, statusFilter, page]);

    useEffect(() => { load(); }, [load]);

    return (
        <AdminLayout>
            <div className="p-4 md:p-6 max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div>
                        <h1 className="page-title">Payment Management</h1>
                        <p className="page-subtitle">{total} payments</p>
                    </div>
                    <div className="card p-4 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/15">
                            <IndianRupee className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Total Revenue</p>
                            <p className="text-lg font-bold text-white flex items-center gap-1">
                                <ArrowUpRight className="w-4 h-4 text-emerald-400" />₹{totalRevenue?.toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                    {[
                        { state: typeFilter, setState: setTypeFilter, opts: ['','advance','final','subscription','ad'], label: 'Type' },
                        { state: statusFilter, setState: setStatusFilter, opts: ['','paid','pending','failed','refunded'], label: 'Status' },
                    ].map(({ state, setState, opts, label }) => (
                        <div key={label} className="relative">
                            <select value={state} onChange={(e) => { setState(e.target.value); setPage(1); }}
                                className="appearance-none input pr-8 py-2.5 text-sm">
                                <option value="">All {label}s</option>
                                {opts.filter(Boolean).map((o) => <option key={o} value={o}>{o}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 text-red-500 animate-spin" /></div>
                ) : !payments.length ? (
                    <div className="card p-12 text-center">
                        <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white">No payments found</h3>
                    </div>
                ) : (
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/8">
                                        {['User','Type','Amount','Status','Date','Razorpay ID'].map((h) => (
                                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {payments.map((p) => (
                                        <tr key={p._id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-white">{p.user?.name || '—'}</p>
                                                <p className="text-xs text-slate-500">{p.user?.email}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`badge text-xs capitalize ${TYPE_BADGE[p.type] || 'badge-neutral'}`}>{p.type}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-bold text-white">₹{p.amount?.toLocaleString('en-IN')}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`badge text-xs ${STATUS_BADGE[p.status] || 'badge-neutral'}`}>{p.status}</span>
                                            </td>
                                            <td className="px-4 py-3 text-slate-400 text-xs">
                                                {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'2-digit'}) : '—'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-500 text-xs font-mono truncate max-w-[120px]">
                                                {p.razorpayPaymentId || '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
        </AdminLayout>
    );
}
