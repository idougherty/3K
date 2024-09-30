function clip(v1, v2, n, o) {
    let points = [];
    const d1 = n.dot(v1) - o;
    const d2 = n.dot(v2) - o;

    if(d1 >= 0) points.push(v1);

    if(d2 >= 0) points.push(v2);

    if(d1 * d2 < 0) {
        let e = Vec2D.sub(v1, v2);
        const u = d1 / (d1 - d2);
        e.mult(u).add(v1);

        points.push(e);
    }

    return points;
}

function debugLine(p1, p2, ctx, color = "red") {
    ctx.strokeStyle = color;
    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
}

function insertion_sort(arr, lambda = (x) => x) {
    let val, j, i;
    for(i = 1; i < arr.length; i++) {
        val = arr[i];
        j = i - 1;

        while(j >= 0 && lambda(arr[j]) > lambda(val)) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = val;
    }
}

function minkowski_dif_support(s1, s2, d) {
    let support1 = s1.get_support(d);
    let support2 = s2.get_support(Vec2D.mult(d, -1));
    return Vec2D.sub(support2, support1);
}

function mean(arr) {
    let sum = 0;
    for(const el of arr) {
        sum += el;
    }
    return sum / arr.length;
}

function variance(arr) {
    let variance = 0;
    const mean = mean(arr);
    for(const el of arr) {
        const dif = el - mean;
        variance += dif * dif;
    }
    return variance / arr.length;
}

function calc_mass_and_moi(shape, material) {
    if(material.density == Infinity)
        return [Infinity, Infinity];

    if(material.density == 0)
        return [0, 0];

    let mass = 0;
    let center = new Vec2D(0, 0);
    let moi = 0;

    let prev = shape.length - 1;
    for(let cur = 0; cur < shape.length; cur++) {
        const a = shape[prev];
        const b = shape[cur];

        const area_step = Math.abs(Vec2D.cross(a, b) / 2);
        const mass_step = area_step * material.density;
        const center_step = Vec2D.add(a, b).div(3);
        const moi_step = mass_step / 6 * (a.dot(a) + b.dot(b) + a.dot(b));

        mass += mass_step
        center.add(center_step);
        moi += moi_step;
    }

    return [mass, moi];
}

const MATERIAL_WOOD = {
    density: 1,
    restitution: .4,
    s_friction: .3,
    d_friction: .2,
    color: "#a98",
};

const MATERIAL_RUBBER = {
    density: 2.5,
    restitution: .95,
    s_friction: .6,
    d_friction: .4,
    color: "#a75",
};

const MATERIAL_WALL = {
    density: Infinity,
    restitution: .5,
    s_friction: .4,
    d_friction: .2,
    color: "#eee",
};

class Vec2D {
    static ZERO = new Vec2D(0, 0);

    static rotate(pivot, point, rad) {
        const dx = (point.x - pivot.x);
        const dy = (point.y - pivot.y);

        const nx = dx * Math.cos(rad) - dy * Math.sin(rad); 
        const ny = dx * Math.sin(rad) + dy * Math.cos(rad);

        return new Vec2D(nx, ny);
    }

    static mag(vec) {
        return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
    }

    static normalize(vec) {
        if(vec.x == 0 && vec.y == 0) return new Vec2D(0, 0);
        const mag = Vec2D.mag(vec);
        return new Vec2D(vec.x / mag, vec.y / mag);
    }

    static add(A, B) {
        if(B.x != undefined && B.y != undefined)
            return new Vec2D(A.x + B.x, A.y + B.y);
        return new Vec2D(A.x + B, A.y + B);
    }

    static sub(A, B) {
        if(B.x != undefined && B.y != undefined)
            return new Vec2D(B.x - A.x, B.y - A.y);
        return new Vec2D(A.x - B, A.y - B);
    }

    static mult(vec, num) {
        return new Vec2D(vec.x * num, vec.y * num);
    }

    static div(vec, num) {
        return new Vec2D(vec.x / num, vec.y / num);
    }

    static triple_prod(A, B, C) {
        const k = A.x * B.y - A.y * B.x;
        const nx = -C.y * k;
        const ny = C.x * k;
        return new Vec2D(nx, ny, 0);
    }

