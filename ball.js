class Basketball extends PhysCircle {

    static SIZE = 10;

    isHandled = false;
    handRef = null;

    constructor(pos) {

        const MATERIAL_BBALL = {
            density: 0.5,
            restitution: .98,
            sFriction: 0.12,
            dFriction: 0.08,
            color: "#a75",
        };

        super(pos, Basketball.SIZE, MATERIAL_BBALL);

        this.onCollision = (_, other) => {
            if(other.tag != "player-hand" || 
                other.isHandling || 
                other.shotCooldown > 0)
                return;
            
            other.isHandling = true;
            other.ballRef = this;

            if(this.isHandled && this.handRef != other) {
                this.handRef.isHandling = false;
                this.handRef.isShooting = false;
                this.handRef.ballRef = null;
                this.handRef.shotCharge = 0;
                this.handRef.shotCooldown = PlayerHand.SHOT_COOLDOWN_TICKS;
                ball.masks.splice(ball.masks.indexOf(this.handRef.playerRef.collisionMask), 1);
            }

            this.isHandled = true;
            this.handRef = other;

            const mask = other.playerRef.collisionMask;

            if(!this.masks.includes(mask))
                this.masks.push(mask);

        }

        this.tag = "ball";

    }

    step() {
        if(this.isHandled) {
            this.pos.x = this.handRef.pos.x;
            this.pos.y = this.handRef.pos.y;

            this.vel.x = 0;
            this.vel.y = 0;
        }

        let gravity = {
            pos: this.pos,
            dir: new Vec2D(0, this.mass * 400),
        };
    
        this.applyForce(gravity);
    }

}