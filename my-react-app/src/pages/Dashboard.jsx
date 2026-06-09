
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import TaskModal from '../components/TaskModal';
import socket from '../socket';

const COLUMNS = [
  { id: 'todo', label: 'To Do', icon: '○', color: '#6b6b8a' },
  { id: 'inprogress', label: 'In Progress', icon: '◑', color: '#f59e0b' },
  { id: 'completed', label: 'Completed', icon: '●', color: '#22c55e' },
];

const PRIORITY_COLORS = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
};




// TASK CARD
const TaskCard = ({
  task,
  onEdit,
  onDelete,
  onDragStart,
  onMove,
  columns
}) => {

  const date = new Date(
    task.createdAt
  ).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric'
    }
  );

  const [menuOpen, setMenuOpen] =
    useState(false);

  const menuRef = useRef();



  useEffect(() => {

    const handler = (e) => {

      if (
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener(
      'mousedown',
      handler
    );

    return () =>
      document.removeEventListener(
        'mousedown',
        handler
      );

  }, []);




  return (
    <div
      className="task-card"
      draggable
      onDragStart={(e) =>
        onDragStart(e, task._id)
      }
    >

      <div className="task-card-header">

        <span
          className="task-priority-dot"
          style={{
            background:
              PRIORITY_COLORS[
                task.priority
              ]
          }}
          title={task.priority}
        />

        <span className="task-date">
          {date}
        </span>

        <div
          className="task-menu-wrap"
          ref={menuRef}
        >

          <button
            className="task-menu-btn"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
          >
            ⋯
          </button>

          {menuOpen && (
            <div className="task-menu">

              {columns
                .filter(
                  c =>
                    c.id !== task.status
                )
                .map(col => (

                  <button
                    key={col.id}
                    onClick={() => {

                      onMove(
                        task._id,
                        col.id
                      );

                      setMenuOpen(false);
                    }}
                  >

                    <span>
                      {col.icon}
                    </span>

                    Move to {col.label}

                  </button>
                ))}

              <div className="task-menu-divider" />

              <button
                onClick={() => {

                  onEdit(task);

                  setMenuOpen(false);
                }}
              >
                ✎ Edit
              </button>

              <button
                className="danger"
                onClick={() => {

                  onDelete(task._id);

                  setMenuOpen(false);
                }}
              >
                ✕ Delete
              </button>

            </div>
          )}
        </div>
      </div>





      <h4 className="task-title">
        {task.title}
      </h4>

      {task.description && (
        <p className="task-desc">
          {task.description}
        </p>
      )}





      <div className="task-card-footer">

        <span
          className={`task-priority-badge priority-${task.priority}`}
        >
          {task.priority}
        </span>

        <div className="task-quick-actions">

          <button
            className="btn-icon-sm"
            onClick={() =>
              onEdit(task)
            }
            title="Edit"
          >
            ✎
          </button>

          <button
            className="btn-icon-sm danger"
            onClick={() =>
              onDelete(task._id)
            }
            title="Delete"
          >
            ✕
          </button>

        </div>
      </div>
    </div>
  );
};






// COLUMN
const KanbanColumn = ({
  column,
  tasks,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onMove,
  isDragOver
}) => {

  return (
    <div
      className={`kanban-column ${
        isDragOver
          ? 'drag-over'
          : ''
      }`}
      onDragOver={(e) =>
        onDragOver(e, column.id)
      }
      onDrop={(e) =>
        onDrop(e, column.id)
      }
    >

      <div className="column-header">

        <div className="column-title">

          <span
            className="column-icon"
            style={{
              color: column.color
            }}
          >
            {column.icon}
          </span>

          <span>
            {column.label}
          </span>

        </div>

        <span className="column-count">
          {tasks.length}
        </span>

      </div>





      <div className="column-body">

        {tasks.length === 0 && (
          <div className="column-empty">
            <span>
              Drop tasks here
            </span>
          </div>
        )}



        {tasks.map(task => (

          <TaskCard
            key={task._id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onDragStart={onDragStart}
            onMove={onMove}
            columns={COLUMNS}
          />
        ))}

      </div>
    </div>
  );
};






// DASHBOARD
const Dashboard = () => {

  const { user, logout } =
    useAuth();

  const [tasks, setTasks] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [notifications, setNotifications] =
    useState([]);

  const [showModal, setShowModal] =
    useState(false);

  const [editingTask, setEditingTask] =
    useState(null);

  const [addToColumn, setAddToColumn] =
    useState('todo');

  const [search, setSearch] =
    useState('');

  const [
    filterPriority,
    setFilterPriority
  ] = useState('all');

  const [darkMode, setDarkMode] =
    useState(() =>
      localStorage.getItem('theme')
      !== 'light'
    );

  const [dragOverCol, setDragOverCol] =
    useState(null);

  const dragTaskId = useRef(null);





  useEffect(() => {

    document.documentElement.setAttribute(
      'data-theme',
      darkMode
        ? 'dark'
        : 'light'
    );

    localStorage.setItem(
      'theme',
      darkMode
        ? 'dark'
        : 'light'
    );

  }, [darkMode]);







  const fetchTasks =
    useCallback(async () => {

      setLoading(true);

      try {

        const params = {};

        if (
          filterPriority !== 'all'
        ) {
          params.priority =
            filterPriority;
        }

        if (search) {
          params.search = search;
        }

        const res = await api.get(
          '/tasks',
          { params }
        );

        setTasks(res.data.tasks || []);

      } catch {

        setError(
          'Failed to load tasks'
        );

      } finally {

        setLoading(false);
      }

    }, [
      search,
      filterPriority
    ]);






  useEffect(() => {

    fetchTasks();

  }, [fetchTasks]);






// DUE DATE NOTIFICATIONS
useEffect(() => {

  if (!tasks?.length) return;

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  tasks.forEach((task) => {

    // ONLY CURRENT USER TASKS
    if (
      task.userId !== user?.id &&
      task.userId?._id !== user?.id
    ) {
      return;
    }

    if (!task.dueDate) return;

    const due = new Date(task.dueDate);

    due.setHours(0, 0, 0, 0);

    const diff =
      Math.ceil(
        (due - today) /
        (1000 * 60 * 60 * 24)
      );

    // UNIQUE KEY
    const notifyKey =
      `due-alert-${task._id}-${task.dueDate}`;

    // ALREADY SHOWN
    if (localStorage.getItem(notifyKey)) {
      return;
    }

    // TODAY
    if (diff === 0) {

      alert(
        `📌 Task Due Today\n\n${task.title}`
      );

      localStorage.setItem(
        notifyKey,
        'shown'
      );
    }

    // TOMORROW
    if (diff === 1) {

      alert(
        `⏰ Task Due Tomorrow\n\n${task.title}`
      );

      localStorage.setItem(
        notifyKey,
        'shown'
      );
    }
  });

}, [tasks, user]);






  // CREATE
  const handleCreate =
    async (data) => {

      await api.post(
        '/tasks',
        {
          ...data,
          status: addToColumn
        }
      );

      fetchTasks();
    };





  // UPDATE
  const handleUpdate =
    async (data) => {

      await api.put(
        `/tasks/${editingTask._id}`,
        data
      );

      fetchTasks();
    };





  // DELETE
  const handleDelete =
    async (id) => {

      if (
        !window.confirm(
          'Delete this task?'
        )
      ) return;

      await api.delete(
        `/tasks/${id}`
      );

      fetchTasks();
    };






  // MOVE
  const handleMove =
    async (id, status) => {

      setTasks(prev =>
        prev.map(task =>
          task._id === id
            ? {
                ...task,
                status
              }
            : task
        )
      );

      try {

        await api.patch(
          `/tasks/${id}/move`,
          { status }
        );

      } catch (err) {

        console.log(err);

        fetchTasks();
      }
    };






  const openAdd = (colId) => {

    setAddToColumn(colId);

    setEditingTask(null);

    setShowModal(true);
  };




  const openEdit = (task) => {

    setEditingTask(task);

    setShowModal(true);
  };




  const closeModal = () => {

    setShowModal(false);

    setEditingTask(null);
  };






  // DRAG START
  const onDragStart = (
    e,
    taskId
  ) => {

    dragTaskId.current =
      taskId;

    e.dataTransfer.setData(
      "taskId",
      taskId
    );

    e.dataTransfer.effectAllowed =
      "move";
  };





  // DRAG OVER
  const onDragOver = (
    e,
    colId
  ) => {

    e.preventDefault();

    e.stopPropagation();

    e.dataTransfer.dropEffect =
      "move";

    setDragOverCol(colId);
  };





  // DROP
  const onDrop = async (
    e,
    colId
  ) => {

    e.preventDefault();

    e.stopPropagation();

    setDragOverCol(null);

    const taskId =
      dragTaskId.current ||
      e.dataTransfer.getData(
        "taskId"
      );

    if (!taskId) return;

    const task = tasks.find(
      t => t._id === taskId
    );

    if (!task) return;

    if (
      task.status === colId
    ) return;



    setTasks(prev =>
      prev.map(t =>
        t._id === taskId
          ? {
              ...t,
              status: colId
            }
          : t
      )
    );



    try {

      await api.patch(
        `/tasks/${taskId}/move`,
        {
          status: colId
        }
      );

    } catch (err) {

      console.log(err);

      fetchTasks();
    }



    dragTaskId.current =
      null;
  };






  const getColumnTasks =
    (colId) =>
      tasks.filter(
        t =>
          t.status === colId
      );

  const total = tasks.length;

  const completed =
    tasks.filter(
      t =>
        t.status ===
        'completed'
    ).length;

  const progress =
    total > 0
      ? Math.round(
          (completed / total)
          * 100
        )
      : 0;






  return (
    <div className="dashboard">

      <header className="dashboard-header">

        <div className="header-left">

          <span className="logo-icon">
            ✦
          </span>

          <span className="logo-text">
            TaskFlow
          </span>

        </div>





        <div className="header-center">

          <div className="search-wrap">

            <span className="search-icon">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={e =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>
        </div>





        <div className="header-right">

          <select
            className="filter-select"
            value={filterPriority}
            onChange={e =>
              setFilterPriority(
                e.target.value
              )
            }
          >

            <option value="all">
              All Priority
            </option>

            <option value="high">
              High
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="low">
              Low
            </option>

          </select>





          <button
            className="theme-toggle"
            onClick={() =>
              setDarkMode(
                !darkMode
              )
            }
          >
            {darkMode
              ? '☀'
              : '☽'}
          </button>





          <div className="user-pill">

            <span className="user-avatar">
              {user?.name?.[0]?.toUpperCase()}
            </span>

            <span className="user-name">
              {user?.name}
            </span>

          </div>





          <button
            className="btn btn-ghost"
            onClick={logout}
          >
            Logout
          </button>

        </div>
      </header>






      <main className="dashboard-main">

        {/* NOTIFICATIONS */}
        {notifications.length > 0 && (

          <div className="notification-container">

            {notifications.map((n) => (

              <div
                key={n.id}
                className="notification-item"
              >
                🔔 {n.message}
              </div>

            ))}

          </div>

        )}



        {/* STATS */}
        <div className="stats-bar">

          <div className="stat-item">

            <span className="stat-val">
              {total}
            </span>

            <span className="stat-lbl">
              Total
            </span>

          </div>





          <div className="stat-item todo-color">

            <span className="stat-val">
              {
                getColumnTasks(
                  'todo'
                ).length
              }
            </span>

            <span className="stat-lbl">
              To Do
            </span>

          </div>





          <div className="stat-item inprogress-color">

            <span className="stat-val">
              {
                getColumnTasks(
                  'inprogress'
                ).length
              }
            </span>

            <span className="stat-lbl">
              In Progress
            </span>

          </div>





          <div className="stat-item done-color">

            <span className="stat-val">
              {completed}
            </span>

            <span className="stat-lbl">
              Completed
            </span>

          </div>





          <div className="stat-progress">

            <div className="progress-label">

              <span>
                Overall Progress
              </span>

              <span>
                {progress}%
              </span>

            </div>

            <div className="progress-bar">

              <div
                className="progress-fill"
                style={{
                  width:
                    `${progress}%`
                }}
              />

            </div>
          </div>
        </div>






        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}






        {/* BOARD */}
        {loading ? (

          <div className="loading-state">

            <div className="spinner" />

            <p>
              Loading tasks...
            </p>

          </div>

        ) : (

          <div className="kanban-board">

            {COLUMNS.map(col => (

              <div
                key={col.id}
                className="kanban-col-wrap"
              >

                <KanbanColumn
                  column={col}
                  tasks={getColumnTasks(
                    col.id
                  )}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  onMove={handleMove}
                  isDragOver={
                    dragOverCol ===
                    col.id
                  }
                />





                <button
                  className="add-task-btn"
                  onClick={() =>
                    openAdd(
                      col.id
                    )
                  }
                >
                  + Add Task
                </button>

              </div>
            ))}

          </div>
        )}

      </main>






      {showModal && (

        <TaskModal
          task={editingTask}
          defaultStatus={addToColumn}
          onClose={closeModal}
          onSave={
            editingTask
              ? handleUpdate
              : handleCreate
          }
        />
      )}

    </div>
  );
};

export default Dashboard;

