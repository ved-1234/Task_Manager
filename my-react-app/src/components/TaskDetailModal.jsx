import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../AuthContext';


const STATUS_META = {
  todo:        { label: 'To Do',       color: '#5b5bff' },
  inprogress:  { label: 'In Progress', color: '#f59e0b' },
  completed:   { label: 'Completed',   color: '#22c55e' },
};
const PRIORITY_CLS = { low: 'tag-low', medium: 'tag-medium', high: 'tag-high' };
const fetchMembers = async () => {

    const response = await fetch(
        `http://localhost:5000/api/workspace/${workspaceId}/members`
    );

    const data = await response.json();

    setMembers(data);
};
export default function TaskDetailModal({ task: init, onClose, onUpdate }) {
  const { user }    = useAuth();
  const { socket }  = useSocket();
  const [task, setTask]       = useState(init);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Live updates via socket
  useEffect(() => {
    if (!socket) return;
    const h = (updated) => {
      if (updated._id === task._id) {
        setTask(updated);
        onUpdate && onUpdate(updated);
      }
    };
    socket.on('taskUpdated', h);
    return () => socket.off('taskUpdated', h);
  }, [socket, task._id]);

  const sendComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSending(true);
    try {
      const res = await api.post(`/tasks/${task._id}/comments`, { text: comment.trim() });
      setTask(res.data.task);
      setComment('');
      onUpdate && onUpdate(res.data.task);
    } catch {}
    finally { setSending(false); }
  };

  const deleteComment = async (commentId) => {
    setDeleting(commentId);
    try {
      const res = await api.delete(`/tasks/${task._id}/comments/${commentId}`);
      setTask(res.data.task);
      onUpdate && onUpdate(res.data.task);
    } catch {}
    finally { setDeleting(null); }
  };

  const dueDate  = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date() && task.status !== 'completed';
  const statusMeta = STATUS_META[task.status] || STATUS_META.todo;

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-detail">
        {/* Header badges */}
        <div className="detail-badges">
          <span className={`task-tag ${PRIORITY_CLS[task.priority]}`}>{task.priority} priority</span>
          <span className="detail-status-badge" style={{ color: statusMeta.color, borderColor: `${statusMeta.color}30`, background: `${statusMeta.color}12` }}>
            {statusMeta.label}
          </span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Title & Description */}
        <h2 className="detail-title">{task.title}</h2>
        {task.description && <p className="detail-desc">{task.description}</p>}

        {/* Meta grid */}
        <div className="detail-meta-grid">
          <div className="detail-meta-card">
            <span className="meta-icon">👤</span>
            <div>
              <p className="meta-card-label">Created by</p>
              <div className="meta-user">
                <span className="mini-avatar">{task.userId?.name?.[0]?.toUpperCase()}</span>
                <span>{task.userId?.name}</span>
              </div>
            </div>
          </div>

          {dueDate && (
            <div className={`detail-meta-card ${isOverdue ? 'overdue-card' : ''}`}>
              <span className="meta-icon">{isOverdue ? '⚠' : '📅'}</span>
              <div>
                <p className="meta-card-label">{isOverdue ? 'Overdue!' : 'Due Date'}</p>
                <p className="meta-card-val" style={{ color: isOverdue ? '#fb7185' : 'inherit' }}>
                  {dueDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          )}

          <div className="detail-meta-card">
            <span className="meta-icon">🗓</span>
            <div>
              <p className="meta-card-label">Created</p>
              <p className="meta-card-val">{new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* Assigned team members */}
        {task.assignedTo?.length > 0 && (
          <div className="detail-section">
            <h4 className="detail-section-title">👥 Assigned To</h4>
            <div className="assignees-display">
              {task.assignedTo.map(u => (
                <div key={u._id} className="assignee-display-item">
                  <span className="mini-avatar lg">{u.name[0].toUpperCase()}</span>
                  <div>
                    <p className="assignee-display-name">{u.name}</p>
                    <p className="assignee-display-email">{u.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {task.tags?.length > 0 && (
          <div className="detail-section">
            <h4 className="detail-section-title">🏷 Tags</h4>
            <div className="tag-row">
              {task.tags.map(t => <span key={t} className="tag-chip">{t}</span>)}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="detail-section">
          <h4 className="detail-section-title">
            💬 Comments
            <span className="comments-count-badge">{task.comments?.length || 0}</span>
          </h4>

          <div className="comments-list">
            {!task.comments?.length && (
              <div className="no-comments">
                <span>💭</span>
                <p>No comments yet — be the first!</p>
              </div>
            )}

            {task.comments?.map(c => (
              <div key={c._id} className="comment-item">
                <span className="mini-avatar">{c.userId?.name?.[0]?.toUpperCase()}</span>
                <div className="comment-body">
                  <div className="comment-meta">
                    <strong>{c.userId?.name}</strong>
                    <span className="comment-time">{timeAgo(c.createdAt)}</span>
                    {c.userId?._id === user._id && (
                      <button
                        className="comment-delete"
                        onClick={() => deleteComment(c._id)}
                        disabled={deleting === c._id}
                      >
                        {deleting === c._id ? '…' : '✕'}
                      </button>
                    )}
                  </div>
                  <p>{c.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Comment input */}
          <form className="comment-form" onSubmit={sendComment}>
            <span className="mini-avatar">{user?.name?.[0]?.toUpperCase()}</span>
            <div className="comment-input-wrap">
              <input
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Write a comment…"
                disabled={sending}
              />
              <button type="submit" className="comment-send-btn" disabled={sending || !comment.trim()}>
                {sending ? '…' : '↑'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
