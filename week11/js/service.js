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

// Services

/**
 * @returns {TodoService}
 * @constructor
 */
const DevTodoService = () => {
    const getOne = async (id) => {
        console.debug("DevTodoService::getOne", id);

        return {
            id,
            title: "Dev Todo " + id,
            userId: 1,
        };
    };

    const getAll = async () => {
        console.debug("DevTodoService::getAll");

        return [
            await getOne(1),
            await getOne(2),
        ];
    };

    const updateOne = async (id, userId, title, completed) => {
        console.debug("DevTodoService::updateOne", id, userId, title, completed);

        return {
            id,
            userId,
            title,
            completed
        };
    };

    const deleteOne = async (id) => {
        console.debug("DevTodoService::deleteOne", id);
    };

    return {
        getOne,
        getAll,
        updateOne,
        deleteOne,
    };
};

/**
 * @returns {UserService}
 * @constructor
 */
const DevUserService = () => {
    const getOne = async (id) => {
        console.debug("DevUserService::getOne", id);

        return {
            id,
            name: "Dev User " + id,
        }
    }

    return {
        getOne,
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
