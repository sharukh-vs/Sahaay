import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Phone, CheckCircle, Loader2, ChevronRight, ChevronLeft, Zap, Plus, X } from 'lucide-react';
import ProviderLayout from '../../components/layout/ProviderLayout';
import axiosInstance from '../../axios/axiosInstance';
import toast from 'react-hot-toast';

const CATEGORIES = ['Plumbing','Electrical','Carpentry','Painting','Cleaning','Landscaping','HVAC','Roofing','Appliance Repair','Pest Control','Photography','Catering','Event Management','Tutoring','Medical','Legal','Accounting','IT Support','Beauty & Wellness','Automotive','Moving'];
const COLLAR = [{ val:'blue', label:'Blue Collar', desc:'Skilled trades & manual services' }, { val:'white', label:'White Collar', desc:'Professional & knowledge services' }, { val:'grey', label:'Grey Collar', desc:'Mixed or technical services' }];

const steps = [{ title:'Business Info' }, { title:'Service Areas' }, { title:'Categories' }];

export default function ProviderOnboarding() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        businessName: '', businessPhone: '', businessEmail: '',
        collarType: 'blue', bio: '',
        businessAddress: { street: '', city: '', state: '', pincode: '' },
        serviceRadius: 20, categories: [], tags: [],
    });
    const [tagInput, setTagInput] = useState('');
    const [errors, setErrors] = useState({});

    const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: '' })); };
    const setAddr = (k, v) => setForm((f) => ({ ...f, businessAddress: { ...f.businessAddress, [k]: v } }));
    const toggleCat = (c) => setForm((f) => ({ ...f, categories: f.categories.includes(c) ? f.categories.filter((x) => x !== c) : [...f.categories, c] }));
    const addTag = () => { const t = tagInput.trim().toLowerCase(); if (t && !form.tags.includes(t)) setForm((f) => ({ ...f, tags: [...f.tags, t] })); setTagInput(''); };

    const validate = () => {
        const e = {};
        if (step === 1) {
            if (!form.businessName.trim()) e.businessName = 'Business name required';
            if (!form.collarType) e.collarType = 'Select a type';
        }
        if (step === 2) { if (!form.businessAddress.city.trim()) e.city = 'City required'; }
        if (step === 3) { if (!form.categories.length) e.categories = 'Select at least one category'; }
        setErrors(e);
        return !Object.keys(e).length;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            await axiosInstance.post('/provider/onboard', form);
            toast.success('Provider profile created! Welcome aboard 🎉');
            navigate('/provider/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create profile');
        } finally { setLoading(false); }
    };

    return (
        <ProviderLayout>
            <div className="p-4 md:p-6 max-w-2xl mx-auto">
                <div className="mb-6">
                    <h1 className="page-title">Provider Onboarding</h1>
                    <p className="page-subtitle">Set up your business profile to start receiving requests</p>
                </div>

                {/* Steps */}
                <div className="flex items-center gap-2 mb-8">
                    {steps.map((s, i) => (
                        <React.Fragment key={i}>
                            <div className={`flex items-center gap-2 ${i + 1 === step ? '' : 'opacity-50'}`}>
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${i + 1 < step ? 'bg-emerald-500 text-white' : i + 1 === step ? '' : 'bg-slate-700 text-slate-400'}`}
                                    style={i + 1 === step ? { background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', color: '#fff' } : {}}>
                                    {i + 1 < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                                </div>
                                <span className="text-xs font-medium text-white hidden sm:block">{s.title}</span>
                            </div>
                            {i < steps.length - 1 && <div className={`flex-1 h-px ${i + 1 < step ? 'bg-emerald-500' : 'bg-slate-700'}`} />}
                        </React.Fragment>
                    ))}
                </div>

                <div className="card p-6">
                    {/* Step 1 — Business Info */}
                    {step === 1 && (
                        <div className="space-y-5 animate-fade-in">
                            <div>
                                <label className="label"><Briefcase className="inline w-3.5 h-3.5 mr-1" />Business Name</label>
                                <input type="text" value={form.businessName} onChange={(e) => set('businessName', e.target.value)}
                                    placeholder="e.g. Singh Plumbing Services" className={`input ${errors.businessName ? 'input-error' : ''}`} />
                                {errors.businessName && <p className="form-error">{errors.businessName}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label"><Phone className="inline w-3.5 h-3.5 mr-1" />Business Phone</label>
                                    <input type="tel" value={form.businessPhone} onChange={(e) => set('businessPhone', e.target.value)} placeholder="+91 98765 43210" className="input" />
                                </div>
                                <div>
                                    <label className="label">Business Email</label>
                                    <input type="email" value={form.businessEmail} onChange={(e) => set('businessEmail', e.target.value)} placeholder="contact@yourbiz.com" className="input" />
                                </div>
                            </div>
                            <div>
                                <label className="label">Business Type</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {COLLAR.map(({ val, label, desc }) => (
                                        <button key={val} type="button" onClick={() => set('collarType', val)}
                                            className={`p-3 rounded-xl border text-left transition-all ${form.collarType === val ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                                            <p className="font-semibold text-white text-sm">{label}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="label">Bio / Description</label>
                                <textarea rows={3} value={form.bio} onChange={(e) => set('bio', e.target.value)}
                                    placeholder="Tell clients about your experience, specialties, and what makes you stand out…"
                                    className="input resize-none" />
                            </div>
                        </div>
                    )}

                    {/* Step 2 — Location */}
                    {step === 2 && (
                        <div className="space-y-5 animate-fade-in">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label"><MapPin className="inline w-3.5 h-3.5 mr-1" />City</label>
                                    <input type="text" value={form.businessAddress.city} onChange={(e) => setAddr('city', e.target.value)}
                                        placeholder="Mumbai" className={`input ${errors.city ? 'input-error' : ''}`} />
                                    {errors.city && <p className="form-error">{errors.city}</p>}
                                </div>
                                <div>
                                    <label className="label">State</label>
                                    <input type="text" value={form.businessAddress.state} onChange={(e) => setAddr('state', e.target.value)} placeholder="Maharashtra" className="input" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Street / Area</label>
                                    <input type="text" value={form.businessAddress.street} onChange={(e) => setAddr('street', e.target.value)} placeholder="Andheri West" className="input" />
                                </div>
                                <div>
                                    <label className="label">Pincode</label>
                                    <input type="text" value={form.businessAddress.pincode} onChange={(e) => setAddr('pincode', e.target.value)} placeholder="400058" className="input" />
                                </div>
                            </div>
                            <div>
                                <label className="label">Service Radius: <span className="text-violet-400 font-bold">{form.serviceRadius} km</span></label>
                                <input type="range" min={5} max={100} step={5} value={form.serviceRadius}
                                    onChange={(e) => set('serviceRadius', Number(e.target.value))}
                                    className="w-full accent-violet-500" />
                                <div className="flex justify-between text-xs text-slate-500 mt-1"><span>5 km</span><span>100 km</span></div>
                            </div>
                        </div>
                    )}

                    {/* Step 3 — Categories */}
                    {step === 3 && (
                        <div className="space-y-5 animate-fade-in">
                            <div>
                                <label className="label">Service categories <span className="text-slate-400 font-normal text-xs">— Select all that apply. This helps our matching algorithm connect you with the right clients.</span></label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {CATEGORIES.map((c) => (
                                        <button key={c} type="button" onClick={() => toggleCat(c)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${form.categories.includes(c) ? 'border-violet-500 bg-violet-500/15 text-violet-300' : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'}`}>
                                            {form.categories.includes(c) && '✓ '}{c}
                                        </button>
                                    ))}
                                </div>
                                {errors.categories && <p className="form-error mt-2">{errors.categories}</p>}
                            </div>
                            <div>
                                <label className="label">Tags <span className="text-slate-400 font-normal text-xs">(helps matching algorithm)</span></label>
                                <div className="flex gap-2">
                                    <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                                        placeholder="Type a skill/tag and press Enter" className="input flex-1" />
                                    <button type="button" onClick={addTag} className="btn btn-secondary btn-md px-4"><Plus className="w-4 h-4" /></button>
                                </div>
                                {form.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {form.tags.map((t) => (
                                            <span key={t} className="flex items-center gap-1 badge badge-primary text-xs">
                                                {t}<button type="button" onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }))}><X className="w-3 h-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Summary */}
                            <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-sm space-y-1.5">
                                <h4 className="font-semibold text-white mb-2">Summary</h4>
                                <p className="flex justify-between"><span className="text-slate-400">Business</span><span className="text-white">{form.businessName}</span></p>
                                <p className="flex justify-between"><span className="text-slate-400">Type</span><span className="text-white capitalize">{form.collarType} collar</span></p>
                                <p className="flex justify-between"><span className="text-slate-400">Location</span><span className="text-white">{form.businessAddress.city}, {form.businessAddress.state}</span></p>
                                <p className="flex justify-between"><span className="text-slate-400">Radius</span><span className="text-white">{form.serviceRadius} km</span></p>
                                <p className="flex justify-between"><span className="text-slate-400">Categories</span><span className="text-white">{form.categories.length} selected</span></p>
                            </div>
                        </div>
                    )}

                    <div className={`flex gap-3 mt-8 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
                        {step > 1 && (
                            <button type="button" onClick={() => setStep((s) => s - 1)} className="btn btn-secondary btn-md">
                                <ChevronLeft className="w-4 h-4" />Back
                            </button>
                        )}
                        <button type="button" disabled={loading}
                            onClick={() => { if (!validate()) return; if (step < 3) setStep((s) => s + 1); else handleSubmit(); }}
                            className="btn btn-md flex-1"
                            style={{ background: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', color: '#fff' }}>
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> :
                             step < 3 ? <>Continue <ChevronRight className="w-4 h-4" /></> :
                             <><Zap className="w-4 h-4" />Create Provider Profile</>}
                        </button>
                    </div>
                </div>
            </div>
        </ProviderLayout>
    );
}
