
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

    static create_player(spawn) {
        let controls = PlayerFactory.CONTROLS[Player.ID];
        let color = PlayerFactory.COLORS[Player.ID];
        return new Player(spawn, controls, color);
    }
}

class Player {

    static ID = 0;

    static JUMPABLE_TAGS = ["player-body", "ball", "floor", "superball"];

    constructor(pos, controls, color) {
        this.controls = controls;
        this.id = Player.ID++;
        
        const [body, hand, ground] = this.init_components(pos, color);

        this.body = body;
        this.hand = hand;
        this.ground_hitbox = ground;

        Game.PHYS_ENV.add_object(this.body);
        Game.PHYS_ENV.add_object(this.hand);
        Game.PHYS_ENV.add_object(this.ground_hitbox);
    }
    
    init_components(pos, color) {
        let body = new PlayerBody(this, pos, color);
        let hand = new PlayerHand(this, pos, color);
        let ground_hitbox = new PlayerGroundHitbox(body, pos);

        return [body, hand, ground_hitbox];
    }

    step() {
        this.body.step();
        this.hand.step();
        this.ground_hitbox.step();
    }
}

class PlayerBody extends PhysPolygon {

    static WIDTH = 22;
    static HEIGHT = 45;
    static CORNER = 5;

    player_ref = null;

    constructor(player_ref, pos, color) {

        let body_shape = [
            new Vec2D(0, PlayerBody.CORNER),
            new Vec2D(0, PlayerBody.HEIGHT - PlayerBody.CORNER),
            new Vec2D(PlayerBody.CORNER, PlayerBody.HEIGHT),
            new Vec2D(PlayerBody.WIDTH - PlayerBody.CORNER, PlayerBody.HEIGHT),
            new Vec2D(PlayerBody.WIDTH, PlayerBody.HEIGHT - PlayerBody.CORNER),
            new Vec2D(PlayerBody.WIDTH, PlayerBody.CORNER),
            new Vec2D(PlayerBody.WIDTH - PlayerBody.CORNER, 0),
            new Vec2D(PlayerBody.CORNER, 0),
        ];

        const MATERIAL_PLAYER = {
            density: 10,
            restitution: 0,
            s_friction: 0.3,
            d_friction: 0.3,
            color,
        };
        
        super(pos, body_shape, MATERIAL_PLAYER);

        this.mass = 500;
        this.moi = 250000;
        this.tag = `player-body-${player_ref.id}`;
        this.player_ref = player_ref;
    }

    step() {

        const controls = this.player_ref.controls;
        const is_left = Input.is_key_pressed(controls.left);
        const is_right = Input.is_key_pressed(controls.right);
        const is_up = Input.is_key_pressed(controls.up);

        const max_speed = this.player_ref.hand.is_handling ? 150 : 200;
        const speed_up = this.is_grounded ? 20 : 10;
        const slow_down = this.is_grounded ? 0.9 : 0.99;

        let acc = 0;

        if(is_right && !is_left) {
            if(Math.abs(this.vel.x) < max_speed)
                acc += speed_up;
        } else if (is_left && !is_right) {
            if(Math.abs(this.vel.x) < max_speed)
                acc -= speed_up;
        } 
        
        this.vel.x += acc;

        if(acc == 0 || Math.sign(acc) != Math.sign(this.vel.x)) {
            this.vel.x *= slow_down;
        }

        if(is_up && this.is_grounded) {
            this.vel.y = -275;
        }

        this.rot_vel += -this.angle * 0.8;
        this.rot_vel *= 0.85;

        this.gravity_strength = is_up && this.vel.y < 0 ? 400 : 600;
        this.is_grounded = false;
    }
}

class PlayerHand extends PhysCircle {

    static SIZE = 5;
    static ARM_LENGTH = 30;
    static REST_ANGLE = Math.PI / 4;
    static DUNK_ANGLE = -Math.PI * 0.25;
    static MIN_SHOT_ANGLE = Math.PI * 0.45;
    static MAX_SHOT_ANGLE = Math.PI * 0.3;
    static MIN_SHOOTING_ANGLE = -Math.PI * 0.35;
    static MAX_SHOOTING_ANGLE = -Math.PI * 0.75;
    static SHOT_COOLDOWN_TICKS = 45;

    direction = 1;
    shot_charge = 0;
    shot_cooldown = 0;
    is_handling = false;
    is_shooting = false;
    can_dunk = false;
    is_dunking = false;
    was_action = false;
    player_ref = null;
    ball_ref = null;

    target_angle = PlayerHand.REST_ANGLE;
    arm_angle = PlayerHand.REST_ANGLE;

    constructor(player_ref, pos, color) {

        const MATERIAL_HITBOX = {
            density: 0,
            restitution: 0,
            s_friction: 0,
            d_friction: 0,
            color,
        };

        super(pos, PlayerHand.SIZE, MATERIAL_HITBOX);

        this.tag = `player-hand-${player_ref.id}`;
        this.player_ref = player_ref;
    }

