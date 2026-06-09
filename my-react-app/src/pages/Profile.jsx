import { useState } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';

export default function Profile({ onClose }) {
  const { user, refreshUser } = useAuth();
  const [tab, setTab]         = useState('profile');

  // Profile state
  const [profile, setProfile] = useState({ name: user?.name || '', bio: user?.bio || '' });

  // Password state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showCon, setShowCon] = useState(false);

  const [msg, setMsg]     = useState('');
  const [err, setErr]     = useState('');
  const [loading, setLoading] = useState(false);

  const flash = (ok, text) => {
    if (ok) { setMsg(text); setErr(''); }
    else    { setErr(text); setMsg(''); }
    setTimeout(() => { setMsg(''); setErr(''); }, 3500);
  };

  // Password strength
  const strength = (() => {
    const p = pwForm.newPassword;
    if (!p) return null;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    if (s <= 1) return { label: 'Weak',   cls: 'weak',   pct: 25 };
    if (s <= 2) return { label: 'Fair',   cls: 'fair',   pct: 50 };
    if (s <= 3) return { label: 'Good',   cls: 'good',   pct: 75 };
    return              { label: 'Strong', cls: 'strong', pct: 100 };
  })();

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) return flash(false, 'Name cannot be empty');
    setLoading(true);
    try {
      await api.put('/auth/profile', { name: profile.name.trim(), bio: profile.bio });
      await refreshUser();
      flash(true, '✓ Profile updated successfully!');
    } catch (e) { flash(false, e.response?.data?.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirm)
      return flash(false, 'All fields are required');
    if (pwForm.newPassword.length < 6)
      return flash(false, 'New password must be at least 6 characters');
    if (pwForm.newPassword !== pwForm.confirm)
      return flash(false, 'Passwords do not match');
    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      flash(true, '✓ Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e) { flash(false, e.response?.data?.message || 'Failed to change password'); }
    finally { setLoading(false); }
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-wide">
        <div className="modal-header">
          <h3>⚙ Account Settings</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Tab bar */}
        <div className="profile-tabs">
          <button className={`ptab ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')}>
            👤 Profile
          </button>
          <button className={`ptab ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}>
            🔒 Password
          </button>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}
        {err && <div className="alert alert-error">{err}</div>}

        {/* ── PROFILE TAB ── */}
        {tab === 'profile' && (
          <form onSubmit={saveProfile}>
            <div className="profile-avatar-section">
              <div className="avatar-big">{initials}</div>
              <div className="avatar-info">
                <p className="avatar-name">{user?.name}</p>
                <p className="avatar-email">{user?.email}</p>
                <p className="avatar-hint">Avatar is generated from your initials</p>
              </div>
            </div>

            <div className="form-group">
              <label>Display Name</label>
              <input
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                placeholder="Your name"
              />
            </div>

            <div className="form-group">
              <label>Bio <span className="label-opt">(optional)</span></label>
              <textarea
                value={profile.bio}
                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell your team a bit about yourself…"
                rows={3}
                maxLength={200}
              />
              <span className="char-count">{profile.bio.length}/200</span>
            </div>

            <div className="form-group">
              <label>Email</label>
              <input value={user?.email} disabled className="input-disabled"/>
              <span className="input-hint">Email cannot be changed</span>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {/* ── PASSWORD TAB ── */}
        {tab === 'password' && (
          <form onSubmit={changePassword}>
            <div className="pw-info-box">
              🔐 Choose a strong password with letters, numbers and symbols.
            </div>

            <div className="form-group">
              <label>Current Password</label>
              <div className="pw-wrap">
                <input
                  type={showCur ? 'text' : 'password'}
                  value={pwForm.currentPassword}
                  onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  placeholder="Enter your current password"
                />
                <button type="button" className="pw-toggle" onClick={() => setShowCur(v => !v)} tabIndex={-1}>
                  {showCur ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>New Password</label>
              <div className="pw-wrap">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={pwForm.newPassword}
                  onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  placeholder="Min 6 characters"
                />
                <button type="button" className="pw-toggle" onClick={() => setShowNew(v => !v)} tabIndex={-1}>
                  {showNew ? '🙈' : '👁'}
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
              <label>Confirm New Password</label>
              <div className="pw-wrap">
                <input
                  type={showCon ? 'text' : 'password'}
                  value={pwForm.confirm}
                  onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
                  placeholder="Repeat new password"
                />
                <button type="button" className="pw-toggle" onClick={() => setShowCon(v => !v)} tabIndex={-1}>
                  {showCon ? '🙈' : '👁'}
                </button>
              </div>
              {pwForm.confirm && (
                <p className={`match-hint ${pwForm.newPassword === pwForm.confirm ? 'ok' : 'no'}`}>
                  {pwForm.newPassword === pwForm.confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            <div className="pw-rules">
              {[
                { ok: pwForm.newPassword.length >= 6,          text: 'At least 6 characters' },
                { ok: /[A-Z]/.test(pwForm.newPassword),        text: 'One uppercase letter' },
                { ok: /[0-9]/.test(pwForm.newPassword),        text: 'One number' },
                { ok: /[^A-Za-z0-9]/.test(pwForm.newPassword), text: 'One special character' },
              ].map((rule, i) => (
                <span key={i} className={`pw-rule ${rule.ok ? 'ok' : ''}`}>
                  {rule.ok ? '✓' : '○'} {rule.text}
                </span>
              ))}
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Updating…' : 'Change Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
