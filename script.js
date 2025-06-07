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

let pos1 = new Vec2D(C_WDTH * 0.4, C_HGHT * 0.70);
// let ball1 = new PhysCircle(pos1, 10, MATERIAL_TEST);
let ball1 = new PhysPolygon(pos1, shape2, MATERIAL_TEST);
ball1.tag = "ball1";

let pos2 = new Vec2D(C_WDTH * 0.4, C_HGHT * 0.85);
// let ball2 = new PhysCircle(pos2, 30, MATERIAL_TEST);
let ball2 = new PhysPolygon(pos2, shape1, MATERIAL_TEST);
ball2.tag = "ball2";

let pos3 = new Vec2D(C_WDTH * 0.55, C_HGHT * 0.70);
// let ball3 = new PhysCircle(pos3, 10, MATERIAL_TEST);
let ball3 = new PhysPolygon(pos3, shape2, MATERIAL_TEST);
ball3.tag = "ball3";

// ball1.rot_vel = Math.PI;
// ball2.rot_vel = 2;
// ball2.vel.x = -50;
// ball1.vel.x = 50;

// ball1.gravity_strength = 0;
// ball2.gravity_strength = 0;
// ball3.gravity_strength = 0;

let constraint1 = new FixedConstraint(ball1, ball2);
let constraint2 = new FixedConstraint(constraint1.composite_body, ball3);

// constraint1.composite_body.rot_vel = 1;

Game.PHYS_ENV.add_object(ball1);
Game.PHYS_ENV.add_object(ball2);
Game.PHYS_ENV.add_object(ball3);
Game.PHYS_ENV.add_constraint(constraint1);
// Game.PHYS_ENV.add_constraint(constraint2);

game.init();

console.log("STARTING!!!!")

