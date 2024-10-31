function level_two_tramp(C_WDTH, C_HGHT) {

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

    let plat_pos = new Vec2D(C_WDTH * 1/2, C_HGHT * 0.75);
    let plat = new PhysPolygon(plat_pos, platform_shape, MATERIAL_FLOOR);
    plat.tag = "floor";
    level.static_objects.push(plat);

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