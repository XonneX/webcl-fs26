export {ProdServiceFactory};

/**
 * @returns {TodoService}
 * @constructor
 */
const ProdTodoService = (baseUrl) => {
    const getOne = (id) => {
        console.debug("ProdTodoService::getOne", id);

        return fetch(`${baseUrl}/todos/${id}`)
            .then(res => res.json());
    };

    const getAll = async () => {
        console.debug("ProdTodoService::getAll");

        return fetch(`${baseUrl}/todos`)
            .then(res => res.json());
    };

    const updateOne = async (id, userId, title, completed) => {
        console.debug("ProdTodoService::updateOne", id, userId, title, completed);

        return fetch(`${baseUrl}/todos/${id}`, {
            method: "PUT",
            body: JSON.stringify({
                id: id,
                userId: userId,
                title: title,
                completed: completed,
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
            .then(res => res.json());
    };

    const createOne = async (userId, title, completed) => {
        console.debug("ProdTodoService::createOne", userId, title, completed);

        return fetch(`${baseUrl}/todos`, {
            method: "POST",
            body: JSON.stringify({
                userId: userId,
                title: title,
                completed: completed,
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
            .then(res => res.json());
    };

    const deleteOne = async (id) => {
        console.debug("ProdTodoService::deleteOne", id);

        return fetch(`${baseUrl}/todos/${id}`, {method: 'DELETE'})
            .then(res => res.json());
    };

    return {
        getOne,
        getAll,
        updateOne,
        createOne,
        deleteOne,
    };
};

/**
 * @returns {UserService}
 * @constructor
 */
const ProdUserService = (baseUrl) => {
    const usersById = new Map();

    const getOne = async (id) => {
        console.debug("ProdUserService::getOne", id);

        if (usersById.has(id)) {
            console.debug("ProdUserService::getOne cache hit", id);
            return usersById.get(id);
        }

        const promise = fetch(`${baseUrl}/users/${id}`)
            .then(res => res.json())
            .catch(err => {
                usersById.delete(id);
                throw err;
            });

        usersById.set(id, promise);

        return promise;
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
const ProdServiceFactory = (baseUrl) => {
    const createTodoService = () => {
        return ProdTodoService(baseUrl);
    };

    const createUserService = () => {
        return ProdUserService(baseUrl);
    };

    return {
        createTodoService,
        createUserService,
    };
};
