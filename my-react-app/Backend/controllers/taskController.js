const Task = require('../models/Task');


// GET TASKS
const getTasks = async (req, res) => {

  try {

    const { priority, search } = req.query;

    const filter = {

      userId: req.user._id
    };

    if (
      priority &&
      priority !== 'all'
    ) {

      filter.priority = priority;
    }

    if (search) {

      filter.title = {

        $regex: search,

        $options: 'i'
      };
    }

    const tasks = await Task.find(filter)

      .sort({
        createdAt: -1
      });

    res.json({ tasks });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      message: 'Server error'
    });
  }
};


// CREATE TASK
const createTask = async (req, res) => {

  try {

    const {
      title,
      description,
      priority,
      status,
      dueDate
    } = req.body;

    const task = await Task.create({

      title,
      description,
      priority,
      status,
      dueDate,

      userId: req.user._id
    });

    res.status(201).json({ task });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      message: 'Server error'
    });
  }
};


// UPDATE TASK
const updateTask = async (req, res) => {

  try {

    const task = await Task.findOne({

      _id: req.params.id,

      userId: req.user._id
    });

    if (!task) {

      return res.status(404).json({

        message: 'Task not found'
      });
    }

    const {
      title,
      description,
      priority,
      status,
      dueDate
    } = req.body;

    if (title !== undefined)
      task.title = title;

    if (description !== undefined)
      task.description = description;

    if (priority !== undefined)
      task.priority = priority;

    if (status !== undefined)
      task.status = status;

    if (dueDate !== undefined)
      task.dueDate = dueDate;

    await task.save();

    res.json({ task });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      message: 'Server error'
    });
  }
};


// DELETE TASK
const deleteTask = async (req, res) => {

  try {

    const task =
      await Task.findOneAndDelete({

        _id: req.params.id,

        userId: req.user._id
      });

    if (!task) {

      return res.status(404).json({

        message: 'Task not found'
      });
    }

    res.json({

      message: 'Task deleted successfully'
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      message: 'Server error'
    });
  }
};


// MOVE TASK
const moveTask = async (req, res) => {

  try {

    const { status } = req.body;

    const task = await Task.findOne({

      _id: req.params.id,

      userId: req.user._id
    });

    if (!task) {

      return res.status(404).json({

        message: 'Task not found'
      });
    }

    task.status = status;

    await task.save();


    // PRIVATE NOTIFICATION
    req.app
      .get('io')
      .to(task.userId.toString())
      .emit('taskUpdated', task);


    // DUE DATE CHECK
    if (task.dueDate) {

      const today =
        new Date().toDateString();

      const due =
        new Date(task.dueDate).toDateString();

      if (today === due) {

        req.app
          .get('io')
          .to(task.userId.toString())
          .emit('dueTask', {

            message: `Task Due: ${task.title}`,

            task
          });
      }
    }

    res.json({

      success: true,

      task
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      message: 'Server error'
    });
  }
};

const getNotifications = async (req, res) => {

  try {

    const now = new Date();

    const tasks = await Task.find({

      userId: req.user._id,

      dueDate: { $lte: now },

      notified: false,

      status: { $ne: 'completed' }

    });

    const notifications = tasks.map(task => ({

      _id: task._id,

      message: `Task "${task.title}" is due today`

    }));

    await Task.updateMany(

      {

        _id: { $in: tasks.map(t => t._id) }

      },

      {

        $set: { notified: true }

      }

    );

    res.json({

      notifications

    });

  } catch (err) {

    console.log(err);

    res.status(500).json({

      message: 'Server error'

    });
  }
};


module.exports = {

  getTasks,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
  getNotifications
};