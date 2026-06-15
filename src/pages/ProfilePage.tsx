import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, X } from 'lucide-react';
import { Avatar, Button } from '@/components/ui';
import { SettingsRow } from '@/components/Shared';
import { getUser } from '@/lib/mock-data/user';
import { formatCurrency } from '@/lib/utils';
import { appToast } from '@/lib/toast';
import { ACTIVITY_META } from '@/lib/types';

const USER = getUser();

const CITIES = ['Mumbai', 'Delhi', 'Bengaluru', 'Pune', 'Chennai', 'Hyderabad', 'Jaipur', 'Kochi'];

export default function ProfilePage() {
  const navigate = useNavigate();
  const [showSignOut, setShowSignOut] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState(USER.name);
  const [editCity, setEditCity] = useState('Mumbai');

  const favActivity = ACTIVITY_META[USER.stats.favoriteActivity];

  return (
    <div className="min-h-screen pb-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-b from-violet-600 to-violet-800 text-white pb-20 relative">
        <div className="flex items-center justify-between px-5 pt-6">
          <h1 className="text-xl font-bold">Profile</h1>
          <button
            onClick={() => setShowEditProfile(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-white/30 hover:bg-white/10 transition-colors"
            aria-label="Edit profile"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-col items-center pt-4">
          <Avatar src={USER.avatar} alt={USER.name} size="xl" className="border-[3px] border-white" />
          <h2 className="text-xl font-bold mt-3">{USER.name}</h2>
          <p className="text-violet-200 text-sm">{USER.phone}</p>
          {USER.isVerified && (
            <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/40 px-3 py-0.5 text-xs">
              ✓ Verified
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="relative z-10 -mt-10 px-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl shadow-md py-4 text-center">
            <div className="text-2xl font-bold text-violet-600">{USER.stats.totalBookings}</div>
            <div className="text-xs text-slate-500 mt-0.5">Bookings</div>
          </div>
          <div className="bg-white rounded-2xl shadow-md py-4 text-center">
            <div className="text-2xl font-bold text-violet-600">{formatCurrency(USER.stats.totalSpent)}</div>
            <div className="text-xs text-slate-500 mt-0.5">Total spent</div>
          </div>
          <div className="bg-white rounded-2xl shadow-md py-4 text-center">
            <div className="text-2xl">{favActivity.icon}</div>
            <div className="text-xs text-slate-500 mt-0.5">Fav activity</div>
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-5 mb-2">Account</h3>
        <div className="bg-white rounded-2xl shadow-sm mx-5 divide-y divide-slate-100 overflow-hidden">
          <SettingsRow icon="👤" label="Edit Profile" onClick={() => setShowEditProfile(true)} />
          <SettingsRow icon="🔔" label="Notifications" />
          <SettingsRow icon="💳" label="Payment Methods" />
          <SettingsRow icon="🛡" label="Safety Settings" />
          <SettingsRow icon="📋" label="My Reviews" />
        </div>
      </div>

      {/* Preferences Section */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-5 mb-2">Preferences</h3>
        <div className="bg-white rounded-2xl shadow-sm mx-5 divide-y divide-slate-100 overflow-hidden">
          <SettingsRow icon="🌍" label="Language" value="English" />
          <SettingsRow icon="📍" label="Default City" value="Mumbai" />
          <SettingsRow icon="💱" label="Currency" value="INR ₹" />
        </div>
      </div>

      {/* Support Section */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-5 mb-2">Support</h3>
        <div className="bg-white rounded-2xl shadow-sm mx-5 divide-y divide-slate-100 overflow-hidden">
          <SettingsRow icon="❓" label="Help Center" />
          <SettingsRow icon="📞" label="Contact Support" />
          <SettingsRow icon="📜" label="Terms of Service" />
          <SettingsRow icon="🔒" label="Privacy Policy" />
        </div>
      </div>

      {/* Sign Out */}
      <div className="mx-5 mt-4">
        <Button variant="danger" size="lg" className="w-full" onClick={() => setShowSignOut(true)}>
          Sign Out
        </Button>
      </div>

      {/* Sign Out Confirmation */}
      {showSignOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 animate-fade-in" onClick={() => setShowSignOut(false)} />
          <div className="relative bg-white rounded-3xl p-6 max-w-xs w-full animate-scale-in z-10 text-center">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Sign Out?</h3>
            <p className="text-sm text-slate-500 mb-4">Are you sure you want to sign out?</p>
            <div className="flex gap-3">
              <Button variant="outline" size="md" className="flex-1" onClick={() => setShowSignOut(false)}>Cancel</Button>
              <Button variant="primary" size="md" className="flex-1 bg-red-500 hover:bg-red-600" onClick={() => { setShowSignOut(false); navigate('/login'); }}>Sign Out</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Sheet */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowEditProfile(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl animate-slide-up max-h-[80vh] overflow-y-auto">
            <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold">Edit Profile</h2>
              <button onClick={() => setShowEditProfile(false)} className="p-2 -mr-2 rounded-full hover:bg-slate-100" aria-label="Close">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label htmlFor="editName" className="text-sm font-medium text-slate-700 mb-1.5 block">Name</label>
                <input
                  id="editName"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <div>
                <label htmlFor="editCity" className="text-sm font-medium text-slate-700 mb-1.5 block">City</label>
                <select
                  id="editCity"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100"
                >
                  {CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <Button
                variant="primary"
                size="lg"
                className="w-full rounded-2xl"
                onClick={() => {
                  appToast.success('Profile updated!');
                  setShowEditProfile(false);
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
