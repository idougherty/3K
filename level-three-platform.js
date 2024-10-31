function level_three_platform(C_HGHT, C_HGHT) {

    let level = level_empty(C_WDTH, C_HGHT);
    
    const MATERIAL_FLOOR = {
        density: Infinity,
        restitution: .7,
        s_friction: .2,
        d_friction: .1,
        color: "#eee",
    };

    let platform_shape = [
        new Vec2D(0, 0),
        new Vec2D(0, 15),
        new Vec2D(150, 15),
        new Vec2D(150, 0),
    ];

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

    // for(let i = 0; i < 100; i++) {

    //     const MATERIAL_SUPERBALL = {
    //         density: 0.1,
    //         restitution: 1,
    //         s_friction: .2,
    //         d_friction: .1,
    //         color: `hsl(${Math.floor(Math.random()*360)}, 70%, 60%)`,
    //     };

    //     let superballPos = new Vec2D(C_WDTH / 2 + Math.random(), Math.random());

    //     let superball = new PhysCircle(superballPos, 10, MATERIAL_SUPERBALL);
    //     superball.tag = "superball";
    //     level.dynamic_objects.push(superball);
    // }

    return level;
}