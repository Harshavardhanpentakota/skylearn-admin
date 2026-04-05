import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi, type SuspiciousUser } from '@/api/admin';
import { ShieldAlert, ChevronDown, ChevronRight, AlertTriangle, Shield } from 'lucide-react';
import clsx from 'clsx';

const RISK_CONFIG = {
  critical: {
    label: 'Critical',
    classes: 'bg-red-100 text-red-700',
    row:    'bg-red-50 hover:bg-red-100',
    badge:  'bg-red-500',
    icon:   ShieldAlert,
  },
  high: {
    label: 'High',
    classes: 'bg-orange-100 text-orange-700',
    row:    'bg-orange-50 hover:bg-orange-100',
    badge:  'bg-orange-500',
    icon:   AlertTriangle,
  },
  medium: {
    label: 'Medium',
    classes: 'bg-amber-100 text-amber-700',
    row:    'bg-amber-50 hover:bg-amber-100',
    badge:  'bg-amber-400',
    icon:   Shield,
  },
};

function fmtDate(d: string) {
  return new Date(d).toLocaleString('en', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function RiskBadge({ level }: { level: SuspiciousUser['riskLevel'] }) {
  const cfg = RISK_CONFIG[level];
  const Icon = cfg.icon;
  return (
    <span className={clsx(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
      cfg.classes
    )}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function SummaryCard({ level, count }: { level: keyof typeof RISK_CONFIG; count: number }) {
  const cfg = RISK_CONFIG[level];
  const Icon = cfg.icon;
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
      <div className={clsx('flex h-10 w-10 items-center justify-center rounded-lg', cfg.classes)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900">{count}</p>
        <p className="text-xs text-gray-500">{cfg.label} risk user{count !== 1 ? 's' : ''}</p>
      </div>
    </div>
  );
}

export default function SuspiciousActivity() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: suspicious = [], isLoading } = useQuery({
    queryKey: ['suspicious'],
    queryFn: adminApi.getSuspiciousActivity,
  });

  const counts = {
    critical: suspicious.filter((u) => u.riskLevel === 'critical').length,
    high:     suspicious.filter((u) => u.riskLevel === 'high').length,
    medium:   suspicious.filter((u) => u.riskLevel === 'medium').length,
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Suspicious Activity</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Users who have logged in from 2 or more distinct IP addresses.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryCard level="critical" count={counts.critical} />
        <SummaryCard level="high"     count={counts.high} />
        <SummaryCard level="medium"   count={counts.medium} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Loading…</div>
        ) : suspicious.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400">
            <Shield className="h-8 w-8 text-emerald-400" />
            <p className="text-sm font-medium text-gray-500">No suspicious activity detected</p>
            <p className="text-xs">All users have logged in from a single IP address.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left w-6" />
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Risk</th>
                  <th className="px-4 py-3 text-left">Distinct IPs</th>
                  <th className="px-4 py-3 text-left">Total Logins</th>
                  <th className="px-4 py-3 text-left">Auth Methods</th>
                  <th className="px-4 py-3 text-left">First Seen</th>
                  <th className="px-4 py-3 text-left">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {suspicious.map((u) => {
                  const isOpen = expandedId === u.userId;
                  const sortedLogins = [...u.recentLogins].sort(
                    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  );

                  return [
                    /* Main row */
                    <tr
                      key={u.userId}
                      className={clsx(
                        'cursor-pointer transition-colors',
                        RISK_CONFIG[u.riskLevel].row
                      )}
                      onClick={() => setExpandedId(isOpen ? null : u.userId)}
                    >
                      <td className="px-4 py-3">
                        {isOpen
                          ? <ChevronDown className="h-4 w-4 text-gray-500" />
                          : <ChevronRight className="h-4 w-4 text-gray-500" />}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </td>
                      <td className="px-4 py-3"><RiskBadge level={u.riskLevel} /></td>
                      <td className="px-4 py-3">
                        <span className={clsx(
                          'text-sm font-bold',
                          u.riskLevel === 'critical' ? 'text-red-700' :
                          u.riskLevel === 'high'     ? 'text-orange-700' : 'text-amber-700'
                        )}>
                          {u.ipCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.totalLogins}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {u.methods.map((m) => (
                            <span key={m} className={clsx(
                              'rounded-full px-2 py-0.5 text-xs font-medium',
                              m === 'google' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                            )}>
                              {m === 'google' ? 'Google' : 'Email'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(u.firstLogin)}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(u.lastLogin)}</td>
                    </tr>,

                    /* Expanded detail row */
                    isOpen && (
                      <tr key={`${u.userId}-detail`} className="bg-white border-t border-gray-100">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Distinct IPs */}
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Known IP Addresses
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {u.distinctIPs.map((ip) => (
                                  <code key={ip} className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-mono text-gray-700">
                                    {ip}
                                  </code>
                                ))}
                              </div>
                            </div>

                            {/* Recent logins */}
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Recent Login History
                              </p>
                              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                {sortedLogins.map((l, i) => (
                                  <div
                                    key={i}
                                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-1.5 text-xs"
                                  >
                                    <code className="font-mono text-gray-600">{l.ip}</code>
                                    <span className={clsx(
                                      'rounded-full px-2 py-0.5 font-medium',
                                      l.method === 'google' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                    )}>
                                      {l.method === 'google' ? 'Google' : 'Email'}
                                    </span>
                                    <span className="text-gray-400">{fmtDate(l.createdAt)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ),
                  ];
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
