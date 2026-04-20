import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ChevronRight, ChevronLeft, CheckCircle, Loader2, Plus, X, IndianRupee } from 'lucide-react';
import ProviderLayout from '../../components/layout/ProviderLayout';
import axiosInstance from '../../axios/axiosInstance';
import toast from 'react-hot-toast';

const CATEGORIES = ['Plumbing','Electrical','Carpentry','Painting','Cleaning','Landscaping','HVAC','Roofing','Appliance Repair','Pest Control','Photography','Catering','Event Management','Tutoring','Medical','Legal','Accounting','IT Support','Beauty & Wellness','Automotive','Moving','Other'];

export default function CreateService() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [form, setForm] = useState({
        name: '', description: '', category: '', subCategory: '',
        pricingType: 'fixed', priceMin: '', priceMax: '',
        currency: 'INR', tags: [], duration: '',
        inclusions: '', exclusions: '', images: [], status: 'active',
    });
    const [errors, setErrors] = useState({});

    const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })); };

    const addTag = () => {
        const t = tagInput.trim().toLowerCase();
        if (t && !form.tags.includes(t)) {
            setForm((f) => ({ ...f, tags: [...f.tags, t] }));
        }
        setTagInput('');
    };
    const removeTag = (t) => setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }));

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Service name required';
        if (!form.description.trim()) e.description = 'Description required';
        if (!form.category) e.category = 'Category required';
        if (form.pricingType !== 'quote_based') {
            if (!form.priceMin) e.priceMin = 'Price required';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const payload = {
                ...form,
                priceMin: Number(form.priceMin) || 0,
                priceMax: Number(form.priceMax) || 0,
            };
            await axiosInstance.post('/services', payload);
            toast.success('Service created!');
            navigate('/provider/services');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create service');
        } finally { setLoading(false); }
    };

    return (
        <ProviderLayout>
            <div className="p-4 md:p-6 max-w-2xl mx-auto">
                <div className="mb-6">
                    <h1 className="page-title">Add New Service</h1>
                    <p className="page-subtitle">Create a listing to appear in search results</p>
                </div>

                <form onSubmit={handleSubmit} className="card p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-white border-b border-white/8 pb-2">Basic Information</h3>
                        <div>
                            <label className="label">Service Name</label>
                            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)}
                                placeholder="e.g. Professional Plumbing Repair"
                                className={`input ${errors.name ? 'input-error' : ''}`} />
                            {errors.name && <p className="form-error">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="label">Description</label>
                            <textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)}
                                placeholder="Describe what you offer, your experience, and what makes you stand out..."
                                className={`input resize-none ${errors.description ? 'input-error' : ''}`} />
                            {errors.description && <p className="form-error">{errors.description}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label">Category</label>
                                <select value={form.category} onChange={(e) => set('category', e.target.value)}
                                    className={`input ${errors.category ? 'input-error' : ''}`}>
                                    <option value="">Select category</option>
                                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                                {errors.category && <p className="form-error">{errors.category}</p>}
                            </div>
                            <div>
                                <label className="label">Sub-Category <span className="text-slate-500">(optional)</span></label>
                                <input type="text" value={form.subCategory} onChange={(e) => set('subCategory', e.target.value)}
                                    placeholder="e.g. Pipe repair" className="input" />
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-white border-b border-white/8 pb-2">Pricing</h3>
                        <div>
                            <label className="label">Pricing Type</label>
                            <div className="grid grid-cols-4 gap-2">
                                {[{ val: 'fixed', label: 'Fixed' }, { val: 'hourly', label: 'Hourly' }, { val: 'daily', label: 'Daily' }, { val: 'quote_based', label: 'Quote' }].map(({ val, label }) => (
                                    <button key={val} type="button" onClick={() => set('pricingType', val)}
                                        className={`py-2 rounded-xl border text-sm font-medium transition-all ${form.pricingType === val ? 'border-violet-500 bg-violet-500/10 text-violet-300' : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {form.pricingType !== 'quote_based' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" />Min Price (₹)</label>
                                    <input type="number" value={form.priceMin} onChange={(e) => set('priceMin', e.target.value)}
                                        placeholder="500" className={`input ${errors.priceMin ? 'input-error' : ''}`} />
                                    {errors.priceMin && <p className="form-error">{errors.priceMin}</p>}
                                </div>
                                <div>
                                    <label className="label">Max Price (₹) <span className="text-slate-500">(optional)</span></label>
                                    <input type="number" value={form.priceMax} onChange={(e) => set('priceMax', e.target.value)}
                                        placeholder="2000" className="input" />
                                </div>
                            </div>
                        )}
                        <div>
                            <label className="label">Estimated Duration <span className="text-slate-500">(optional)</span></label>
                            <input type="text" value={form.duration} onChange={(e) => set('duration', e.target.value)}
                                placeholder="e.g. 2–4 hours, 1 day" className="input" />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-white border-b border-white/8 pb-2">Tags <span className="font-normal text-slate-500 text-sm">(helps matching algorithm)</span></h3>
                        <div className="flex gap-2">
                            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                                placeholder="Type a tag and press Enter"
                                className="input flex-1" />
                            <button type="button" onClick={addTag} className="btn btn-secondary btn-md px-4"><Plus className="w-4 h-4" /></button>
                        </div>
                        {form.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {form.tags.map((t) => (
                                    <span key={t} className="flex items-center gap-1 badge badge-primary">
                                        {t}
                                        <button type="button" onClick={() => removeTag(t)}><X className="w-3 h-3" /></button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Inclusions / Exclusions */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">What's included <span className="text-slate-500">(optional)</span></label>
                            <textarea rows={3} value={form.inclusions} onChange={(e) => set('inclusions', e.target.value)}
                                placeholder="• Free inspection&#10;• Materials included" className="input resize-none text-sm" />
                        </div>
                        <div>
                            <label className="label">What's not included <span className="text-slate-500">(optional)</span></label>
                            <textarea rows={3} value={form.exclusions} onChange={(e) => set('exclusions', e.target.value)}
                                placeholder="• Replacement parts&#10;• Follow-up visits" className="input resize-none text-sm" />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={form.status === 'active'}
                                onChange={(e) => set('status', e.target.checked ? 'active' : 'draft')} className="sr-only peer" />
                            <div className="w-9 h-5 bg-slate-700 peer-checked:bg-violet-500 rounded-full transition-colors" />
                            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                        </label>
                        <span className="text-sm text-slate-300">Publish immediately as <strong className="text-white">{form.status === 'active' ? 'Active' : 'Draft'}</strong></span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => navigate('/provider/services')} className="btn btn-secondary btn-md">Cancel</button>
                        <button type="submit" disabled={loading} className="btn btn-md flex-1"
                            style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff' }}>
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : <><Briefcase className="w-4 h-4" />Create Service</>}
                        </button>
                    </div>
                </form>
            </div>
        </ProviderLayout>
    );
}
