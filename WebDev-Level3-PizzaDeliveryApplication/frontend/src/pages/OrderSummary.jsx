import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

const BASE_PRICE = 249; // flat price for a custom build, in rupees; adjust as needed

export default function OrderSummary() {
  const { state } = useLocation();
  const { token } = useAuth();
  const nav = useNavigate();
  const [err, setErr] = useState(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => { if (!state) nav('/build'); }, [state, nav]);
  if (!state) return null;

  const amount = BASE_PRICE + state.vegetables.length * 20;

  const pay = async () => {
    setErr(null); setPaying(true);
    try {
      const order = await api.createOrder({ ...state, amount }, token);

      // Razorpay checkout in TEST mode: clicking "Success" in the test modal
      // confirms the order, per the assignment brief.
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Pizza App',
        description: 'Custom pizza order',
        order_id: order.razorpayOrderId,
        handler: async (response) => {
          try {
            await api.verifyPayment({ orderId: order.orderId, ...response }, token);
            nav('/dashboard');
          } catch (e) { setErr(e.message); }
        },
        modal: { ondismiss: () => setPaying(false) },
        theme: { color: '#c0392b' },
      });
      rzp.open();
    } catch (e) { setErr(e.message); setPaying(false); }
  };

  return (
    <div className="card">
      <h1>Order summary</h1>
      <ul className="summary-list">
        <li><b>Base:</b> {state.base}</li>
        <li><b>Sauce:</b> {state.sauce}</li>
        <li><b>Cheese:</b> {state.cheese}</li>
        <li><b>Vegetables:</b> {state.vegetables.length ? state.vegetables.join(', ') : 'None'}</li>
      </ul>
      <p className="price">Total: ₹{amount}</p>
      <button className="primary" onClick={pay} disabled={paying}>
        {paying ? 'Opening checkout...' : 'Pay with Razorpay (test mode)'}
      </button>
      {err && <p className="msg err">{err}</p>}
    </div>
  );
}
