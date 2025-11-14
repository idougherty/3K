let canvas = document.getElementById("paper");
let ctx = canvas.getContext("2d");

const C_WDTH = canvas.width;
const C_HGHT = canvas.height;

const level = level_empty(C_WDTH, C_HGHT); 
// const level = level_two_tramp(C_WDTH, C_HGHT);
// const level = level_three_platform(C_WDTH, C_HGHT); 

let game = new Game();
game.load_level(level);

const MATERIAL_TEST = {
    density: 0.5,
    restitution: 0.7,
    s_friction: .4,
    d_friction: .3,
    color: "#a7a",
};

let shape1 = [
    new Vec2D(0, 0),
    new Vec2D(0, 60),
    new Vec2D(60, 60),
    new Vec2D(60, 0),
];

let shape2 = [
    new Vec2D(0, 0),
    new Vec2D(0, 15),
    new Vec2D(15, 15),
    new Vec2D(15, 0),
];

let anchor_pos = new Vec2D(C_WDTH * 0.3, C_HGHT * 0.7);
let anchor = new PhysCircle(anchor_pos, 5, MATERIAL_WALL);
anchor.tag = "anchor";

let pos1 = new Vec2D(C_WDTH * 0.3, C_HGHT * 0.80);
let ball1 = new PhysCircle(pos1, 15, MATERIAL_TEST);
// let ball1 = new PhysPolygon(pos1, shape2, MATERIAL_TEST);
ball1.tag = "ball1";

let pos2 = new Vec2D(C_WDTH * 0.4, C_HGHT * 0.80);
let ball2 = new PhysCircle(pos2, 15, MATERIAL_TEST);
// let ball2 = new PhysPolygon(pos2, shape1, MATERIAL_TEST);
ball2.tag = "ball2";

// let pos3 = new Vec2D(C_WDTH * 0.50, C_HGHT * 0.65);
// let ball3 = new PhysCircle(pos3, 30, MATERIAL_TEST);
// let ball3 = new PhysPolygon(pos3, shape2, MATERIAL_TEST);
// ball3.tag = "ball3";

// ball1.rot_vel = Math.PI;
// ball2.rot_vel = 2;
// ball2.vel.x = -50;
ball1.vel.x = 50;

ball1.rot_vel = 2;
// ball1.gravity_strength = 0;
// ball2.gravity_strength = 0;
// ball3.gravity_strength = 0;

let constraint1 = new DistanceConstraintNonCOM(ball1, ball2, 15, new Vec2D(ball2.radius, 0), new Vec2D(ball1.radius, 0));
let constraint2 = new DistanceConstraintNonCOM(anchor, ball1, 15, new Vec2D(0, anchor.radius), new Vec2D(-ball1.radius, 0));
// let constraint3 = new FixedConstraint(anchor, ball1);
// let constraint1 = new DistanceConstraint(ball1, ball2, 40, new Vec2D(0, 0), new Vec2D(0, 0));
// let constraint2 = new FixedConstraint(constraint1.composite_body, ball3);

// constraint1.update_composite_body();
// constraint1.composite_body.angle = Math.PI;
// constraint1.composite_body.rot_vel = Math.PI/2;
// constraint1.composite_body.vel.x = 50;
// constraint1.apply_composite_body();

// ball2.rot_vel = Math.PI;
// ball3.rot_vel = Math.PI;

Game.PHYS_ENV.mask_table.set_mask(anchor.tag, ball1.tag);
Game.PHYS_ENV.mask_table.set_mask(ball1.tag, ball2.tag);

Game.PHYS_ENV.add_object(anchor);
Game.PHYS_ENV.add_object(ball1);
Game.PHYS_ENV.add_object(ball2);
// Game.PHYS_ENV.add_object(ball3);
Game.PHYS_ENV.add_constraint(constraint1);
Game.PHYS_ENV.add_constraint(constraint2);
// Game.PHYS_ENV.add_constraint(constraint3);

game.init();

console.log("STARTING!!!!")

