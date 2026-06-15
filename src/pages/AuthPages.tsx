import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Check, Camera } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/utils/cn';
import { appToast } from '@/lib/toast';
import type { ActivityType } from '@/lib/types';

// ─── Login Page ──────────────────────────────────────────────
export function LoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    if (phone.length < 10) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/login/verify', { state: { phone } });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Hero */}
        <div className="w-24 h-24 rounded-full bg-violet-600 flex items-center justify-center mb-6 shadow-lg">
          <span className="text-4xl">🤝</span>
        </div>
        <h1 className="text-2xl font-bold text-violet-600 mb-2">CompanionApp</h1>
        <p className="text-slate-500 text-center text-sm mb-8">Your social companion, just a tap away</p>

        {/* Form */}
        <div className="w-full max-w-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-3">Enter your phone number</h2>
            <div className="flex gap-2">
              <div className="flex items-center gap-1 bg-slate-100 rounded-2xl border-2 border-slate-200 px-4 py-3 flex-shrink-0">
                <span className="text-lg">🇮🇳</span>
                <span className="text-sm font-medium text-slate-700">+91</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="98765 43210"
                className="flex-1 rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100 transition-colors"
                inputMode="numeric"
                id="phone"
              />
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full rounded-2xl font-bold"
            disabled={phone.length < 10}
            isLoading={isLoading}
            onClick={handleSubmit}
          >
            Get OTP
          </Button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 rounded-2xl py-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            onClick={() => { appToast.info('Google SSO coming soon!'); }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-xs text-slate-400 text-center mt-4">
            By continuing you agree to our <span className="text-violet-600">Terms</span> & <span className="text-violet-600">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Verify OTP Page ─────────────────────────────────────────
export function VerifyOtpPage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(28);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const phone = '98765 43210'; // Would come from location state

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    if (otp.every(d => d !== '')) {
      setIsVerifying(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    }
  }, [otp, navigate]);

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      <button
        onClick={() => navigate(-1)}
        className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors mb-8"
        aria-label="Go back"
      >
        <ArrowLeft className="w-5 h-5 text-slate-700" />
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Enter OTP</h1>
        <p className="text-sm text-slate-500 mb-1">OTP sent to +91 {phone}</p>
        <button className="text-violet-600 text-sm font-medium mb-8 hover:underline" type="button">
          Change number
        </button>

        <div className="flex gap-3 justify-center mb-6">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl transition-colors focus:border-violet-600 focus:ring-2 focus:ring-violet-100 focus:outline-none"
              aria-label={`OTP digit ${i + 1}`}
            />
          ))}
        </div>

        <p className="text-xs text-slate-400 text-center mb-6">
          Demo: enter any 6 digits (e.g. 123456)
        </p>

        {resendTimer > 0 ? (
          <p className="text-sm text-slate-400 text-center">Resend in {resendTimer}s</p>
        ) : (
          <button
            onClick={() => { setResendTimer(28); appToast.info('OTP sent to your number'); }}
            className="text-violet-600 text-sm font-medium text-center hover:underline"
            type="button"
          >
            Resend OTP
          </button>
        )}

        {isVerifying && (
          <div className="mt-6 text-center">
            <div className="inline-block w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-500 mt-2">Verifying...</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Partner Signup Page ─────────────────────────────────────
interface PartnerFormState {
  step: number;
  name: string;
  age: string;
  gender: string;
  city: string;
  photoPreview: string | null;
  activities: ActivityType[];
  bio: string;
  hourlyRate: number;
  languages: string[];
  uploadedId: boolean;
  uploadedSelfie: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;
}

const INITIAL_FORM: PartnerFormState = {
  step: 1,
  name: '',
  age: '',
  gender: '',
  city: '',
  photoPreview: null,
  activities: [],
  bio: '',
  hourlyRate: 500,
  languages: [],
  uploadedId: false,
  uploadedSelfie: false,
  isSubmitting: false,
  isSubmitted: false,
};

const LANGUAGES = ['Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Bengali'];
const GENDERS = ['Male', 'Female', 'Non-binary'];
const CITIES_LIST = ['Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Chennai', 'Hyderabad', 'Jaipur', 'Kochi'];

export function PartnerSignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<PartnerFormState>(INITIAL_FORM);

  const setField = <K extends keyof PartnerFormState>(key: K, value: PartnerFormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const toggleActivity = (activity: ActivityType) => {
    setForm(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity],
    }));
  };

  const toggleLanguage = (lang: string) => {
    setForm(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const isStep1Valid = form.name && form.age && form.gender && form.city && form.activities.length > 0;
  const isStep2Valid = form.bio.length >= 50 && form.hourlyRate > 0 && form.languages.length > 0;

  const handleSubmit = () => {
    setForm(prev => ({ ...prev, isSubmitting: true }));
    setTimeout(() => {
      setForm(prev => ({ ...prev, isSubmitting: false, isSubmitted: true }));
    }, 2000);
  };

  if (form.isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 text-center">
        <div className="w-20 h-20 rounded-full bg-violet-600 flex items-center justify-center mb-6 animate-scale-in">
          <Check className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Application Submitted!</h1>
        <p className="text-slate-500 mb-6">We&apos;ll review within 24 hours</p>
        <Button variant="primary" size="lg" className="rounded-2xl" onClick={() => navigate('/login')}>
          Back to Login
        </Button>
        {/* Simple confetti */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#7C3AED', '#0EA5E9', '#F59E0B', '#10B981', '#EF4444'][i % 5],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 py-6">
      {/* Progress Bar */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-200">
            <div
              className={cn('h-full rounded-full transition-all duration-500', s <= form.step ? 'bg-violet-600 w-full' : 'w-0')}
            />
          </div>
        ))}
      </div>

      <h1 className="text-xl font-bold text-slate-900 mb-1">
        {form.step === 1 ? 'Basic Info' : form.step === 2 ? 'About & Pricing' : 'Verification'}
      </h1>
      <p className="text-sm text-slate-500 mb-6">Step {form.step} of 3</p>

      {/* Step 1 */}
      {form.step === 1 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="psName" className="text-sm font-medium text-slate-700 mb-1.5 block">Name</label>
            <input id="psName" type="text" value={form.name} onChange={(e) => setField('name', e.target.value)} className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100" placeholder="Your full name" />
          </div>
          <div>
            <label htmlFor="psAge" className="text-sm font-medium text-slate-700 mb-1.5 block">Age</label>
            <input id="psAge" type="number" value={form.age} onChange={(e) => setField('age', e.target.value)} className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100" placeholder="18-45" min={18} max={45} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Gender</label>
            <div className="flex gap-2">
              {GENDERS.map(g => (
                <button key={g} type="button" onClick={() => setField('gender', g)} className={cn('flex-1 rounded-xl py-2.5 text-sm font-medium border-2 transition-all', form.gender === g ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-700 border-slate-200')}>{g}</button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="psCity" className="text-sm font-medium text-slate-700 mb-1.5 block">City</label>
            <select id="psCity" value={form.city} onChange={(e) => setField('city', e.target.value)} className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100">
              <option value="">Select city</option>
              {CITIES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Profile Photo</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                {form.photoPreview ? (
                  <img src={form.photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <label className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-200 transition-colors">
                <Upload className="w-4 h-4" />
                Upload photo
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setField('photoPreview', URL.createObjectURL(file));
                }} />
              </label>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Activities</label>
            <div className="grid grid-cols-2 gap-2">
              {(['mall', 'coffee', 'movies', 'outdoor'] as ActivityType[]).map(a => {
                const icons: Record<string, string> = { mall: '🛍', coffee: '☕', movies: '🎬', outdoor: '🌳' };
                const labels: Record<string, string> = { mall: 'Mall', coffee: 'Coffee', movies: 'Movies', outdoor: 'Outdoors' };
                return (
                  <button key={a} type="button" onClick={() => toggleActivity(a)} className={cn('rounded-2xl p-3 text-sm font-medium border-2 transition-all flex items-center gap-2', form.activities.includes(a) ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-700 border-slate-200')}>
                    {icons[a]} {labels[a]}
                  </button>
                );
              })}
            </div>
          </div>
          <Button variant="primary" size="lg" className="w-full rounded-2xl" disabled={!isStep1Valid} onClick={() => setField('step', 2)}>Continue</Button>
        </div>
      )}

      {/* Step 2 */}
      {form.step === 2 && (
        <div className="space-y-4">
          <div className="relative">
            <label htmlFor="psBio" className="text-sm font-medium text-slate-700 mb-1.5 block">Bio</label>
            <textarea id="psBio" value={form.bio} onChange={(e) => setField('bio', e.target.value)} maxLength={500} rows={4} className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm resize-none focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100" placeholder="Tell users about yourself... (min 50 chars)" />
            <span className="absolute bottom-3 right-3 text-xs text-slate-400">{form.bio.length}/500</span>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Hourly Rate</label>
            <div className="text-center mb-2">
              <span className="text-4xl font-bold text-violet-600">₹{form.hourlyRate}</span>
              <span className="text-slate-500 text-lg">/hour</span>
            </div>
            <input type="range" min={200} max={2000} step={50} value={form.hourlyRate} onChange={(e) => setField('hourlyRate', Number(e.target.value))} className="w-full" />
            <p className="text-xs text-slate-400 text-center mt-1">Most partners charge ₹400–₹800/hr</p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Languages</label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(l => (
                <button key={l} type="button" onClick={() => toggleLanguage(l)} className={cn('rounded-full px-4 py-2 text-sm font-medium border-2 transition-all', form.languages.includes(l) ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-700 border-slate-200')}>{l}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" className="flex-1 rounded-2xl" onClick={() => setField('step', 1)}>Back</Button>
            <Button variant="primary" size="lg" className="flex-1 rounded-2xl" disabled={!isStep2Valid} onClick={() => setField('step', 3)}>Continue</Button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {form.step === 3 && (
        <div className="space-y-4">
          <div className="space-y-3">
            {[
              { label: '📷 Profile photo', done: !!form.photoPreview },
              { label: '🪪 Govt ID (Aadhaar/PAN/Passport)', done: form.uploadedId },
              { label: '🤳 Selfie with ID', done: form.uploadedSelfie },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-4">
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                {item.done ? (
                  <span className="text-green-600 text-sm font-medium">✓ Done</span>
                ) : (
                  <label className="flex items-center gap-1 text-violet-600 text-sm font-medium cursor-pointer hover:underline">
                    <Upload className="w-3.5 h-3.5" />
                    Upload
                    <input type="file" className="hidden" onChange={() => {
                      if (i === 1) setField('uploadedId', true);
                      if (i === 2) setField('uploadedSelfie', true);
                    }} />
                  </label>
                )}
              </div>
            ))}
            <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-4">
              <span className="text-sm font-medium text-slate-700">📹 Schedule video call</span>
              <button type="button" className="text-violet-600 text-sm font-medium hover:underline" onClick={() => appToast.info('Video call scheduling coming soon!')}>Schedule</button>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" className="flex-1 rounded-2xl" onClick={() => setField('step', 2)}>Back</Button>
            <Button variant="primary" size="lg" className="flex-1 rounded-2xl" isLoading={form.isSubmitting} onClick={handleSubmit}>Submit for review</Button>
          </div>
        </div>
      )}
    </div>
  );
}


