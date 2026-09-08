'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import {
  useGetDashboardQuery,
  useGetAdminUsersQuery,
  useGetAdminBookingsQuery,
  useDeleteAdminBookingMutation,
  usePromoteUserMutation,
} from '@/store/api/adminApi';
import { useGetRoomsQuery } from '@/store/api/roomApi';

type Tab = 'analytics' | 'rooms' | 'bookings' | 'users';

export default function AdminPage() {
  const router = useRouter();
  const { token, isAdmin } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<Tab>('analytics');

  // Redirect non-admins
  useEffect(() => {
    if (!token) { router.push('/auth'); return; }
    if (!isAdmin) { router.push('/'); }
  }, [token, isAdmin, router]);

  // RTK Query hooks (conditionally fetch based on active tab)
  const { data: stats, isLoading: statsLoading, error: statsError } = useGetDashboardQuery(undefined, { skip: activeTab !== 'analytics' });
  const { data: rooms = [], isLoading: roomsLoading } = useGetRoomsQuery(undefined, { skip: activeTab !== 'rooms' } as any);
  const { data: bookings = [], isLoading: bookingsLoading } = useGetAdminBookingsQuery(undefined, { skip: activeTab !== 'bookings' });
  const { data: users = [], isLoading: usersLoading } = useGetAdminUsersQuery(undefined, { skip: activeTab !== 'users' });

  const [deleteBooking] = useDeleteAdminBookingMutation();
  const [promoteUser] = usePromoteUserMutation();

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'rooms', label: 'Rooms', icon: '🏨' },
    { id: 'bookings', label: 'Bookings', icon: '📅' },
    { id: 'users', label: 'Users', icon: '👥' },
  ];

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Delete this booking?')) return;
    try { await deleteBooking(id).unwrap(); alert('Deleted!'); }
    catch { alert('Failed to delete'); }
  };

  const handlePromoteUser = async (id: string) => {
    if (!confirm('Promote this user to admin?')) return;
    try { await promoteUser(id).unwrap(); alert('User promoted!'); }
    catch { alert('Failed to promote'); }
  };

  if (!token || !isAdmin) return null;

  return (
    <div className="pt-28 max-w-6xl mx-auto px-6 py-10 animate-fade-in">
      <h1 className="font-playfair text-4xl font-light text-white mb-2">Admin Panel</h1>
      <p className="text-white/50 mb-8">Manage The Grand Ceylon Hotels & Resorts</p>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-white/10">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'text-purple-400 border-b-2 border-purple-400 -mb-px'
                : 'text-white/50 hover:text-white'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div>
          {statsLoading && <div className="flex justify-center py-16"><div className="spinner" /></div>}
          {statsError && <p className="text-red-400">Failed to load analytics. Make sure the FastAPI admin-service is running.</p>}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Rooms', value: stats.total_rooms ?? '—', color: 'text-purple-400' },
                { label: 'Available Rooms', value: stats.available_rooms ?? '—', color: 'text-emerald-400' },
                { label: 'Total Bookings', value: stats.total_bookings ?? '—', color: 'text-blue-400' },
                { label: 'Total Users', value: stats.total_users ?? '—', color: 'text-yellow-400' },
              ].map(s => (
                <div key={s.label} className="glass rounded-2xl p-6 text-center">
                  <p className={`text-4xl font-bold ${s.color} mb-2`}>{s.value}</p>
                  <p className="text-white/50 text-sm">{s.label}</p>
                </div>
              ))}
            </div>
          )}
          {stats?.recent_bookings?.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-4">Recent Bookings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white/40 text-left border-b border-white/10">
                      <th className="pb-2 pr-4">Booking ID</th>
                      <th className="pb-2 pr-4">Room ID</th>
                      <th className="pb-2 pr-4">Check In</th>
                      <th className="pb-2 pr-4">Total</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent_bookings.map((b: any) => (
                      <tr key={b._id} className="border-b border-white/5 text-white/70">
                        <td className="py-2 pr-4 font-mono text-xs">{b._id?.slice(-8)}</td>
                        <td className="py-2 pr-4 font-mono text-xs">{b.room_id?.slice(-8)}</td>
                        <td className="py-2 pr-4">{b.check_in_date?.split('T')[0]}</td>
                        <td className="py-2 pr-4">${b.total_price}</td>
                        <td className="py-2">
                          <span className={b.status === 'Confirmed' ? 'tag-available' : 'tag-booked'}>{b.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Rooms Tab */}
      {activeTab === 'rooms' && (
        <div>
          {roomsLoading && <div className="flex justify-center py-16"><div className="spinner" /></div>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-left border-b border-white/10">
                  {['Room No.', 'Type', 'Price/Night', 'Status', 'Description'].map(h => (
                    <th key={h} className="pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rooms.map((room: any) => (
                  <tr key={room._id} className="border-b border-white/5 text-white/70 hover:bg-white/5">
                    <td className="py-3 pr-4 font-mono">#{room.roomNumber}</td>
                    <td className="py-3 pr-4 font-semibold text-white">{room.type}</td>
                    <td className="py-3 pr-4 text-purple-400">${room.pricePerNight}</td>
                    <td className="py-3 pr-4">
                      <span className={room.isAvailable ? 'tag-available' : 'tag-booked'}>
                        {room.isAvailable ? 'Available' : 'Booked'}
                      </span>
                    </td>
                    <td className="py-3 text-white/40 text-xs max-w-xs truncate">{room.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div>
          {bookingsLoading && <div className="flex justify-center py-16"><div className="spinner" /></div>}
          <div className="space-y-3">
            {bookings.map((b: any) => (
              <div key={b._id} className="glass rounded-xl p-5 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="text-xs font-mono text-white/40 mb-1">ID: {b._id}</p>
                  <p className="font-semibold text-white">Room: <span className="font-mono text-sm text-purple-400">{b.roomId}</span></p>
                  <p className="text-white/50 text-sm mt-1">
                    {new Date(b.checkInDate).toLocaleDateString()} → {new Date(b.checkOutDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={b.status === 'Cancelled' ? 'tag-booked' : 'tag-available'}>{b.status}</span>
                  <p className="text-xl font-bold text-white">${b.totalPrice}</p>
                  <button
                    onClick={() => handleDeleteBooking(b._id)}
                    className="border border-red-500/30 hover:bg-red-500/10 text-red-400 text-xs px-4 py-2 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          {usersLoading && <div className="flex justify-center py-16"><div className="spinner" /></div>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 text-left border-b border-white/10">
                  {['Name', 'Email', 'Role', 'Actions'].map(h => (
                    <th key={h} className="pb-3 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u._id} className="border-b border-white/5 text-white/70 hover:bg-white/5">
                    <td className="py-3 pr-4 font-semibold text-white">{u.name}</td>
                    <td className="py-3 pr-4">{u.email}</td>
                    <td className="py-3 pr-4">
                      <span className={u.isAdmin ? 'tag-available' : 'text-white/40 text-xs'}>
                        {u.isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="py-3">
                      {!u.isAdmin && (
                        <button
                          onClick={() => handlePromoteUser(u._id)}
                          className="border border-purple-500/30 hover:bg-purple-500/10 text-purple-400 text-xs px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Make Admin
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