    static cross(A, B) {
        if(A.x == undefined) {
            // scalar x vector
            return new Vec2D(-A * B.y, A * B.x);
        } else if(B.x == undefined) {
            // vector x scalar
            return new Vec2D(B * A.y, -B * A.x);
        } else {
            // vector x vector
            return A.x * B.y - A.y * B.x;
        }
    }

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    }

    sub(other) {
        this.x -= other.x;
        this.y -= other.y;
        return this;
    }

    mult(num) {
        this.x *= num;
        this.y *= num;
        return this;
    }

    div(num) {
        this.x /= num;
        this.y /= num;
        return this;
    }

    dot(other) {
        return this.x * other.x + this.y * other.y;
    }
}

class AABB {

    static find_bounds(obj) {
        let b = new Vec2D(Infinity, Infinity);
        let e = new Vec2D(-Infinity, -Infinity);

        for(const point of obj.points) {
            b.x = Math.min(point.x, b.x);
            b.y = Math.min(point.y, b.y);

            e.x = Math.max(point.x, e.x);
            e.y = Math.max(point.y, e.y);
        }

        return new AABB(b, e);
    }

    constructor(b, e) {
        this.b = b;
        this.e = e;
        this.color = "blue";
    }

    update(obj) {
        this.b.add(new Vec2D(Infinity, Infinity));
        this.e.add(new Vec2D(-Infinity, -Infinity));

        for(const point of obj.points) {
            this.b.x = Math.min(point.x, this.b.x);
            this.b.y = Math.min(point.y, this.b.y);

            this.e.x = Math.max(point.x, this.e.x);
            this.e.y = Math.max(point.y, this.e.y);
        }
    }

    draw(ctx) {
        ctx.strokeStyle = this.color;
        ctx.strokeRect(this.b.x, this.b.y, this.e.x - this.b.x, this.e.y - this.b.y);
    }
}

class PhysObject {

    constructor(pos, mass, moi, material = MATERIAL_WOOD) {
        this.force = new Vec2D(0, 0);
        this.acc = new Vec2D(0, 0);
        this.vel = new Vec2D(0, 0);
        this.pos = pos;

        this.torque = 0;
        this.rot_acc = 0;
        this.rot_vel = 0;
        this.angle = 0;

        this.material = material;
        
        this.mass = mass;
        this.moi = moi;

        this.masks = [];
        this.on_collision = null;
        this.tag = "";
    }

    // a force consists of a position vector and a direction vector
    apply_force(force) {
        const r = new Vec2D(force.pos.x - this.pos.x, force.pos.y - this.pos.y);

        this.force.add(force.dir);
        this.torque += r.x * force.dir.y - r.y * force.dir.x;
    }

    step_forces(dt) {
        this.acc = Vec2D.div(this.force, this.mass);
        
        if(this.mass == 0)
            this.acc = new Vec2D(0, 0);
        
        this.vel.add(Vec2D.mult(this.acc, dt));
        this.pos.add(Vec2D.mult(this.vel, dt));
        
        this.rot_acc = this.torque / this.moi;

        if(this.moi == 0)
            this.rot_acc = 0;
        
        this.rot_vel += this.rot_acc * dt;
        this.angle += this.rot_vel * dt;

        this.force = new Vec2D(0, 0);
        this.torque = 0;
    }
}

class PhysPolygon extends PhysObject {

    static find_com(points) {
        let COM = new Vec2D(0, 0);
        
        for(const point of points) {
            COM.add(point);
        }

        COM.x /= points.length;
        COM.y /= points.length;

        return COM;
    }

    static rotate_shape(shape, pos, angle) {
        let points = [];

        for(let i = 0; i < shape.length; i++) {
            points[i] = Vec2D.rotate(Vec2D.ZERO, shape[i], angle);
            points[i].add(pos);
        }

        return points;
    }

    constructor(pos, points, material = MATERIAL_WOOD) {

        const center = PhysPolygon.find_com(points);
        points.forEach((p) => p.sub(center));
        let shape = points;

        const [mass, moi] = calc_mass_and_moi(shape, material);

        super(pos, mass, moi, material);

        this.shape = shape;
        this.points = PhysPolygon.rotate_shape(shape, this.pos, this.angle);
        this.AABB = AABB.find_bounds(this);
    }

    get_support(d) {
        let furthest = null;
        let dot = -Infinity;
    
        for(const point of this.points) {
            const proj = point.dot(d);
            if(proj > dot) {
                furthest = point;
                dot = proj;
            }
        }
    
        return furthest;
    }

