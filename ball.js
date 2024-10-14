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
        
        other.is_handling = true;
        other.ball_ref = this;

        if(this.is_handled && this.hand_ref != other) {
            this.hand_ref.is_handling = false;
            this.hand_ref.is_shooting = false;
            this.hand_ref.ball_ref = null;
            this.hand_ref.shot_charge = 0;
            this.hand_ref.shot_cooldown = PlayerHand.SHOT_COOLDOWN_TICKS;
            Game.PHYS_ENV.mask_table.set_mask(this.tag, this.hand_ref.player_ref.body.tag, false);
        }

        this.is_handled = true;
        this.hand_ref = other;

        Game.PHYS_ENV.mask_table.set_mask(this.tag, this.hand_ref.player_ref.body.tag);
    }

    step() {
        if(this.is_handled) {
            this.pos.x = this.hand_ref.pos.x;
            this.pos.y = this.hand_ref.pos.y;

            this.vel.x = 0;
            this.vel.y = 0;
        }
    }

    draw(ctx) {
        ctx.strokeStyle = this.material.color
        if(this.hand_ref && this.hand_ref.can_dunk) {
            ctx.strokeStyle = "#cc6";
            ctx.shadowColor = "#cc6";
            ctx.shadowBlur = 5;
        }

        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, this.angle, 2 * Math.PI + this.angle);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(
            this.pos.x + Math.cos(this.angle) * (this.radius + 4), 
            this.pos.y + Math.sin(this.angle) * (this.radius + 4), 
            this.radius, 
            this.angle + Math.PI * 0.75, 
            this.angle - Math.PI * 0.75
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(
            this.pos.x + Math.cos(this.angle + Math.PI) * (this.radius + 4), 
            this.pos.y + Math.sin(this.angle + Math.PI) * (this.radius + 4), 
            this.radius, 
            this.angle - Math.PI * 0.25, 
            this.angle + Math.PI * 0.25
        );
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(
            this.pos.x + Math.cos(this.angle) * this.radius,
            this.pos.y + Math.sin(this.angle) * this.radius
        );
        ctx.lineTo(
            this.pos.x + Math.cos(this.angle + Math.PI) * this.radius,
            this.pos.y + Math.sin(this.angle + Math.PI) * this.radius
        );
        ctx.moveTo(
            this.pos.x + Math.cos(this.angle + Math.PI / 2) * this.radius,
            this.pos.y + Math.sin(this.angle + Math.PI / 2) * this.radius
        );
        ctx.lineTo(
            this.pos.x + Math.cos(this.angle - Math.PI / 2) * this.radius,
            this.pos.y + Math.sin(this.angle - Math.PI / 2) * this.radius
        );
        ctx.stroke();

        ctx.shadowBlur = 0;
    }
}