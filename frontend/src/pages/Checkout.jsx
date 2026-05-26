import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const room = location.state?.room;

  const [hasHighTea, setHasHighTea] = useState(false);
  const [hasCookery, setHasCookery] = useState(false);

  if (!room) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>No room selected</h2>
        <Link to="/rooms" className="btn">Go back to Rooms</Link>
      </div>
    );
  }

  const basePrice = room.pricePerNight;
  const highTeaPrice = 14;
  const cookeryPrice = 50;

  const addonsTotal = (hasHighTea ? highTeaPrice : 0) + (hasCookery ? cookeryPrice : 0);
  const subtotal = basePrice + addonsTotal;
  // Let's assume taxes and fees are roughly 23% based on the screenshot ($90 base + $26.82 tax = $116.82)
  const taxesAndFees = subtotal * 0.298; 
  const total = subtotal + taxesAndFees;

  // Format dates for display
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  const dateStr = `${today.toLocaleDateString('en-US', options)} - ${tomorrow.toLocaleDateString('en-US', options)}`;

  const handleCheckout = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in to complete checkout!');
      navigate('/auth');
      return;
    }

    // Navigate to the Payment page with all cart details
    navigate('/payment', {
      state: {
        room,
        total,
        subtotal,
        taxesAndFees,
        hasHighTea,
        hasCookery,
        highTeaPrice,
        cookeryPrice,
        basePrice
      }
    });
  };

  return (
    <div className="checkout-container animate-fade-in">
      <div className="checkout-success-banner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
        YOU HAVE SUCCESSFULLY CREATED YOUR PROFILE.
      </div>

      <div className="checkout-header-nav">
        <span className="back-arrow" onClick={() => navigate('/rooms')}>←</span> ADD TO YOUR ROOM
      </div>

      <div className="checkout-grid">
        {/* Left Column: Add-ons */}
        <div className="checkout-left">
          <div className="addons-section">
            <h3 className="addons-title">SPECIAL PACKAGES</h3>
            
            {/* Add-on 1 */}
            <div className="addon-box">
              <div className="addon-info">
                <div className="addon-name">HIGH TEA (3:00 P.M. – 5:00 P.M.) SPECIAL HIGH TEA AT YOUR PREFERRED LOCATIO</div>
              </div>
              <div className="addon-action">
                <div className="addon-price">${highTeaPrice}</div>
                <div className="addon-price-meta">Average Per Guest / Stay</div>
                <button 
                  className={`addon-btn ${hasHighTea ? 'added' : ''}`}
                  onClick={() => setHasHighTea(!hasHighTea)}
                >
                  {hasHighTea ? 'Remove' : 'Add details'}
                </button>
              </div>
            </div>

            {/* Add-on 2 */}
            <div className="addon-box">
              <div className="addon-info">
                <div className="addon-name">TRADITIONAL SRI LANKAN COOKERY DEMONSTRATION WITH LUNCH</div>
              </div>
              <div className="addon-action">
                <div className="addon-price">${cookeryPrice}</div>
                <div className="addon-price-meta">Average Per Guest / Stay</div>
                <button 
                  className={`addon-btn ${hasCookery ? 'added' : ''}`}
                  onClick={() => setHasCookery(!hasCookery)}
                >
                  {hasCookery ? 'Remove' : 'Add details'}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Cart */}
        <div className="checkout-right">
          <div className="cart-box">
            <h3 className="cart-title">YOUR CART: 1 ITEM</h3>
            
            <div className="cart-summary-top">
              <div className="cart-total-label">Total ${total.toFixed(2)}</div>
              <div className="cart-total-meta">Including taxes and fees</div>
            </div>

            <div className="cart-item-details">
              <div className="cart-item-header">
                <div className="cart-room-name">{room.type.toUpperCase()}, {room.type} King</div>
                <div className="cart-room-base-price">${basePrice.toFixed(2)}</div>
              </div>
              <div className="cart-room-promo">Room Only - Standard Rate - Getaway Deal 2026</div>
              <div className="cart-room-stay">1 Night stay</div>
              
              {hasHighTea && (
                <div className="cart-item-header" style={{marginTop: '10px'}}>
                  <div className="cart-room-promo" style={{color: '#333'}}>+ High Tea Package</div>
                  <div className="cart-room-base-price">${highTeaPrice.toFixed(2)}</div>
                </div>
              )}
              {hasCookery && (
                <div className="cart-item-header" style={{marginTop: '10px'}}>
                  <div className="cart-room-promo" style={{color: '#333'}}>+ Cookery Demo Package</div>
                  <div className="cart-room-base-price">${cookeryPrice.toFixed(2)}</div>
                </div>
              )}

              <div className="cart-taxes-row">
                <div>Taxes and fees</div>
                <div>${taxesAndFees.toFixed(2)}</div>
              </div>

              <div className="cart-dates">
                {dateStr}<br/>
                2 Adults
              </div>

              <div className="cart-links">
                <span>Edit</span> &bull; <span>Remove</span> &bull; <span>Add coupon</span>
              </div>
            </div>

            <div className="cart-summary-bottom">
              <div className="cart-total-row">
                <div className="cart-total-label-big">Total</div>
                <div className="cart-total-value-big">${total.toFixed(2)}</div>
              </div>
              <div className="cart-total-meta">Including taxes and fees</div>
              
              <button className="cart-checkout-btn" onClick={handleCheckout}>
                View Cart & Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
