import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import axios from 'axios';

const PAYPAL_CLIENT_ID = 'BAAnnvVaDaF0TyQ4vWjVT8TsnZLwUtv8eUrsYjiSxU6ppN-_rJEwgW2NLPRoctmKm8JCMnC6WkDhtI9ZYI';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { room, total, subtotal, taxesAndFees, hasHighTea, hasCookery, highTeaPrice, cookeryPrice, basePrice, checkInDate, checkOutDate } = location.state || {};

  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  if (!room || !total) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>No booking information found</h2>
        <Link to="/rooms" className="btn">Go back to Rooms</Link>
      </div>
    );
  }

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const parsedCheckIn = checkInDate ? new Date(checkInDate) : today;
  const parsedCheckOut = checkOutDate ? new Date(checkOutDate) : tomorrow;

  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  const dateStr = `${parsedCheckIn.toLocaleDateString('en-US', options)} – ${parsedCheckOut.toLocaleDateString('en-US', options)}`;

  const timeDiff = parsedCheckOut.getTime() - parsedCheckIn.getTime();
  const nights = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));

  const getAuthInfo = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    let userId = 'demo-user';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload && payload.id) userId = payload.id;
    } catch (e) {
      console.error('Error decoding token', e);
    }
    return { token, userId };
  };

  const createBooking = async () => {
    const auth = getAuthInfo();
    if (!auth) {
      alert('Please sign in to complete your payment!');
      navigate('/auth');
      return null;
    }
    const config = { headers: { Authorization: `Bearer ${auth.token}` } };
    const bookingRes = await axios.post('http://localhost:5000/api/bookings', {
      userId: auth.userId,
      roomId: room._id,
      checkInDate: parsedCheckIn.toISOString(),
      checkOutDate: parsedCheckOut.toISOString(),
      totalPrice: parseFloat(total.toFixed(2))
    }, config);
    return { bookingId: bookingRes.data._id, userId: auth.userId, token: auth.token };
  };

  const handlePayPalCreateOrder = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/payments/paypal/create-order', {
        amount: parseFloat(total.toFixed(2)),
        currency: 'USD'
      });
      return res.data.orderId;
    } catch (err) {
      console.error('PayPal create order error:', err);
      alert('Failed to create PayPal order. Please try again.');
      throw err;
    }
  };

  const handlePayPalApprove = async (data) => {
    setProcessing(true);
    try {
      const bookingInfo = await createBooking();
      if (!bookingInfo) return;
      const config = { headers: { Authorization: `Bearer ${bookingInfo.token}` } };
      await axios.post('http://localhost:5000/api/payments/paypal/capture-order', {
        orderId: data.orderID,
        bookingId: bookingInfo.bookingId,
        userId: bookingInfo.userId,
        amount: parseFloat(total.toFixed(2))
      }, config);
      setPaymentSuccess(true);
      setTimeout(() => navigate('/bookings'), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'PayPal payment failed. Please try again.');
      setProcessing(false);
    }
  };

  // ─── Success Screen ───────────────────────────────
  if (paymentSuccess) {
    return (
      <div className="payment-page animate-fade-in">
        <div className="payment-success-screen">
          <div className="success-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h2 className="success-title">Payment Successful!</h2>
          <p className="success-amount">${total.toFixed(2)}</p>
          <p className="success-subtitle">Your booking has been confirmed. Redirecting to your reservations...</p>
          <div className="success-details-card">
            <div className="success-detail-row">
              <span>Room</span>
              <span>{room.type} Suite</span>
            </div>
            <div className="success-detail-row">
              <span>Payment Method</span>
              <span>PayPal</span>
            </div>
            <div className="success-detail-row">
              <span>Stay</span>
              <span>{nights} Night{nights > 1 ? 's' : ''}</span>
            </div>
          </div>
          <div className="success-loader-bar">
            <div className="success-loader-fill"></div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Payment Page ────────────────────────────
  return (
    <PayPalScriptProvider options={{
      'client-id': PAYPAL_CLIENT_ID,
      currency: 'USD',
      intent: 'capture'
    }}>
      <div className="payment-page animate-fade-in">
        <div className="payment-header-nav">
          <span className="back-arrow" onClick={() => navigate('/checkout', { state: { room } })}>←</span>
          SECURE PAYMENT
          <div className="payment-secure-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            SSL Encrypted
          </div>
        </div>

        <div className="payment-grid">
          {/* Left: PayPal Payment */}
          <div className="payment-left">
            <div className="payment-methods-section">
              <h3 className="payment-section-title">COMPLETE YOUR PAYMENT</h3>

              <div className="payment-method-tab active">
                <div className="method-tab-header">
                  <div className="method-radio selected">
                    <div className="radio-dot"></div>
                  </div>
                  <div className="method-tab-brand">
                    <div className="paypal-logo">
                      <span className="paypal-pay">Pay</span><span className="paypal-pal">Pal</span>
                    </div>
                  </div>
                </div>

                <div className="method-tab-body">
                  <div className="paypal-select-step">
                    <p className="paypal-info-text">
                      Complete your payment securely with PayPal. Click the button below to approve the transaction.
                    </p>

                    <div className="paypal-buttons-container">
                      <PayPalButtons
                        style={{
                          layout: 'vertical',
                          color: 'gold',
                          shape: 'rect',
                          label: 'paypal',
                          height: 50
                        }}
                        disabled={processing}
                        createOrder={handlePayPalCreateOrder}
                        onApprove={handlePayPalApprove}
                        onError={(err) => {
                          console.error('PayPal error:', err);
                          alert('PayPal encountered an error. Please try again.');
                        }}
                        onCancel={() => console.log('PayPal payment cancelled')}
                      />
                    </div>

                    <div className="paypal-benefits">
                      <div className="benefit-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                        Buyer Protection Included
                      </div>
                      <div className="benefit-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                        No card details shared with the hotel
                      </div>
                      <div className="benefit-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                        256-bit SSL Encrypted
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="payment-trust-section">
              <div className="trust-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5c2483" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Secure Payment</span>
              </div>
              <div className="trust-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5c2483" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>256-bit SSL</span>
              </div>
              <div className="trust-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5c2483" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>Money-back Guarantee</span>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="payment-right">
            <div className="payment-summary-card">
              <h3 className="payment-summary-title">ORDER SUMMARY</h3>

              <div className="payment-room-info">
                <div className="payment-room-name">{room.type.toUpperCase()}, {room.type} King</div>
                <div className="payment-room-dates">{dateStr}</div>
                <div className="payment-room-guests">2 Adults • {nights} Night{nights > 1 ? 's' : ''}</div>
              </div>

              <div className="payment-line-items">
                <div className="payment-line-item">
                  <span>Room ({room.type})</span>
                  <span>${basePrice.toFixed(2)}</span>
                </div>
                {hasHighTea && (
                  <div className="payment-line-item">
                    <span>High Tea Package</span>
                    <span>${highTeaPrice.toFixed(2)}</span>
                  </div>
                )}
                {hasCookery && (
                  <div className="payment-line-item">
                    <span>Cookery Demo Package</span>
                    <span>${cookeryPrice.toFixed(2)}</span>
                  </div>
                )}
                <div className="payment-line-item subtotal">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="payment-line-item">
                  <span>Taxes & fees</span>
                  <span>${taxesAndFees.toFixed(2)}</span>
                </div>
              </div>

              <div className="payment-total-row">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="payment-promo-tag">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                Getaway Deal 2026 Applied
              </div>
            </div>

            <div className="payment-cancellation-note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div>
                <strong>Free cancellation</strong> available up to 24 hours before check-in.
              </div>
            </div>
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  );
};

export default Payment;
