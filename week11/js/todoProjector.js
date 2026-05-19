
export { todoItemProjector }

const todoTextProjector = todo => {

    const inputElement = document.createElement("INPUT");
    inputElement.type = "text";
    inputElement.size = 42;

    inputElement.oninput = _ => todo.setText(inputElement.value);

    todo.onTextChanged(_ => inputElement.value = todo.getText());

    todo.onTextValidChanged(
        valid => valid
          ? inputElement.classList.remove("invalid")
          : inputElement.classList.add("invalid")
    );

    todo.onTextEditableChanged(
        isEditable => isEditable
        ? inputElement.removeAttribute("readonly")
        : inputElement.setAttribute("readonly", true));

    return inputElement;
};

const todoDoneProjector = todo => {

    const checkboxElement = document.createElement("INPUT");
    checkboxElement.type = "checkbox";

    checkboxElement.onclick = _ => todo.setDone(checkboxElement.checked);

    todo.onDoneChanged(
        done => done
        ? checkboxElement.setAttribute("checked", true)
        : checkboxElement.removeAttribute("checked")
    );

    return checkboxElement;
};

const userProjector = todo => {
    const spanElement = document.createElement("div");
    spanElement.classList.add("user", "tooltip");

    const textElement = document.createElement("span");

    const tooltipElement = document.createElement("span");
    tooltipElement.classList.add("tooltiptext");

    spanElement.append(textElement, tooltipElement);

    todo.onUserChange(user => {
        if (user) {
            textElement.textContent = "By " + user.name;
            tooltipElement.innerHTML =
                `Username: ${user.username}<br>Email: ${user.email}`;
        } else {
            textElement.textContent = "By Unknown";
            tooltipElement.textContent = "";
        }
    });

    return spanElement;
};

const todoItemProjector = (todoController, rootElement, todo) => {

    const deleteButton      = document.createElement("Button");
    deleteButton.setAttribute("class","delete");
    deleteButton.innerHTML  = "&times;";
    deleteButton.onclick    = _ => todoController.removeTodo(todo);

    const inputElement      = todoTextProjector(todo);
    const checkboxElement   = todoDoneProjector(todo);

    const spacer1Element = document.createElement("span");
    const userElement = userProjector(todo);
    const spacer2Element = document.createElement("span");

    todoController.onTodoRemove( (removedTodo, removeMe) => {
        if (removedTodo !== todo) return;
        rootElement.removeChild(deleteButton);
        rootElement.removeChild(inputElement);
        rootElement.removeChild(checkboxElement);
        rootElement.removeChild(spacer1Element);
        rootElement.removeChild(userElement);
        rootElement.removeChild(spacer2Element);
        removeMe();
    } );

    rootElement.appendChild(deleteButton);
    rootElement.appendChild(inputElement);
    rootElement.appendChild(checkboxElement);
    rootElement.appendChild(spacer1Element);
    rootElement.appendChild(userElement);
    rootElement.appendChild(spacer2Element);
};
