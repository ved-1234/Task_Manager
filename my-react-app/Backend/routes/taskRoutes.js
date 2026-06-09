const express = require('express');

const router = express.Router();

const protect =
  require('../middleware/authMiddleware');

const {

  getTasks,
  createTask,
  updateTask,
  deleteTask,
  moveTask

} = require('../controllers/taskController');


// GET TASKS
router.get(
  '/',
  protect,
  getTasks
);


// CREATE TASK
router.post(
  '/',
  protect,
  createTask
);


// UPDATE TASK
router.put(
  '/:id',
  protect,
  updateTask
);


// DELETE TASK
router.delete(
  '/:id',
  protect,
  deleteTask
);


// MOVE TASK
router.patch(
  '/:id/move',
  protect,
  moveTask
);


module.exports = router;