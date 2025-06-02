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
// let ball1 = new PhysCircle(pos1, 5, MATERIAL_TEST);
let ball1 = new PhysPolygon(pos1, shape1, MATERIAL_TEST);
ball1.tag = "ball1";

let pos2 = new Vec2D(C_WDTH * 0.4, C_HGHT * 0.85);
// let ball2 = new PhysCircle(pos2, 10, MATERIAL_TEST);
// ball2.tag = "ball2";

// let square = new PhysCircle(pos2, 30, MATERIAL_TEST);
let square = new PhysPolygon(pos2, shape1, MATERIAL_TEST);
square.tag = "square";
// ball1.rot_vel = 2;
// square.vel.x = 50;
// ball1.vel.x = -50;

// ball1.gravity_strength = 0;
// square.gravity_strength = 0;

let constraint = new FixedConstraint(ball1, square);
// let constraint = new DistanceConstraint(ball1, square);

Game.PHYS_ENV.mask_table.set_mask(ball1.tag, square.tag, true);
Game.PHYS_ENV.add_object(ball1);
// Game.PHYS_ENV.add_object(ball2);
Game.PHYS_ENV.add_object(square);
Game.PHYS_ENV.add_constraint(constraint);

game.init();

