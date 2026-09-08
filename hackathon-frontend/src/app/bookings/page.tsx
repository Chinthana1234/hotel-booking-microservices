'use client';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useGetUserBookingsQuery, useCancelBookingMutation } from '@/store/api/bookingApi';
import { useGetRoomsQuery } from '@/store/api/roomApi';
import { useSubmitReviewMutation } from '@/store/api/reviewApi';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', {
  weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
});

export default function BookingsPage() {
  const router = useRouter();
  const { token, userId } = useSelector((state: RootState) => state.auth);
  const [reviewingRoomId, setReviewingRoomId] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  const { data: bookings = [], isLoading, error } = useGetUserBookingsQuery(userId!, { skip: !userId || !token });
  const { data: allRooms = [] } = useGetRoomsQuery();
  const [cancelBooking] = useCancelBookingMutation();
  const [submitReview, { isLoading: reviewLoading }] = useSubmitReviewMutation();

  // Build rooms lookup map
  const roomsMap: Record<string, any> = {};
  allRooms.forEach((r: any) => { roomsMap[r._id] = r; });

  if (!token || !userId) {
    return (
      <div className="pt-28 flex flex-col items-center justify-center min-h-[70vh]">
        <p className="text-white/50 text-lg mb-6">Please sign in to view your bookings.</p>
        <Link href="/auth" className="bg-purple-700 hover:bg-purple-600 text-white px-8 py-3 font-semibold uppercase tracking-wider transition-colors">
          Sign In
        </Link>
      </div>
    );
  }

  if (isLoading) return (
    <div className="pt-28 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="spinner mb-4" />
      <p className="text-white/50">Loading your reservations...</p>
    </div>
  );

  if (error) return (
    <div className="pt-28 text-center py-24 text-red-400">Failed to fetch bookings. Please try again later.</div>
  );

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await cancelBooking(bookingId).unwrap();
      alert('Booking cancelled successfully!');
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to cancel booking');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent, roomId: string) => {
    e.preventDefault();
    try {
      await submitReview({ roomId, ...reviewForm }).unwrap();
      alert('Review submitted successfully!');
      setReviewingRoomId(null);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <div className="pt-28 max-w-4xl mx-auto px-6 py-10 animate-fade-in">
      <h1 className="font-playfair text-4xl font-light text-white mb-2">My Bookings</h1>
      <p className="text-white/50 mb-10">Manage your luxury stays and reservations.</p>

      {bookings.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <p className="text-white/50 text-lg mb-6">You don't have any bookings yet.</p>
          <Link href="/rooms" className="bg-purple-700 hover:bg-purple-600 text-white px-8 py-3 font-semibold uppercase tracking-wider transition-colors rounded-lg">
            Book a Room Now
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {bookings.map((booking: any) => {
            const room = roomsMap[booking.roomId] || { type: 'Unknown', roomNumber: 'N/A', description: '' };
            const isCancelled = booking.status === 'Cancelled';

            return (
              <div key={booking._id} className="space-y-2">
                <div className="glass rounded-2xl p-6 flex flex-wrap justify-between items-center gap-6">
                  {/* Left: Room Info */}
                  <div className="flex-1 min-w-[280px]">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full inline-block mb-3 ${isCancelled ? 'tag-booked' : 'tag-available'}`}>
                      {booking.status}
                    </span>
                    <h3 className="text-xl font-semibold text-white mb-1">{room.type} Suite — #{room.roomNumber}</h3>
                    <p className="text-white/50 text-sm">{room.description}</p>
                  </div>

                  {/* Middle: Dates */}
                  <div className="flex gap-8 text-sm">
                    <div>
                      <p className="text-white/40 mb-1">Check In</p>
                      <p className="font-semibold text-white">{formatDate(booking.checkInDate)}</p>
                    </div>
                    <div>
                      <p className="text-white/40 mb-1">Check Out</p>
                      <p className="font-semibold text-white">{formatDate(booking.checkOutDate)}</p>
                    </div>
                  </div>

                  {/* Right: Price & Actions */}
                  <div className="flex flex-col items-end gap-2 min-w-[140px]">
                    <p className="text-2xl font-bold text-purple-400">${booking.totalPrice}</p>
                    {!isCancelled && (
                      <>
                        <button
                          onClick={() => handleCancel(booking._id)}
                          className="w-full border border-red-500/30 hover:bg-red-500/10 text-red-400 text-sm py-2 px-4 transition-colors rounded-lg"
                        >
                          Cancel Booking
                        </button>
                        <button
                          onClick={() => setReviewingRoomId(booking.roomId)}
                          className="w-full border border-white/10 hover:bg-white/5 text-white/70 text-sm py-2 px-4 transition-colors rounded-lg"
                        >
                          Leave Review
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Inline Review Form */}
                {reviewingRoomId === booking.roomId && (
                  <div className="glass rounded-xl p-5">
                    <form onSubmit={(e) => handleReviewSubmit(e, booking.roomId)} className="flex flex-wrap gap-4 items-end">
                      <div>
                        <label className="text-xs text-white/50 block mb-1">Rating</label>
                        <select
                          value={reviewForm.rating}
                          onChange={e => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                          className="bg-white/5 border border-white/10 text-white text-sm px-3 py-2 rounded-lg outline-none focus:border-purple-500"
                        >
                          {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                        </select>
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <label className="text-xs text-white/50 block mb-1">Comment</label>
                        <input
                          type="text"
                          required
                          value={reviewForm.comment}
                          onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          placeholder="How was your stay?"
                          className="w-full bg-white/5 border border-white/10 text-white text-sm px-4 py-2 rounded-lg outline-none focus:border-purple-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" disabled={reviewLoading}
                          className="bg-purple-700 hover:bg-purple-600 text-white text-sm px-5 py-2 rounded-lg transition-colors disabled:opacity-60">
                          Submit
                        </button>
                        <button type="button" onClick={() => setReviewingRoomId(null)}
                          className="border border-white/10 hover:bg-white/5 text-white/60 text-sm px-5 py-2 rounded-lg transition-colors">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
