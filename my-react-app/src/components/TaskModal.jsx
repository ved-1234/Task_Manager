import { useState, useEffect } from 'react';
import api from '../api';

const STATUSES = [
  { id: 'todo', label: '○ To Do' },
  { id: 'inprogress', label: '◑ In Progress' },
  { id: 'completed', label: '● Completed' },
];

export default function TaskModal({
  task,
  onClose,
  onSave,
  defaultStatus = 'todo',
}) {

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: defaultStatus,
    dueDate: '',
    assignedTo: '',
    tags: '',
  });

  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(true);

  // FETCH TEAM MEMBERS
  useEffect(() => {

    const fetchMembers = async () => {

      try {

        const res = await api.get('/auth/users');

        setMembers(res.data.users || []);

      } catch (err) {

        console.log(err);

      } finally {

        setMembersLoading(false);
      }
    };

    fetchMembers();

  }, []);

  // EDIT TASK DATA
  useEffect(() => {

    if (task) {

      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',

        dueDate: task.dueDate
          ? task.dueDate.slice(0, 10)
          : '',

        assignedTo:
          task.assignedTo?._id ||
          task.assignedTo ||
          '',

        tags: task.tags?.join(', ') || '',
      });
    }

  }, [task]);

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // SUBMIT
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!form.title.trim()) {

      return setError('Title is required');
    }

    setLoading(true);

    setError('');

    try {

      await onSave({
        ...form,

        tags: form.tags
          ? form.tags
              .split(',')
              .map(tag => tag.trim())
              .filter(Boolean)
          : [],

        dueDate: form.dueDate || null,
      });

      onClose();

    } catch (err) {

      setError(
        err.response?.data?.message ||
        'Failed to save task'
      );

    } finally {

      setLoading(false);
    }
  };

  const today =
    new Date().toISOString().split('T')[0];

  return (

    <div
      className="modal-overlay"
      onClick={(e) =>
        e.target === e.currentTarget &&
        onClose()
      }
    >

      <div className="modal modal-wide">

        {/* HEADER */}
        <div className="modal-header">

          <h3>
            {task
              ? '✎ Edit Task'
              : '+ New Task'}
          </h3>

          <button
            className="modal-close"
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        {/* ERROR */}
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit}>

          {/* TITLE */}
          <div className="form-group">

            <label>Title *</label>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="What needs to be done?"
              autoFocus
            />

          </div>

          {/* DESCRIPTION */}
          <div className="form-group">

            <label>Description</label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Add more details..."
              rows={3}
            />

          </div>

          {/* STATUS + PRIORITY + DATE */}
          <div className="form-row-3">

            {/* STATUS */}
            <div className="form-group">

              <label>Status</label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >

                {STATUSES.map((s) => (

                  <option
                    key={s.id}
                    value={s.id}
                  >
                    {s.label}
                  </option>

                ))}

              </select>

            </div>

            {/* PRIORITY */}
            <div className="form-group">

              <label>Priority</label>

              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >

                <option value="low">
                  🟢 Low
                </option>

                <option value="medium">
                  🟡 Medium
                </option>

                <option value="high">
                  🔴 High
                </option>

              </select>

            </div>

            {/* DUE DATE */}
            <div className="form-group">

              <label>Due Date</label>

              <input
                type="date"
                min={today}
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
              />

            </div>

          </div>

          {/* BUTTONS */}
          <div className="modal-actions">

            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >

              {loading
                ? 'Saving...'
                : task
                ? 'Update Task'
                : 'Create Task'}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}