    find_collision_edge(normal) {
        let v = null;
        let idx = null;
        let dot = -Infinity;
    
        for(const [i, point] of this.points.entries()) {
            const proj = point.dot(normal);
            if(proj > dot) {
                v = point;
                idx = i;
                dot = proj;
            }
        }
    
        const v0 = this.points[(idx - 1 + this.points.length) % this.points.length];
        const v1 = this.points[(idx + 1) % this.points.length];

        const left_edge = Vec2D.sub(v, v0);
        const right_edge = Vec2D.sub(v, v1);

        if(Vec2D.normalize(right_edge).dot(normal) <= Vec2D.normalize(left_edge).dot(normal)) {
            return [v, [v0, v]];
        } else {
            return [v, [v, v1]];
        }
    }

    update() {
        this.points = PhysPolygon.rotate_shape(this.shape, this.pos, this.angle);
        this.AABB.update(this);
    }

    draw(ctx) {
        ctx.strokeStyle = this.material.color
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        for(const point of this.points) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.closePath();

        ctx.stroke();
    }
}

class PhysCircle extends PhysObject {

    static update_bounding_box(AABB, pos, radius) {
        AABB.b.x = pos.x - radius;
        AABB.b.y = pos.y - radius;
        AABB.e.x = pos.x + radius;
        AABB.e.y = pos.y + radius;
    }

    constructor(pos, radius, material = MATERIAL_WOOD) {
      
        const mass = Math.PI * radius * radius * material.density;
        const moi = mass * radius * radius;
        
        super(pos, mass, moi, material);
        
        this.radius = radius;
        this.AABB = new AABB(new Vec2D(0, 0), new Vec2D(0, 0));
        PhysCircle.update_bounding_box(this.AABB, this.pos, this.radius);
    }

    get_support(d) {
        return Vec2D.mult(d, this.radius).add(this.pos);
    }

    find_collision_edge(normal) {
        let contact = this.get_support(normal);
        return [contact, null]
    }

    update() {
        PhysCircle.update_bounding_box(this.AABB, this.pos, this.radius);
    }

    draw(ctx) {
        ctx.strokeStyle = this.material.color
        ctx.lineWidth = 2.5;

        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.radius, this.angle, 2 * Math.PI + this.angle);
        ctx.lineTo(this.pos.x, this.pos.y);
        ctx.stroke();
    }
}

class PhysEnv {

    constructor(objects = []) {
        this.objects = [];
        this.intervals = [];
        this.sweep_x = true;

        for(const obj of objects) {
            this.add_object(obj);
        }
    }

    add_object(obj) {
        let start = [obj.AABB.b, this.objects.length];
        let end = [obj.AABB.e, this.objects.length];
        
        this.intervals.push(start, end);
        this.objects.push(obj);
    }

    remove_object(obj) {
        let idx = -1;
        
        for(let i = 0; i < this.objects.length; i++) {
            if(obj == this.objects[i]) {
                idx = i;
                this.objects.splice(i, 1);
                break;
            }
        }

        for(let i = this.intervals.length - 1; i >= 0; i--) {
            if(idx == this.intervals[i][1]) {
                this.intervals.splice(i, 1);
            } else if(this.intervals[i][1] > idx) {
                this.intervals[i][1]--;
            }
        }
    }

    clear_objects() {
        this.objects = [];
        this.intervals = [];
    }

    sweep_and_prune() {
        let overlaps = [];
        let active_objects = {};

        if(this.sweep_x) {
            insertion_sort(this.intervals, (x) => x[0].x);
        } else {
            insertion_sort(this.intervals, (x) => x[0].y);
        }

        for(let i = this.intervals.length - 1; i >= 0; i--) {
            const node = this.intervals[i];
            if(active_objects[node[1]] != null) {
                delete active_objects[node[1]];
            } else {
                for(const key in active_objects) {
                    overlaps.push([this.objects[node[1]], this.objects[active_objects[key]]]);
                }

                active_objects[node[1]] = node[1];
            }
        }

        return overlaps;
    }

    update(dt) {
        this.step_forces(dt);
        for(let i = 0; i < 5; i++) {
            this.detect_collisions();
        }
    }

    step_forces(dt) {
        for(const obj of this.objects) {
            obj.step_forces(dt);
            obj.update();
        }
    }

