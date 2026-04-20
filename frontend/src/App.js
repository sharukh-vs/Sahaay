import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute, { PublicOnlyRoute } from './components/ProtectedRoute';

// ─── Auth Pages ────────────────────────────────────────────────────────────────
import Login from './pages/Login';
import Register from './pages/Register';
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword  = lazy(() => import('./pages/auth/ResetPassword'));

// ─── User Platform ─────────────────────────────────────────────────────────────
const UserHome      = lazy(() => import('./pages/UserHome'));
const ServiceSearch = lazy(() => import('./pages/user/ServiceSearch'));
const MyRequests    = lazy(() => import('./pages/user/MyRequests'));
const PostRequest   = lazy(() => import('./pages/user/PostRequest'));
const UserProfile   = lazy(() => import('./pages/user/UserProfile'));

// ─── Provider Platform ─────────────────────────────────────────────────────────
const ProviderDashboard = lazy(() => import('./pages/provider/ProviderDashboard'));
const RequestFeed       = lazy(() => import('./pages/provider/RequestFeed'));
const MyServices        = lazy(() => import('./pages/provider/MyServices'));
const CreateService     = lazy(() => import('./pages/provider/CreateService'));
const Earnings          = lazy(() => import('./pages/provider/Earnings'));
const SubmitQuote       = lazy(() => import('./pages/provider/SubmitQuote'));

// ─── Admin Platform ───────────────────────────────────────────────────────────
const AdminDashboard     = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement     = lazy(() => import('./pages/admin/UserManagement'));
const ProviderManagement = lazy(() => import('./pages/admin/ProviderManagement'));
const DisputeManagement  = lazy(() => import('./pages/admin/DisputeManagement'));
const PaymentManagement  = lazy(() => import('./pages/admin/PaymentManagement'));
const AdsManagement      = lazy(() => import('./pages/admin/AdsManagement'));
const TicketManagement   = lazy(() => import('./pages/admin/TicketManagement'));
const PlatformSettings   = lazy(() => import('./pages/admin/PlatformSettings'));


// ─── Shared (legacy) ───────────────────────────────────────────────────────────
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Services  = lazy(() => import('./pages/Services'));

// ─── New Phase pages ───────────────────────────────────────────────────────────
const ProviderOnboarding = lazy(() => import('./pages/provider/ProviderOnboarding'));
const MyQuotes           = lazy(() => import('./pages/provider/MyQuotes'));
const UserQuotations     = lazy(() => import('./pages/user/UserQuotations'));


const ADMIN_ROLES = [
    'superAdmin', 'subAdmin', 'contentManager', 'contentCreator',
    'staff', 'helpSupport', 'accountant', 'inventoryManager', 'hrManager',
];

// Global loading fallback
const PageLoader = () => (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-slate-700 border-t-indigo-500 animate-spin" />
            <p className="text-slate-400 text-sm">Loading...</p>
        </div>
    </div>
);

