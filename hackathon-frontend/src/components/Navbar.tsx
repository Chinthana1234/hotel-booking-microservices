'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { logout } from '@/store/slices/authSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { token, isAdmin } = useSelector((state: RootState) => state.auth);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBookingWidgetOpen, setIsBookingWidgetOpen] = useState(false);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(fmt(today));
  const [checkOut, setCheckOut] = useState(fmt(tomorrow));
  const widgetRef = useRef<HTMLDivElement>(null);
  const isHomePage = pathname === '/';

  // Hide navbar on auth page
  if (pathname === '/auth') return null;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (isBookingWidgetOpen && widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setIsBookingWidgetOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isBookingWidgetOpen]);

  const handleLogout = () => {
    dispatch(logout());
    setIsMenuOpen(false);
    router.push('/');
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBookingWidgetOpen(false);
    router.push(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}`);
  };

  return (
    <>
      {/* Overlay for booking widget */}
      {isBookingWidgetOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsBookingWidgetOpen(false)} />
      )}

      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isHomePage && !isScrolled ? 'bg-transparent' : 'bg-slate-900/95 backdrop-blur-md border-b border-white/10'
      }`}>
        {/* Top purple bar */}
        <div className="bg-purple-900/80 px-6 py-1.5 flex justify-between items-center text-xs text-white/80">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-playfair font-semibold text-white tracking-wide">The Grand Ceylon</Link>
            <span className="text-white/40">|</span>
            <span className="opacity-70">DISCOVERY</span>
          </div>
          <div className="flex items-center gap-3">
            {token && <Link href="/bookings" className="hover:text-white transition-colors">My Bookings</Link>}
            {token && <span className="text-white/40">|</span>}
            {isAdmin && <Link href="/admin" className="text-yellow-300 hover:text-yellow-200">Admin Panel</Link>}
            {isAdmin && <span className="text-white/40">|</span>}
            {token ? (
              <button onClick={handleLogout} className="hover:text-white transition-colors cursor-pointer">Logout</button>
            ) : (
              <Link href="/auth" className="hover:text-white transition-colors">Sign In</Link>
            )}
            <span className="text-white/40">|</span>
            <span>ENGLISH ▾</span>
          </div>
        </div>

        {/* Main bar */}
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Hamburger */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex flex-col gap-1.5 p-1"
            aria-label="Open menu"
          >
            <span className="w-6 h-0.5 bg-white block" />
            <span className="w-6 h-0.5 bg-white block" />
            <span className="w-6 h-0.5 bg-white block" />
          </button>

          {/* Brand */}
          <Link href="/" className="text-center absolute left-1/2 -translate-x-1/2">
            <div className="font-playfair text-xl font-semibold tracking-widest text-white">The Grand Ceylon</div>
            <div className="text-xs tracking-[0.3em] text-white/60 uppercase">Hotels & Resorts</div>
          </Link>

          {/* Book Now */}
          <div className="relative" ref={widgetRef}>
            <button
              onClick={() => setIsBookingWidgetOpen(!isBookingWidgetOpen)}
              className="bg-purple-700 hover:bg-purple-600 text-white text-sm font-semibold px-6 py-2.5 tracking-wider uppercase transition-colors"
            >
              Book Now
            </button>

            {/* Booking Widget Dropdown */}
            {isBookingWidgetOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-white/10 shadow-2xl p-5 z-50">
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/60 uppercase tracking-wider block mb-1">Check In</label>
                      <input
                        type="date"
                        value={checkIn}
                        min={fmt(new Date())}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/60 uppercase tracking-wider block mb-1">Check Out</label>
                      <input
                        type="date"
                        value={checkOut}
                        min={checkIn}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-2.5 uppercase tracking-widest text-sm transition-colors"
                  >
                    Search Rooms
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Slide-out Drawer */}
      <div
        className={`fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      />
      <nav className={`fixed top-0 left-0 h-full w-72 bg-slate-900 z-50 transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} p-8`}>
        <button onClick={() => setIsMenuOpen(false)} className="text-white/60 hover:text-white text-2xl mb-8 block">×</button>
        <div className="space-y-1">
          {[
            { href: '/', label: 'Home' },
            { href: '/rooms', label: 'Rooms & Suites' },
            ...(token ? [{ href: '/bookings', label: 'My Bookings' }] : []),
            ...(isAdmin ? [{ href: '/admin', label: 'Admin Panel', className: 'text-yellow-300' }] : []),
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className={`block py-3 border-b border-white/5 text-white/80 hover:text-white hover:pl-2 transition-all ${item.className || ''}`}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-8">
            {token ? (
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 transition-colors py-3"
              >
                Logout
              </button>
            ) : (
              <Link href="/auth" onClick={() => setIsMenuOpen(false)} className="text-purple-400 hover:text-purple-300">
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
