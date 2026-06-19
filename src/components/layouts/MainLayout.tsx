import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Home, Search, Calendar, User } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ScrollToTop, ErrorBoundary, LoadingBar } from '@/components/Shared';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Search, label: 'Explore', path: '/explore' },
  { icon: Calendar, label: 'Bookings', path: '/bookings' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showLoading, setShowLoading] = useState(false);
  const pathname = location.pathname;

  useEffect(() => {
    setShowLoading(true);
    const timer = setTimeout(() => setShowLoading(false), 800);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      {showLoading && <LoadingBar />}
      
      <div className="flex">
        {/* Desktop Sidebar */}
        <nav className="hidden md:flex flex-col w-16 lg:w-20 bg-canvas-soft border-r border-hairline-mid min-h-screen fixed left-0 top-0 z-40 py-4" aria-label="Main navigation">
          <div className="flex-1 flex flex-col items-center gap-1 pt-4">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-200',
                    isActive
                      ? 'text-white bg-white/20'
                      : 'text-body hover:text-ink hover:bg-surface-pressed'
                  )}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 md:ml-16 lg:ml-20 pb-20 md:pb-4">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
          <ScrollToTop />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-canvas-soft border-t border-hairline-mid z-40 pb-safe" aria-label="Main navigation">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex flex-col items-center justify-center min-h-[48px] px-4 py-2 transition-all duration-200 relative',
                  isActive ? 'text-white' : 'text-body'
                )}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
                {isActive && (
                  <div className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
