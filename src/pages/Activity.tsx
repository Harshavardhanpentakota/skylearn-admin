import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { ChevronLeft, ChevronRight, Monitor, Smartphone, Globe } from 'lucide-react';

function fmtDate(d: string) {
  return new Date(d).toLocaleString('en', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function DeviceIcon({ ua }: { ua: string | null }) {
  if (!ua) return <Globe className="h-3.5 w-3.5 text-gray-400" />;
  const u = ua.toLowerCase();
  if (u.includes('mobile') || u.includes('android') || u.includes('iphone'))
    return <Smartphone className="h-3.5 w-3.5 text-blue-400" />;
  return <Monitor className="h-3.5 w-3.5 text-gray-500" />;
}

export default function Activity() {
  const [page, setPage] = useState(1);
  const LIMIT = 50;

  const { data, isLoading } = useQuery({
    queryKey: ['admin-activity', page],
    queryFn: () => adminApi.getActivity(page, LIMIT),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Login Activity</h1>
        {data && (
          <span className="text-sm text-gray-500">{data.total.toLocaleString()} total events</span>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Loading…</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">IP Address</th>
                    <th className="px-4 py-3 text-left">Method</th>
                    <th className="px-4 py-3 text-left">Device</th>
                    <th className="px-4 py-3 text-left">User Agent</th>
                    <th className="px-4 py-3 text-left">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(data?.data ?? []).map((a) => (
                    <tr key={String(a.id)} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {a.user ? (
                          <>
                            <p className="font-medium text-gray-800">{a.user.name}</p>
                            <p className="text-xs text-gray-400">{a.user.email}</p>
                          </>
                        ) : (
                          <p className="text-gray-400 italic text-xs">Deleted user</p>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{a.ip}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          a.method === 'google'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {a.method === 'google' ? 'Google' : 'Email'}
                        </span>
                      </td>
                      <td className="px-4 py-3"><DeviceIcon ua={a.userAgent} /></td>
                      <td className="px-4 py-3 text-xs text-gray-400 max-w-xs truncate">
                        {a.userAgent ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {fmtDate(a.createdAt)}
                      </td>
                    </tr>
                  ))}
                  {data?.data.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                        No login activity yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Page {data.page} of {data.pages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" /> Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                    disabled={page === data.pages}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                  >
                    Next <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
