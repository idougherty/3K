class Input {
    static pressed_keys = new Set();
    static key_down_events = new Map();
    static key_up_events = new Map();

    static handle_key_down({code}) {
        Input.pressed_keys.add(code);
        let event = Input.key_down_events.get(code);
        if(event != undefined) 
            event();
    }

    static handle_key_up({code}) {
        Input.pressed_keys.delete(code);
        let event = Input.key_up_events.get(code);
        if(event != undefined) 
            event();
    }

    static is_key_pressed(key) {
        return Input.pressed_keys.has(key);
    }

    static register_key_down_event(code, event) {
        Input.key_down_events.set(code, event);
    }

    static register_key_up_event(code, event) {
        Input.key_up_events.set(code, event);
    }
}

window.addEventListener("keydown", Input.handle_key_down);
window.addEventListener("keyup", Input.handle_key_up);