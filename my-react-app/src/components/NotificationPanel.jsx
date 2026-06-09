import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { useSocket } from '../SocketContext';

const TYPE_META = {
  assignment: { icon: '👤', color: '#a78bfa', label: 'Assignment', bg: 'rgba(167,139,250,0.12)' },
  comment:    { icon: '💬', color: '#38bdf8', label: 'Comment',    bg: 'rgba(56,189,248,0.12)'  },
  due:        { icon: '⏰', color: '#f59e0b', label: 'Due',        bg: 'rgba(245,158,11,0.12)'  },
  move:       { icon: '↔',  color: '#34d399', label: 'Moved',      bg: 'rgba(52,211,153,0.12)'  },
  mention:    { icon: '@',  color: '#f87171', label: 'Mention',    bg: 'rgba(248,113,113,0.12)' },
  invite:     { icon: '🏢', color: '#818cf8', label: 'Workspace',  bg: 'rgba(129,140,248,0.12)' },
};

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date);
  const m = Math.floor(diff / 60000);
  if (m < 1)   return 'just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)   return `${d}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function NotificationPanel({ onClose }) {
  const [notifs, setNotifs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');
  const [clearing, setClearing] = useState(false);
  const { socket } = useSocket();
  const panelRef   = useRef();

  // Fetch on mount
  useEffect(() => {
    api.get('/auth/notifications')
      .then(r => setNotifs(r.data.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    // Close on outside click
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Live socket notifications
  useEffect(() => {
    if (!socket) return;
    const handler = (n) => setNotifs(prev => [{ ...n, read: false }, ...prev]);
    socket.on('notification', handler);
    return () => socket.off('notification', handler);
  }, [socket]);

  const markAllRead = async () => {
    try {
      await api.put('/auth/notifications/read');
      setNotifs(p => p.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const clearAll = async () => {
    setClearing(true);
    try {
      await api.delete('/auth/notifications');
      setNotifs([]);
    } catch {}
    finally { setClearing(false); }
  };

  const unread   = notifs.filter(n => !n.read).length;
  const filtered = filter === 'unread' ? notifs.filter(n => !n.read) : notifs;

  return (
    <div className="notif-panel" ref={panelRef}>

      {/* ── HEADER ── */}
      <div className="notif-header">
        <div className="notif-title-row">
          <span className="notif-title">Notifications</span>
          {unread > 0 && <span className="notif-badge">{unread > 99 ? '99+' : unread}</span>}
        </div>

        <div className="notif-actions-row">
          {/* Filter tabs */}
          <div className="notif-filter-tabs">
            <button
              className={`notif-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All <span className="tab-count">{notifs.length}</span>
            </button>
            <button
              className={`notif-tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread <span className="tab-count">{unread}</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="notif-header-btns">
            {unread > 0 && (
              <button className="notif-action-btn" onClick={markAllRead} title="Mark all as read">
                ✓ Read
              </button>
            )}
            {notifs.length > 0 && (
              <button
                className="notif-action-btn danger"
                onClick={clearAll}
                disabled={clearing}
                title="Clear all notifications"
              >
                {clearing ? '…' : '🗑'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="notif-list">

        {/* Loading */}
        {loading && (
          <div className="notif-state">
            <div className="spinner sm" />
            <p>Loading notifications…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="notif-state">
            <span className="notif-empty-icon">
              {filter === 'unread' ? '✅' : '🔔'}
            </span>
            <p className="notif-empty-title">
              {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </p>
            <p className="notif-empty-sub">
              {filter === 'unread'
                ? 'You have no unread notifications'
                : 'Notifications for tasks, comments and due dates will appear here'}
            </p>
          </div>
        )}

        {/* Notification items */}
        {filtered.map((n, i) => {
          const meta = TYPE_META[n.type] || { icon: '🔔', color: '#a78bfa', label: 'Notification', bg: 'rgba(167,139,250,0.12)' };
          return (
            <div key={i} className={`notif-item ${!n.read ? 'unread' : ''}`}>

              {/* Unread indicator stripe */}
              {!n.read && <div className="notif-unread-stripe" style={{ background: meta.color }} />}

              {/* Icon */}
              <div
                className="notif-icon-box"
                style={{ background: meta.bg, border: `1px solid ${meta.color}25` }}
              >
                <span>{meta.icon}</span>
              </div>

              {/* Content */}
              <div className="notif-content">
                <div className="notif-meta-row">
                  <span className="notif-type-tag" style={{ color: meta.color }}>
                    {meta.label}
                  </span>
                  <span className="notif-time">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="notif-msg">{n.message}</p>
              </div>

              {/* Unread dot */}
              {!n.read && <span className="notif-dot" style={{ background: meta.color }} />}
            </div>
          );
        })}
      </div>

      {/* ── FOOTER ── */}
      {notifs.length > 0 && (
        <div className="notif-footer">
          <span>{notifs.length} notification{notifs.length !== 1 ? 's' : ''} total</span>
        </div>
      )}
    </div>
  );
}
