import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState(null);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    try {
      const res = await api.login(form);
      login(res.token, res.user);
      nav('/dashboard');
    } catch (e) { setErr(e.message); }
  };

  return (
    <div className="card">
      <h1>Log in</h1>
      <form onSubmit={submit}>
        <label>Email</label>
        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <label>Password</label>
        <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        <button type="submit">Login</button>
      </form>
      {err && <p className="msg err">{err}</p>}
      <p className="alt"><Link to="/forgot-password">Forgot password?</Link></p>
      <p className="alt">New here? <Link to="/register">Create an account</Link></p>
      <p className="alt"><Link to="/admin/login">Admin login</Link></p>
    </div>
  );
}
