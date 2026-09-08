'use client';

import { useRouter } from 'next/navigation';
import { useGetRoomsQuery } from '@/store/api/roomApi';
import { useGetReviewsByRoomQuery } from '@/store/api/reviewApi';

// Room card with inline reviews fetch
function FeaturedRoomCard({ room, index }: { room: any; index: number }) {
  const { data: reviews = [] } = useGetReviewsByRoomQuery(room._id);
  const avgRating = reviews.length > 0
    ? reviews.reduce((a: number, r: any) => a + r.rating, 0) / reviews.length
    : 0;

  const roomImages = [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600',
  ];
  const router = useRouter();

  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col hover:border-purple-500/30 transition-colors">
      <div className="relative">
        <img
          src={roomImages[index % roomImages.length]}
          alt={`${room.type} Suite`}
          className="w-full h-52 object-cover"
        />
        <span className={`absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full ${
          room.isAvailable ? 'tag-available' : 'tag-booked'
        }`}>
          {room.isAvailable ? 'Available' : 'Booked'}
        </span>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-semibold mb-1">{room.type} Suite — #{room.roomNumber}</h3>
        {reviews.length > 0 ? (
          <div className="text-yellow-400 text-sm mb-3">
            {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
            <span className="text-white/40 ml-2">({avgRating.toFixed(1)} · {reviews.length} reviews)</span>
          </div>
        ) : (
          <p className="text-white/40 text-xs mb-3">No reviews yet</p>
        )}
        <p className="text-white/60 text-sm flex-1 mb-4">{room.description}</p>
        <div className="text-2xl font-bold text-purple-400 mb-4">${room.pricePerNight}<span className="text-sm font-normal text-white/50"> /night</span></div>
        <button
          onClick={() => router.push('/rooms')}
          className="w-full bg-purple-700 hover:bg-purple-600 text-white py-2.5 text-sm font-semibold tracking-wider uppercase transition-colors rounded-lg"
        >
          View All Rooms
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { data: rooms = [], isLoading } = useGetRoomsQuery();
  const featuredRooms = rooms.filter((r: any) => r.isAvailable).slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/40 via-slate-950/60 to-slate-950 z-10" />
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1920"
          alt="The Grand Ceylon"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="relative z-20 text-center max-w-4xl px-6 animate-fade-in">
          <p className="text-purple-300 text-sm tracking-[0.5em] uppercase mb-4">Welcome to</p>
          <h1 className="font-playfair text-6xl md:text-8xl font-light tracking-widest text-white mb-6">
            The Grand Ceylon
          </h1>
          <p className="text-white/60 italic font-playfair text-xl mb-10">
            "Crafted by nature, perfected by luxury."
          </p>
          <button
            onClick={() => router.push('/rooms')}
            className="bg-purple-700 hover:bg-purple-600 text-white px-12 py-4 text-sm font-bold tracking-[0.3em] uppercase transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-900/40"
          >
            Explore Rooms & Suites
          </button>
        </div>
      </section>

      {/* Brand Story */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="font-playfair text-4xl font-light mb-6 text-white">A Journey of Extraordinary Moments</h2>
        <p className="text-white/60 leading-relaxed text-lg">
          Inspired by Sri Lankan heritage and warm hospitality, The Grand Ceylon Hotels & Resorts offers
          an elite collection of destinations designed to rejuvenate the body, mind, and spirit.
          From dynamic modern business centers in Colombo to rustic luxury safaris on the verge of Yala's
          untamed wilderness — experience unmatched luxury built on a modern microservices architecture.
        </p>
      </section>

      {/* Featured Rooms */}
      {!isLoading && featuredRooms.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-24">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl font-light text-white mb-2">Featured Rooms</h2>
            <p className="text-white/50">Experience unparalleled comfort</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredRooms.map((room: any, i: number) => (
              <FeaturedRoomCard key={room._id} room={room} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950/80 mt-10">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <p className="font-playfair text-xl text-white mb-3">The Grand Ceylon.</p>
            <p className="text-white/50 text-sm leading-relaxed">
              Providing luxury stays and extraordinary travel memories inspired by Sri Lankan hospitality.
            </p>
          </div>
          {[
            { title: 'Destinations', links: ['Colombo', 'Yala', 'Kandy', 'Maldives'] },
            { title: 'Experiences', links: ['Dining', 'Wellness Spa', 'Eco Safaris', 'Weddings'] },
            { title: 'Corporate', links: ['About Us', 'Careers', 'Sustainability', 'Contact Us'] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-bold uppercase tracking-widest text-white/70 mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <button
                      onClick={() => router.push('/rooms')}
                      className="text-white/50 hover:text-white text-sm transition-colors"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 px-6 py-4 flex justify-between items-center text-white/30 text-xs max-w-6xl mx-auto">
          <span>© {new Date().getFullYear()} The Grand Ceylon Hotels & Resorts. All Rights Reserved.</span>
          <div className="flex gap-4">
            <button className="hover:text-white/60 transition-colors">Privacy Policy</button>
            <button className="hover:text-white/60 transition-colors">Terms of Use</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
