

const Observable = value => {
    const listeners = [];
    return {
        onChange: callback => {
            listeners.push(callback);
            callback(value, value);
        },
        getValue: ()       => value,
        setValue: newValue => {
            if (value === newValue) return;
            const oldValue = value;
            value = newValue;
            listeners.forEach(callback => callback(value, oldValue));
        }
    }
};


const ObservableList = list => {
    const addListeners = [];
    const delListeners = [];
    const removeAt     = array => index => array.splice(index, 1);
    const removeItem   = array => item  => { const i = array.indexOf(item); if (i>=0) removeAt(array)(i); };
    const listRemoveItem     = removeItem(list);
    const delListenersRemove = removeAt(delListeners);
    return {
        onAdd: listener => addListeners.push(listener),
        onDel: listener => delListeners.push(listener),
        add: item => {
            list.push(item);
            addListeners.forEach( listener => listener(item))
        },
        del: item => {
            listRemoveItem(item);
            const safeIterate = [...delListeners]; // shallow copy as we might change listeners array while iterating
            safeIterate.forEach( (listener, index) => listener(item, () => delListenersRemove(index) ));
        },
        removeDeleteListener: removeItem(delListeners),
        count:   ()   => list.length,
        countIf: pred => list.reduce( (sum, item) => pred(item) ? sum + 1 : sum, 0)
    }
};

const ObservableWithTransformers = (observable, transformers) => {
    let value = observable.getValue();
    transformers.forEach(t => value = t(value));
    observable.setValue(value);
    return {
        onChange: observable.onChange,
        getValue: observable.getValue,
        setValue: newValue => {
            let v = newValue;
            transformers.forEach(t => v = t(v));
            observable.setValue(v);
        }
    }
};

const ObservableWithValidation = (observable, validators) => {
    const validationListeners = [];
    let validationResult = "";
    observable.onChange((newValue, _) => {
        // validation
        const oldValidationResult = validationResult;
        for (let v of validators) {
            validationResult = v(newValue);
            if (validationResult === "") {
                continue;
            }
            break;
        }
        if (oldValidationResult === validationResult) {
            return;
        }
        validationListeners.forEach(callback => callback(validationResult));
    });
    return {
        onChange: observable.onChange,
        getValue: observable.getValue,
        setValue: observable.setValue,
        getValidationResult: () => validationResult,
        onValidationChange: (callback) => validationListeners.push(callback),
    }
};
