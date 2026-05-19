/**
 * @typedef Todo
 * @property {number} userId
 * @property {number} id
 * @property {string} title
 * @property {boolean} completed
 */

/**
 * @typedef User
 * @property {number} id
 * @property {string} name
 */

/**
 * @typedef TodoService
 * @property {(id: number) => Promise<Todo>} getOne
 * @property {() => Promise<Todo[]>} getAll
 * @property {(id: number, userId: number, title: string, completed: boolean) => Promise<Todo>} updateOne
 * @property {(id: number) => Promise<Todo>} deleteOne
 */

/**
 * @typedef UserService
 * @property {(number) => Promise<User>} getOne
 */

/**
 * @typedef ServiceFactory
 * @property {() => TodoService} createTodoService
 * @property {() => UserService} createUserService
 */
