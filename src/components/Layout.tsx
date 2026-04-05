import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/AuthContext';

export default function Layout() {
  const { token } = useAuth();
  const navigate  = useNavigate();

  useEffect(() => {
    if (!token) navigate('/login', { replace: true });
  }, [token, navigate]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
