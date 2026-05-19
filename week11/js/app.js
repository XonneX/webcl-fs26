export {DevServiceFactory};

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
 * @property {(number) => Promise<Todo>} getTodo
 * @property {() => Promise<Todo[]>} getAll
 */

/**
 * @typedef UserService
 * @property {(number) => Promise<User>} getUser
 */


/**
 * @typedef ServiceFactory
 * @property {() => TodoService} createTodoService
 * @property {() => UserService} createUserService
 */

// Services

/**
 * @returns {TodoService}
 * @constructor
 */
const DevTodoService = () => {
    const getTodo = async (id) => {
        return {
            id,
            title: "Dev Todo " + id,
        };
    };

    const getAll = async () => {
        return [
            await getTodo(1),
            await getTodo(2),
        ];
    };

    return {
        getTodo,
        getAll,
    };
};

/**
 * @returns {UserService}
 * @constructor
 */
const DevUserService = () => {
    const getUser = async (id) => {
        return {
            id,
            name: "Dev User",
        }
    }

    return {
        getUser,
    };
};

// Abstract Factory

/**
 * @returns {ServiceFactory}
 * @constructor
 */
const DevServiceFactory = () => {
    const createTodoService = () => {
        return DevTodoService();
    };

    const createUserService = () => {
        return DevUserService();
    };

    return {
        createTodoService,
        createUserService,
    };
};
