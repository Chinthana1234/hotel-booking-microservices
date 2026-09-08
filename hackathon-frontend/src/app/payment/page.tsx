'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useGetRoomByIdQuery } from '@/store/api/roomApi';
import { useCreateBookingMutation } from '@/store/api/bookingApi';
import { useProcessPaymentMutation } from '@/store/api/paymentApi';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token, userId } = useSelector((state: RootState) => state.auth);

  const roomId = searchParams.get('roomId') || '';
  const total = parseFloat(searchParams.get('total') || '0');
  const subtotal = parseFloat(searchParams.get('subtotal') || '0');
  const taxesAndFees = parseFloat(searchParams.get('taxesAndFees') || '0');
  const basePrice = parseFloat(searchParams.get('basePrice') || '0');
  const hasHighTea = searchParams.get('hasHighTea') === 'true';
  const hasCookery = searchParams.get('hasCookery') === 'true';
  const highTeaPrice = parseFloat(searchParams.get('highTeaPrice') || '0');
  const cookeryPrice = parseFloat(searchParams.get('cookeryPrice') || '0');
  const checkInDate = searchParams.get('checkInDate') || new Date().toISOString();
  const checkOutDate = searchParams.get('checkOutDate') || new Date(Date.now() + 86400000).toISOString();

  const { data: room } = useGetRoomByIdQuery(roomId, { skip: !roomId });
  const [createBooking] = useCreateBookingMutation();
  const [processPayment] = useProcessPaymentMutation();

  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'card'>('paypal');
  const [paypalStep, setPaypalStep] = useState<'select' | 'login' | 'confirm' | 'success'>('select');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalPassword, setPaypalPassword] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [processing, setProcessing] = useState(false);

  const parsedCheckIn = new Date(checkInDate);
  const parsedCheckOut = new Date(checkOutDate);
  const nights = Math.max(1, Math.ceil((parsedCheckOut.getTime() - parsedCheckIn.getTime()) / 86400000));
  const opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  const dateStr = `${parsedCheckIn.toLocaleDateString('en-US', opts)} – ${parsedCheckOut.toLocaleDateString('en-US', opts)}`;

  const handlePayNow = async (method: string) => {
    if (!token) { router.push('/auth'); return; }
    setProcessing(true);
    try {
      // 1. Create Booking
      const booking = await createBooking({
        userId,
        roomId,
        checkInDate: parsedCheckIn.toISOString(),
        checkOutDate: parsedCheckOut.toISOString(),
        totalPrice: parseFloat(total.toFixed(2)),
      }).unwrap();

      // 2. Process Payment (calls .NET Core service via gateway)
      await processPayment({
        bookingId: booking._id,
        userId: userId!,
        amount: parseFloat(total.toFixed(2)),
        paymentMethod: method,
      }).unwrap();

      setPaypalStep('success');
      setTimeout(() => router.push('/bookings'), 3000);
    } catch (err: any) {
      alert(err?.data?.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  const formatCard = (v: string) => {
    const d = v.replace(/\D/g, '').match(/.{1,4}/g);
    return d ? d.join(' ') : v;
  };
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, '');
    return d.length >= 2 ? d.slice(0, 2) + '/' + d.slice(2, 4) : d;
  };

  if (paypalStep === 'success') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="glass rounded-2xl p-12 text-center max-w-md w-full animate-fade-in">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" className="w-8 h-8"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h2 className="font-playfair text-3xl font-light text-white mb-2">Payment Successful!</h2>
          <p className="text-3xl font-bold text-purple-400 mb-2">${total.toFixed(2)}</p>
          <p className="text-white/50 text-sm mb-8">Your booking has been confirmed. Redirecting to your reservations...</p>
          <div className="glass rounded-xl p-4 text-sm text-white/70 space-y-2">
            <div className="flex justify-between"><span>Room</span><span>{room?.type} Suite</span></div>
            <div className="flex justify-between"><span>Method</span><span>{paymentMethod === 'paypal' ? 'PayPal' : 'Credit Card'}</span></div>
            <div className="flex justify-between"><span>Stay</span><span>{nights} Night{nights > 1 ? 's' : ''}</span></div>
          </div>
          <div className="mt-6 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 animate-pulse w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!roomId || !total) return (
    <div className="text-center py-24 text-white/50">
      No booking info. <button onClick={() => router.push('/rooms')} className="text-purple-400 hover:text-purple-300 ml-2">Browse Rooms</button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="text-white/50 hover:text-white text-xl transition-colors">←</button>
        <h1 className="text-sm font-bold tracking-[0.3em] uppercase text-white/80">Secure Payment</h1>
        <span className="flex items-center gap-1 text-xs text-emerald-400 ml-auto">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          SSL Encrypted
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Payment Methods */}
        <div className="space-y-4">
          {/* PayPal Tab */}
          <div className={`glass rounded-2xl overflow-hidden border transition-colors ${paymentMethod === 'paypal' ? 'border-purple-500/50' : 'border-white/5'}`}>
            <div
              className="flex items-center gap-4 p-5 cursor-pointer"
              onClick={() => { setPaymentMethod('paypal'); setPaypalStep('select'); }}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'paypal' ? 'border-purple-500' : 'border-white/30'}`}>
                {paymentMethod === 'paypal' && <div className="w-2 h-2 rounded-full bg-purple-500" />}
              </div>
              <span className="font-bold text-lg">
                <span className="text-blue-400">Pay</span><span className="text-blue-300">Pal</span>
              </span>
            </div>

            {paymentMethod === 'paypal' && (
              <div className="px-5 pb-5">
                {paypalStep === 'select' && (
                  <div>
                    <p className="text-white/50 text-sm mb-4">You'll complete payment securely via PayPal.</p>
                    <button
                      onClick={() => setPaypalStep('login')}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-sm transition-colors"
                    >
                      Continue with PayPal
                    </button>
                    <div className="mt-3 space-y-1.5 text-xs text-emerald-400">
                      {['Buyer Protection Included', 'No card details shared', 'One-touch checkout'].map(b => (
                        <div key={b} className="flex items-center gap-2">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 shrink-0"><path d="M20 6L9 17l-5-5"/></svg>
                          {b}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {paypalStep === 'login' && (
                  <form onSubmit={(e) => { e.preventDefault(); setPaypalStep('confirm'); }} className="space-y-3">
                    <div className="text-center mb-4">
                      <p className="font-bold text-xl"><span className="text-blue-400">Pay</span><span className="text-blue-300">Pal</span></p>
                    </div>
                    <div>
                      <label className="text-xs text-white/60 block mb-1">Email or mobile number</label>
                      <input type="email" value={paypalEmail} onChange={e => setPaypalEmail(e.target.value)} placeholder="email@example.com" required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="text-xs text-white/60 block mb-1">Password</label>
                      <input type="password" value={paypalPassword} onChange={e => setPaypalPassword(e.target.value)} placeholder="••••••••" required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-500" />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-sm">Log In</button>
                    <button type="button" onClick={() => { setPaypalEmail('guest@hotel.com'); setPaypalPassword('demo123'); }}
                      className="w-full border border-white/10 hover:bg-white/5 text-white/70 py-2.5 rounded-xl text-xs transition-colors">
                      Use Demo Account
                    </button>
                    <button type="button" onClick={() => setPaypalStep('select')} className="text-xs text-white/40 hover:text-white/60 block mx-auto">← Back</button>
                  </form>
                )}

                {paypalStep === 'confirm' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="font-bold text-xl mb-1"><span className="text-blue-400">Pay</span><span className="text-blue-300">Pal</span></p>
                      <p className="text-white/50 text-xs">{paypalEmail}</p>
                    </div>
                    <div className="glass rounded-xl p-4 text-center">
                      <p className="text-white/50 text-xs mb-1">Payment Amount</p>
                      <p className="text-2xl font-bold text-white">${total.toFixed(2)} USD</p>
                    </div>
                    <div className="space-y-2 text-sm text-white/60">
                      <div className="flex justify-between"><span>To</span><span>The Grand Ceylon</span></div>
                      <div className="flex justify-between"><span>Room</span><span>{room?.type} Suite</span></div>
                      <div className="flex justify-between"><span>Stay</span><span>{nights} Night{nights > 1 ? 's' : ''}</span></div>
                    </div>
                    <button onClick={() => handlePayNow('PayPal')} disabled={processing}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                      {processing ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : `Pay $${total.toFixed(2)} Now`}
                    </button>
                    <button onClick={() => setPaypalStep('login')} className="text-xs text-white/40 hover:text-white/60 block mx-auto">← Change account</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Credit Card Tab */}
          <div className={`glass rounded-2xl overflow-hidden border transition-colors ${paymentMethod === 'card' ? 'border-purple-500/50' : 'border-white/5'}`}>
            <div className="flex items-center gap-4 p-5 cursor-pointer" onClick={() => setPaymentMethod('card')}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-purple-500' : 'border-white/30'}`}>
                {paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-purple-500" />}
              </div>
              <span className="font-semibold text-white">Credit / Debit Card</span>
              <div className="ml-auto flex gap-1.5">
                {['VISA', 'MC', 'AMEX'].map(c => (
                  <span key={c} className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded">{c}</span>
                ))}
              </div>
            </div>

            {paymentMethod === 'card' && (
              <form onSubmit={(e) => { e.preventDefault(); handlePayNow('Credit Card'); }} className="px-5 pb-5 space-y-3">
                <div>
                  <label className="text-xs text-white/60 block mb-1">Cardholder Name</label>
                  <input type="text" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Name on card" required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="text-xs text-white/60 block mb-1">Card Number</label>
                  <input type="text" value={cardNumber} onChange={e => setCardNumber(formatCard(e.target.value))} placeholder="1234 5678 9012 3456" maxLength={19} required
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-purple-500 font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-white/60 block mb-1">Expiry</label>
                    <input type="text" value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" maxLength={5} required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-purple-500" />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 block mb-1">CVV</label>
                    <input type="password" value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="•••" maxLength={4} required
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-purple-500" />
                  </div>
                </div>
                <button type="submit" disabled={processing}
                  className="w-full bg-purple-700 hover:bg-purple-600 disabled:bg-slate-700 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
                  {processing
                    ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>Pay ${total.toFixed(2)}</>
                  }
                </button>
              </form>
            )}
          </div>

          {/* Trust badges */}
          <div className="flex justify-around pt-2">
            {[
              { icon: '🛡️', label: 'Secure Payment' },
              { icon: '🔒', label: '256-bit SSL' },
              { icon: '✅', label: 'Money-back' },
            ].map(b => (
              <div key={b.label} className="flex flex-col items-center gap-1 text-xs text-white/40">
                <span className="text-lg">{b.icon}</span>
                {b.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div>
          <div className="glass rounded-2xl p-6 mb-4">
            <h2 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-5">Order Summary</h2>
            <div className="mb-4">
              <p className="font-bold text-white uppercase tracking-wide">{room?.type}, {room?.type} King</p>
              <p className="text-white/50 text-sm mt-1">{dateStr}</p>
              <p className="text-white/40 text-xs mt-1">2 Adults · {nights} Night{nights > 1 ? 's' : ''}</p>
            </div>
            <div className="space-y-2 text-sm border-t border-white/10 pt-4">
              <div className="flex justify-between text-white/70"><span>Room ({room?.type})</span><span>${basePrice.toFixed(2)}</span></div>
              {hasHighTea && <div className="flex justify-between text-white/70"><span>High Tea</span><span>${highTeaPrice.toFixed(2)}</span></div>}
              {hasCookery && <div className="flex justify-between text-white/70"><span>Cookery Demo</span><span>${cookeryPrice.toFixed(2)}</span></div>}
              <div className="flex justify-between text-white/50"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-white/50"><span>Taxes & Fees</span><span>${taxesAndFees.toFixed(2)}</span></div>
            </div>
            <div className="flex justify-between font-bold text-white text-lg border-t border-white/10 pt-4 mt-2">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-purple-400 bg-purple-900/20 rounded-lg px-3 py-2">
              <span>🏷️</span> Getaway Deal 2026 Applied
            </div>
          </div>

          <div className="glass rounded-xl p-4 flex items-start gap-3 text-sm text-white/60">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 mt-0.5 shrink-0 text-white/40"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p><strong className="text-white">Free cancellation</strong> available up to 24 hours before check-in.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <div className="pt-28">
      <Suspense fallback={<div className="flex justify-center pt-40"><div className="spinner" /></div>}>
        <PaymentContent />
      </Suspense>
    </div>
  );
}
