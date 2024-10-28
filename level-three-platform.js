function level_three_platform(C_HGHT, C_HGHT) {

    let level = new Level();
    level.ball_spawn = new Vec2D(C_WDTH / 2, C_HGHT * 1/3);
    level.player_spawns[0] = new Vec2D(C_WDTH * 1/6, C_HGHT * 4/5);
    level.player_spawns[1] = new Vec2D(C_WDTH * 5/6, C_HGHT * 4/5);
    level.goal_spawns[0] = {pos:  new Vec2D(C_WDTH * 0.1, C_HGHT * 0.52), dir: 1};
    level.goal_spawns[1] = {pos:  new Vec2D(C_WDTH * 0.9, C_HGHT * 0.52), dir: -1};
    
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
        new Vec2D(-WALL_WDTH, C_HGHT + WALL_WDTH),
        new Vec2D(WALL_WDTH, C_HGHT - WALL_WDTH),
        new Vec2D(WALL_WDTH,  WALL_WDTH),
    ];

    let right_wall_shape = [
        new Vec2D(-WALL_WDTH,  WALL_WDTH),
        new Vec2D(-WALL_WDTH, C_HGHT - WALL_WDTH),
        new Vec2D(WALL_WDTH, C_HGHT + WALL_WDTH),
        new Vec2D(WALL_WDTH,  -WALL_WDTH),
    ];

    let platform_shape = [
        new Vec2D(0, 0),
        new Vec2D(0, 15),
        new Vec2D(150, 15),
        new Vec2D(150, 0),
    ];

    let floor_pos = new Vec2D(C_WDTH * 1/2, C_HGHT);
    let floor = new PhysPolygon(floor_pos, floor_shape, MATERIAL_FLOOR);
    floor.tag = "floor";
    level.static_objects.push(floor);

    let plat1_pos = new Vec2D(C_WDTH * 0.33, C_HGHT * 0.82);
    let plat1 = new PhysPolygon(plat1_pos, platform_shape, MATERIAL_FLOOR);
    plat1.tag = "floor";
    level.static_objects.push(plat1);

    let plat2_pos = new Vec2D(C_WDTH * 0.67, C_HGHT * 0.82);
    let plat2 = new PhysPolygon(plat2_pos, platform_shape, MATERIAL_FLOOR);
    plat2.tag = "floor";
    level.static_objects.push(plat2);

    let plat3_pos = new Vec2D(C_WDTH * 0.5, C_HGHT * 0.67);
    let plat3 = new PhysPolygon(plat3_pos, platform_shape, MATERIAL_FLOOR);
    plat3.tag = "floor";
    level.static_objects.push(plat3);

    let plats = [plat1, plat2, plat3];

    let left_wall_pos = new Vec2D(0, C_HGHT * 1/2);
    let left_wall = new PhysPolygon(left_wall_pos, left_wall_shape, MATERIAL_FLOOR);
    level.static_objects.push(left_wall);

    let right_wall_pos = new Vec2D(C_WDTH, C_HGHT * 1/2);
    let right_wall = new PhysPolygon(right_wall_pos, right_wall_shape, MATERIAL_FLOOR);
    level.static_objects.push(right_wall);

    // level.step = (game) => {
    //     for(const player of game.players) {
    //         for(let i = 0; i < plats.length; i++) {
    //             if(player.body.pos.y + PlayerBody.HEIGHT/2 > plats[i].pos.y) {
    //                 Game.PHYS_ENV.mask_table.set_mask(player.body.tag, "platform-"+(i+1), true);
    //             } else {
    //                 Game.PHYS_ENV.mask_table.set_mask(player.body.tag, "platform-"+(i+1), false);
    //             }

    //             if(Input.is_key_pressed(player.controls.down)) {
    //                 Game.PHYS_ENV.mask_table.set_mask(player.body.tag, "platform-"+(i+1), true);
    //             }
    //         }
    //     }
    // };

    return level;
}