let canvas = document.getElementById("paper");
let ctx = canvas.getContext("2d");
Game.ctx = ctx;

const C_WDTH = canvas.width;
const C_HGHT = canvas.height;

let game = new Game();

let level = new Level();
level.ball_spawn = new Vec2D(C_WDTH / 3, C_HGHT * 2/3);
level.player_spawns[0] = new Vec2D(C_WDTH * 2/5, C_HGHT * 2/3);
level.player_spawns[1] = new Vec2D(C_WDTH * 3/4, C_HGHT * 2/3);
level.goal_spawns[0] = {pos:  new Vec2D(C_WDTH * 0.1, C_HGHT * 0.6), dir: 1};
level.goal_spawns[1] = {pos:  new Vec2D(C_WDTH * 0.9, C_HGHT * 0.6), dir: -1};

const MATERIAL_FLOOR = {
    density: Infinity,
    restitution: .7,
    s_friction: .2,
    d_friction: .1,
    color: "#eee",
};

const WALL_WDTH = 25;

let floor_shape = [
    new Vec2D(WALL_WDTH,  -WALL_WDTH),
    new Vec2D(-WALL_WDTH,  WALL_WDTH),
    new Vec2D(C_WDTH + WALL_WDTH, WALL_WDTH),
    new Vec2D(C_WDTH - WALL_WDTH, -WALL_WDTH),
];

let left_wall_shape = [
    new Vec2D(-WALL_WDTH,  -WALL_WDTH),
    new Vec2D(WALL_WDTH,  WALL_WDTH),
    new Vec2D(WALL_WDTH, C_HGHT - WALL_WDTH),
    new Vec2D(-WALL_WDTH, C_HGHT + WALL_WDTH),
];

let right_wall_shape = [
    new Vec2D(-WALL_WDTH,  WALL_WDTH),
    new Vec2D(WALL_WDTH,  -WALL_WDTH),
    new Vec2D(WALL_WDTH, C_HGHT + WALL_WDTH),
    new Vec2D(-WALL_WDTH, C_HGHT - WALL_WDTH),
];

let platform_shape = [
    new Vec2D(-WALL_WDTH,  WALL_WDTH),
    new Vec2D(WALL_WDTH,  -WALL_WDTH),
    new Vec2D(WALL_WDTH, C_HGHT + WALL_WDTH),
    new Vec2D(-WALL_WDTH, C_HGHT - WALL_WDTH),
];

let floor_pos = new Vec2D(C_WDTH * 1/2, C_HGHT);
floor = new PhysPolygon(floor_pos, floor_shape, MATERIAL_FLOOR);
floor.tag = "floor";
level.static_objects.push(floor);

let left_wall_pos = new Vec2D(0, C_HGHT * 1/2);
let left_wall = new PhysPolygon(left_wall_pos, left_wall_shape, MATERIAL_FLOOR);
level.static_objects.push(left_wall);

let right_wall_pos = new Vec2D(C_WDTH, C_HGHT * 1/2);
let right_wall = new PhysPolygon(right_wall_pos, right_wall_shape, MATERIAL_FLOOR);
level.static_objects.push(right_wall);

let box_shape = [
    new Vec2D(-10, -10),
    new Vec2D(-10, 10),
    new Vec2D(10, 10),
    new Vec2D(10, -10),
];

const MATERIAL_BOX = {
    density: 1,
    restitution: 0.4,
    s_friction: .2,
    d_friction: .1,
    color: "#393",
};

// for(let i = 0; i < 10; i++) {
//     let pos = new Vec2D(C_WDTH/2 + Math.random(), i*20 + 340);
//     let box = new PhysPolygon(pos, box_shape, MATERIAL_BOX);
//     box.tag = "superball"
//     level.dynamic_objects.push(box);
// }

// let box_pos = new Vec2D(C_WDTH * 2/3, C_HGHT * 0.6);
// let box = new PhysPolygon(box_pos, box_shape, MATERIAL_BOX);
// box.tag = "box";
// level.dynamic_objects.push(box);

const MATERIAL_TRAMP = {
    density: Infinity,
    restitution: 1,
    s_friction: .2,
    d_friction: .1,
    color: "#66f",
};

let tramp_pos = new Vec2D(C_WDTH * 1/4, C_HGHT * 1.19);
let tramp = new PhysCircle(tramp_pos, 150, MATERIAL_TRAMP);
tramp.tag = "tramp";
level.static_objects.push(tramp);
Game.PHYS_ENV.rest_table.add_restitution_override(tramp.tag, 0.9);

tramp.on_impulse = (_, other, {normal, impulse, contact}) => {
    if(other.mass == Infinity) 
        return false;

    Game.PHYS_ENV.apply_impulse(tramp, other, impulse, contact);

    const target_impulse = 350;

    let vel_mag = other.vel.dot(normal); 
    let new_impulse = Vec2D.mult(normal, (target_impulse - vel_mag) * other.mass);
    Game.PHYS_ENV.apply_impulse(tramp, other, new_impulse, contact);

    return true;
}

// for(let i = 0; i < 300; i++) {

//     const MATERIAL_SUPERBALL = {
//         density: .1,
//         restitution: 0.5,
//         s_friction: .2,
//         d_friction: .1,
//         color: `hsl(${Math.floor(Math.random()*360)}, 70%, 60%)`,
//     };

//     let pos = new Vec2D(C_WDTH/2 + Math.random(), Math.random());

//     let superball = new PhysCircle(pos, 10, MATERIAL_SUPERBALL);
//     superball.tag = "superball";
//     level.dynamic_objects.push(superball);
// }

game.load_level(level);
game.init();

