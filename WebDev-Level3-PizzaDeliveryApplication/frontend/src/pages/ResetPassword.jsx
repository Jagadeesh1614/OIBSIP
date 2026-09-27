import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null); setMsg(null);
    try {
      const res = await api.resetPassword({ email: params.get('email'), token: params.get('token'), password });
      setMsg(res.message);
    } catch (e) { setErr(e.message); }
  };

  return (
    <div className="card">
      <h1>Reset password</h1>
      <form onSubmit={submit}>
        <label>New password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <p className="hint">At least 8 characters, including 1 number.</p>
        <button type="submit">Reset password</button>
      </form>
      {msg && <p className="msg ok">{msg}</p>}
      {err && <p className="msg err">{err}</p>}
      <p className="alt"><Link to="/login">Back to login</Link></p>
    </div>
  );
}
