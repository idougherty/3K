
class PlayerFactory {

    static CONTROLS = [
        {
            left: "KeyA",
            right: "KeyD",
            up: "KeyW",
            action: "KeyF",
        },
        {
            left: "ArrowLeft",
            right: "ArrowRight",
            up: "ArrowUp",
            action: "KeyM",
        }
    ];

    static COLORS = [
        "#6e6", "#e6e", 
    ];

    static create_player(env, spawn) {
        let controls = PlayerFactory.CONTROLS[Player.ID];
        let color = PlayerFactory.COLORS[Player.ID];

        return new Player(env, spawn, controls, color);
    }
}

class Player {

    static ID = 0;
    static WIDTH = 22;
    static HEIGHT = 45;
    static CORNER = 5;

    static JUMPABLE_TAGS = ["player-body", "ball", "floor", "superball"];

    is_grounded = false;

    constructor(env, pos, controls, color) {
        this.controls = controls;
        this.id = Player.ID++;
        this.collision_mask = `player-${this.id}`;
        
        const [body, hand, ground] = this.init_components(pos, color);

        this.body = body;
        this.hand = hand;
        this.ground_hitbox = ground;

        env.add_object(this.body);
        env.add_object(this.hand);
        env.add_object(this.ground_hitbox);
    }
    
    init_components(pos, color) {
        let body_shape = [
            new Vec2D(0, Player.CORNER),
            new Vec2D(0, Player.HEIGHT - Player.CORNER),
            new Vec2D(Player.CORNER, Player.HEIGHT),
            new Vec2D(Player.WIDTH - Player.CORNER, Player.HEIGHT),
            new Vec2D(Player.WIDTH, Player.HEIGHT - Player.CORNER),
            new Vec2D(Player.WIDTH, Player.CORNER),
            new Vec2D(Player.WIDTH - Player.CORNER, 0),
            new Vec2D(Player.CORNER, 0),
        ];

        const MATERIAL_PLAYER = {
            density: 10,
            restitution: 0,
            s_friction: 0.3,
            d_friction: 0.3,
            color,
        };
        
        let body = new PhysPolygon(pos, body_shape, MATERIAL_PLAYER);
        body.mass = 500;
        body.moi = Infinity;
        body.tag = "player-body"

        let hand_pos = new Vec2D(pos.x, pos.y);
        let hand = new PlayerHand(hand_pos);
        hand.player_ref = this;

        let hitbox_pos = new Vec2D(pos.x, pos.y + Player.HEIGHT / 2);
        let ground_hitbox = new PlayerGroundHitbox(hitbox_pos);
        ground_hitbox.player_ref = this;

        body.masks.push(this.collision_mask);
        hand.masks.push(this.collision_mask);
        ground_hitbox.masks.push(this.collision_mask);

        return [body, hand, ground_hitbox];
    }

    step() {
        this.hand.step();
        this.ground_hitbox.step();

        const is_left = Input.is_key_pressed(this.controls.left);
        const is_right = Input.is_key_pressed(this.controls.right);
        const is_up = Input.is_key_pressed(this.controls.up);

        const max_speed = this.hand.is_handling ? 150 : 200;
        const speed_up = this.is_grounded ? 20 : 10;
        const slow_down = this.is_grounded ? 0.9 : 0.99;

        let acc = 0;

        if(is_right && !is_left) {
            if(Math.abs(this.body.vel.x) < max_speed)
                acc += speed_up;
        } else if (is_left && !is_right) {
            if(Math.abs(this.body.vel.x) < max_speed)
                acc -= speed_up;
        } 
        
        this.body.vel.x += acc;

        if(acc == 0 || Math.sign(acc) != Math.sign(this.body.vel.x)) {
            this.body.vel.x *= slow_down;
        }

        if(is_up && this.is_grounded) {
            this.body.vel.y = -275;
        }

        this.gravity_strength = is_up && this.body.vel.y < 0 ? 400 : 700;
        this.is_grounded = false;
    }
}

class PlayerHand extends PhysCircle {

    static SIZE = 5;
    static ARM_LENGTH = 30;
    static REST_ANGLE = Math.PI / 4;
    static MIN_SHOOTING_ANGLE = -Math.PI * 0.35;
    static MAX_SHOOTING_ANGLE = -Math.PI * 0.75;
    static SHOT_COOLDOWN_TICKS = 45;

