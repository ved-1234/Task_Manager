const TaskCard = ({ task, onToggle, onEdit, onDelete }) => {
  const date = new Date(task.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className={`task-card ${task.status === 'completed' ? 'task-done' : ''}`}>
      <div className="task-card-top">
        <button
          className={`task-checkbox ${task.status === 'completed' ? 'checked' : ''}`}
          onClick={() => onToggle(task._id)}
          title="Toggle complete"
        >
          {task.status === 'completed' && '✓'}
        </button>
        <div className="task-info">
          <h4 className="task-title">{task.title}</h4>
          {task.description && <p className="task-desc">{task.description}</p>}
        </div>
      </div>

      <div className="task-card-bottom">
        <span className={`task-priority task-priority-${task.priority}`}>
          {task.priority}
        </span>
        <span className="task-date">{date}</span>
        <div className="task-actions">
          <button className="btn-icon" onClick={() => onEdit(task)} title="Edit">✎</button>
          <button className="btn-icon btn-danger" onClick={() => onDelete(task._id)} title="Delete">✕</button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
