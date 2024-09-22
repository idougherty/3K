class Input {
    static pressedKeys = new Set();
    static keyDownEvents = new Map();
    static keyUpEvents = new Map();

    static handleKeyDown({code}) {
        Input.pressedKeys.add(code);
        let event = Input.keyDownEvents.get(code);
        if(event != undefined) 
            event();
    }

    static handleKeyUp({code}) {
        Input.pressedKeys.delete(code);
        let event = Input.keyUpEvents.get(code);
        if(event != undefined) 
            event();
    }

    static isKeyPressed(key) {
        return Input.pressedKeys.has(key);
    }

    static registerKeyDownEvent(code, event) {
        Input.keyDownEvents.set(code, event);
    }

    static registerKeyUpEvent(code, event) {
        console.log(event);
        Input.keyUpEvents.set(code, event);
    }
}

window.addEventListener("keydown", Input.handleKeyDown);
window.addEventListener("keyup", Input.handleKeyUp);