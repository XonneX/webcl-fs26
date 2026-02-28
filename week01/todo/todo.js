// requires ../observable/observable.js
// requires ./fortuneService.js
// requires ../dataflow/dataflow.js
const toUpperCase = text => text.toLocaleUpperCase();
const lengthValidatorMax = (max) => {
    return text => {
        if (text.length > max) {
            return `Text must be at shorter than ${max} characters.`;
        }
        return "";
    }
}
const lengthValidatorMin = (min) => {
    return text => {
        if (text.length < min) {
            return `Text must be at least ${min} characters long.`;
        }
        return "";
    }
}

const TodoController = () => {

    const Todo = () => {
        const textAttr = ObservableWithValidation(
            ObservableWithTransformers(
                Observable("text"), [toUpperCase],
            ), [lengthValidatorMax(20), lengthValidatorMin(3)]);

        // Only allow checking a Todo when it's valid
        const doneAttr = ObservableWithTransformers(Observable(false), [(newValue) => {
            if (textAttr.getValidationResult() === "") {
                return newValue;
            }
            return false;
        }]);

        // Uncheck invalid Todos
        textAttr.onValidationChange((validationResult) => {
            if (textAttr.getValidationResult() === "") {
                return;
            }
            doneAttr.setValue(false);
        });

        return {
            getDone:            doneAttr.getValue,
            setDone:            doneAttr.setValue,
            onDoneChanged:      doneAttr.onChange,
            setText:            textAttr.setValue,
            getText:            textAttr.getValue,
            onTextChanged:      textAttr.onChange,
            onValidationChange: textAttr.onValidationChange,
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

const TodoItemsView = (todoController, rootElement) => {

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
        checkboxElement.onclick = _ => {
            todo.setDone(checkboxElement.checked);
            checkboxElement.checked = todo.getDone();
        }
        deleteButton.onclick    = _ => todoController.removeTodo(todo);

        todoController.onTodoRemove( (removedTodo, removeMe) => {
            if (removedTodo !== todo) return;
            rootElement.removeChild(inputElement);
            rootElement.removeChild(deleteButton);
            rootElement.removeChild(checkboxElement);
            removeMe();
        } );

        todo.onTextChanged(() => inputElement.value = todo.getText());
        todo.onDoneChanged(() => checkboxElement.checked = todo.getDone());
        todo.onValidationChange(msg => {
            inputElement.setCustomValidity(msg);
            inputElement.reportValidity();
        });

        rootElement.appendChild(deleteButton);
        rootElement.appendChild(inputElement);
        rootElement.appendChild(checkboxElement);
    };

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
        numberOfOpenTasksElement.textContent = "" + todoController.numberOfOpenTasks();

    // binding

    todoController.onTodoAdd(todo => {
        render();
        todo.onDoneChanged(render);
    });
    todoController.onTodoRemove(render);
};


