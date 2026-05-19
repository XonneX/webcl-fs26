import {ObservableList} from "../../kolibri-dist-2026-02-15/kolibri/observable.js";
import {Attribute, EDITABLE, VALID, VALUE} from "../../kolibri-dist-2026-02-15/kolibri/presentationModel.js";
import {Scheduler} from "../../kolibri-dist-2026-02-15/kolibri/dataflow/dataflow.js";
import {todoItemProjector} from "./todoProjector.js";

export {TodoController, TodoItemsView, TodoTotalView, TodoOpenView}

/**
 *
 * @param {TodoService} todoService
 * @param {UserService} userService
 * @constructor
 */
const TodoController = (todoService, userService) => {

    const Todo = () => {                               // facade
        const textAttr = Attribute("text");
        const doneAttr = Attribute(false);
        const idAttr = Attribute(-1);
        const userIdAttr = Attribute(1);
        const userAttr = Attribute(undefined);

        // textAttr.setConverter( input => input.toUpperCase() );
        textAttr.setValidator(input => input.length >= 3);

        // business rules / constraints (the text is only editable if not done)
        doneAttr.getObs(VALUE).onChange(isDone => textAttr.getObs(EDITABLE, !isDone).setValue(!isDone));

        return {
            getDone: doneAttr.getObs(VALUE).getValue,
            setDone: doneAttr.getObs(VALUE).setValue,
            onDoneChanged: doneAttr.getObs(VALUE).onChange,
            getText: textAttr.getObs(VALUE).getValue,
            setText: textAttr.setConvertedValue,
            onTextChanged: textAttr.getObs(VALUE).onChange,
            onTextValidChanged: textAttr.getObs(VALID).onChange,
            onTextEditableChanged: textAttr.getObs(EDITABLE).onChange,
            getId: idAttr.getObs(VALUE).getValue,
            setId: idAttr.getObs(VALUE).setValue,
            getUserId: userIdAttr.getObs(VALUE).getValue,
            setUserId: userIdAttr.getObs(VALUE).setValue,
            getUser: userAttr.getObs(VALUE).getValue,
            setUser: userAttr.getObs(VALUE).setValue,
            onUserChange: userAttr.getObs(VALUE).onChange,
        }
    };

    const todoModel = ObservableList([]); // observable array of Todos, this state is private

    const updateTodo = todo => {
        return (value, oldValue) => {
            if (value === oldValue) {
                return;
            }

            todoService.updateOne(
                todo.getId(),
                todo.getUserId(),
                todo.getText(),
                todo.getDone(),
            );
        };
    };

    const addTodo = () => {
        const newTodo = Todo();
        userService.getOne(newTodo.getUserId())
            .then(user => {
                newTodo.setUser(user);
            })
            .catch(err => console.log(err));

        const updateHandler = updateTodo(newTodo);

        newTodo.onDoneChanged(updateHandler);
        newTodo.onTextChanged(updateHandler);
        todoModel.add(newTodo);

        return newTodo;
    };

    todoService.getAll()
        .then(todos => {
            for (let todo of todos) {
                const newTodo = Todo();
                newTodo.setId(todo.id);
                newTodo.setText(todo.title);
                newTodo.setDone(todo.completed);
                newTodo.setUserId(todo.userId);
                userService.getOne(todo.userId)
                    .then(user => {
                        newTodo.setUser(user);
                    })
                    .catch(err => console.log(err));

                const updateHandler = updateTodo(newTodo);
                newTodo.onDoneChanged(updateHandler);
                newTodo.onTextChanged(updateHandler);

                todoModel.add(newTodo);
            }
        })
        .catch(err => console.error(err))
    ;

    todoModel.onDel((todo, _) => {
        todoService.deleteOne(todo.getId());
    });

    todoModel.onAdd((todo, _) => {
        if (todo.getId() !== -1) {
            return;
        }

        todoService.createOne(todo.getUserId(), todo.getText(), todo.getDone())
            .then((updatedTodo) => {
                todo.setId(updatedTodo.id);
            });
    });

    return {
        numberOfTodos: todoModel.count,
        numberOfOpenTasks: () => todoModel.countIf(todo => !todo.getDone()),
        addTodo: addTodo,
        removeTodo: todoModel.del,
        onTodoAdd: todoModel.onAdd,
        onTodoRemove: todoModel.onDel,
        removeTodoRemoveListener: todoModel.removeDeleteListener, // only for the test case, not used below
    }
};


// View-specific parts

const TodoItemsView = (todoController, rootElement) => {

    const render = todo =>
        todoItemProjector(todoController, rootElement, todo);

    // binding

    todoController.onTodoAdd(render);

    // we do not expose anything as the view is totally passive.
};

const TodoTotalView = (todoController, numberOfTasksElement) => {

    const render = () =>
        numberOfTasksElement.innerText = "" + todoController.numberOfTodos();

    // binding

    todoController.onTodoAdd(render);
    todoController.onTodoRemove(render);
};

const TodoOpenView = (todoController, numberOfOpenTasksElement) => {

    const render = () =>
        numberOfOpenTasksElement.innerText = "" + todoController.numberOfOpenTasks();

    // binding

    todoController.onTodoAdd(todo => {
        render();
        todo.onDoneChanged(render);
    });
    todoController.onTodoRemove(render);
};
