import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Eye, EyeOff, Loader2, UserPlus, ChevronRight, ChevronLeft,
    Users, Briefcase, Check, MapPin, Phone, Mail, Lock, User as UserIcon,
    Building2, Tag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SERVICE_CATEGORIES = [
    'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning',
    'Landscaping', 'HVAC', 'Roofing', 'Appliance Repair', 'Pest Control',
    'Security Systems', 'Photography', 'Catering', 'Event Management',
    'Tutoring', 'Medical', 'Legal', 'Accounting', 'IT Support',
    'Beauty & Wellness', 'Automotive', 'Moving', 'Other',
];

const COLLAR_TYPES = [
    { value: 'white', label: 'White Collar', desc: 'Professional services (legal, medical, IT, finance)', plan: '₹3,000/yr' },
    { value: 'blue', label: 'Blue Collar', desc: 'Skilled trades (plumbing, electrical, carpentry)', plan: '₹1,500/yr' },
    { value: 'gray', label: 'Gray Collar', desc: 'Service workers (cleaning, delivery, maintenance)', plan: '₹1,000/yr' },
];

const Register = () => {
    const [accountType, setAccountType] = useState('user'); // 'user' | 'serviceProvider'
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState({});

    // Common fields
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        // User fields
        city: '',
        state: '',
        // Provider fields
        businessName: '',
        businessPhone: '',
        collarType: '',
        categories: [],
        businessDescription: '',
    });

    const { register } = useAuth();
    const navigate = useNavigate();

    const totalSteps = accountType === 'serviceProvider' ? 3 : 2;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const toggleCategory = (cat) => {
        setFormData((prev) => ({
            ...prev,
            categories: prev.categories.includes(cat)
                ? prev.categories.filter((c) => c !== cat)
                : [...prev.categories, cat],
        }));
    };

    const validateStep = () => {
        const newErrors = {};

        if (step === 1) {
            if (!formData.name.trim()) newErrors.name = 'Full name is required';
            if (!formData.email) newErrors.email = 'Email is required';
            else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email';
            if (!formData.password) newErrors.password = 'Password is required';
            else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
            else if (!/\d/.test(formData.password) || !/[a-zA-Z]/.test(formData.password)) {
                newErrors.password = 'Password must contain letters and numbers';
            }
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        if (step === 2) {
            if (accountType === 'user') {
                if (!formData.city.trim()) newErrors.city = 'City is required';
            } else if (accountType === 'serviceProvider') {
                if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
                if (!formData.businessPhone.trim()) newErrors.businessPhone = 'Business phone is required';
                if (!formData.collarType) newErrors.collarType = 'Please select a collar type';
            }
        }

        if (step === 3 && accountType === 'serviceProvider') {
            if (formData.categories.length === 0) newErrors.categories = 'Select at least one service category';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep()) setStep((s) => s + 1);
    };

    const prevStep = () => setStep((s) => s - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep()) return;
        setLoading(true);
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                role: accountType,
                address: {
                    city: formData.city,
                    state: formData.state,
                },
                // Provider extras
                ...(accountType === 'serviceProvider' && {
                    businessName: formData.businessName,
                    businessPhone: formData.businessPhone,
                    collarType: formData.collarType,
                    categories: formData.categories,
                    businessDescription: formData.businessDescription,
                }),
            };

            const data = await register(payload);
            toast.success('Account created! Please check your email to verify.');
            if (accountType === 'user') navigate('/home');
            else navigate('/provider/subscription');
        } catch (err) {
            const msg = err.response?.data?.error || 'Registration failed. Please try again.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center gap-2 mb-8">
            {Array.from({ length: totalSteps }).map((_, i) => (
                <React.Fragment key={i}>
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                        i + 1 < step ? 'bg-emerald-500 text-white' :
                        i + 1 === step ? 'bg-indigo-500 text-white shadow-glow-sm' :
                        'bg-slate-700 text-slate-400'
                    }`}>
                        {i + 1 < step ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    {i < totalSteps - 1 && (
                        <div className={`h-0.5 w-12 transition-all ${i + 1 < step ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    // ── Step Renders ────────────────────────────────────────────────────────

    const renderStep1 = () => (
        <div className="space-y-5 animate-fade-in">
            <h2 className="text-xl font-bold text-white">
                {accountType === 'user' ? 'Create your account' : 'Register as a provider'}
            </h2>

            <div>
                <label htmlFor="reg-name" className="label">
                    <UserIcon className="inline w-3.5 h-3.5 mr-1" />Full name
                </label>
                <input id="reg-name" name="name" type="text" value={formData.name}
                    onChange={handleChange} placeholder="John Doe" className={`input ${errors.name ? 'input-error' : ''}`} />
                {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            <div>
                <label htmlFor="reg-email" className="label">
                    <Mail className="inline w-3.5 h-3.5 mr-1" />Email address
                </label>
                <input id="reg-email" name="email" type="email" value={formData.email}
                    onChange={handleChange} placeholder="you@example.com" className={`input ${errors.email ? 'input-error' : ''}`} />
                {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div>
                <label htmlFor="reg-phone" className="label">
                    <Phone className="inline w-3.5 h-3.5 mr-1" />Phone number <span className="text-slate-500">(optional)</span>
                </label>
                <input id="reg-phone" name="phone" type="tel" value={formData.phone}
                    onChange={handleChange} placeholder="+91 98765 43210" className="input" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="reg-password" className="label">
                        <Lock className="inline w-3.5 h-3.5 mr-1" />Password
                    </label>
                    <div className="relative">
                        <input id="reg-password" name="password" type={showPassword ? 'text' : 'password'}
                            value={formData.password} onChange={handleChange} placeholder="Min 8 chars"
                            className={`input pr-11 ${errors.password ? 'input-error' : ''}`} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.password && <p className="form-error">{errors.password}</p>}
                </div>
                <div>
                    <label htmlFor="reg-confirm" className="label">Confirm password</label>
                    <div className="relative">
                        <input id="reg-confirm" name="confirmPassword" type={showConfirm ? 'text' : 'password'}
                            value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat"
                            className={`input pr-11 ${errors.confirmPassword ? 'input-error' : ''}`} />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
                </div>
            </div>
        </div>
    );

    const renderStep2User = () => (
        <div className="space-y-5 animate-fade-in">
            <h2 className="text-xl font-bold text-white">Your location</h2>
            <p className="text-slate-400 text-sm">Help us find services near you.</p>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="reg-city" className="label">
                        <MapPin className="inline w-3.5 h-3.5 mr-1" />City
                    </label>
                    <input id="reg-city" name="city" type="text" value={formData.city}
                        onChange={handleChange} placeholder="Mumbai"
                        className={`input ${errors.city ? 'input-error' : ''}`} />
                    {errors.city && <p className="form-error">{errors.city}</p>}
                </div>
                <div>
                    <label htmlFor="reg-state" className="label">State</label>
                    <input id="reg-state" name="state" type="text" value={formData.state}
                        onChange={handleChange} placeholder="Maharashtra" className="input" />
                </div>
            </div>
        </div>
    );

    const renderStep2Provider = () => (
        <div className="space-y-5 animate-fade-in">
            <h2 className="text-xl font-bold text-white">Business details</h2>
            <div>
                <label htmlFor="reg-business" className="label">
                    <Building2 className="inline w-3.5 h-3.5 mr-1" />Business name
                </label>
                <input id="reg-business" name="businessName" type="text" value={formData.businessName}
                    onChange={handleChange} placeholder="Sharma Electricals"
                    className={`input ${errors.businessName ? 'input-error' : ''}`} />
                {errors.businessName && <p className="form-error">{errors.businessName}</p>}
            </div>
            <div>
                <label htmlFor="reg-bizphone" className="label">
                    <Phone className="inline w-3.5 h-3.5 mr-1" />Business phone
                </label>
                <input id="reg-bizphone" name="businessPhone" type="tel" value={formData.businessPhone}
                    onChange={handleChange} placeholder="+91 98765 43210"
                    className={`input ${errors.businessPhone ? 'input-error' : ''}`} />
                {errors.businessPhone && <p className="form-error">{errors.businessPhone}</p>}
            </div>
            <div>
                <label className="label">Subscription type</label>
                <div className="space-y-3">
                    {COLLAR_TYPES.map((ct) => (
                        <button key={ct.value} type="button"
                            onClick={() => setFormData((p) => ({ ...p, collarType: ct.value }))}
                            className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all ${
                                formData.collarType === ct.value
                                    ? 'border-indigo-500 bg-indigo-500/10'
                                    : 'border-white/10 bg-white/5 hover:border-white/20'
                            }`}
                        >
                            <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center ${
                                formData.collarType === ct.value ? 'border-indigo-500' : 'border-slate-600'
                            }`}>
                                {formData.collarType === ct.value && (
                                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold text-sm text-white">{ct.label}</span>
                                    <span className="badge badge-primary text-xs">{ct.plan}</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">{ct.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
                {errors.collarType && <p className="form-error mt-2">{errors.collarType}</p>}
            </div>
        </div>
    );

    const renderStep3Provider = () => (
        <div className="space-y-5 animate-fade-in">
            <div>
                <h2 className="text-xl font-bold text-white">Services you offer</h2>
                <p className="text-slate-400 text-sm mt-1">Select all that apply. This helps our matching algorithm connect you with the right clients.</p>
            </div>
            <div>
                <label className="label">
                    <Tag className="inline w-3.5 h-3.5 mr-1" />Service categories
                </label>
                <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1 no-scrollbar">
                    {SERVICE_CATEGORIES.map((cat) => {
                        const isSelected = formData.categories.includes(cat);
                        return (
                            <button key={cat} type="button"
                                onClick={() => toggleCategory(cat)}
                                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                                    isSelected
                                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                                        : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-300'
                                }`}
                            >
                                {isSelected && <Check className="inline w-3 h-3 mr-1" />}
                                {cat}
                            </button>
                        );
                    })}
                </div>
                {errors.categories && <p className="form-error mt-2">{errors.categories}</p>}
            </div>
            <div>
                <label htmlFor="reg-bizdesc" className="label">Business description <span className="text-slate-500">(optional)</span></label>
                <textarea id="reg-bizdesc" name="businessDescription" value={formData.businessDescription}
                    onChange={handleChange} rows={3} placeholder="Tell clients what makes your service special..."
                    className="input resize-none" />
            </div>
        </div>
    );

    const renderCurrentStep = () => {
        if (step === 1) return renderStep1();
        if (step === 2 && accountType === 'user') return renderStep2User();
        if (step === 2 && accountType === 'serviceProvider') return renderStep2Provider();
        if (step === 3 && accountType === 'serviceProvider') return renderStep3Provider();
    };

    const isLastStep = step === totalSteps;

    return (
        <div className="min-h-screen bg-slate-900 bg-dots flex flex-col items-center justify-center px-4 py-12">
            {/* Gradient orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-md animate-slide-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-glow mb-4">
                        <span className="text-white text-xl font-black">S</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white">Join Sahaay</h1>
                    <p className="text-slate-400 mt-1 text-sm">Create your free account</p>
                </div>

                <div className="card p-8 shadow-card">
                    {/* Account type selector — only on first load */}
                    {step === 1 && (
                        <div className="mb-6">
                            <p className="label">I want to</p>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: 'user', label: 'Find Services', sub: 'As a client', icon: Users },
                                    { value: 'serviceProvider', label: 'Offer Services', sub: 'As a provider', icon: Briefcase },
                                ].map((opt) => {
                                    const Icon = opt.icon;
                                    return (
                                        <button key={opt.value} type="button"
                                            id={`type-${opt.value}`}
                                            onClick={() => setAccountType(opt.value)}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                                                accountType === opt.value
                                                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                                                    : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'
                                            }`}
                                        >
                                            <Icon className="w-6 h-6" />
                                            <div className="text-center">
                                                <div className="text-sm font-semibold">{opt.label}</div>
                                                <div className="text-xs opacity-70">{opt.sub}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {renderStepIndicator()}

                    <form onSubmit={isLastStep ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
                        {renderCurrentStep()}

                        <div className={`flex gap-3 mt-8 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
                            {step > 1 && (
                                <button type="button" onClick={prevStep} className="btn btn-secondary btn-md">
                                    <ChevronLeft className="w-4 h-4" />Back
                                </button>
                            )}
                            <button
                                id={isLastStep ? 'register-submit' : 'register-next'}
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary btn-md flex-1"
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" />Creating account...</>
                                ) : isLastStep ? (
                                    <><UserPlus className="w-4 h-4" />Create Account</>
                                ) : (
                                    <>Continue<ChevronRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-xs text-slate-500 mt-6">
                        By creating an account you agree to our{' '}
                        <Link to="/terms" className="text-indigo-400 hover:text-indigo-300">Terms</Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</Link>
                    </p>

                    <p className="text-center text-sm text-slate-400 mt-3">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;