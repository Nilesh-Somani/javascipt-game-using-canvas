const battleBackgroundImage = new Image();
battleBackgroundImage.src = './img/battleBackground.png';
const battleBackground = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    image: battleBackgroundImage
})

let draggle;
let emby;
let renderedSprites = [];
let battleAnimationId;
let queue;

function initBattle() {
    document.getElementById('userInterface').style.display = 'block'
    document.getElementById('dialogueBox').style.display = 'none'
    document.getElementById('enemyHealthBar').style.width = '100%'
    document.getElementById('playerHealthBar').style.width = '100%'
    document.getElementById('attackBox').replaceChildren()
    draggle = new Monster(monsters.Draggle);
    emby = new Monster(monsters.Emby);
    renderedSprites = [draggle, emby];
    queue = [];
    emby.attacks.forEach((attack) => {
        const button = document.createElement('button');
        button.innerHTML = attack.name;
        document.getElementById('attackBox').append(button);
    })
    document.querySelectorAll("button").forEach((button) => {
        button.addEventListener('click', (e) => {
            const selectedAttack = attacks[e.currentTarget.innerHTML];
            emby.attack({
                attack: selectedAttack,
                recipient: draggle,
                renderedSprites
            })
            const randomAttack = draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)]
            queue.push(() => {
                draggle.attack({
                    attack: randomAttack,
                    recipient: emby,
                    renderedSprites
                })
            })
        })
        button.addEventListener('mouseenter', (e) => {
            const selectedAttack = attacks[e.currentTarget.innerHTML];
            document.getElementById('attackType').innerHTML = '<h1>' + selectedAttack.type + '</h1>';
            document.getElementById('attackType').style.color = selectedAttack.color;
        })
        button.addEventListener('mouseleave', () => {
            document.getElementById('attackType').innerHTML = "<h1>Attack Type</h1>";
            document.getElementById('attackType').style.color = "black";
        })
    })
}

function animateBattle() {
    battleAnimationId = window.requestAnimationFrame(animateBattle);
    battleBackground.draw();
    renderedSprites.forEach(sprite => {
        sprite.draw();
    })
}
//initBattle();
//animateBattle();

document.querySelector('#dialogueBox').addEventListener('click', (e) => {
    if (queue.length > 0) {
        queue[0]();
        queue.shift()
    } else e.currentTarget.style.display = 'none';
})