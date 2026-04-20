import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, IndianRupee, Calendar, Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import ProviderLayout from '../../components/layout/ProviderLayout';
import axiosInstance from '../../axios/axiosInstance';
import toast from 'react-hot-toast';

const PERIODS = [
    { val: 'week', label: 'Last 7 days' },
    { val: 'month', label: 'Last 30 days' },
    { val: 'year', label: 'Last 12 months' },
];

// Simple bar chart component (no external lib)
const BarChart = ({ data }) => {
    if (!data?.length) return (
        <div className="flex items-center justify-center h-32 text-slate-500 text-sm">No earnings data for this period</div>
    );
    const max = Math.max(...data.map((d) => d.amount));
    return (
        <div className="flex items-end gap-1 h-32 px-2">
            {data.map((d) => {
                const pct = max > 0 ? (d.amount / max) * 100 : 0;
                return (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group" title={`₹${d.amount.toLocaleString('en-IN')}\n${d.date}`}>
                        <div className="w-full rounded-t-md transition-all duration-300"
                            style={{ height: `${Math.max(pct, 4)}%`, background: 'linear-gradient(to top, #8b5cf6, #c4b5fd)' }} />
                    </div>
                );
            })}
        </div>
    );
};

export default function Earnings() {
    const [period, setPeriod] = useState('month');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get(`/provider/earnings?period=${period}`);
            setData(res.data);
        } catch { toast.error('Failed to load earnings'); }
        finally { setLoading(false); }
    }, [period]);

    useEffect(() => { load(); }, [load]);

    return (
        <ProviderLayout>
            <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="page-title">Earnings</h1>
                        <p className="page-subtitle">Track your income and payment history</p>
                    </div>
                    <div className="flex gap-1 bg-slate-800 border border-white/8 rounded-xl p-1">
                        {PERIODS.map((p) => (
                            <button key={p.val} onClick={() => setPeriod(p.val)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${period === p.val ? '' : 'text-slate-400 hover:text-white'}`}
                                style={period === p.val ? { background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff' } : {}}>
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-7 h-7 text-violet-500 animate-spin" /></div>
                ) : (
                    <>
                        {/* Hero stat */}
                        <div className="card p-6 bg-gradient-to-br from-violet-900/40 to-purple-900/40 border-violet-500/20">
                            <p className="text-violet-300 text-sm font-medium mb-2">{PERIODS.find((p) => p.val === period)?.label}</p>
                            <div className="flex items-end gap-4 flex-wrap">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Total Earned</p>
                                    <p className="text-4xl font-bold text-white flex items-center gap-1">
                                        <IndianRupee className="w-7 h-7 text-violet-400" />
                                        {data?.totalEarned?.toLocaleString('en-IN') || '0'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium mb-1">
                                    <ArrowUpRight className="w-4 h-4" />{data?.payments?.length || 0} payments
                                </div>
                            </div>
                            <div className="mt-6">
                                <BarChart data={data?.chartData} />
                            </div>
                        </div>

                        {/* Payment list */}
                        <div className="card">
                            <div className="px-5 pt-5 pb-3 border-b border-white/8">
                                <h2 className="font-bold text-white">Payment History</h2>
                            </div>
                            {data?.payments?.length === 0 ? (
                                <div className="p-10 text-center text-slate-500 text-sm">
                                    <IndianRupee className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                    No payments in this period
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {data?.payments?.map((p) => (
                                        <div key={p._id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
                                            <div className={`p-2 rounded-xl flex-shrink-0 ${p.type === 'final' ? 'bg-emerald-500/15' : 'bg-violet-500/15'}`}>
                                                <IndianRupee className={`w-4 h-4 ${p.type === 'final' ? 'text-emerald-400' : 'text-violet-400'}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-white capitalize">{p.type} Payment</p>
                                                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(p.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-white">+₹{p.amount?.toLocaleString('en-IN')}</p>
                                                <span className="badge badge-success text-xs">{p.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </ProviderLayout>
    );
}
