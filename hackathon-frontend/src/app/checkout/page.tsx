'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetRoomByIdQuery } from '@/store/api/roomApi';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const roomId = searchParams.get('roomId') || '';
  const passedCheckIn = searchParams.get('checkIn') || '';
  const passedCheckOut = searchParams.get('checkOut') || '';

  const { data: room, isLoading, error } = useGetRoomByIdQuery(roomId, { skip: !roomId });

  const [hasHighTea, setHasHighTea] = useState(false);
  const [hasCookery, setHasCookery] = useState(false);

  if (!roomId) {
    return (
      <div className="text-center py-24">
        <p className="text-white/50 mb-4">No room selected.</p>
        <button onClick={() => router.push('/rooms')} className="bg-purple-700 hover:bg-purple-600 text-white px-6 py-2.5 font-semibold">
          Browse Rooms
        </button>
      </div>
    );
  }

  if (isLoading) return <div className="flex justify-center pt-24"><div className="spinner" /></div>;
  if (error || !room) return <div className="text-center py-24 text-red-400">Room not found.</div>;

  const basePrice = room.pricePerNight;
  const highTeaPrice = 14;
  const cookeryPrice = 50;
  const addonsTotal = (hasHighTea ? highTeaPrice : 0) + (hasCookery ? cookeryPrice : 0);
  const subtotal = basePrice + addonsTotal;
  const taxesAndFees = subtotal * 0.298;
  const total = subtotal + taxesAndFees;

  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const checkInDate = passedCheckIn ? new Date(passedCheckIn) : today;
  const checkOutDate = passedCheckOut ? new Date(passedCheckOut) : tomorrow;
  const opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  const dateStr = `${checkInDate.toLocaleDateString('en-US', opts)} - ${checkOutDate.toLocaleDateString('en-US', opts)}`;
  const nights = Math.max(1, Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / 86400000));

  const handleCheckout = () => {
    const params = new URLSearchParams({
      roomId,
      total: total.toFixed(2),
      subtotal: subtotal.toFixed(2),
      taxesAndFees: taxesAndFees.toFixed(2),
      basePrice: String(basePrice),
      hasHighTea: String(hasHighTea),
      hasCookery: String(hasCookery),
      highTeaPrice: String(highTeaPrice),
      cookeryPrice: String(cookeryPrice),
      checkInDate: checkInDate.toISOString(),
      checkOutDate: checkOutDate.toISOString(),
    });
    router.push(`/payment?${params.toString()}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Success banner */}
      <div className="bg-emerald-900/30 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 flex items-center gap-2 mb-8 rounded-lg">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0"><path d="M20 6L9 17l-5-5"/></svg>
        Room selected! Add special packages below or proceed to checkout.
      </div>

      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.push('/rooms')} className="text-white/50 hover:text-white transition-colors text-xl">←</button>
        <h1 className="font-playfair text-2xl font-light text-white uppercase tracking-wider">Add To Your Room</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Add-ons */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Special Packages</h2>

          {/* High Tea */}
          <div className="glass rounded-2xl p-5 flex justify-between items-center">
            <div className="flex-1 pr-4">
              <p className="font-semibold text-white text-sm uppercase tracking-wide mb-1">High Tea</p>
              <p className="text-white/50 text-xs">3:00 PM – 5:00 PM · Special high tea at your preferred location</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-bold text-white mb-1">${highTeaPrice}</p>
              <p className="text-white/40 text-xs mb-3">Per Guest / Stay</p>
              <button
                onClick={() => setHasHighTea(!hasHighTea)}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors rounded ${
                  hasHighTea
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {hasHighTea ? 'Remove' : 'Add'}
              </button>
            </div>
          </div>

          {/* Cookery */}
          <div className="glass rounded-2xl p-5 flex justify-between items-center">
            <div className="flex-1 pr-4">
              <p className="font-semibold text-white text-sm uppercase tracking-wide mb-1">Sri Lankan Cookery Demo</p>
              <p className="text-white/50 text-xs">Traditional Sri Lankan Cookery Demonstration with Lunch</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-bold text-white mb-1">${cookeryPrice}</p>
              <p className="text-white/40 text-xs mb-3">Per Guest / Stay</p>
              <button
                onClick={() => setHasCookery(!hasCookery)}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors rounded ${
                  hasCookery
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {hasCookery ? 'Remove' : 'Add'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Cart */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Your Cart: 1 Item</h2>

          <div className="bg-purple-900/20 rounded-xl p-4 mb-4">
            <div className="flex justify-between text-white font-bold text-lg mb-1">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <p className="text-white/40 text-xs">Including taxes and fees</p>
          </div>

          <div className="space-y-2 text-sm mb-4 border-b border-white/10 pb-4">
            <div className="flex justify-between text-white/80">
              <span>{room.type.toUpperCase()} — Room Only</span>
              <span>${basePrice.toFixed(2)}</span>
            </div>
            <p className="text-white/40 text-xs">{nights} Night{nights > 1 ? 's' : ''} · {dateStr}</p>
            {hasHighTea && (
              <div className="flex justify-between text-white/80 pt-1">
                <span>+ High Tea</span><span>${highTeaPrice.toFixed(2)}</span>
              </div>
            )}
            {hasCookery && (
              <div className="flex justify-between text-white/80">
                <span>+ Cookery Demo</span><span>${cookeryPrice.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-white/50 pt-2">
              <span>Taxes & Fees</span><span>${taxesAndFees.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between font-bold text-white text-lg mb-6">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-3.5 uppercase tracking-widest text-sm transition-colors rounded-xl"
          >
            View Cart & Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="pt-28">
      <Suspense fallback={<div className="flex justify-center pt-40"><div className="spinner" /></div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
