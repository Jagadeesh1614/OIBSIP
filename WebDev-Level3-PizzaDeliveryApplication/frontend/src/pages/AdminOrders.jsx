import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAdminAuth } from '../context/AdminAuthContext';

const STATUSES = ['Order Received', 'In Kitchen', 'Sent to Delivery'];

export default function AdminOrders() {
  const { token, admin, logout } = useAdminAuth();
  const [orders, setOrders] = useState([]);

  const load = () => api.allOrders(token).then(setOrders).catch(() => {});
  useEffect(() => { load(); }, [token]);

  const setStatus = async (id, status) => {
    await api.updateOrderStatus(id, status, token);
    load(); // status change is immediately reflected; the user dashboard picks it up via its own polling
  };

  return (
    <div className="page">
      <header className="topbar">
        <h1>Orders — {admin?.name}</h1>
        <div>
          <a className="btn" href="/admin/inventory">Inventory</a>
          <button onClick={logout}>Logout</button>
        </div>
      </header>
      {orders.length === 0 && <p className="empty">No paid orders yet.</p>}
      <ul className="order-list">
        {orders.map(o => (
          <li key={o._id} className="order-row">
            <div>
              <b>{o.user?.name}</b> ({o.user?.email})<br />
              {o.base}, {o.sauce}, {o.cheese}{o.vegetables?.length ? ` + ${o.vegetables.join(', ')}` : ''}
              <br /><span className="hint">₹{(o.amount / 100).toFixed(2)}</span>
            </div>
            <select value={o.status} onChange={e => setStatus(o._id, e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}
