function level_two_tramp(C_HGHT, C_HGHT) {

    let level = new Level();
    level.ball_spawn = new Vec2D(C_WDTH / 2, C_HGHT * 2/3);
    level.player_spawns[0] = new Vec2D(C_WDTH * 1/6, C_HGHT * 4/5);
    level.player_spawns[1] = new Vec2D(C_WDTH * 5/6, C_HGHT * 4/5);
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

    let tramp_bounce = (tramp, other, {normal, impulse, contact}) => {
        if(other.mass == Infinity) 
            return false;
        
        Game.PHYS_ENV.apply_impulse(tramp, other, impulse, contact);
        
        const target_impulse = 350;
        
        let vel_mag = other.vel.dot(normal); 
        let new_impulse = Vec2D.mult(normal, (target_impulse - vel_mag) * other.mass);
        Game.PHYS_ENV.apply_impulse(tramp, other, new_impulse, contact);
        
        return true;
    }

    const MATERIAL_TRAMP = {
        density: Infinity,
        restitution: 1,
        s_friction: .2,
        d_friction: .1,
        color: "#66f",
    };

    let tramp_pos = new Vec2D(C_WDTH * 2/7, C_HGHT * 1.19);
    let tramp = new PhysCircle(tramp_pos, 150, MATERIAL_TRAMP);
    tramp.tag = "tramp";
    tramp.on_impulse = tramp_bounce;
    level.static_objects.push(tramp);
    Game.PHYS_ENV.rest_table.add_restitution_override(tramp.tag, 0.9);

    tramp_pos = new Vec2D(C_WDTH * 5/7, C_HGHT * 1.19);
    tramp = new PhysCircle(tramp_pos, 150, MATERIAL_TRAMP);
    tramp.tag = "tramp";
    tramp.on_impulse = tramp_bounce;
    level.static_objects.push(tramp);
    Game.PHYS_ENV.rest_table.add_restitution_override(tramp.tag, 0.9);

    return level;
}