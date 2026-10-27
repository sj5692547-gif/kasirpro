import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Lock, 
  Mail, 
  Key, 
  Crown, 
  Store, 
  ShoppingBag, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowRight,
  Shield,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    login, 
    currentUser, 
    availableCredentials 
  } = useApp();

  const [emailOrId, setEmailOrId] = useState<string>('sj5692547@gmail.com');
  const [passwordOrPin, setPasswordOrPin] = useState<string>('admin123');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const res = login(emailOrId, passwordOrPin);
    if (res.success) {
      setSuccessMessage(res.message);
      setTimeout(() => {
        setIsAuthModalOpen(false);
      }, 700);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleQuickFill = (email: string, pass: string) => {
    setEmailOrId(email);
    setPasswordOrPin(pass);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-6">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Shield className="w-4 h-4 text-emerald-400" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Autentikasi & Hak Akses
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white">
            Login Sistem KasirPro UMKM
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Masuk sebagai <strong>Super Admin (Anda)</strong>, <strong>Pemilik Toko</strong>, atau <strong>Kasir Shift</strong>.
          </p>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Quick-Click Preset Credentials */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Pilih Akun Cepat (Tinggal Klik untuk Mengisi):</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              {/* Super Admin Preset */}
              <div
                onClick={() => handleQuickFill('sj5692547@gmail.com', 'admin123')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  emailOrId === 'sj5692547@gmail.com'
                    ? 'border-amber-500 bg-amber-50/70 shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between text-amber-600 mb-1">
                  <span className="font-bold text-[11px] flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-500" />
                    <span>Super Admin (Anda)</span>
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-slate-900 truncate">
                  sj5692547@gmail.com
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Password: <strong className="font-mono text-slate-700">admin123</strong>
                </div>
              </div>

              {/* Merchant Owner Preset */}
              <div
                onClick={() => handleQuickFill('budikopi@gmail.com', 'owner123')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  emailOrId === 'budikopi@gmail.com'
                    ? 'border-indigo-500 bg-indigo-50/70 shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between text-indigo-600 mb-1">
                  <span className="font-bold text-[11px] flex items-center gap-1">
                    <Store className="w-3 h-3 text-indigo-500" />
                    <span>Owner Toko UMKM</span>
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-slate-900 truncate">
                  budikopi@gmail.com
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Password: <strong className="font-mono text-slate-700">owner123</strong>
                </div>
              </div>

              {/* Cashier Preset */}
              <div
                onClick={() => handleQuickFill('rian.kasir@gmail.com', 'kasir123')}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                  emailOrId === 'rian.kasir@gmail.com'
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                    : 'border-slate-200 bg-slate-50 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between text-emerald-600 mb-1">
                  <span className="font-bold text-[11px] flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3 text-emerald-500" />
                    <span>Kasir Shift</span>
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-slate-900 truncate">
                  rian.kasir@gmail.com
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  PIN / Pass: <strong className="font-mono text-slate-700">1234 / kasir123</strong>
                </div>
              </div>

            </div>
          </div>

          {/* Form Login */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                ID / Alamat Email Akun
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={emailOrId}
                  onChange={e => setEmailOrId(e.target.value)}
                  placeholder="Masukkan email atau ID kasir..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs text-slate-900 font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Password atau PIN Kasir
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passwordOrPin}
                  onChange={e => setPasswordOrPin(e.target.value)}
                  placeholder="Masukkan password atau PIN 4-digit..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs text-slate-900 font-semibold"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Masuk Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Current Logged In Info */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Saat ini login sebagai:</span>
            <span className="font-bold text-slate-800">
              {currentUser.name} ({currentUser.email})
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
