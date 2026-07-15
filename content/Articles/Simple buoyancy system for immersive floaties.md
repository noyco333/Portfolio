---
publish: true
---
July 15th 2026

*tools: [[Unity]], [[Cluster]]*
*project: [[Marina '88]]*

[[Marina '88]] has a pool and floaties inside of it. I wanted it to have a somewhat convincing buoyancy system that can react to collision against walls, players and other floaties.
![[Pasted image 20260715164409.png]]

I achieved this by approximating how deep the object is submerged as a whole. Using only the object's Y position and comparing it to the water surface Y level would be inadequate because it cannot account for tilt. I resolved this by creating an arbitrary number of "buoy points" where the water depth is calculated. The up-force is applied individually at each buoy point according to its own depth using `$.addForceAt()`.

![[Screenshot 2026-07-15 164745 1.png]]
*the "buoy points" of a floatie labeled as gray diamond icons*

![[a84e2a5c-4fd4-4b07-8108-790724671b9e.png]]
*The motorboat in [[Marina '88]] uses the exact same script.*

The final script has some added features like returning to its original position after being out of water for too long.
```
const maxDepth = 0.5;
const playerCollisionPower = 0.5;

let isRiding = false;
let targetForce;
let targetRotation;

let outOfWaterTimer = 0;

$.onStart(() => {
    $.state.initPos = $.getPosition();
    $.state.initRot = $.getRotation();
})

$.onRide((isGetOn, player) => {
    $.setStateCompat("this", "on", isGetOn);
    isRiding = isGetOn;
    targetForce = undefined;
    targetRotation = undefined;
})

$.onCollide(collision => {
    if (isRiding) return;
    if (collision.handle?.type === "player") {
        let playerPos = collision.handle.getPosition();
        $.addImpulsiveForceAt($.getPosition().sub(playerPos).normalize().multiplyScalar(playerCollisionPower), playerPos);
    }
});

$.onSteer((input, player) => {
    let speed = $.getStateCompat("this", "speed", "float");
    let steer = $.getStateCompat("this", "steer", "float");
    if ($.getStateCompat("this", "forward", "vector3").length() > 0){
        targetForce = $.getStateCompat("this", "forward", "vector3").normalize().multiplyScalar(input.y * speed);
    }
    else{
        targetForce = Vector3(0, 0, input.y * speed);
    }
    
    targetRotation = Vector3(0, input.x * steer, 0);
});

$.onPhysicsUpdate(deltaTime => {
    if (targetForce != undefined){
        $.addForce(targetForce.clone().applyQuaternion($.getRotation()));
    }
    if (targetRotation != undefined){
        $.addTorque(targetRotation);
    }

    let waterHeight = $.getStateCompat("this", "waterHeight", "float");
    let buoyancy = $.getStateCompat("this", "buoyancy", "float");

    let wet = false;
    for (let i = 0; i < 4; i++){
        let node = $.subNode(`buoyPoint (${i})`);
        let force = Math.max(0, Math.min(maxDepth, waterHeight - node.getGlobalPosition().y)) * (buoyancy / 4);

        if (force > 0){
            $.addForceAt(Vector3(0, force, 0), node.getGlobalPosition());
            wet = true;
        }
    }

    if (!wet){
        outOfWaterTimer += deltaTime;
        if (outOfWaterTimer > 30){
            outOfWaterTimer = 0;
            $.setPosition($.state.initPos);
            $.setRotation($.state.initRot);
        }
    }
    else{
        outOfWaterTimer = 0;
    }
    $.setStateCompat("this", "speedRatio", $.velocity.length() / Math.max(0.1, $.getStateCompat("this", "targetSpeed", "float")));
});
```