function App() {
    return (
        <AuthProvider>
            <Router>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* ── Default redirect ───────────────────────────────── */}
                        <Route path="/" element={<Navigate to="/login" replace />} />

                        {/* ── Public Auth Routes ─────────────────────────────── */}
                        <Route path="/login" element={
                            <PublicOnlyRoute><Login /></PublicOnlyRoute>
                        } />
                        <Route path="/register" element={
                            <PublicOnlyRoute><Register /></PublicOnlyRoute>
                        } />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />

                        {/* ── User Routes ────────────────────────────────────── */}
                        <Route path="/home" element={
                            <ProtectedRoute allowedRoles={['user']}><UserHome /></ProtectedRoute>
                        } />
                        <Route path="/user/search" element={
                            <ProtectedRoute allowedRoles={['user']}><ServiceSearch /></ProtectedRoute>
                        } />
                        <Route path="/user/services" element={
                            <ProtectedRoute allowedRoles={['user']}><Services /></ProtectedRoute>
                        } />
                        <Route path="/user/requests" element={
                            <ProtectedRoute allowedRoles={['user']}><MyRequests /></ProtectedRoute>
                        } />
                        <Route path="/user/requests/new" element={
                            <ProtectedRoute allowedRoles={['user']}><PostRequest /></ProtectedRoute>
                        } />
                        <Route path="/user/profile" element={
                            <ProtectedRoute allowedRoles={['user']}><UserProfile /></ProtectedRoute>
                        } />
                        <Route path="/user/quotations" element={
                            <ProtectedRoute allowedRoles={['user']}><UserQuotations /></ProtectedRoute>
                        } />


                        {/* ── Provider Routes ────────────────────────────────── */}
                        <Route path="/provider/dashboard" element={
                            <ProtectedRoute allowedRoles={['serviceProvider']}><ProviderDashboard /></ProtectedRoute>
                        } />
                        <Route path="/provider/requests" element={
                            <ProtectedRoute allowedRoles={['serviceProvider']}><RequestFeed /></ProtectedRoute>
                        } />
                        <Route path="/provider/services" element={
                            <ProtectedRoute allowedRoles={['serviceProvider']}><MyServices /></ProtectedRoute>
                        } />
                        <Route path="/provider/services/new" element={
                            <ProtectedRoute allowedRoles={['serviceProvider']}><CreateService /></ProtectedRoute>
                        } />
                        <Route path="/provider/earnings" element={
                            <ProtectedRoute allowedRoles={['serviceProvider']}><Earnings /></ProtectedRoute>
                        } />
                        <Route path="/provider/quotes" element={
                            <ProtectedRoute allowedRoles={['serviceProvider']}><MyQuotes /></ProtectedRoute>
                        } />
                        <Route path="/provider/quotes/new" element={
                            <ProtectedRoute allowedRoles={['serviceProvider']}><SubmitQuote /></ProtectedRoute>
                        } />
                        <Route path="/provider/onboard" element={
                            <ProtectedRoute allowedRoles={['serviceProvider']}><ProviderOnboarding /></ProtectedRoute>
                        } />

                        {/* ── Admin Routes ───────────────────────────────────── */}
                        <Route path="/admin/dashboard" element={
                            <ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminDashboard /></ProtectedRoute>
                        } />
                        <Route path="/admin/users" element={
                            <ProtectedRoute allowedRoles={ADMIN_ROLES}><UserManagement /></ProtectedRoute>
                        } />
                        <Route path="/admin/providers" element={
                            <ProtectedRoute allowedRoles={ADMIN_ROLES}><ProviderManagement /></ProtectedRoute>
                        } />
                        <Route path="/admin/disputes" element={
                            <ProtectedRoute allowedRoles={ADMIN_ROLES}><DisputeManagement /></ProtectedRoute>
                        } />
                        <Route path="/admin/payments" element={
                            <ProtectedRoute allowedRoles={ADMIN_ROLES}><PaymentManagement /></ProtectedRoute>
                        } />
                        <Route path="/admin/ads" element={
                            <ProtectedRoute allowedRoles={ADMIN_ROLES}><AdsManagement /></ProtectedRoute>
                        } />
                        <Route path="/admin/tickets" element={
                            <ProtectedRoute allowedRoles={ADMIN_ROLES}><TicketManagement /></ProtectedRoute>
                        } />
                        <Route path="/admin/settings" element={
                            <ProtectedRoute allowedRoles={ADMIN_ROLES}><PlatformSettings /></ProtectedRoute>
                        } />



                        {/* ── Legacy redirect ────────────────────────────────── */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />

                        {/* ── 404 ───────────────────────────────────────────── */}
                        <Route path="*" element={
                            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                                <div className="text-center animate-fade-in">
                                    <h1 className="text-8xl font-black gradient-text mb-4">404</h1>
                                    <p className="text-slate-400 text-lg mb-6">Page not found</p>
                                    <a href="/login" className="btn btn-primary btn-md">Go Home</a>
                                </div>
                            </div>
                        } />
                    </Routes>
                </Suspense>

                {/* Global Toast Notifications */}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#1e293b',
                            color: '#f1f5f9',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontFamily: 'Inter, sans-serif',
                        },
                        success: {
                            iconTheme: { primary: '#10b981', secondary: '#1e293b' },
                        },
                        error: {
                            iconTheme: { primary: '#ef4444', secondary: '#1e293b' },
                        },
                    }}
                />
            </Router>
        </AuthProvider>
    );
}

export default App;
