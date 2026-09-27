import { useState } from 'react';
import { api } from '../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    const res = await api.forgotPassword({ email }).catch(e => ({ message: e.message }));
    setMsg(res.message);
  };

  return (
    <div className="card">
      <h1>Forgot password</h1>
      <form onSubmit={submit}>
        <label>Email</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <button type="submit">Send reset link</button>
      </form>
      {msg && <p className="msg ok">{msg}</p>}
    </div>
  );
}
