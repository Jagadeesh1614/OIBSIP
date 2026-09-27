import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAdminAuth } from '../context/AdminAuthContext';

// Deliberately a separate page/route from user login and registration.
export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState(null);
  const { login } = useAdminAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    try {
      const res = await api.adminLogin(form);
      login(res.token, res.admin);
      nav('/admin/orders');
    } catch (e) { setErr(e.message); }
  };

  return (
    <div className="card">
      <h1>Admin login</h1>
      <form onSubmit={submit}>
        <label>Email</label>
        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <label>Password</label>
        <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        <button type="submit">Login</button>
      </form>
      {err && <p className="msg err">{err}</p>}
      <p className="hint">Admin accounts are created via the seed script, not this site.</p>
    </div>
  );
}
