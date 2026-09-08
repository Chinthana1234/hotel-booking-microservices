'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useGetRoomsQuery, useGetAvailableRoomsQuery } from '@/store/api/roomApi';
import { useGetReviewsByRoomQuery } from '@/store/api/reviewApi';
import { Suspense } from 'react';

const roomImages = [
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600',
  'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600',
];

// Individual room card with RTK Query review fetch
function RoomCard({ room, index, checkIn, checkOut }: any) {
  const { data: reviews = [] } = useGetReviewsByRoomQuery(room._id);
  const avgRating = reviews.length > 0
    ? reviews.reduce((a: number, r: any) => a + r.rating, 0) / reviews.length : 0;
  const router = useRouter();

  const handleBook = () => {
    const params = new URLSearchParams();
    params.set('roomId', room._id);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col md:flex-row hover:border-purple-500/30 transition-all animate-fade-in">
      {/* Image */}
      <div className="md:w-64 shrink-0 relative">
        <img
          src={roomImages[index % roomImages.length]}
          alt={`${room.type} Suite`}
          className="w-full h-48 md:h-full object-cover"
        />
      </div>

      {/* Middle: Details */}
      <div className="flex-1 p-6 border-r border-white/5">
        <h3 className="text-xl font-bold text-white tracking-wide uppercase mb-2">{room.type}</h3>
        <div className="flex items-center gap-3 mb-3">
          <span className={room.isAvailable !== false ? 'tag-available' : 'tag-booked'}>
            {room.isAvailable !== false ? 'Available' : 'Unavailable'}
          </span>
          <span className="text-white/40 text-sm">1 King bed · Sleeps 3</span>
        </div>
        {reviews.length > 0 && (
          <div className="text-yellow-400 text-sm mb-3">
            {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
            <span className="text-white/40 ml-2">({avgRating.toFixed(1)} · {reviews.length})</span>
          </div>
        )}
        <p className="text-white/50 text-sm mb-4">{room.description}</p>
        <div className="space-y-1 text-xs text-white/40">
          <div className="flex items-center gap-2">
            <span>❄</span> Air Conditioning
          </div>
          <div className="flex items-center gap-2">
            <span>🚿</span> Separate Shower
          </div>
          <div className="flex items-center gap-2">
            <span>💼</span> Free Minibar
          </div>
        </div>
        <div className="mt-4 p-3 bg-purple-900/20 border border-purple-500/10 rounded-lg text-xs text-white/50">
          <p className="font-semibold text-purple-300 mb-1">Room Only — Grand Ceylon DISCOVERY</p>
          <p>Earn 2X DISCOVERY Dollars · 15% off Dining · 10% off Spa</p>
        </div>
      </div>

      {/* Right: Price & Book */}
      <div className="md:w-48 p-6 flex flex-col items-end justify-between shrink-0">
        <div>
          <p className="text-xs font-bold text-purple-400 tracking-widest uppercase mb-2">MEMBER RATE</p>
          <p className="text-white/30 line-through text-sm">${room.pricePerNight + 50}</p>
          <p className="text-3xl font-bold text-white">${room.pricePerNight}</p>
          <p className="text-white/40 text-xs mt-1">Per Night<br/>Excl. taxes</p>
        </div>
        <button
          onClick={handleBook}
          disabled={room.isAvailable === false}
          className="w-full bg-purple-700 hover:bg-purple-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 text-sm uppercase tracking-wider transition-colors rounded-lg mt-4"
        >
          {room.isAvailable !== false ? 'Book Now' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
}

function RoomsContent() {
  const searchParams = useSearchParams();
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';

  const shouldFilterByDate = checkIn && checkOut;

  const allRoomsResult = useGetRoomsQuery(undefined, { skip: !!shouldFilterByDate });
  const availableRoomsResult = useGetAvailableRoomsQuery(
    { checkIn, checkOut },
    { skip: !shouldFilterByDate }
  );

  const { data: rooms = [], isLoading, error } = shouldFilterByDate ? availableRoomsResult : allRoomsResult;

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="spinner mb-4" />
      <p className="text-white/50">Loading luxury...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-24 text-red-400">
      Failed to load rooms. Make sure the API Gateway is running.
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="font-playfair text-4xl font-light text-white mb-2">Our Rooms</h1>
      {checkIn && checkOut ? (
        <p className="text-white/50 mb-8">Showing available rooms from <strong className="text-white">{checkIn}</strong> to <strong className="text-white">{checkOut}</strong></p>
      ) : (
        <p className="text-white/50 mb-8">Find your perfect escape.</p>
      )}

      {rooms.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-white/50">
          No rooms available for the selected dates.
        </div>
      ) : (
        <div className="space-y-6">
          {rooms.map((room: any, i: number) => (
            <RoomCard key={room._id} room={room} index={i} checkIn={checkIn} checkOut={checkOut} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RoomsPage() {
  return (
    <div className="pt-28">
      <Suspense fallback={<div className="flex justify-center pt-40"><div className="spinner" /></div>}>
        <RoomsContent />
      </Suspense>
    </div>
  );
}