    acquire_ball(ball_ref) {
        this.is_handling = true;
        this.ball_ref = ball_ref;
        ball_ref.is_handled = true;
        ball_ref.hand_ref = this;

        Game.PHYS_ENV.mask_table.set_mask(ball_ref.tag, this.player_ref.body.tag);
    }

    release_ball() {
        this.ball_ref.is_handled = false;
        this.ball_ref.hand_ref = null;
        Game.PHYS_ENV.mask_table.set_mask(this.player_ref.body.tag, this.ball_ref.tag, false);

        this.shot_charge = 0;
        this.shot_cooldown = PlayerHand.SHOT_COOLDOWN_TICKS;
        this.is_handling = false;
        this.is_shooting = false;
        this.ball_ref = null;
    }

    shoot() {
        if(!this.is_handling || !this.is_shooting)
            return;

        const strength = 200 * this.shot_charge + 100;
        const shot_angle = (1 - this.shot_charge) * PlayerHand.MIN_SHOT_ANGLE + this.shot_charge * PlayerHand.MAX_SHOT_ANGLE;
        const x_strength = Math.cos(shot_angle + this.player_ref.body.angle) * strength;
        const y_strength = Math.sin(shot_angle + this.player_ref.body.angle) * strength;
        const r_strength = this.shot_charge * 25;

        this.ball_ref.vel.x = this.direction * x_strength + 0.5 * this.player_ref.body.vel.x;
        this.ball_ref.vel.y = -y_strength + 0.5 * this.player_ref.body.vel.y;
        this.ball_ref.rot_vel = -this.direction * r_strength;

        this.release_ball();
    }

    dunk() {
        if(!this.is_handling || !this.is_dunking)
            return;

        const x_strength = Math.cos(this.arm_angle + Math.PI/2) * 300;
        const y_strength = Math.sin(this.arm_angle + Math.PI/2) * 300;
        const r_strength = 0;

        this.ball_ref.vel.x = this.direction * x_strength + this.player_ref.body.vel.x;
        this.ball_ref.vel.y = y_strength + this.player_ref.body.vel.y;
        this.ball_ref.rot_vel = -this.direction * r_strength;
        
        this.release_ball();
    }

    step() {

        const controls = this.player_ref.controls;
        const is_left = Input.is_key_pressed(controls.left);
        const is_right = Input.is_key_pressed(controls.right);
        const is_action = Input.is_key_pressed(controls.action);
        this.can_dunk = this.shot_charge > 0.5

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

            if(this.is_dunking) {
                this.shot_charge -= 0.15;
                if(this.shot_charge < 0) {
                    this.shot_charge = 0;
                }

                const t = this.shot_charge;
                this.target_angle = (1 - t) * PlayerHand.REST_ANGLE + 
                    t * PlayerHand.MAX_SHOOTING_ANGLE;

                if(this.arm_angle > PlayerHand.DUNK_ANGLE) {
                    this.dunk();
                }
            }
            
            if(this.was_action && !is_action && this.is_shooting) {
                if(this.can_dunk) {
                    this.is_dunking = true;
                    this.is_shooting = false;
                } else {
                    this.shoot();
                }
            }
        } else if(is_action) {
            this.target_angle = PlayerHand.MIN_SHOOTING_ANGLE;
        }

        if((!is_action && !this.is_dunking) || (this.is_handling && !this.is_shooting && !this.is_dunking))
            this.target_angle = PlayerHand.REST_ANGLE;

        this.shot_cooldown -= 1;
        this.arm_angle += 0.15 * (this.target_angle - this.arm_angle);

        let {pos, angle} = this.player_ref.body;
        const height = pos.y - PlayerBody.HEIGHT / 2 + PlayerBody.WIDTH / 2;
        let shoulder = Vec2D.rotate(pos, new Vec2D(pos.x, height), angle).add(pos);

        if(this.direction == -1)
            angle += Math.PI;

        this.pos.x = shoulder.x + Math.cos(this.direction * this.arm_angle + angle) * PlayerHand.ARM_LENGTH;
        this.pos.y = shoulder.y + Math.sin(this.direction * this.arm_angle + angle) * PlayerHand.ARM_LENGTH;

        this.was_action = is_action;
    }
}

class PlayerGroundHitbox extends PhysCircle {

    static SIZE = PlayerBody.WIDTH / 4;

    constructor(body_ref, pos) {

        const MATERIAL_HITBOX = {
            density: 0,
            restitution: 0,
            s_friction: 0,
            d_friction: 0,
            color: "#ea60",
        };

        super(pos, PlayerGroundHitbox.SIZE, MATERIAL_HITBOX);

        this.on_collision = this.handle_ground_state;
        this.body_ref = body_ref;
    }

    handle_ground_state(_, other) {
        if(other != this.body_ref && (Player.JUMPABLE_TAGS.includes(other.tag) ||
            other.tag.startsWith("player-body")))
            this.body_ref.is_grounded = true;
    }

    step() {
        let {x, y} = this.body_ref.pos;
        this.pos.x = x;
        this.pos.y = y + PlayerBody.HEIGHT / 2;
    }

}
