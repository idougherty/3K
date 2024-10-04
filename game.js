
class Level {
    dynamic_objects = [];
    static_objects = [];

    goal_spawns = [];
    player_spawns = [];
    ball_spawn;

    step() {
        
    }
}

class Game {
    static SEC_PER_TICK = 1 / 60;
    static GET_TICK = () => Math.floor(Date.now() / 1000 / Game.SEC_PER_TICK);
    static ctx;

    phys_env;
    level;
    tick;

    players = [];
    ball;
    goals = [];
    
    constructor() {
        this.phys_env = new PhysEnv();
    }

    load_level(level) {
        this.level = level;

        for(const object of level.dynamic_objects)
            this.phys_env.add_object(object);

        for(const object of level.static_objects)
            this.phys_env.add_object(object);

        for(const spawn of level.player_spawns)
            this.players.push(PlayerFactory.create_player(this.phys_env, spawn));

        for(const {pos, dir} of level.goal_spawns)
            this.goals.push(new Goal(this.phys_env, pos, dir, this.on_score));
        
        this.ball = new Basketball(level.ball_spawn);
        this.phys_env.add_object(this.ball);
    }

    init() {
        this.tick = Game.GET_TICK();
        this.draw_loop();
    }

    on_score() {
        console.log("SCORE!!!");
    }

    apply_gravity() {
        for(const obj of this.phys_env.objects) {
            if(obj.mass == 0 || obj.mass == Infinity)
                continue;

            const strength = obj.gravity_strength ?? 400;

            let gravity = {
                pos: obj.pos,
                dir: new Vec2D(0, obj.mass * strength),
            };
        
            obj.apply_force(gravity);
        }
    }

    step() {
        this.apply_gravity();
        this.phys_env.update(Game.SEC_PER_TICK);

        for(const player of this.players)
            player.step();

        this.ball.step();

        for(const goal of this.goals)
            goal.step();

        this.level.step();
    }

    draw(ctx) {
        ctx.fillStyle = "#444";
        ctx.fillRect(0, 0, C_WDTH, C_HGHT);

        for(const goal of this.goals)
            goal.draw(ctx);

        this.phys_env.draw_objects(ctx);
    }
    
    draw_loop() {
        let curr_tick = Game.GET_TICK();
    
        while(this.tick < curr_tick) {
            this.step();
            this.tick++;
        }

        this.draw(ctx);
        
        window.requestAnimationFrame(this.draw_loop.bind(this));
    }
}