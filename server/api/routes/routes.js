'use strict';
module.exports = function(app) {
  var ships = require('../controllers/ship-controller');

  // todoList Routes
  app.route('/ships')
    .get(ships.list);
    //.post(todoList.create_a_task);


  //app.route('/tasks/:taskId')
  //  .get(todoList.read_a_task)
  //  .put(todoList.update_a_task)
  //  .delete(todoList.delete_a_task);
};