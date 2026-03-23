import React from 'react';
import { MessageSquare, Users, Bot, AlertTriangle, Clock, TrendingUp } from 'lucide-react';

const stats = [
  { key: 'total', label: 'Total Messages', icon: MessageSquare, color: 'bg-blue-100 text-blue-700' },
  { key: 'contacts', label: 'Contacts', icon: Users, color: 'bg-violet-100 text-violet-700' },
  { key: 'aiReplies', label: 'AI Replies', icon: Bot, color: 'bg-emerald-100 text-emerald-700' },
  { key: 'pending', label: 'Pending Review', icon: Clock, color: 'bg-amber-100 text-amber-700' },
  { key: 'urgent', label: 'Urgent', icon: AlertTriangle, color: 'bg-red-100 text-red-700' },
  { key: 'responseRate', label: 'Response Rate', icon: TrendingUp, color: 'bg-cyan-100 text-cyan-700' },
];

export default function WAStatsBar({ messages = [], contacts = [] }) {
  const today = new Date().toISOString().split('T')[0];
  const todayMsgs = messages.filter(m => m.created_date?.startsWith(today));
  
  const values = {
    total: messages.length,
    contacts: contacts.length,
    aiReplies: messages.filter(m => m.ai_generated).length,
    pending: messages.filter(m => m.status === 'pending_review').length,
    urgent: messages.filter(m => m.sentiment === 'urgent').length,
    responseRate: messages.length > 0 
      ? Math.round((messages.filter(m => m.direction === 'outbound').length / Math.max(1, messages.filter(m => m.direction === 'inbound').length)) * 100) + '%'
      : '0%',
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map(({ key, label, icon: Icon, color }) => (
        <div key={key} className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{values[key]}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      ))}
    </div>
  );
}