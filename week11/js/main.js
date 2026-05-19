import {DevServiceFactory} from "./service.js";
import {TodoController, TodoOpenView, TodoTotalView, TodoItemsView} from './todo.js';

const factory = DevServiceFactory();

const todoService = factory.createTodoService();
const userService = factory.createUserService();

const todoController = TodoController(todoService, userService);

// binding of the main view

document.getElementById('plus').onclick    = _ => todoController.addTodo();

// create the sub-views, incl. binding

TodoItemsView(todoController, document.getElementById('todoContainer'));
TodoTotalView(todoController, document.getElementById('numberOfTasks'));
TodoOpenView (todoController, document.getElementById('openTasks'));
