import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.getMenu().then(setMenu).catch(() => {});
    api.myOrders(token).then(setOrders).catch(() => {});
  }, [token]);

  // Poll for order status updates every 5s so "In Kitchen" -> "Sent to Delivery"
  // shows up without a manual refresh (matches the real-time-tracking requirement).
  useEffect(() => {
    const id = setInterval(() => {
      api.myOrders(token).then(setOrders).catch(() => {});
    }, 5000);
    return () => clearInterval(id);
  }, [token]);

  return (
    <div className="page">
      <header className="topbar">
        <h1>Hi, {user?.name}</h1>
        <button onClick={logout}>Logout</button>
      </header>

      <section>
        <div className="section-head">
          <h2>Pizza varieties</h2>
          <Link className="btn" to="/build">Build your own pizza</Link>
        </div>
        <div className="grid">
          {menu.map(p => (
            <div className="tile" key={p._id}>
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <p className="price">₹{p.price}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Your orders</h2>
        {orders.length === 0 && <p className="empty">No orders yet — build a pizza to get started.</p>}
        <ul className="order-list">
          {orders.map(o => (
            <li key={o._id} className="order-row">
              <div>
                <b>{o.base}</b>, {o.sauce}, {o.cheese}
                {o.vegetables?.length ? ` + ${o.vegetables.join(', ')}` : ''}
              </div>
              <span className={`status status-${o.status.replace(/\s/g, '-')}`}>{o.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
