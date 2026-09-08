'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useLoginMutation, useRegisterMutation } from '@/store/api/userApi';
import { setCredentials } from '@/store/slices/authSlice';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState('');

  const router = useRouter();
  const dispatch = useDispatch();

  // RTK Query mutations
  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [register, { isLoading: registerLoading }] = useRegisterMutation();
  const isLoading = loginLoading || registerLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      let result: any;
      if (isLogin) {
        result = await login({ email: formData.email, password: formData.password }).unwrap();
      } else {
        result = await register(formData).unwrap();
      }
      dispatch(setCredentials({ token: result.token }));
      router.push('/rooms');
    } catch (err: any) {
      setError(err?.data?.message || 'Authentication failed. Please try again.');
    }
  };

  const inputClass = (field: string) =>
    `flex items-center rounded-lg px-4 mb-5 transition-all duration-200 ${
      focusedField === field
        ? 'bg-white border-2 border-purple-500 shadow-lg shadow-purple-500/10'
        : 'bg-blue-50 border-2 border-transparent'
    }`;

  return (
    <div className={`flex min-h-screen bg-white font-inter ${!isLogin ? 'flex-row-reverse' : ''}`}>
      {/* Form Side */}
      <div className="w-full md:w-1/2 flex flex-col justify-between items-center px-8 md:px-20 py-12">
        <div className="font-playfair text-lg font-medium text-slate-900 self-start tracking-wide">
          The Grand Ceylon
        </div>

        <div className="w-full max-w-sm">
          <h2 className="font-playfair text-3xl font-medium text-black mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            {isLogin ? 'Please enter your details to sign in.' : 'Please enter your details to register.'}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-2">Full Name</label>
                <div className={inputClass('name')}>
                  <svg className="text-slate-400 mr-3 shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input
                    type="text"
                    className="bg-transparent border-none outline-none py-3.5 w-full text-slate-900 text-sm"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-2">Email Address</label>
              <div className={inputClass('email')}>
                <svg className="text-slate-400 mr-3 shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <input
                  type="email"
                  className="bg-transparent border-none outline-none py-3.5 w-full text-slate-900 text-sm"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Password</label>
                {isLogin && <span className="text-xs text-slate-400 hover:text-pink-500 cursor-pointer transition-colors">Forgot Password?</span>}
              </div>
              <div className={inputClass('password')}>
                <svg className="text-slate-400 mr-3 shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input
                  type="password"
                  className="bg-transparent border-none outline-none py-3.5 w-full text-slate-900 text-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black hover:bg-pink-600 text-white font-bold py-3.5 text-xs tracking-[0.2em] uppercase transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed rounded-lg mt-2"
            >
              {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Register')}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-8">
            {isLogin ? "New to The Grand Ceylon? " : "Already have an account? "}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="font-semibold text-black hover:text-pink-600 transition-colors ml-1"
            >
              {isLogin ? 'Create an account' : 'Sign In'}
            </button>
          </p>
        </div>

        <p className="text-slate-300 text-xs">© {new Date().getFullYear()} The Grand Ceylon. All rights reserved.</p>
      </div>

      {/* Image Side */}
      <div
        className="hidden md:flex w-1/2 relative flex-col justify-center items-center text-center p-10"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 to-slate-950/70" />
        <div className="relative z-10 max-w-md">
          <h1 className="font-playfair text-5xl font-light text-white tracking-[0.3em] uppercase mb-4">
            The Grand Ceylon
          </h1>
          <div className="flex items-center justify-center gap-4 my-4">
            <div className="h-px w-10 bg-white/40" />
            <span className="text-white/60 text-sm">✦</span>
            <div className="h-px w-10 bg-white/40" />
          </div>
          <p className="font-playfair italic text-white/90 text-lg font-light">
            "Crafted by nature, perfected by luxury."
          </p>
        </div>
      </div>
    </div>
  );
}
