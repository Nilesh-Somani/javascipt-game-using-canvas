const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024
canvas.height = 576

const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 120) {
    collisionsMap.push(collisions.slice(i, 120 + i));
}

const battleZonesMap = [];
for (let i = 0; i < battleZonesData.length; i += 120) {
    battleZonesMap.push(battleZonesData.slice(i, 120 + i));
}

const boundaries = [];

const offset = {
    x: -3785,
    y: -1900
}

collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025)
            boundaries.push(new Boundary({
                position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y / 1.015
                }
            }))
    })
})

const battleZones = [];

battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 1025)
            battleZones.push(new Boundary({
                position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y / 1.025
                }
            }))
    })
})

const image = new Image();
image.src = './img/Town.png';

const playerDownImage = new Image();
playerDownImage.src = './img/playerDown.png';

const playerUpImage = new Image();
playerUpImage.src = './img/playerUp.png';

const playerLeftImage = new Image();
playerLeftImage.src = './img/playerLeft.png';

const playerRightImage = new Image();
playerRightImage.src = './img/playerRight.png';

const foregroundImage = new Image();
foregroundImage.src = './img/foregroundObjects.png';

const player = new Sprite({
    position: {
        x: canvas.width / 2 - playerDownImage.width / 4 / 2,
        y: canvas.height / 2 - playerDownImage.height
    },
    image: playerDownImage,
    frames: { max: 4, hold: 10 },
    sprites: {
        up: playerUpImage,
        down: playerDownImage,
        left: playerLeftImage,
        right: playerRightImage
    }
})

const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: image
})

const foreground = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: foregroundImage
})

const keys = {
    u: {
        pressed: false
    },
    d: {
        pressed: false
    },
    l: {
        pressed: false
    },
    r: {
        pressed: false
    },
}

const movables = [background, ...boundaries, foreground, ...battleZones];

function rectangularCollision({ rectangle1, rectangle2 }) {
    return rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height
}

const battle = {
    initiated: false
}

function animate() {
    const animationId = window.requestAnimationFrame(animate);
    background.draw();
    boundaries.forEach(boundary => {
        boundary.draw();
    })
    battleZones.forEach(battleZone => {
        battleZone.draw();
    })
    player.draw()
    foreground.draw();
    let moving = true;
    player.animate = false;
    if (battleZones.initiated) return;
    if (keys.u.pressed || keys.d.pressed || keys.l.pressed || keys.r.pressed) {
        for (let i = 0; i < battleZones.length; i++) {
            const battleZone = battleZones[i];
            const overlapingArea = (Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width) - Math.max(player.position.x, battleZone.position.x)) * (Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height) - Math.max(player.position.y, battleZone.position.y));
            if (rectangularCollision({
                rectangle1: player,
                rectangle2: battleZone
            }) &&
                overlapingArea > (player.width * player.height) / 2 &&
                Math.random() < 0.01) {
                    console.log('inside');
                window.cancelAnimationFrame(animationId)
                battleZone.initiated = true;
                gsap.to('#overlappingDiv', {
                    opacity: 1,
                    repeat: 3,
                    yoyo: true,
                    duration: 0.5,
                    onComplete() {
                        gsap.to('#overlappingDiv', {
                            opacity: 1,
                            duration: 0.4,
                            onComplete() {
                                initBattle();
                                animateBattle();
                                gsap.to('#overlappingDiv', {
                                    opacity: 0,
                                    duration: 0.4
                                })
                            }
                        })
                    }
                })
                document.getElementById('enemyHealthBar').innerHTML = '100%';
                document.getElementById('playerHealthBar').innerHTML = '100%';
                break;
            }
        }
    }
    if (keys.u.pressed) {
        player.animate = true;
        player.image = player.sprites.up;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (rectangularCollision({
                rectangle1: player,
                rectangle2: {
                    ...boundary, position: {
                        x: boundary.position.x,
                        y: boundary.position.y + 3
                    }
                }
            })) {
                moving = false;
                break;
            }
        }
        if (moving) movables.forEach(movable => movable.position.y += 3);
    }
    else if (keys.d.pressed) {
        player.animate = true;
        player.image = player.sprites.down;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (rectangularCollision({
                rectangle1: player,
                rectangle2: {
                    ...boundary, position: {
                        x: boundary.position.x,
                        y: boundary.position.y - 3
                    }
                }
            })) {
                moving = false;
                break;
            }
        }
        if (moving) movables.forEach(movable => movable.position.y -= 3);
    }
    else if (keys.l.pressed) {
        player.animate = true;
        player.image = player.sprites.left;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (rectangularCollision({
                rectangle1: player,
                rectangle2: {
                    ...boundary, position: {
                        x: boundary.position.x + 3,
                        y: boundary.position.y
                    }
                }
            })) {
                moving = false;
                break;
            }
        }
        if (moving) movables.forEach(movable => movable.position.x += 3);
    }
    else if (keys.r.pressed) {
        player.animate = true;
        player.image = player.sprites.right;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (rectangularCollision({
                rectangle1: player,
                rectangle2: {
                    ...boundary, position: {
                        x: boundary.position.x - 3,
                        y: boundary.position.y
                    }
                }
            })) {
                moving = false;
                break;
            }
        }
        if (moving) movables.forEach(movable => movable.position.x -= 3);
    }
}
animate();


window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            keys.u.pressed = true;
            break;
        case 'ArrowDown':
            keys.d.pressed = true;
            break;
        case 'ArrowLeft':
            keys.l.pressed = true;
            break;
        case 'ArrowRight':
            keys.r.pressed = true;
            break;
    }
})

window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            keys.u.pressed = false;
            break;
        case 'ArrowDown':
            keys.d.pressed = false;
            break;
        case 'ArrowLeft':
            keys.l.pressed = false;
            break;
        case 'ArrowRight':
            keys.r.pressed = false;
            break;
    }
})
