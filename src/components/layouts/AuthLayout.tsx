import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function AuthLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isRoot = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-white">
      {!isRoot && (
        <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-slate-50 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>
        </div>
      )}
      <Outlet />
    </div>
  );
}
