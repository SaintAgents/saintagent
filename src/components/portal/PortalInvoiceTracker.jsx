import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Receipt, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const statusColors = {
  draft: 'border-slate-200 text-slate-500',
  sent: 'border-blue-200 text-blue-700 bg-blue-50',
  paid: 'border-emerald-200 text-emerald-700 bg-emerald-50',
  overdue: 'border-red-200 text-red-700 bg-red-50',
  cancelled: 'border-slate-200 text-slate-400',
};

export default function PortalInvoiceTracker({ invoices, projectMap }) {
  const sorted = [...invoices].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.amount || 0), 0);
  const totalOutstanding = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + (i.amount || 0), 0);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Receipt className="w-4 h-4 text-emerald-600" />
          Invoices
          <Badge variant="secondary" className="ml-auto text-xs">{invoices.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {/* Summary */}
        <div className="px-6 pb-3 flex gap-4">
          <div className="flex-1 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
            <p className="text-xs text-emerald-600 font-medium">Paid</p>
            <p className="text-lg font-bold text-emerald-700">${totalPaid.toLocaleString()}</p>
          </div>
          <div className="flex-1 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-600 font-medium">Outstanding</p>
            <p className="text-lg font-bold text-amber-700">${totalOutstanding.toLocaleString()}</p>
          </div>
        </div>

        <ScrollArea className="h-[320px] px-6 pb-4">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <DollarSign className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No invoices yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sorted.map(inv => (
                <div key={inv.id} className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900 truncate">{inv.title}</p>
                        {inv.invoice_number && (
                          <span className="text-xs text-slate-400 shrink-0">#{inv.invoice_number}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {projectMap[inv.project_id]?.title || inv.project_title || 'Project'}
                        {inv.due_date && ` • Due ${inv.due_date}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-900">${(inv.amount || 0).toLocaleString()}</p>
                      <Badge variant="outline" className={cn("text-[10px]", statusColors[inv.status])}>
                        {inv.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}