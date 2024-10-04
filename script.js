let canvas = document.getElementById("paper");
let ctx = canvas.getContext("2d");
Game.ctx = ctx;

const C_WDTH = canvas.width;
const C_HGHT = canvas.height;

let game = new Game();

let level = new Level();
level.ball_spawn = new Vec2D(C_WDTH / 3, C_HGHT * 2/3);
level.player_spawns[0] = new Vec2D(C_WDTH * 1/4, C_HGHT * 2/3);
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
    new Vec2D(-20, -20),
    new Vec2D(-20, 20),
    new Vec2D(20, 20),
    new Vec2D(20, -20),
];

const MATERIAL_TRAMP = {
    density: Infinity,
    restitution: 5,
    s_friction: .2,
    d_friction: .1,
    color: "#66f",
};

let tramp_pos = new Vec2D(C_WDTH * 1/2, C_HGHT * 1.25);
let tramp = new PhysCircle(tramp_pos, 200, MATERIAL_TRAMP);
level.static_objects.push(tramp);

tramp.on_collision = (_, other, {normal}) => {
    if(other.mass == Infinity || other.mass == 0)
        return;

    other.vel = Vec2D.mult(normal, 400);
}

// for(let i = 0; i < 10; i++) {

//     const MATERIAL_SUPERBALL = {
//         density: .1,
//         restitution: 1,
//         s_friction: .2,
//         d_friction: .1,
//         color: `hsl(${Math.floor(Math.random()*360)}, 70%, 60%)`,
//     };

//     let pos = new Vec2D(100+(i*5), 0);

//     let superball = new PhysCircle(pos, 10, MATERIAL_SUPERBALL);
//     superball.tag = "superball";
//     level.dynamic_objects.push(superball);
// }

game.load_level(level);
game.init();

