import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null); setMsg(null);
    try {
      const res = await api.register(form);
      setMsg(res.message);
    } catch (e) { setErr(e.message); }
  };

  return (
    <div className="card">
      <h1>Create account</h1>
      <form onSubmit={submit}>
        <label>Name</label>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <label>Email</label>
        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <label>Password</label>
        <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        <p className="hint">At least 8 characters, including 1 number.</p>
        <button type="submit">Register</button>
      </form>
      {msg && <p className="msg ok">{msg} (dev tip: open your email inbox for the verification link)</p>}
      {err && <p className="msg err">{err}</p>}
      <p className="alt">Already have an account? <Link to="/login">Log in</Link></p>
      <p className="alt"><Link to="/verify-email">Have a verification link?</Link></p>
    </div>
  );
}
