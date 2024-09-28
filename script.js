let canvas = document.getElementById("paper");
let ctx = canvas.getContext("2d");

const C_WDTH = canvas.width;
const C_HGHT = canvas.height;

let env, player1, player2, ball, l_goal, r_goal;
let superballs = [];

function initPhys() {
    env = new PhysEnv([]);

    p1Controls = {
        left: "KeyA",
        right: "KeyD",
        up: "KeyW",
        action: "KeyF",
    };

    p2Controls = {
        left: "ArrowLeft",
        right: "ArrowRight",
        up: "ArrowUp",
        action: "KeyM",
    };

    let player1Pos = new Vec2D(C_WDTH * 1/4, C_HGHT * 2/3);
    player1 = new Player(env, player1Pos, p1Controls, "#6e6");

    let player2Pos = new Vec2D(C_WDTH * 3/4, C_HGHT * 2/3);
    player2 = new Player(env, player2Pos, p2Controls, "#e6e");

    const MATERIAL_FLOOR = {
        density: Infinity,
        restitution: .7,
        sFriction: .2,
        dFriction: .1,
        color: "#eee",
    };

    let ballPos = new Vec2D(C_WDTH / 3, C_HGHT * 2/3);
    ball = new Basketball(ballPos);
    env.addObject(ball);

    ball.masks.push("ball-net");

    const WALL_WDTH = 15;

    let floorShape = [
        new Vec2D(WALL_WDTH,  -WALL_WDTH),
        new Vec2D(-WALL_WDTH,  WALL_WDTH),
        new Vec2D(C_WDTH + WALL_WDTH, WALL_WDTH),
        new Vec2D(C_WDTH - WALL_WDTH, -WALL_WDTH),
    ];

    let leftWallShape = [
        new Vec2D(-WALL_WDTH,  -WALL_WDTH),
        new Vec2D(WALL_WDTH,  WALL_WDTH),
        new Vec2D(WALL_WDTH, C_HGHT - WALL_WDTH),
        new Vec2D(-WALL_WDTH, C_HGHT + WALL_WDTH),
    ];

    let rightWallShape = [
        new Vec2D(-WALL_WDTH,  WALL_WDTH),
        new Vec2D(WALL_WDTH,  -WALL_WDTH),
        new Vec2D(WALL_WDTH, C_HGHT + WALL_WDTH),
        new Vec2D(-WALL_WDTH, C_HGHT - WALL_WDTH),
    ];

    let floorPos = new Vec2D(C_WDTH * 1/2, C_HGHT);
    floor = new PhysPolygon(floorPos, floorShape, MATERIAL_FLOOR);
    env.addObject(floor);
    floor.tag = "floor";

    let leftWallPos = new Vec2D(0, C_HGHT * 1/2);
    let leftWall = new PhysPolygon(leftWallPos, leftWallShape, MATERIAL_FLOOR);
    env.addObject(leftWall);

    let rightWallPos = new Vec2D(C_WDTH, C_HGHT * 1/2);
    let rightWall = new PhysPolygon(rightWallPos, rightWallShape, MATERIAL_FLOOR);
    env.addObject(rightWall);

    const MATERIAL_TRAMP = {
        density: 0,
        restitution: 5,
        sFriction: .2,
        dFriction: .1,
        color: "#66f",
    };

    let trampPos = new Vec2D(C_WDTH * 1/2, C_HGHT * 1.25);
    let tramp = new PhysCircle(trampPos, 180, MATERIAL_TRAMP);
    env.addObject(tramp);

    tramp.onCollision = (_, other, {normal}) => {
        if(other.mass == Infinity || other.mass == 0)
            return;

        other.vel = normal.mult(400);
    }

    for(let i = 0; i < 0; i++) {

        const MATERIAL_SUPERBALL = {
            density: .1,
            restitution: 1,
            sFriction: .2,
            dFriction: .1,
            color: `hsl(${Math.floor(Math.random()*360)}, 70%, 60%)`,
        };

        let superballPos = new Vec2D(100+ (i*5), 0);

        let superball = new PhysCircle(superballPos, 10, MATERIAL_SUPERBALL);
        superball.tag = "superball";
        superballs.push(superball)
        env.addObject(superball);
    }

    const RIM_YPOS = C_HGHT * 0.6;
    const LRIM_XPOS = C_WDTH * 0.1;
    const RRIM_XPOS = C_WDTH * 0.9;

    l_goal = new Goal(env, new Vec2D(LRIM_XPOS, RIM_YPOS), 1);
    r_goal = new Goal(env, new Vec2D(RRIM_XPOS, RIM_YPOS), -1);
}

function superballs_step () {
    for(const superball of superballs) {
        let gravity = {
            pos: superball.pos,
            dir: new Vec2D(0, superball.mass * 400),
        };
    
        superball.applyForce(gravity);
    }
}

function drawLoop() {
    ctx.fillStyle = "#444";
    ctx.fillRect(0, 0, C_WDTH, C_HGHT);
    env.update(.01667, ctx);
    

    player1.step();
    player2.step();
    ball.step();
    l_goal.step();
    r_goal.step();
    superballs_step();

    l_goal.draw(ctx);
    r_goal.draw(ctx);
    env.drawObjects(ctx);

    window.requestAnimationFrame(drawLoop);
}

let game = new Game();

initPhys();
drawLoop();
