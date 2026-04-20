import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IndianRupee, Clock, FileText, CheckCircle, Loader2, Plus, Minus } from 'lucide-react';
import ProviderLayout from '../../components/layout/ProviderLayout';
import axiosInstance from '../../axios/axiosInstance';
import toast from 'react-hot-toast';

export default function SubmitQuote() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const requestId = searchParams.get('requestId');
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [errors, setErrors] = useState({});
    const [form, setForm] = useState({
        amount: '',
        advanceAmount: '',
        description: '',
        estimatedDuration: '',
        breakdownItems: [{ label: '', amount: '' }],
    });

    useEffect(() => {
        if (!requestId) { navigate('/provider/requests'); return; }
        axiosInstance.get(`/requests/${requestId}`)
            .then((r) => setRequest(r.data.request))
            .catch(() => toast.error('Failed to load request'))
            .finally(() => setFetching(false));
    }, [requestId, navigate]);

    const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })); };

    const addLine = () => setForm((f) => ({ ...f, breakdownItems: [...f.breakdownItems, { label: '', amount: '' }] }));
    const removeLine = (i) => setForm((f) => ({ ...f, breakdownItems: f.breakdownItems.filter((_, idx) => idx !== i) }));
    const updateLine = (i, key, val) => setForm((f) => {
        const items = [...f.breakdownItems];
        items[i] = { ...items[i], [key]: val };
        return { ...f, breakdownItems: items };
    });

    const totalFromBreakdown = form.breakdownItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    const validate = () => {
        const e = {};
        if (!form.amount) e.amount = 'Total amount required';
        if (!form.description.trim()) e.description = 'Description required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            await axiosInstance.post('/quotations', {
                requestId,
                amount: Number(form.amount),
                advanceAmount: Number(form.advanceAmount) || 0,
                description: form.description,
                estimatedDuration: form.estimatedDuration,
                breakdownItems: form.breakdownItems.filter((i) => i.label && i.amount),
            });
            toast.success('Quote submitted!');
            navigate('/provider/quotes');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to submit quote');
        } finally { setLoading(false); }
    };

    if (fetching) return (
        <ProviderLayout><div className="flex justify-center py-20"><Loader2 className="w-7 h-7 text-violet-500 animate-spin" /></div></ProviderLayout>
    );

    return (
        <ProviderLayout>
            <div className="p-4 md:p-6 max-w-2xl mx-auto">
                <div className="mb-6">
                    <h1 className="page-title">Submit Quote</h1>
                    <p className="page-subtitle">For: <span className="text-white font-medium">{request?.title}</span></p>
                </div>

                {/* Request summary */}
                {request && (
                    <div className="card p-4 mb-6 bg-violet-500/5 border-violet-500/20">
                        <div className="flex gap-3">
                            <FileText className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-white">{request.title}</h3>
                                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{request.description}</p>
                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                                    <span>{request.category}</span>
                                    {request.budgetMax > 0 && <span>Client budget: up to ₹{request.budgetMax?.toLocaleString()}</span>}
                                    {request.address?.city && <span>{request.address.city}</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="card p-6 space-y-6">
                    {/* Cost breakdown */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-white">Cost Breakdown <span className="text-slate-500 font-normal text-sm">(optional)</span></h3>
                            <button type="button" onClick={addLine} className="btn btn-secondary btn-sm text-xs">
                                <Plus className="w-3 h-3" />Add Line
                            </button>
                        </div>
                        <div className="space-y-2">
                            {form.breakdownItems.map((item, i) => (
                                <div key={i} className="flex gap-2">
                                    <input type="text" value={item.label} onChange={(e) => updateLine(i, 'label', e.target.value)}
                                        placeholder="e.g. Labour, Materials" className="input flex-1 text-sm py-2" />
                                    <input type="number" value={item.amount} onChange={(e) => updateLine(i, 'amount', e.target.value)}
                                        placeholder="₹" className="input w-28 text-sm py-2" />
                                    <button type="button" onClick={() => removeLine(i)} className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                                        <Minus className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {totalFromBreakdown > 0 && (
                            <p className="text-xs text-slate-400 mt-2">Breakdown total: <span className="text-white font-semibold">₹{totalFromBreakdown.toLocaleString()}</span></p>
                        )}
                    </div>

                    {/* Total */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" />Total Amount (₹) <span className="text-red-400">*</span></label>
                            <input type="number" value={form.amount} onChange={(e) => set('amount', e.target.value)}
                                placeholder={totalFromBreakdown || 'e.g. 1500'}
                                className={`input ${errors.amount ? 'input-error' : ''}`} />
                            {errors.amount && <p className="form-error">{errors.amount}</p>}
                        </div>
                        <div>
                            <label className="label">Advance Required (₹) <span className="text-slate-500">(optional)</span></label>
                            <input type="number" value={form.advanceAmount} onChange={(e) => set('advanceAmount', e.target.value)}
                                placeholder="e.g. 500" className="input" />
                        </div>
                    </div>

                    {/* Duration & Notes */}
                    <div>
                        <label className="label flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Estimated Duration</label>
                        <input type="text" value={form.estimatedDuration} onChange={(e) => set('estimatedDuration', e.target.value)}
                            placeholder="e.g. 2–3 hours, 1 day" className="input" />
                    </div>
                    <div>
                        <label className="label">Quote Description <span className="text-red-400">*</span></label>
                        <textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)}
                            placeholder="Explain what you'll do, your approach, any special tools/materials needed..."
                            className={`input resize-none ${errors.description ? 'input-error' : ''}`} />
                        {errors.description && <p className="form-error">{errors.description}</p>}
                    </div>

                    <div className="flex gap-3">
                        <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary btn-md">Cancel</button>
                        <button type="submit" disabled={loading} className="btn btn-md flex-1"
                            style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff' }}>
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : <><CheckCircle className="w-4 h-4" />Submit Quote</>}
                        </button>
                    </div>
                </form>
            </div>
        </ProviderLayout>
    );
}
