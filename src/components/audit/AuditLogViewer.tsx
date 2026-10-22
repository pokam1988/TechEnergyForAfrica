import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuthRole } from '../../context/AuthRoleContext';
import { History, Shield, Search, User, Filter } from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const { t } = useLanguage();
  const { auditLogs } = useAuthRole();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.projectTitle && log.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
              Governance & Compliance
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Revisionssicheres Audit- & Governance-Protokoll
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
            Lückenlose Aufzeichnung aller Statuswechsel, Rollenwechsel, Genehmigungen, Finanzfreigaben
            und Projektänderungen gemäß Gemeinnützigkeitsrecht.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Audit-Protokoll durchsuchen..."
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Zeitstempel</th>
                <th className="py-2.5 px-3">Benutzer & Rolle</th>
                <th className="py-2.5 px-3">Aktion</th>
                <th className="py-2.5 px-3">Projekt</th>
                <th className="py-2.5 px-3">Protokoll-Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleString('de-DE')}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{entry.userName}</div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {entry.userRole}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border">
                      {entry.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700">
                    {entry.projectTitle ? (
                      <span className="font-medium truncate max-w-xs block">
                        {entry.projectTitle}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-md">{entry.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
