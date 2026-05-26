import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { room, total, subtotal, taxesAndFees, hasHighTea, hasCookery, highTeaPrice, cookeryPrice, basePrice } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [processing, setProcessing] = useState(false);
  const [paypalStep, setPaypalStep] = useState('select'); // 'select' | 'login' | 'confirm' | 'success'
  
  // PayPal login form
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalPassword, setPaypalPassword] = useState('');

  // Credit card form
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

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
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  const dateStr = `${today.toLocaleDateString('en-US', options)} – ${tomorrow.toLocaleDateString('en-US', options)}`;

  const processBookingAndPayment = async (method) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to complete your payment!');
      navigate('/auth');
      return;
    }

    let userId = 'demo-user';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload && payload.id) userId = payload.id;
    } catch (e) {
      console.error('Error decoding token', e);
    }

    setProcessing(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // 1. Create Booking
      const bookingRes = await axios.post('http://localhost:5000/api/bookings', {
        userId,
        roomId: room._id,
        checkInDate: today,
        checkOutDate: tomorrow,
        totalPrice: parseFloat(total.toFixed(2))
      }, config);

      // 2. Process Payment
      await axios.post('http://localhost:5000/api/payments', {
        bookingId: bookingRes.data._id,
        userId,
        amount: parseFloat(total.toFixed(2)),
        paymentMethod: method
      }, config);

      setPaypalStep('success');
      setTimeout(() => {
        navigate('/bookings');
      }, 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  const handlePaypalLogin = (e) => {
    e.preventDefault();
    if (!paypalEmail || !paypalPassword) return;
    setPaypalStep('confirm');
  };

  const handlePaypalConfirm = () => {
    processBookingAndPayment('PayPal');
  };

  const handleCreditCardPay = (e) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvv || !cardName) return;
    processBookingAndPayment('Credit Card');
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) return v.substring(0, 2) + '/' + v.substring(2, 4);
    return v;
  };

  // Success Screen
  if (paypalStep === 'success') {
    return (
      <div className="payment-page animate-fade-in">
        <div className="payment-success-screen">
          <div className="success-icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
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
              <span>{paymentMethod === 'paypal' ? 'PayPal' : 'Credit Card'}</span>
            </div>
            <div className="success-detail-row">
              <span>Stay</span>
              <span>1 Night</span>
            </div>
          </div>
          <div className="success-loader-bar">
            <div className="success-loader-fill"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page animate-fade-in">
      <div className="payment-header-nav">
        <span className="back-arrow" onClick={() => navigate('/checkout', { state: { room } })}>←</span>
        SECURE PAYMENT
        <div className="payment-secure-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          SSL Encrypted
        </div>
      </div>

      <div className="payment-grid">
        {/* Left: Payment Methods */}
        <div className="payment-left">
          <div className="payment-methods-section">
            <h3 className="payment-section-title">SELECT PAYMENT METHOD</h3>
            
            {/* PayPal Tab */}
            <div 
              className={`payment-method-tab ${paymentMethod === 'paypal' ? 'active' : ''}`}
              onClick={() => { setPaymentMethod('paypal'); setPaypalStep('select'); }}
            >
              <div className="method-tab-header">
                <div className={`method-radio ${paymentMethod === 'paypal' ? 'selected' : ''}`}>
                  <div className="radio-dot"></div>
                </div>
                <div className="method-tab-brand">
                  <div className="paypal-logo">
                    <span className="paypal-pay">Pay</span><span className="paypal-pal">Pal</span>
                  </div>
                </div>
              </div>

              {paymentMethod === 'paypal' && (
                <div className="method-tab-body">
                  {paypalStep === 'select' && (
                    <div className="paypal-select-step">
                      <p className="paypal-info-text">
                        You will be redirected to PayPal to complete your payment securely.
                      </p>
                      <button 
                        className="paypal-checkout-btn"
                        onClick={() => setPaypalStep('login')}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H9.76c-.52 0-.96.382-1.04.901l-.638 4.1-.015.08-.456 2.892-.015.032z"/>
                        </svg>
                        Continue with PayPal
                      </button>
                      <div className="paypal-benefits">
                        <div className="benefit-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                          Buyer Protection Included
                        </div>
                        <div className="benefit-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                          No card details shared
                        </div>
                        <div className="benefit-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                          One-touch checkout
                        </div>
                      </div>
                    </div>
                  )}

                  {paypalStep === 'login' && (
                    <div className="paypal-login-modal">
                      <div className="paypal-modal-header">
                        <div className="paypal-logo large">
                          <span className="paypal-pay">Pay</span><span className="paypal-pal">Pal</span>
                        </div>
                      </div>
                      <form onSubmit={handlePaypalLogin} className="paypal-login-form">
                        <div className="paypal-input-group">
                          <label>Email or mobile number</label>
                          <input 
                            type="email"
                            value={paypalEmail}
                            onChange={(e) => setPaypalEmail(e.target.value)}
                            placeholder="email@example.com"
                            required
                          />
                        </div>
                        <div className="paypal-input-group">
                          <label>Password</label>
                          <input 
                            type="password"
                            value={paypalPassword}
                            onChange={(e) => setPaypalPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                          />
                        </div>
                        <button type="submit" className="paypal-login-btn">Log In</button>
                        <div className="paypal-login-footer">
                          <a href="#" onClick={(e) => e.preventDefault()}>Having trouble logging in?</a>
                          <div className="paypal-divider">
                            <span>or</span>
                          </div>
                          <button 
                            type="button" 
                            className="paypal-signup-btn"
                            onClick={() => {
                              setPaypalEmail('guest@hotel.com');
                              setPaypalPassword('demo123');
                            }}
                          >
                            Use Demo Account
                          </button>
                        </div>
                      </form>
                      <button className="paypal-modal-back" onClick={() => setPaypalStep('select')}>
                        ← Back to payment methods
                      </button>
                    </div>
                  )}

                  {paypalStep === 'confirm' && (
                    <div className="paypal-confirm-step">
                      <div className="paypal-confirm-header">
                        <div className="paypal-logo large">
                          <span className="paypal-pay">Pay</span><span className="paypal-pal">Pal</span>
                        </div>
                        <p className="paypal-confirm-email">{paypalEmail}</p>
                      </div>
                      <div className="paypal-confirm-amount">
                        <div className="confirm-label">Payment Amount</div>
                        <div className="confirm-value">${total.toFixed(2)} USD</div>
                      </div>
                      <div className="paypal-confirm-details">
                        <div className="confirm-detail-row">
                          <span>To</span>
                          <span>The Grand Ceylon Hotels</span>
                        </div>
                        <div className="confirm-detail-row">
                          <span>Room</span>
                          <span>{room.type} Suite</span>
                        </div>
                        <div className="confirm-detail-row">
                          <span>Stay</span>
                          <span>1 Night</span>
                        </div>
                      </div>
                      <button 
                        className="paypal-pay-now-btn"
                        onClick={handlePaypalConfirm}
                        disabled={processing}
                      >
                        {processing ? (
                          <span className="btn-spinner"></span>
                        ) : (
                          <>Pay ${total.toFixed(2)} Now</>
                        )}
                      </button>
                      <button className="paypal-modal-back" onClick={() => setPaypalStep('login')}>
                        ← Change account
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Credit Card Tab */}
            <div 
              className={`payment-method-tab ${paymentMethod === 'card' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('card')}
            >
              <div className="method-tab-header">
                <div className={`method-radio ${paymentMethod === 'card' ? 'selected' : ''}`}>
                  <div className="radio-dot"></div>
                </div>
                <div className="method-tab-brand">
                  <span className="card-brand-text">Credit / Debit Card</span>
                  <div className="card-brand-icons">
                    <div className="card-icon visa">VISA</div>
                    <div className="card-icon mastercard">MC</div>
                    <div className="card-icon amex">AMEX</div>
                  </div>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div className="method-tab-body">
                  <form onSubmit={handleCreditCardPay} className="card-form">
                    <div className="card-input-group">
                      <label>Cardholder Name</label>
                      <input 
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Name on card"
                        required
                      />
                    </div>
                    <div className="card-input-group">
                      <label>Card Number</label>
                      <div className="card-number-input-wrapper">
                        <input 
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                          required
                        />
                        <div className="card-type-indicator">
                          {cardNumber.startsWith('4') && <span className="detected-card">VISA</span>}
                          {cardNumber.startsWith('5') && <span className="detected-card">MC</span>}
                          {cardNumber.startsWith('3') && <span className="detected-card">AMEX</span>}
                        </div>
                      </div>
                    </div>
                    <div className="card-input-row">
                      <div className="card-input-group">
                        <label>Expiry Date</label>
                        <input 
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/YY"
                          maxLength="5"
                          required
                        />
                      </div>
                      <div className="card-input-group">
                        <label>CVV</label>
                        <div className="cvv-input-wrapper">
                          <input 
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="•••"
                            maxLength="4"
                            required
                          />
                          <svg className="cvv-help-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <button 
                      type="submit" 
                      className="card-pay-btn"
                      disabled={processing}
                    >
                      {processing ? (
                        <span className="btn-spinner"></span>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                          </svg>
                          Pay ${total.toFixed(2)}
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="payment-trust-section">
            <div className="trust-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5c2483" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Secure Payment</span>
            </div>
            <div className="trust-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5c2483" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>256-bit SSL</span>
            </div>
            <div className="trust-badge">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5c2483" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
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
              <div className="payment-room-guests">2 Adults • 1 Night</div>
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
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              Getaway Deal 2026 Applied
            </div>
          </div>

          <div className="payment-cancellation-note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <strong>Free cancellation</strong> available up to 24 hours before check-in.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
