import React, { useState, useReducer, useEffect } from 'react';
import { X, Star, ChevronUp } from 'lucide-react';
import { Avatar, Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import { appToast } from '@/lib/toast';
import type { Partner } from '@/lib/types';
import type { LucideIcon } from 'lucide-react';

// ─── Review Modal ────────────────────────────────────────────
interface ReviewModalProps {
  partner: Partner;
  isOpen: boolean;
  onClose: () => void;
}

interface ReviewState {
  rating: number;
  comment: string;
  isSubmitting: boolean;
}

type ReviewAction =
  | { type: 'SET_RATING'; payload: number }
  | { type: 'SET_COMMENT'; payload: string }
  | { type: 'SUBMIT' }
  | { type: 'RESET' };

const reviewInitialState: ReviewState = { rating: 0, comment: '', isSubmitting: false };

function reviewReducer(state: ReviewState, action: ReviewAction): ReviewState {
  switch (action.type) {
    case 'SET_RATING': return { ...state, rating: action.payload };
    case 'SET_COMMENT': return { ...state, comment: action.payload };
    case 'SUBMIT': return { ...state, isSubmitting: true };
    case 'RESET': return reviewInitialState;
    default: return state;
  }
}

export function ReviewModal({ partner, isOpen, onClose }: ReviewModalProps) {
  const [state, dispatch] = useReducer(reviewReducer, reviewInitialState);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const isValid = state.rating > 0 && state.comment.length > 10;

  const handleSubmit = () => {
    dispatch({ type: 'SUBMIT' });
    setTimeout(() => {
      appToast.success('Review posted! 🎉');
      dispatch({ type: 'RESET' });
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-canvas-soft rounded-3xl w-full max-w-sm animate-scale-in z-10" role="dialog" aria-modal="true">
        <div className="px-5 pt-5 pb-3 border-b border-hairline-mid">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Review {partner.name}</h2>
            <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-canvas-softer" aria-label="Close">
              <X className="w-5 h-5 text-body" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Avatar src={partner.avatar} alt={partner.name} size="sm" />
            <span className="text-sm font-medium text-ink">{partner.name}</span>
          </div>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-ink mb-2 block">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => dispatch({ type: 'SET_RATING', payload: star })}
                  className="text-3xl transition-transform duration-200 active:scale-110"
                  type="button"
                  aria-label={`Rate ${star} stars`}
                >
                  <Star className={cn('w-8 h-8', star <= state.rating ? 'fill-white text-white' : 'text-hairline-mid')} />
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <label htmlFor="reviewComment" className="text-sm font-medium text-ink mb-1.5 block">
              Share your experience
            </label>
            <textarea
              id="reviewComment"
              value={state.comment}
              onChange={(e) => dispatch({ type: 'SET_COMMENT', payload: e.target.value })}
              maxLength={500}
              rows={4}
              className="w-full rounded-xl border-2 border-hairline-mid bg-canvas-softer px-4 py-3 text-sm resize-none focus:border-white focus:outline-none focus:ring-2 focus:ring-white/10 placeholder:text-mute"
              placeholder="Tell us about your experience..."
            />
            <span className="absolute bottom-3 right-3 text-xs text-mute">{state.comment.length}/500</span>
          </div>
          <Button
            variant="primary"
            size="lg"
            className="w-full rounded-2xl"
            disabled={!isValid}
            isLoading={state.isSubmitting}
            onClick={handleSubmit}
          >
            Post Review
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────
interface EmptyStateProps {
  icon: LucideIcon;
  heading: string;
  subtext: string;
  action?: { label: string; href: string };
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, heading, subtext, action, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
      <div className="w-16 h-16 rounded-full bg-canvas-softer flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-body" />
      </div>
      <h3 className="text-lg font-semibold text-ink mb-1">{heading}</h3>
      <p className="text-sm text-body mb-4 max-w-xs">{subtext}</p>
      {action && (
        <Button variant="primary" size="md" className="rounded-2xl" onClick={onAction}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

// ─── Scroll To Top ───────────────────────────────────────────
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        'fixed bottom-24 right-5 z-30 w-11 h-11 rounded-full bg-white text-black shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-white/90',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      )}
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
}

// ─── Error Boundary ──────────────────────────────────────────
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] py-16 px-5 text-center">
          <span className="text-5xl mb-4">😕</span>
          <h2 className="text-xl font-bold text-ink mb-2">Something went wrong</h2>
          <p className="text-sm text-body mb-4">Try refreshing the page</p>
          {this.state.error && (
            <pre className="bg-canvas-softer rounded-xl p-4 text-xs text-left max-w-md overflow-auto mb-4 text-body">
              {this.state.error.message}
            </pre>
          )}
          <Button variant="primary" size="md" onClick={() => window.location.reload()}>
            Refresh page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Settings Row ────────────────────────────────────────────
interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
}

export function SettingsRow({ icon, label, value, href, onClick, danger }: SettingsRowProps) {
  const content = (
    <div className={cn(
      'flex items-center gap-3 min-h-[52px] px-4 py-3 transition-colors duration-200',
      danger ? 'text-red-500' : 'text-ink',
      (href || onClick) && 'hover:bg-canvas-softer cursor-pointer'
    )}>
      <span className="text-lg flex-shrink-0">{icon}</span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {value && <span className="text-sm text-body">{value}</span>}
      {(href || onClick) && <span className="text-body text-sm">›</span>}
    </div>
  );

  if (href) {
    return <a href={href}>{content}</a>;
  }
  if (onClick) {
    return <button type="button" onClick={onClick} className="w-full text-left">{content}</button>;
  }
  return content;
}

// ─── Loading Bar ─────────────────────────────────────────────
export function LoadingBar() {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px]">
      <div className="h-full bg-white animate-loading-bar" />
    </div>
  );
}
