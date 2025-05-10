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
    restitution: .95,
    s_friction: .6,
    d_friction: .4,
    color: "#a7a",
};

let pos1 = new Vec2D(C_WDTH/2, C_HGHT * 2/5);
let ball1 = new PhysCircle(pos1, 30, MATERIAL_TEST);
// ball1.vel.y = 50;
// ball1.mass = 100;

let pos2 = new Vec2D(C_WDTH/2, C_HGHT * 0.9);
let ball2 = new PhysCircle(pos2, 30, MATERIAL_TEST);
// ball2.rot_vel = 1;
// ball1.mass = Infinity;
// ball2.moi = Infinity;
// ball1.gravity_strength = 0;
// ball2.gravity_strength = 0;

let pos3 = new Vec2D(C_WDTH/2, C_HGHT/2);
let ball3 = new PhysCircle(pos1, 15);
ball3.mass = Infinity;
ball3.tag = "swing-joint";
Game.PHYS_ENV.mask_table.add_default_mask(ball3.tag);

let constraint1 = new FixedConstraint(ball1, ball2);
let constraint2 = new DistanceConstraint(ball1, ball3);

Game.PHYS_ENV.add_object(ball1);
Game.PHYS_ENV.add_object(ball2);
Game.PHYS_ENV.add_object(ball3);
Game.PHYS_ENV.add_constraint(constraint1);
Game.PHYS_ENV.add_constraint(constraint2);

game.init();

