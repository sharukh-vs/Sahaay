import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, DollarSign, Tag, FileText, ChevronRight, ChevronLeft, Loader2, CheckCircle } from 'lucide-react';
import UserLayout from '../../components/layout/UserLayout';
import axiosInstance from '../../axios/axiosInstance';
import toast from 'react-hot-toast';

const CATEGORIES = ['Plumbing','Electrical','Carpentry','Painting','Cleaning','Landscaping','HVAC','Roofing','Appliance Repair','Pest Control','Photography','Catering','Event Management','Tutoring','Medical','Legal','Accounting','IT Support','Beauty & Wellness','Automotive','Moving','Other'];
const TIME_SLOTS = ['Morning (8am–12pm)', 'Afternoon (12pm–4pm)', 'Evening (4pm–8pm)', 'Flexible'];

const steps = [
    { title: 'Service Details', desc: 'What do you need?' },
    { title: 'Location & Time', desc: 'When and where?' },
    { title: 'Budget', desc: 'What\'s your budget?' },
];

export default function PostRequest() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        title: '', description: '', category: '', subCategory: '', tags: '',
        address: { street: '', city: '', state: '', pincode: '' },
        preferredDate: '', preferredTimeSlot: '', isFlexible: true,
        budgetMin: '', budgetMax: '', isPublic: true,
    });

    const set = (key, val) => { setForm((f) => ({ ...f, [key]: val })); setErrors((e) => ({ ...e, [key]: '' })); };
    const setAddr = (key, val) => setForm((f) => ({ ...f, address: { ...f.address, [key]: val } }));

    const validate = () => {
        const e = {};
        if (step === 1) {
            if (!form.title.trim()) e.title = 'Title required';
            if (!form.description.trim()) e.description = 'Description required';
            if (!form.category) e.category = 'Select a category';
        }
        if (step === 2) {
            if (!form.address.city.trim()) e.city = 'City required';
        }
        if (step === 3) {
            if (form.budgetMin && form.budgetMax && Number(form.budgetMin) > Number(form.budgetMax)) {
                e.budgetMin = 'Min budget must be less than max';
            }
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const payload = {
                ...form,
                tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
                budgetMin: Number(form.budgetMin) || 0,
                budgetMax: Number(form.budgetMax) || 0,
            };
            await axiosInstance.post('/requests', payload);
            setDone(true);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to post request');
        } finally {
            setLoading(false);
        }
    };

    if (done) {
        return (
            <UserLayout>
                <div className="flex items-center justify-center min-h-[80vh] px-4">
                    <div className="card p-10 max-w-md w-full text-center animate-slide-up">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Request Posted!</h2>
                        <p className="text-slate-400 mb-6">
                            We're matching you with the best providers. You'll receive quotes soon.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => navigate('/user/requests')} className="btn btn-secondary btn-md flex-1">View Requests</button>
                            <button onClick={() => { setDone(false); setStep(1); setForm({ title:'',description:'',category:'',subCategory:'',tags:'',address:{street:'',city:'',state:'',pincode:''},preferredDate:'',preferredTimeSlot:'',isFlexible:true,budgetMin:'',budgetMax:'',isPublic:true }); }} className="btn btn-primary btn-md flex-1">Post Another</button>
                        </div>
                    </div>
                </div>
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <div className="p-4 md:p-6 max-w-2xl mx-auto">
                <div className="mb-6">
                    <h1 className="page-title">Post a Service Request</h1>
                    <p className="page-subtitle">Tell us what you need and we'll match you with the best providers</p>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-2 mb-8">
                    {steps.map((s, i) => (
                        <React.Fragment key={i}>
                            <div className={`flex items-center gap-2 ${i + 1 === step ? '' : 'opacity-50'}`}>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i + 1 < step ? 'bg-emerald-500 text-white' : i + 1 === step ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                    {i + 1 < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-xs font-semibold text-white">{s.title}</p>
                                    <p className="text-xs text-slate-500">{s.desc}</p>
                                </div>
                            </div>
                            {i < steps.length - 1 && <div className={`flex-1 h-px ${i + 1 < step ? 'bg-emerald-500' : 'bg-slate-700'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                <div className="card p-6">
                    {/* Step 1 */}
                    {step === 1 && (
                        <div className="space-y-5 animate-fade-in">
                            <div>
                                <label className="label"><FileText className="inline w-3.5 h-3.5 mr-1" />Request Title</label>
                                <input id="req-title" type="text" value={form.title} onChange={(e) => set('title', e.target.value)}
                                    placeholder="e.g. Fix leaking pipe in bathroom"
                                    className={`input ${errors.title ? 'input-error' : ''}`} />
                                {errors.title && <p className="form-error">{errors.title}</p>}
                            </div>
                            <div>
                                <label className="label">Description</label>
                                <textarea id="req-desc" rows={4} value={form.description} onChange={(e) => set('description', e.target.value)}
                                    placeholder="Describe the problem in detail. The more detail, the better matches you'll get..."
                                    className={`input resize-none ${errors.description ? 'input-error' : ''}`} />
                                {errors.description && <p className="form-error">{errors.description}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Category</label>
                                    <select id="req-category" value={form.category} onChange={(e) => set('category', e.target.value)}
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
                            <div>
                                <label className="label"><Tag className="inline w-3.5 h-3.5 mr-1" />Tags <span className="text-slate-500">(comma separated)</span></label>
                                <input type="text" value={form.tags} onChange={(e) => set('tags', e.target.value)}
                                    placeholder="e.g. urgent, bathroom, pipe, leak"
                                    className="input" />
                                <p className="text-xs text-slate-500 mt-1">Tags help our algorithm find better matches</p>
                            </div>
                        </div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                        <div className="space-y-5 animate-fade-in">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label"><MapPin className="inline w-3.5 h-3.5 mr-1" />City</label>
                                    <input type="text" value={form.address.city} onChange={(e) => setAddr('city', e.target.value)}
                                        placeholder="Mumbai" className={`input ${errors.city ? 'input-error' : ''}`} />
                                    {errors.city && <p className="form-error">{errors.city}</p>}
                                </div>
                                <div>
                                    <label className="label">State</label>
                                    <input type="text" value={form.address.state} onChange={(e) => setAddr('state', e.target.value)}
                                        placeholder="Maharashtra" className="input" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Street / Area <span className="text-slate-500">(optional)</span></label>
                                    <input type="text" value={form.address.street} onChange={(e) => setAddr('street', e.target.value)}
                                        placeholder="Andheri West" className="input" />
                                </div>
                                <div>
                                    <label className="label">Pincode <span className="text-slate-500">(optional)</span></label>
                                    <input type="text" value={form.address.pincode} onChange={(e) => setAddr('pincode', e.target.value)}
                                        placeholder="400058" className="input" />
                                </div>
                            </div>
                            <div>
                                <label className="label"><Calendar className="inline w-3.5 h-3.5 mr-1" />Preferred Date <span className="text-slate-500">(optional)</span></label>
                                <input type="date" value={form.preferredDate} onChange={(e) => set('preferredDate', e.target.value)}
                                    min={new Date().toISOString().split('T')[0]} className="input" />
                            </div>
                            <div>
                                <label className="label">Preferred Time Slot</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {TIME_SLOTS.map((ts) => (
                                        <button key={ts} type="button" onClick={() => set('preferredTimeSlot', ts)}
                                            className={`text-sm py-2.5 rounded-xl border transition-all ${form.preferredTimeSlot === ts ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'}`}>
                                            {ts}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={form.isPublic} onChange={(e) => set('isPublic', e.target.checked)} className="sr-only peer" />
                                    <div className="w-9 h-5 bg-slate-700 peer-checked:bg-indigo-500 rounded-full transition-colors peer-focus:ring-2 peer-focus:ring-indigo-500/30" />
                                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
                                </label>
                                <span className="text-sm text-slate-300">Make this request public (visible to more providers)</span>
                            </div>
                        </div>
                    )}

                    {/* Step 3 */}
                    {step === 3 && (
                        <div className="space-y-5 animate-fade-in">
                            <div>
                                <label className="label"><DollarSign className="inline w-3.5 h-3.5 mr-1" />Budget Range (₹)</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <input type="number" value={form.budgetMin} onChange={(e) => set('budgetMin', e.target.value)}
                                            placeholder="Min (e.g. 500)" className={`input ${errors.budgetMin ? 'input-error' : ''}`} />
                                        {errors.budgetMin && <p className="form-error">{errors.budgetMin}</p>}
                                    </div>
                                    <div>
                                        <input type="number" value={form.budgetMax} onChange={(e) => set('budgetMax', e.target.value)}
                                            placeholder="Max (e.g. 2000)" className="input" />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">Providing a budget helps providers tailor their quotes better</p>
                            </div>

                            {/* Summary */}
                            <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2 text-sm">
                                <h3 className="font-semibold text-white mb-3">Request Summary</h3>
                                <p className="flex justify-between"><span className="text-slate-400">Title</span><span className="text-white font-medium">{form.title}</span></p>
                                <p className="flex justify-between"><span className="text-slate-400">Category</span><span className="text-white">{form.category}</span></p>
                                <p className="flex justify-between"><span className="text-slate-400">Location</span><span className="text-white">{form.address.city}, {form.address.state}</span></p>
                                {form.budgetMax && <p className="flex justify-between"><span className="text-slate-400">Budget</span><span className="text-white">₹{Number(form.budgetMin).toLocaleString()} – ₹{Number(form.budgetMax).toLocaleString()}</span></p>}
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className={`flex gap-3 mt-8 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
                        {step > 1 && (
                            <button type="button" onClick={() => setStep((s) => s - 1)} className="btn btn-secondary btn-md">
                                <ChevronLeft className="w-4 h-4" />Back
                            </button>
                        )}
                        <button type="button"
                            onClick={() => {
                                if (!validate()) return;
                                if (step < 3) setStep((s) => s + 1);
                                else handleSubmit();
                            }}
                            disabled={loading}
                            className="btn btn-primary btn-md flex-1"
                        >
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Posting...</> :
                             step < 3 ? <>Continue <ChevronRight className="w-4 h-4" /></> :
                             <>Post Request <CheckCircle className="w-4 h-4" /></>}
                        </button>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