    direction = 1;
    shot_charge = 0;
    shot_cooldown = 0;
    is_handling = false;
    is_shooting = false;
    was_action = false;
    player_ref = null;
    ball_ref = null;

    target_angle = PlayerHand.REST_ANGLE;
    arm_angle = PlayerHand.REST_ANGLE;

    constructor(pos) {

        const MATERIAL_HITBOX = {
            density: 0,
            restitution: 0,
            s_friction: 0,
            d_friction: 0,
            color: "#6ae",
        };

        super(pos, PlayerHand.SIZE, MATERIAL_HITBOX);

        this.tag = "player-hand";
    }

    shoot() {
        if(!this.is_handling || !this.is_shooting)
            return;

        const x_strength = this.shot_charge * 225 + 25;
        const y_strength = this.shot_charge * 100 + 175;
        const r_strength = this.shot_charge * 25;

        this.ball_ref.vel.x = this.direction * x_strength + 0.5 * this.player_ref.body.vel.x;
        this.ball_ref.vel.y = -y_strength + 0.5 * this.player_ref.body.vel.y;
        this.ball_ref.rot_vel = -this.direction * r_strength;
        this.ball_ref.is_handled = false;
        this.ball_ref.hand_ref = null;
        this.ball_ref.masks.splice(this.ball_ref.masks.indexOf(this.player_ref.collision_mask), 1);

        this.shot_charge = 0;
        this.shot_cooldown = PlayerHand.SHOT_COOLDOWN_TICKS;
        this.is_handling = false;
        this.is_shooting = false;
        this.ball_ref = null;
    }

    step() {

        const controls = this.player_ref.controls;
        const is_left = Input.is_key_pressed(controls.left);
        const is_right = Input.is_key_pressed(controls.right);
        const is_action = Input.is_key_pressed(controls.action);

        if(is_right && !is_left) {
            this.direction = 1;
        } else if (is_left && !is_right) {
            this.direction = -1;
        }

        if(this.is_handling) {
            // TODO: use Input.register_key_up_event
            if(!this.was_action && is_action)
                this.is_shooting = true;

            if(this.is_shooting) {
                this.shot_charge += 0.015;
                if(this.shot_charge > 1)
                    this.shot_charge = 1;
    
                const t = this.shot_charge;
    
                this.target_angle = (1 - t) * PlayerHand.MIN_SHOOTING_ANGLE + 
                    t * PlayerHand.MAX_SHOOTING_ANGLE;
            }
            
            if(this.was_action && !is_action && this.is_shooting) {
                this.shoot();
            }
        } else if(is_action) {
            this.target_angle = PlayerHand.MIN_SHOOTING_ANGLE;
        }

        if(!is_action || (this.is_handling && !this.is_shooting))
            this.target_angle = PlayerHand.REST_ANGLE;

        this.shot_cooldown -= 1;
        this.arm_angle += 0.15 * (this.target_angle - this.arm_angle);

        let {x, y} = this.player_ref.body.pos;
        const height = y - Player.HEIGHT / 2 + Player.WIDTH / 2;
        this.pos.x = x + this.direction * Math.cos(this.arm_angle) * PlayerHand.ARM_LENGTH;
        this.pos.y = height + Math.sin(this.arm_angle) * PlayerHand.ARM_LENGTH;

        this.was_action = is_action;
    }
}

class PlayerGroundHitbox extends PhysCircle {

    static SIZE = Player.WIDTH / 4;

    constructor(pos) {

        const MATERIAL_HITBOX = {
            density: 0,
            restitution: 0,
            s_friction: 0,
            d_friction: 0,
            color: "#ea6",
        };

        super(pos, PlayerGroundHitbox.SIZE, MATERIAL_HITBOX);
        this.on_collision = this.handle_ground_state;
    }

    handle_ground_state(_, other) {
        if(other != this.player_ref.body && Player.JUMPABLE_TAGS.includes(other.tag))
            this.player_ref.is_grounded = true;
    }

    step() {
        let {x, y} = this.player_ref.body.pos;
        this.pos.x = x;
        this.pos.y = y + Player.HEIGHT / 2;
    }

}