    detect_collisions() {
        let simplex = [];
        for(let [s1, s2] of this.sweep_and_prune()) {
            if(!(simplex = this.GJK(s1, s2)))
                continue;

            let masked = false;

            for(let i = 0; i < s1.masks.length; i++) {
                for(let j = 0; j < s2.masks.length; j++) {
                    if(s1.masks[i] == s2.masks[j]) {
                        masked = true;
                        
                        i = s1.masks.length;
                        j = s2.masks.length;
                    }
                }
            }

            let normal, depth, contacts;

            if(s1 instanceof PhysCircle && s2 instanceof PhysCircle) {
                normal = Vec2D.normalize(Vec2D.sub(s1.pos, s2.pos));
                let contact = Vec2D.add(s1.pos, Vec2D.mult(normal, s1.radius));
                depth = s2.radius - Vec2D.mag(Vec2D.sub(s2.pos, contact));
                contacts = [contact];
            } else {
                [normal, depth] = this.EPA(s1, s2, simplex);
                contacts = this.find_contacts(s1, s2, normal);
            }

            if(s1.on_collision) s1.on_collision(s1, s2, normal);
            if(s2.on_collision) s2.on_collision(s2, s1, Vec2D.mult(normal, -1));

            if(s1.mass == 0 || s2.mass == 0)
                continue;
            if(masked)
                continue;

            for(const contact of contacts)
                this.apply_impulses(s1, s2, normal, contact);

            this.resolve_intersections(s1, s2, normal, depth);

            s1.update();
            s2.update();
        }
    }

    resolve_intersections(s1, s2, normal, depth) {
        const slop = .1;
        const percent = .98;
        const correction = Math.max(depth - slop, 0) * percent;
        const total_mass = s1.mass + s2.mass;

        if(s1.mass == Infinity && s2.mass == Infinity) {
            return;
        } else if(s1.mass == Infinity) {
            s2.pos.x += normal.x * correction;
            s2.pos.y += normal.y * correction;
        } else if(s2.mass == Infinity) {
            s1.pos.x -= normal.x * correction;
            s1.pos.y -= normal.y * correction;
        } else {
            s1.pos.x -= normal.x * correction * s2.mass / total_mass;
            s1.pos.y -= normal.y * correction * s2.mass / total_mass;
            
            s2.pos.x += normal.x * correction * s1.mass / total_mass;
            s2.pos.y += normal.y * correction * s1.mass / total_mass;
        }
    }

    apply_impulses(s1, s2, normal, contact) {
        const r1 = Vec2D.sub(s1.pos, contact);
        const v1 = Vec2D.add(s1.vel, Vec2D.cross(s1.rot_vel, r1));

        const r2 = Vec2D.sub(s2.pos, contact);
        const v2 = Vec2D.add(s2.vel, Vec2D.cross(s2.rot_vel, r2));

        const ab_vel = Vec2D.sub(v1, v2);
        const contact_vel = ab_vel.dot(normal);

        if(contact_vel >= 0)
            return;

        const arm_a = Vec2D.cross(r1, normal);
        const arm_b = Vec2D.cross(r2, normal);

        const rest = s1.material.restitution * s2.material.restitution;

        const m = 1 / s1.mass + 1 / s2.mass + arm_a * arm_a / s1.moi + arm_b * arm_b / s2.moi; 
        const j = (-(rest + 1) * contact_vel) / m;
        const impulse = Vec2D.mult(normal, j);

        s1.vel.sub(Vec2D.div(impulse, s1.mass));
        s2.vel.add(Vec2D.div(impulse, s2.mass));
        
        const r1_cross_i = Vec2D.cross(r1, impulse);
        const r2_cross_i = Vec2D.cross(r2, impulse);

        s1.rot_vel -= r1_cross_i / s1.moi;
        s2.rot_vel += r2_cross_i / s2.moi;
        
        const vf = ab_vel;

        const tangent = Vec2D.normalize(Vec2D.sub(Vec2D.mult(normal, vf.dot(normal)), vf));
        const jt = -vf.dot(tangent) / m;

        const mu = Math.sqrt(s1.material.s_friction * s1.material.s_friction + s2.material.s_friction * s2.material.s_friction)
        let impulse_t; 

        if(Math.abs(jt) < j * mu) {
            impulse_t = Vec2D.mult(tangent, jt);
        } else {
            const d_friction = Math.sqrt(s1.material.d_friction * s1.material.d_friction + s2.material.d_friction * s2.material.d_friction);
            impulse_t = Vec2D.mult(tangent, -j * d_friction);
        }

        s1.vel.sub(Vec2D.div(impulse_t, s1.mass));
        s2.vel.add(Vec2D.div(impulse_t, s2.mass));

        const r1_cross_it = Vec2D.cross(r1, impulse_t);
        const r2_cross_it = Vec2D.cross(r2, impulse_t);

        s1.rot_vel -= r1_cross_it / s1.moi;
        s2.rot_vel += r2_cross_it / s2.moi;
    }

