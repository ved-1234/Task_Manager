const cron = require('node-cron');

const Task = require('../models/Task');

const startTaskNotifier = () => {

  // EVERY MINUTE
  cron.schedule('* * * * *', async () => {

    console.log('Checking due tasks...');

    try {

      const now = new Date();

      const tasks = await Task.find({

        dueDate: { $lte: now },

        notified: false,

        status: { $ne: 'completed' }

      }).populate('userId');

      for (const task of tasks) {

        global.io.emit('taskDue', {

          message: `Task "${task.title}" is due!`,

          task,
        });

        task.notified = true;

        await task.save();

        console.log(`Notification sent for: ${task.title}`);
      }

    } catch (err) {

      console.log(err);
    }
  });
};

module.exports = startTaskNotifier;