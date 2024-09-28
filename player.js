
class Player {

    static ID = 0;
    static WIDTH = 22;
    static HEIGHT = 45;
    static CORNER = 5;

    static JUMPABLE_TAGS = ["player-body", "ball", "floor", "superball"];

    isGrounded = false;

    constructor(env, pos, controls, color) {
        this.controls = controls;
        this.id = Player.ID++;
        this.collisionMask = `player-${this.id}`;
        
        const [body, hand, ground] = this.initPhysObj(pos, color);

        this.body = body;
        this.hand = hand;
        this.groundHitbox = ground;

        env.addObject(this.body);
        env.addObject(this.hand);
        env.addObject(this.groundHitbox);
    }
    
    initPhysObj(pos, color) {
        let bodyShape = [
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
            sFriction: 0.3,
            dFriction: 0.3,
            color,
        };
        
        let body = new PhysPolygon(pos, bodyShape, MATERIAL_PLAYER);
        body.mass = 500;
        body.moi = Infinity;
        body.tag = "player-body"

        let handPos = new Vec2D(pos.x, pos.y);
        let hand = new PlayerHand(handPos);
        hand.playerRef = this;

        let hitboxPos = new Vec2D(pos.x, pos.y + Player.HEIGHT / 2);
        let groundHitbox = new PlayerGroundHitbox(hitboxPos);
        groundHitbox.playerRef = this;

        body.masks.push(this.collisionMask);
        hand.masks.push(this.collisionMask);
        groundHitbox.masks.push(this.collisionMask);

        groundHitbox.onCollision = (_, other) => {
            if(other != body && Player.JUMPABLE_TAGS.includes(other.tag))
                this.isGrounded = true;
        }

        return [body, hand, groundHitbox];
    }

    step() {
        this.hand.step();
        this.groundHitbox.step();

        const isLeft = Input.isKeyPressed(this.controls.left);
        const isRight = Input.isKeyPressed(this.controls.right);
        const isUp = Input.isKeyPressed(this.controls.up);

        const maxSpeed = this.hand.isHandling ? 150 : 200;
        const speedUp = this.isGrounded ? 20 : 10;
        const slowDown = this.isGrounded ? 0.9 : 0.99;

        let acc = 0;

        if(isRight && !isLeft) {
            if(Math.abs(this.body.vel.x) < maxSpeed)
                acc += speedUp;
        } else if (isLeft && !isRight) {
            if(Math.abs(this.body.vel.x) < maxSpeed)
                acc -= speedUp;
        } 
        
        this.body.vel.x += acc;

        if(acc == 0 || Math.sign(acc) != Math.sign(this.body.vel.x)) {
            this.body.vel.x *= slowDown;
        }

        if(isUp && this.isGrounded) {
            this.body.vel.y = -250;
        }

        let gravityStrength = isUp && this.body.vel.y < 0 ? 400 : 700;
        
        let gravity = {
            pos: this.body.pos,
            dir: new Vec2D(0, this.body.mass * gravityStrength),
        };
    
        this.body.applyForce(gravity);

        this.isGrounded = false;
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
    shotCharge = 0;
    shotCooldown = 0;
    isHandling = false;
    isShooting = false;
    wasAction = false;
    playerRef = null;

    targetAngle = PlayerHand.REST_ANGLE;
    armAngle = PlayerHand.REST_ANGLE;

    constructor(pos) {

        const MATERIAL_HITBOX = {
            density: 0,
            restitution: 0,
            sFriction: 0,
            dFriction: 0,
            color: "#6ae",
        };

        super(pos, PlayerHand.SIZE, MATERIAL_HITBOX);

        this.tag = "player-hand";
    }

    shoot() {
        if(!this.isHandling || !this.isShooting)
            return;

        const xStrength = this.shotCharge * 225 + 25;
        const yStrength = this.shotCharge * 100 + 175;
        const rStrength = this.shotCharge * 25;

        ball.vel.x = this.direction * xStrength + 0.5 * this.playerRef.body.vel.x;
        ball.vel.y = -yStrength + 0.5 * this.playerRef.body.vel.y;
        ball.rotVel = -this.direction * rStrength;
        ball.isHandled = false;
        ball.handRef = null;
        ball.masks.splice(ball.masks.indexOf(this.playerRef.collisionMask), 1);

        this.shotCharge = 0;
        this.shotCooldown = PlayerHand.SHOT_COOLDOWN_TICKS;
        this.isHandling = false;
        this.isShooting = false;
        this.ballRef = null;
    }

    step() {

        const controls = this.playerRef.controls;
        const isLeft = Input.isKeyPressed(controls.left);
        const isRight = Input.isKeyPressed(controls.right);
        const isAction = Input.isKeyPressed(controls.action);

        if(isRight && !isLeft) {
            this.direction = 1;
        } else if (isLeft && !isRight) {
            this.direction = -1;
        }

        if(this.isHandling) {
            if(!this.wasAction && isAction)
                this.isShooting = true;

            if(this.isShooting) {
                this.shotCharge += 0.015;
                if(this.shotCharge > 1)
                    this.shotCharge = 1;
    
                const t = this.shotCharge;
    
                this.targetAngle = (1 - t) * PlayerHand.MIN_SHOOTING_ANGLE + t * PlayerHand.MAX_SHOOTING_ANGLE;
            }6
            
            if(this.wasAction && !isAction && this.isShooting) {
                this.shoot();
            }
        } else if(isAction) {
            this.targetAngle = PlayerHand.MIN_SHOOTING_ANGLE;
        }

        if(!isAction || (this.isHandling && !this.isShooting))
            this.targetAngle = PlayerHand.REST_ANGLE;

        this.shotCooldown -= 1;
        this.armAngle += 0.15 * (this.targetAngle - this.armAngle);

        let {x, y} = this.playerRef.body.pos;
        const height = y - Player.HEIGHT / 2 + Player.WIDTH / 2;
        this.pos.x = x + this.direction * Math.cos(this.armAngle) * PlayerHand.ARM_LENGTH;
        this.pos.y = height + Math.sin(this.armAngle) * PlayerHand.ARM_LENGTH;

        this.wasAction = isAction;
    }
}

class PlayerGroundHitbox extends PhysCircle {

    static SIZE = Player.WIDTH / 4;

    constructor(pos) {

        const MATERIAL_HITBOX = {
            density: 0,
            restitution: 0,
            sFriction: 0,
            dFriction: 0,
            color: "#ea6",
        };

        super(pos, PlayerGroundHitbox.SIZE, MATERIAL_HITBOX);

    }

    step() {
        let {x, y} = this.playerRef.body.pos;
        this.pos.x = x;
        this.pos.y = y + Player.HEIGHT / 2;
    }

}
