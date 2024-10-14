class Basketball extends PhysCircle {

    static SIZE = 10;

    is_handled = false;
    hand_ref = null;

    constructor(pos) {

        const MATERIAL_BBALL = {
            density: 0.5,
            restitution: .98,
            s_friction: 0.12,
            d_friction: 0.08,
            color: "#a75",
        };

        super(pos, Basketball.SIZE, MATERIAL_BBALL);

        this.tag = "ball";
        this.on_collision = this.handle_possession;
    }

    handle_possession(_, other) {
        if(!other.tag.startsWith("player-hand") || 
            other.is_handling || 
            other.shot_cooldown > 0)
            return;

        if(this.is_handled && this.hand_ref != other) {
            this.hand_ref.release_ball();
        }

        other.acquire_ball(this);
    }

    step() {
        if(this.is_handled) {
            this.pos.x = this.hand_ref.pos.x;
            this.pos.y = this.hand_ref.pos.y;

            this.vel.x = 0;
            this.vel.y = 0;
        }
    }
}