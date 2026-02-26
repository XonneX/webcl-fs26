// requires ../observable/observable.js
// requires ./fortuneService.js
// requires ../dataflow/dataflow.js
import {ObservableList, Observable} from "../observable/observable.js";
import {Scheduler} from "../dataflow/dataflow.js";
import {fortuneService} from "./fortuneService.js";

export const TodoController = () => {

    const Todo = () => {                                // facade
        const textAttr = Observable("text");            // we currently don't expose it as we don't use it elsewhere
        const doneAttr = Observable(false);
        const errorAttr = Observable("");
        return {
            getDone:        doneAttr.getValue,
            setDone:        doneAttr.setValue,
            onDoneChanged:  doneAttr.onChange,
            setText:        textAttr.setValue,
            getText:        textAttr.getValue,
            onTextChanged:  textAttr.onChange,
            setError:       errorAttr.setValue,
            getError:       errorAttr.getValue,
            onErrorChanged: errorAttr.onChange,
        }
    };

    const todoModel = ObservableList([]); // observable array of Todos, this state is private
    const scheduler = Scheduler();

    const addTodo = () => {
        const newTodo = Todo();
        todoModel.add(newTodo);
        return newTodo;
    };

    const addFortuneTodo = () => {

        const newTodo = Todo();

        todoModel.add(newTodo);
        newTodo.setText('...');

        scheduler.add( ok =>
           fortuneService( text => {        // schedule the fortune service and proceed when done
                   newTodo.setText(text);
                   ok();
               }
           )
        );
    };

    return {
        numberOfTodos:            todoModel.count,
        numberOfOpenTasks:        () => todoModel.countIf(todo => ! todo.getDone() ),
        addTodo:                  addTodo,
        addFortuneTodo:           addFortuneTodo,
        removeTodo:               todoModel.del,
        onTodoAdd:                todoModel.onAdd,
        onTodoRemove:             todoModel.onDel,
        removeTodoRemoveListener: todoModel.removeDeleteListener, // only for the test case, not used below
    }
};


// View-specific parts

export const TodoItemsView = (todoController, rootElement) => {

    const render = todo => {

        function createElements() {
            const template = document.createElement('DIV'); // only for parsing
            template.innerHTML = `
                <button class="delete">&times;</button>
                <input type="text" size="42">
                <input type="checkbox">
            `;
            return template.children;
        }
        const [deleteButton, inputElement, checkboxElement] = createElements();

        inputElement.oninput = _ => todo.setText(inputElement.value);
        checkboxElement.onclick = _ => todo.setDone(checkboxElement.checked);
        deleteButton.onclick    = _ => todoController.removeTodo(todo);

        todoController.onTodoRemove( (removedTodo, removeMe) => {
            if (removedTodo !== todo) return;
            rootElement.removeChild(inputElement);
            rootElement.removeChild(deleteButton);
            rootElement.removeChild(checkboxElement);
            removeMe();
        } );

        todo.onTextChanged(() => inputElement.value = todo.getText());
        todo.onErrorChanged(() => inputElement.setCustomValidity(todo.getError()));

        rootElement.appendChild(deleteButton);
        rootElement.appendChild(inputElement);
        rootElement.appendChild(checkboxElement);
    };

    // binding

    todoController.onTodoAdd(render);

    // we do not expose anything as the view is totally passive.
};

export const TodoTotalView = (todoController, numberOfTasksElement) => {

    const render = () =>
        numberOfTasksElement.innerText = "" + todoController.numberOfTodos();

    // binding

    todoController.onTodoAdd(render);
    todoController.onTodoRemove(render);
};

export const TodoOpenView = (todoController, numberOfOpenTasksElement) => {

    const render = () =>
        numberOfOpenTasksElement.textContent = "" + todoController.numberOfOpenTasks();

    // binding

    todoController.onTodoAdd(todo => {
        render();
        todo.onDoneChanged(render);
    });
    todoController.onTodoRemove(render);
};


