
class Level {
    dynamic_objects = [];
    static_objects = [];

    player_spawns = [];
    ball_spawns = [];
}

class Game {

    phys_env;
    level;

    players = [];
    balls = [];
    goals = [];
    
    constructor() {
        this.phys_env = new PhysEnv();
    }

    load_level(level) {
    }

    
}