import React, { useState, useEffect, useCallback } from 'react';
import { HelpCircle, Loader2, Send, Clock, CheckCircle2, AlertCircle, RefreshCcw } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import axiosInstance from '../../axios/axiosInstance';
import toast from 'react-hot-toast';

const STATUS_BADGE = { open: 'badge-danger', in_progress: 'badge-warning', resolved: 'badge-success', closed: 'badge-neutral' };

export default function TicketManagement() {
    const [tickets, setTickets] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);

    const [detail, setDetail] = useState(null);
    const [message, setMessage] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const p = new URLSearchParams({ page, limit: 15 });
            if (statusFilter) p.set('status', statusFilter);
            const res = await axiosInstance.get(`/tickets?${p}`);
            setTickets(res.data.tickets || []);
            setTotal(res.data.total || 0);
            setPages(res.data.pages || 1);
        } catch { toast.error('Failed to load tickets'); }
        finally { setLoading(false); }
    }, [statusFilter, page]);

    useEffect(() => { load(); }, [load]);

    const openDetail = async (id) => {
        try {
            const res = await axiosInstance.get(`/tickets/${id}`);
            setDetail(res.data.ticket);
        } catch { toast.error('Failed to load ticket details'); }
    };

    const handleSendMessage = async () => {
        if (!message.trim()) return;
        setActionLoading(true);
        try {
            await axiosInstance.post(`/tickets/${detail._id}/messages`, { text: message });
            setMessage('');
            await openDetail(detail._id);
        } catch { toast.error('Failed to send message'); }
        finally { setActionLoading(false); }
    };

    const handleUpdateStatus = async (newStatus) => {
        setActionLoading(true);
        try {
            await axiosInstance.patch(`/tickets/${detail._id}/status`, { status: newStatus });
            toast.success(`Ticket marked as ${newStatus.replace('_', ' ')}`);
            await openDetail(detail._id);
            load();
        } catch { toast.error('Failed to update status'); }
        finally { setActionLoading(false); }
    };

    return (
        <AdminLayout>
            <div className="p-4 md:p-6 max-w-5xl mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-80px)]">
                
                {/* List View */}
                <div className={`flex-1 flex flex-col min-w-0 ${detail ? 'hidden md:flex md:w-1/3' : 'w-full'}`}>
                    <div className="mb-4">
                        <h1 className="page-title">Support Tickets</h1>
                        <p className="page-subtitle">{total} tickets found</p>
                    </div>

                    <div className="flex gap-2 mb-4 flex-wrap">
                        {['', 'open', 'in_progress', 'resolved', 'closed'].map((s) => (
                            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); setDetail(null); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400 border border-white/10 hover:text-white'}`}>
                                {s.replace('_', ' ') || 'All'}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-red-500 animate-spin" /></div>
                        ) : !tickets.length ? (
                            <div className="card p-8 text-center">
                                <HelpCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                                <h3 className="text-md font-bold text-white">No tickets found</h3>
                            </div>
                        ) : (
                            tickets.map((t) => (
                                <div key={t._id} onClick={() => openDetail(t._id)}
                                    className={`card p-4 cursor-pointer transition-all ${detail?._id === t._id ? 'border-red-500/50 bg-red-500/5' : 'hover:border-white/15'}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-white text-sm truncate pr-2">{t.subject}</h3>
                                        <span className={`badge text-[10px] flex-shrink-0 ${STATUS_BADGE[t.status] || 'badge-neutral'}`}>{t.status.replace('_', ' ')}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 line-clamp-1 mb-2">{t.description}</p>
                                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                                        <span>{t.raisedBy?.name}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(t.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                        {pages > 1 && (
                            <div className="flex justify-center gap-2 mt-4 pb-4">
                                {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map((pg) => (
                                    <button key={pg} onClick={() => setPage(pg)}
                                        className={`w-8 h-8 rounded-lg text-xs font-medium ${page === pg ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400 border border-white/10'}`}>{pg}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail View */}
                {detail && (
                    <div className="flex-1 card flex flex-col overflow-hidden animate-slide-up md:animate-none">
                        <div className="p-4 md:p-5 border-b border-white/8 bg-slate-950/50 flex flex-col gap-3 flex-shrink-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-lg font-bold text-white">{detail.subject}</h2>
                                    <div className="flex gap-2 mt-1">
                                        <span className={`badge text-xs ${STATUS_BADGE[detail.status]}`}>{detail.status.replace('_', ' ')}</span>
                                        <span className="badge badge-neutral text-xs">Priority: {detail.priority}</span>
                                    </div>
                                </div>
                                <button onClick={() => setDetail(null)} className="md:hidden text-slate-400 hover:text-white">✕</button>
                            </div>
                            <div className="flex justify-between text-xs text-slate-400">
                                <span>From: <strong className="text-white">{detail.raisedBy?.name}</strong> ({detail.raisedBy?.email})</span>
                                <span>{new Date(detail.createdAt).toLocaleString()}</span>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2 mt-2">
                                {detail.status !== 'in_progress' && detail.status !== 'resolved' && detail.status !== 'closed' && (
                                    <button onClick={() => handleUpdateStatus('in_progress')} disabled={actionLoading} className="btn btn-sm text-xs bg-amber-500/15 text-amber-400 border border-amber-500/20 hover:bg-amber-500/25">
                                        <RefreshCcw className="w-3 h-3" /> Mark In Progress
                                    </button>
                                )}
                                {detail.status !== 'resolved' && detail.status !== 'closed' && (
                                    <button onClick={() => handleUpdateStatus('resolved')} disabled={actionLoading} className="btn btn-sm text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25">
                                        <CheckCircle2 className="w-3 h-3" /> Mark Resolved
                                    </button>
                                )}
                                {detail.status !== 'closed' && (
                                    <button onClick={() => handleUpdateStatus('closed')} disabled={actionLoading} className="btn btn-sm text-xs bg-slate-800 text-slate-400 border border-white/10 hover:text-white">
                                        Close Ticket
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 custom-scrollbar">
                            {/* Original Description */}
                            <div className="flex gap-3">
                                <img src={detail.raisedBy?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(detail.raisedBy?.name)}&background=6366f1&color=fff`} alt="" className="w-8 h-8 rounded-full border border-white/10" />
                                <div className="flex-1">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="font-semibold text-white text-sm">{detail.raisedBy?.name}</span>
                                        <span className="text-[10px] text-slate-500">Original Request</span>
                                    </div>
                                    <div className="bg-slate-800/50 p-3 rounded-xl rounded-tl-none border border-white/5 text-sm text-slate-300">
                                        {detail.description}
                                    </div>
                                </div>
                            </div>

                            {/* Thread */}
                            {detail.messages?.map((msg, idx) => {
                                const isAdmin = msg.sender?.role === 'superAdmin' || msg.sender?.role === 'subAdmin' || msg.sender?.role === 'helpSupport';
                                return (
                                    <div key={idx} className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                                        <img src={msg.sender?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender?.name || 'U')}&background=${isAdmin ? 'ef4444' : '6366f1'}&color=fff`} alt="" className="w-8 h-8 rounded-full border border-white/10" />
                                        <div className={`flex-1 flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="font-semibold text-white text-sm">{msg.sender?.name}</span>
                                                <span className="text-[10px] text-slate-500">{new Date(msg.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div className={`p-3 rounded-xl border text-sm max-w-[85%] ${isAdmin ? 'bg-red-500/10 border-red-500/20 text-red-50 rounded-tr-none' : 'bg-slate-800/50 border-white/5 text-slate-300 rounded-tl-none'}`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {detail.status !== 'closed' && (
                            <div className="p-4 border-t border-white/8 bg-slate-950/50 flex gap-2 flex-shrink-0">
                                <textarea rows={2} value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                                    placeholder="Type a reply..." className="input flex-1 resize-none py-2.5 text-sm" />
                                <button onClick={handleSendMessage} disabled={actionLoading || !message.trim()} className="btn h-auto px-4 bg-red-500 text-white hover:bg-red-600 disabled:opacity-50">
                                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
