
class Goal {
    static RIM_WDTH = 45;

    constructor(pos, dir = 1, on_score) {
        const MATERIAL_BBOARD = {
            density: Infinity,
            restitution: 0.8,
            s_friction: .2,
            d_friction: .1,
            color: "#eee",
        };

        const MATERIAL_RIM = {
            density: Infinity,
            restitution: 0.7,
            s_friction: .2,
            d_friction: .1,
            color: "#ea6",
        };

        let board_shape = [
            new Vec2D(0,  0),
            new Vec2D(0,  100),
            new Vec2D(10, 100),
            new Vec2D(10, 0),
        ];

        this.dir = dir;
    
        this.backboard = new PhysPolygon(pos, board_shape, MATERIAL_BBOARD);
        Game.PHYS_ENV.add_object(this.backboard);
    
        let rim_pos = new Vec2D(pos.x + (20 + Goal.RIM_WDTH) * dir, pos.y + 35);
        this.f_rim = new PhysCircle(rim_pos, 5, MATERIAL_RIM);
        Game.PHYS_ENV.add_object(this.f_rim);
    
        rim_pos = new Vec2D(pos.x + 20 * dir, pos.y + 35);
        this.b_rim = new PhysCircle(rim_pos, 5, MATERIAL_RIM);
        Game.PHYS_ENV.add_object(this.b_rim);

        let net_pos = new Vec2D(pos.x + (20 + Goal.RIM_WDTH / 2) * dir, pos.y + 35);
        this.net = new Net(net_pos);

        this.scoring_hitbox = new GoalHitbox(this, net_pos, on_score);
        this.dunk_hitbox = new DunkHitbox(this, net_pos);
    }

    step() {
        this.scoring_hitbox.step();
        this.net.step();
    }

    draw(ctx) {
        this.net.draw(ctx);

        ctx.beginPath();
        ctx.moveTo(this.b_rim.pos.x, this.b_rim.pos.y);
        ctx.lineTo(this.f_rim.pos.x, this.f_rim.pos.y);
    
        ctx.strokeStyle = "#ea6";
        ctx.stroke();
    }
}

class DunkHitbox extends PhysPolygon {
    constructor(goal_ref, goal_pos) {
        const size = Goal.RIM_WDTH * 3;

        const hitbox_shape = [
            new Vec2D(0, 0),
            new Vec2D(0, size),
            new Vec2D(size, size),
            new Vec2D(size, 0),
        ];

        const MATERIAL_HITBOX = {
            density: 0,
            s_friction: 0,
            d_friction: 0,
            restitution: 0,
            color: "#ee60"
        }

        let pos = new Vec2D(goal_pos.x + size / 4 * goal_ref.dir, goal_pos.y - size/2);
        super(pos, hitbox_shape, MATERIAL_HITBOX);
        Game.PHYS_ENV.add_object(this);

        this.goal_ref = goal_ref;
        this.on_collision = this.handle_contact;
    }

    handle_contact(_, other) {
        if(!other.tag.startsWith("player-hand"))
            return;

        other.is_dunk_position = true;
    }
}

class GoalHitbox {
    
    goal_ref = null;
    top_hitbox = null;
    bottom_hitbox = null;

    is_top = false;
    is_middle = false;
    is_bottom = false;

    is_scoring_primed = false;
    
    constructor(goal_ref, pos, on_score) {
        const THICKNESS = 10;

        const hitbox_shape = [
            new Vec2D(0, 0),
            new Vec2D(Goal.RIM_WDTH, 0),
            new Vec2D(Goal.RIM_WDTH, THICKNESS),
            new Vec2D(0, THICKNESS),
        ];

        const MATERIAL_HITBOX = {
            density: 0,
            s_friction: 0,
            d_friction: 0,
            restitution: 0,
            color: "#ee60"
        }

        let top_pos = new Vec2D(pos.x, pos.y - Basketball.SIZE - THICKNESS);
        this.top_hitbox = new PhysPolygon(top_pos, hitbox_shape, MATERIAL_HITBOX);
        this.top_hitbox.on_collision = this.detect_ball;
        Game.PHYS_ENV.add_object(this.top_hitbox);

        let middle_pos = new Vec2D(pos.x, pos.y);
        this.middle_hitbox = new PhysPolygon(middle_pos, hitbox_shape, MATERIAL_HITBOX);
        this.middle_hitbox.on_collision = this.detect_ball;
        Game.PHYS_ENV.add_object(this.middle_hitbox);

        let bottom_pos = new Vec2D(pos.x, pos.y + Basketball.SIZE + THICKNESS);
        this.bottom_hitbox = new PhysPolygon(bottom_pos, hitbox_shape, MATERIAL_HITBOX);
        this.bottom_hitbox.on_collision = this.detect_ball;
        Game.PHYS_ENV.add_object(this.bottom_hitbox);

        this.goal_ref = goal_ref;
        this.on_score = on_score;
    }

    detect_ball(hitbox, other) {
        if(other.tag == "ball")
            hitbox.is_active = true;
    }

    step() {
        if(this.top_hitbox.is_active)
            this.is_scoring_primed = false;

        if(this.top_hitbox.is_active && this.middle_hitbox.is_active)
            this.is_scoring_primed = true;

        if(this.middle_hitbox.is_active && this.bottom_hitbox.is_active && this.is_scoring_primed) {
            this.on_score();
            this.is_scoring_primed = false;
        }
        
        this.top_hitbox.is_active = false;
        this.middle_hitbox.is_active = false;
        this.bottom_hitbox.is_active = false;
    }
}

