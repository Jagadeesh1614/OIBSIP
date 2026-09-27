import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminInventory() {
  const { token, admin, logout } = useAdminAuth();
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState(null);

  const load = () => api.getInventory(token).then(setItems).catch(() => {});
  useEffect(() => { load(); }, [token]);

  const save = async (item, stock, threshold) => {
    setMsg(null);
    try {
      await api.updateStock(item._id, { stock, threshold }, token);
      setMsg(`${item.name} updated.`);
      load();
    } catch (e) { setMsg(e.message); }
  };

  const groups = ['base', 'sauce', 'cheese', 'vegetable'];

  return (
    <div className="page">
      <header className="topbar">
        <h1>Inventory — {admin?.name}</h1>
        <div>
          <a className="btn" href="/admin/orders">Orders</a>
          <button onClick={logout}>Logout</button>
        </div>
      </header>
      {msg && <p className="msg ok">{msg}</p>}
      {groups.map(g => (
        <section key={g}>
          <h2 style={{ textTransform: 'capitalize' }}>{g}s</h2>
          <table className="inv-table">
            <thead><tr><th>Name</th><th>Stock</th><th>Threshold</th><th></th></tr></thead>
            <tbody>
              {items.filter(i => i.type === g).map(item => (
                <InvRow key={item._id} item={item} onSave={save} />
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}

function InvRow({ item, onSave }) {
  const [stock, setStock] = useState(item.stock);
  const [threshold, setThreshold] = useState(item.threshold);
  const low = item.stock < item.threshold;

  return (
    <tr className={low ? 'low-stock' : ''}>
      <td>{item.name}{low && <span className="badge">low</span>}</td>
      <td><input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} /></td>
      <td><input type="number" min="0" value={threshold} onChange={e => setThreshold(e.target.value)} /></td>
      <td><button onClick={() => onSave(item, stock, threshold)}>Save</button></td>
    </tr>
  );
}
