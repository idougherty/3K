
class Goal {
    static RIM_WDTH = 45;

    constructor(env, pos, dir = 1) {

        const MATERIAL_BBOARD = {
            density: Infinity,
            restitution: 0.8,
            sFriction: .2,
            dFriction: .1,
            color: "#eee",
        };

        const MATERIAL_RIM = {
            density: Infinity,
            restitution: 0.7,
            sFriction: .2,
            dFriction: .1,
            color: "#ea6",
        };

        let boardShape = [
            new Vec2D(0,  0),
            new Vec2D(0,  100),
            new Vec2D(15, 100),
            new Vec2D(15, 0),
        ];
    
        this.backboard = new PhysPolygon(pos, boardShape, MATERIAL_BBOARD);
        env.addObject(this.backboard);
    
        let rimPos = new Vec2D(pos.x + (20 + Goal.RIM_WDTH) * dir, pos.y + 35);
        this.f_rim = new PhysCircle(rimPos, 5, MATERIAL_RIM);
        env.addObject(this.f_rim);
    
        rimPos = new Vec2D(pos.x + 20 * dir, pos.y + 35);
        this.b_rim = new PhysCircle(rimPos, 5, MATERIAL_RIM);
        env.addObject(this.b_rim);

        let netPos = new Vec2D(pos.x + (20 + Goal.RIM_WDTH / 2) * dir, pos.y + 35);
        this.net = new Net(env, netPos);
    }

    step() {
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

class Net {
    points = [];
    links = [];

    constructor(env, c_pos) {

        this.width = 5;
        this.height = 6;

        this.initNet(c_pos);
    
    }

    initNet(c_pos) {

        const MATERIAL_NET = {
            density: 1,
            restitution: 1,
            sFriction: .6,
            dFriction: .3,
            color: "#eee0",
        }

        const netShape = [
            { width: 1, height: 0.4 },
            { width: 0.7, height: 0.2 },
            { width: 0.7, height: 0.15 },
            { width: 0.6, height: 0.15 },
            { width: 0.6, height: 0.15 },
            { width: 0.6, height: 0.1 },
        ]
    
        let y = c_pos.y;

        for(let rowIdx = 0; rowIdx < netShape.length; rowIdx++) {
            let num_points = rowIdx % 2 == 0 ? this.width : this.width - 1;
            let row = [];
            let rowShape = netShape[rowIdx];

            for(let colIdx = 0; colIdx < num_points; colIdx++) {
                const w = Goal.RIM_WDTH * rowShape.width;
                let x = c_pos.x - w/2 + colIdx * w / (num_points - 1);

                let pos = new Vec2D(x, y);
                let point = new PhysCircle(pos, 2, MATERIAL_NET);
                
                if(rowIdx == 0)
                    point.mass = Infinity;
                point.moi = Infinity;

                const isCorporeal = colIdx != 0 && colIdx != num_points - 1;

                if(isCorporeal) {
                    point.onCollision = this.corporealFunc;
                    point.masks.push("ball-net")
                }
                
                env.addObject(point);
                row.push(point);
            }

            y += Goal.RIM_WDTH * rowShape.height;
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
                    
                    const targetDist = Vec2D.mag(Vec2D.dif(A.pos, B.pos));
                    const link = { A, B, targetDist }
                    this.links.push(link);

                }
                
                if(x + prev_offset + 1 < this.points[y-1].length) {
                    let B = this.points[y-1][x + prev_offset + 1];

                    const targetDist = Vec2D.mag(Vec2D.dif(A.pos, B.pos));
                    const link = { A, B, targetDist }
                    this.links.push(link);
                }
            }
        }
    }

    corporealFunc(A, B) {
        if(B.tag != "ball" || A.mass == Infinity)
            return;

        let vec = Vec2D.dif(B.pos, A.pos);
        let normal = Vec2D.normalize(vec);
    
        const projA = normal.mult(A.vel.dot(normal));
        const projB = normal.mult(B.vel.dot(normal));
        const impulse = projA.subRet(projB).mult(0.1);
        const totalMass = B.mass + A.mass;
    
        A.vel.sub(impulse.mult(B.mass / totalMass));
        B.vel.add(impulse.mult(A.mass / totalMass));
    }

    applyConstraint({A, B, targetDist}) {
        let vec = Vec2D.dif(B.pos, A.pos);
        let normal = Vec2D.normalize(vec);
        let dist = Vec2D.mag(vec);
    
        if(dist < targetDist)
            return;
    
        const projA = normal.mult(A.vel.dot(normal));
        const projB = normal.mult(B.vel.dot(normal));
        const impulse = projA.subRet(projB);
    
        const percent = 0.5;
        const correction = Math.max(dist - targetDist, 0) * percent;
        const totalMass = A.mass + B.mass;
    
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
            A.pos.x -= normal.x * correction * B.mass / totalMass;
            A.pos.y -= normal.y * correction * B.mass / totalMass;
    
            B.pos.x += normal.x * correction * A.mass / totalMass;
            B.pos.y += normal.y * correction * A.mass / totalMass;
            
            A.vel.sub(impulse.mult(B.mass / totalMass));
            B.vel.add(impulse.mult(A.mass / totalMass));
        }
    }

    step() {
        for(let i = 0; i < 5; i++) {
            for(const link of this.links) {
                this.applyConstraint(link);
            }
        }

        for(const row of this.points) {
            for(const point of row) {
                if(point.mass == Infinity)
                    continue;

                let gravity = {
                    pos: point.pos,
                    dir: new Vec2D(0, point.mass * 250),
                };
        
                point.applyForce(gravity);
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