class Net {
    points = [];
    links = [];

    constructor(base_pos) {
        this.width = 5;
        this.height = 6;

        this.init_net(base_pos);
    }

    init_net(base_pos) {

        const MATERIAL_NET = {
            density: 0.7,
            restitution: 1,
            s_friction: .2,
            d_friction: .2,
            color: "#eee0",
        }

        const net_shape = [
            { width: 1, height: 0.4 },
            { width: 0.7, height: 0.2 },
            { width: 0.6, height: 0.15 },
            { width: 0.6, height: 0.15 },
            { width: 0.5, height: 0.15 },
            { width: 0.6, height: 0.1 },
        ]
    
        let y = base_pos.y;

        for(let row_idx = 0; row_idx < net_shape.length; row_idx++) {
            let num_points = row_idx % 2 == 0 ? this.width : this.width - 1;
            let row = [];
            let row_shape = net_shape[row_idx];

            for(let col_idx = 0; col_idx < num_points; col_idx++) {
                const w = Goal.RIM_WDTH * row_shape.width;
                let x = base_pos.x - w/2 + col_idx * w / (num_points - 1);

                let pos = new Vec2D(x, y);
                let point = new PhysCircle(pos, 3, MATERIAL_NET);
                
                if(row_idx == 0)
                    point.mass = Infinity;
                point.moi = Infinity;

                point.gravity_strength = 150;
                
                const is_corporeal = col_idx != 0 && col_idx != num_points - 1;
                
                if(is_corporeal) {
                    point.tag = "net-inner";
                    point.on_collision = this.corporeal_func;                
                } else {
                    point.tag = "net-outer";
                }
                
                Game.PHYS_ENV.add_object(point);
                row.push(point);
            }

            y += Goal.RIM_WDTH * row_shape.height;
            this.points.push(row);
        }

        // Initialize links

        for(let y = 1; y < this.height; y++) {
            let num_points = y % 2 == 0 ? this.width : this.width - 1;
            let prev_offset = y % 2 == 0 ? -1 : 0;

            for(let x = 0; x < num_points; x++) {

                let A = this.points[y][x];

                if(x + prev_offset >= 0) {
                    let B = this.points[y-1][x + prev_offset];
                    
                    const target_dist = Vec2D.mag(Vec2D.sub(A.pos, B.pos));
                    const link = { A, B, target_dist }
                    this.links.push(link);
                }
                
                if(x + prev_offset + 1 < this.points[y-1].length) {
                    let B = this.points[y-1][x + prev_offset + 1];

                    const target_dist = Vec2D.mag(Vec2D.sub(A.pos, B.pos));
                    const link = { A, B, target_dist }
                    this.links.push(link);
                }
            }
        }
    }

    corporeal_func(A, B) {
        if(B.tag != "ball" || A.mass == Infinity)
            return;

        let vec = Vec2D.sub(B.pos, A.pos);
        let normal = Vec2D.normalize(vec);
    
        const corporeal_strength = 0.07;
        const proj_a = Vec2D.mult(normal, A.vel.dot(normal));
        const proj_b = Vec2D.mult(normal, B.vel.dot(normal));
        const impulse = Vec2D.sub(proj_b, proj_a).mult(corporeal_strength);
        const total_mass = B.mass + A.mass;
    
        A.vel.sub(Vec2D.mult(impulse, B.mass / total_mass));
        B.vel.add(Vec2D.mult(impulse, A.mass / total_mass));
    }

    apply_constraint({A, B, target_dist}) {
        let vec = Vec2D.sub(B.pos, A.pos);
        let normal = Vec2D.normalize(vec);
        let dist = Vec2D.mag(vec);
    
        if(dist < target_dist)
            return;
        
        const proj_a = Vec2D.mult(normal, A.vel.dot(normal));
        const proj_b = Vec2D.mult(normal, B.vel.dot(normal));
        const impulse = Vec2D.sub(proj_b, proj_a);
    
        const percent = 0.8;
        const correction = Math.max(dist - target_dist, 0) * percent;
        const total_mass = A.mass + B.mass;
    
        if(A.mass == Infinity && B.mass == Infinity) {
            return;
        } else if(A.mass == Infinity) {
            B.pos.x += normal.x * correction;
            B.pos.y += normal.y * correction;
    
            B.vel.add(impulse);
        } else if(B.mass == Infinity) {
            A.pos.x -= normal.x * correction;
            A.pos.y -= normal.y * correction;
            
            A.vel.sub(impulse);
        } else {
            A.pos.x -= normal.x * correction * B.mass / total_mass;
            A.pos.y -= normal.y * correction * B.mass / total_mass;
    
            B.pos.x += normal.x * correction * A.mass / total_mass;
            B.pos.y += normal.y * correction * A.mass / total_mass;
            
            A.vel.sub(Vec2D.mult(impulse, B.mass / total_mass));
            B.vel.add(Vec2D.mult(impulse, A.mass / total_mass));
        }
    }

    step() {
        for(let i = 0; i < 5; i++) {
            for(const link of this.links) {
                this.apply_constraint(link);
            }
        }
    }
    
    draw(ctx) {
        ctx.beginPath();

        for(const link of this.links) {
            const { A, B } = link;
            ctx.moveTo(A.pos.x, A.pos.y);
            ctx.lineTo(B.pos.x, B.pos.y);
        }

        ctx.strokeStyle = "#eee";
        ctx.stroke();
    }
}