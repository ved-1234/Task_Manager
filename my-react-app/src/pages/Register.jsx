import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Register() {
  const [form, setForm]         = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw]     = useState(false);
  const [showCon, setShowCon]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    if (!form.name || !form.email || !form.password || !form.confirm) return 'All fields are required';
    if (form.name.length < 2)                    return 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email))      return 'Enter a valid email';
    if (form.password.length < 6)                 return 'Password must be at least 6 characters';
    if (form.password !== form.confirm)           return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);
    setLoading(true); setError('');
    try { await register(form.name, form.email, form.password); navigate('/dashboard'); }
    catch (e) { setError(e.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // Password strength
  const strength = (() => {
    const p = form.password;
    if (!p) return null;
    let score = 0;
    if (p.length >= 6)  score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { label: 'Weak',   cls: 'weak',   pct: 25 };
    if (score <= 2) return { label: 'Fair',   cls: 'fair',   pct: 50 };
    if (score <= 3) return { label: 'Good',   cls: 'good',   pct: 75 };
    return              { label: 'Strong', cls: 'strong', pct: 100 };
  })();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-icon">✦</span>
          <h1>TaskFlow</h1>
        </div>
        <h2>Create account</h2>
        <p className="auth-sub">Start managing tasks with your team</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input value={form.name} onChange={set('name')} placeholder="Your name" autoComplete="name"/>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email"/>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="pw-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="Min 6 characters"
                autoComplete="new-password"
              />
              <button type="button" className="pw-toggle" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
            {strength && (
              <div className="strength-wrap">
                <div className="strength-track">
                  <div className={`strength-fill ${strength.cls}`} style={{ width: `${strength.pct}%` }}/>
                </div>
                <span className={`strength-label ${strength.cls}`}>{strength.label}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div className="pw-wrap">
              <input
                type={showCon ? 'text' : 'password'}
                value={form.confirm}
                onChange={set('confirm')}
                placeholder="Repeat password"
                autoComplete="new-password"
              />
              <button type="button" className="pw-toggle" onClick={() => setShowCon(v => !v)} tabIndex={-1}>
                {showCon ? '🙈' : '👁'}
              </button>
            </div>
            {form.confirm && (
              <p className={`match-hint ${form.password === form.confirm ? 'ok' : 'no'}`}>
                {form.password === form.confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
