import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('Verifying...');

  useEffect(() => {
    const email = params.get('email');
    const token = params.get('token');
    if (!email || !token) { setStatus('Missing verification link details.'); return; }
    api.verifyEmail({ email, token })
      .then(r => setStatus(r.message))
      .catch(e => setStatus(e.message));
  }, [params]);

  return (
    <div className="card">
      <h1>Email verification</h1>
      <p>{status}</p>
      <p className="alt"><Link to="/login">Go to login</Link></p>
    </div>
  );
}