    find_contacts(s1, s2, normal) {
        const [p1, e1] = s1.find_collision_edge(normal);
        const [p2, e2] = s2.find_collision_edge(Vec2D.mult(normal, -1));

        if(e1 == null)
            return [p1];

        if(e2 == null)
            return [p2];

        const e1_dif = Vec2D.sub(e1[1], e1[0]);
        const e2_dif = Vec2D.sub(e2[1], e2[0]);

        let ref, p_ref, e_ref, e_inc;
        if(Math.abs(e1_dif.dot(normal)) <= Math.abs(e2_dif.dot(normal))) {
            p_ref = p1;
            e_ref = e1;
            ref = e1_dif;
            e_inc = e2;
        } else {
            p_ref = p2;
            e_ref = e2;
            ref = e2_dif;
            e_inc = e1;
        }

        const ref_v = Vec2D.normalize(ref).mult(-1);
        const o1 = ref_v.dot(e_ref[0]);

        let cp = clip(e_inc[0], e_inc[1], ref_v, o1);

        if(cp.length < 2) return;

        const o2 = ref_v.dot(e_ref[1]);
        
        cp = clip(cp[0], cp[1], Vec2D.mult(ref_v, -1), -o2);
        
        if(cp.length < 2) return;

        let ref_norm = Vec2D.cross(ref, -1);
        const max = ref_norm.dot(p_ref);

        if(ref_norm.dot(cp[1]) - max < 0)
            cp.splice(1, 1);

        if(ref_norm.dot(cp[0]) - max < 0)
            cp.splice(0, 1);

        return cp;
    }

    GJK(s1, s2) {
        let d = Vec2D.normalize(Vec2D.sub(s1.pos, s2.pos));
        let simplex = [minkowski_dif_support(s1, s2, d)];
        d = Vec2D.sub(simplex[0], Vec2D.ZERO);

        while(true) {
            d = Vec2D.normalize(d);
            const A = minkowski_dif_support(s1, s2, d);
            if(A.dot(d) < 0)
                return false;
            simplex.push(A);
            if(this.handle_simplex(simplex, d))
                return simplex;
        }
    }

    handle_simplex(simplex, d) {
        if(simplex.length == 2)
            return this.line_case(simplex, d);
        return this.triangle_case(simplex, d);
    }

    line_case(simplex, d) {
        let [B, A] = simplex;
        let AB = Vec2D.sub(A, B);
        let AO = Vec2D.sub(A, Vec2D.ZERO);
        let AB_perp = Vec2D.triple_prod(AB, AO, AB);
        d.x = AB_perp.x;
        d.y = AB_perp.y;
        return false;
    }

    triangle_case(simplex, d) {
        let [C, B, A] = simplex;

        let AB = Vec2D.sub(A, B);
        let AC = Vec2D.sub(A, C);
        let AO = Vec2D.sub(A, Vec2D.ZERO);

        let AB_perp = Vec2D.triple_prod(AC, AB, AB);
        let AC_perp = Vec2D.triple_prod(AB, AC, AC);

        if(AB_perp.dot(AO) > 0) {

            simplex.splice(0, 1);

            d.x = AB_perp.x;
            d.y = AB_perp.y;

            return false;
        } else if(AC_perp.dot(AO) > 0) {

            simplex.splice(1, 1);

            d.x = AC_perp.x;
            d.y = AC_perp.y;

            return false;
        }
        return true;
    }

    // expanding polytope algorithm
    EPA(s1, s2, simplex) {
        let count = 0;
        while(true) {
            let [edge_dist, edge_norm, edge_idx] = this.find_closest_edge(simplex);
            let sup = minkowski_dif_support(s1, s2, edge_norm);

            if(count++ > 100)
                throw "problem";

            const d = sup.dot(edge_norm);
            if(d - edge_dist <= 0.01) {
                return [edge_norm, edge_dist];
            } else {
                simplex.splice(edge_idx, 0, sup);
            }
        }
    }

    find_closest_edge(simplex) {
        let dist = Infinity;
        let normal, idx;

        for(let i = 0; i < simplex.length; i++) {
            const j = (i + 1) % simplex.length;

            const edge = Vec2D.sub(simplex[i], simplex[j]);
            const n = Vec2D.normalize(Vec2D.triple_prod(edge, simplex[i], edge));

            const d = n.dot(simplex[i]);

            if(d < dist) {
                dist = d;
                normal = n;
                idx = j;
            }
        }

        return [dist, normal, idx];
    }

    draw_objects(ctx) {
        for(const obj of this.objects) {
            obj.draw(ctx);
        }
    }
}

let count = 0;