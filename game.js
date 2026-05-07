const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
// Disable smoothing for pixel art
ctx.imageSmoothingEnabled = false;

const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const popupContainer = document.getElementById('popup-container');
const finaleOverlay = document.getElementById('finale-overlay');
const finaleVideo = document.getElementById('finale-video');

// ==========================================
// AUDIO SYSTEM
// ==========================================
let bgmPlayed = false;
const bgMusic = new Audio('Assets/Sounds/Game Music.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.3; // lesser than full volume

const sfxPickup = new Audio('Assets/Sounds/Heart_Grape%20Pickup.mp3');
const sfxJump = new Audio('Assets/Sounds/Jump.mp3');
const sfxCheesecake = new Audio('Assets/Sounds/Power%20Up%20Effect.mp3');
const sfxDamage = new Audio('Assets/Sounds/Damage.mp3');
const sfxProtectorAcquire = new Audio('Assets/Sounds/Protector%20Acquire%20Sound.mp3');
const sfxProtectorImpact = new Audio('Assets/Sounds/Protector%20Impact%20Sound.mp3');

function playSound(audio) {
    if (!audio) return;
    const clone = audio.cloneNode();
    clone.volume = 0.6;
    clone.play().catch(() => {});
}

function startBGM() {
    if (!bgmPlayed) {
        bgMusic.play().catch(() => {});
        bgmPlayed = true;
    }
}
window.addEventListener('keydown', startBGM);
window.addEventListener('touchstart', startBGM, {passive: true});
window.addEventListener('mousedown', startBGM);

let width, height;
let score = 0;
let lives = 3;
let gameState = 'intro'; 
let protectorMode = false;
let protectorTimer = 0;

// ==========================================
// INTRO SCREEN LOGIC
// ==========================================
const introScreen = document.getElementById('intro-screen');
const btnPlay = document.getElementById('btn-play');
const btnHowTo = document.getElementById('btn-howto');
const howtoPanel = document.getElementById('howto-panel');
const introButtons = document.getElementById('intro-buttons');
const btnHowtoBack = document.getElementById('btn-howto-back');
const uiEl = document.getElementById('ui');
const mobileControls = document.getElementById('mobile-controls');

btnPlay.addEventListener('click', () => {
    introScreen.classList.add('hidden');
    uiEl.style.display = 'flex';
    // Show mobile controls on small screens
    if (window.innerWidth < 768) {
        mobileControls.style.display = 'flex';
    }
    gameState = 'playing';
    startBGM();
});

btnHowTo.addEventListener('click', () => {
    introButtons.style.display = 'none';
    howtoPanel.classList.add('visible');
});

btnHowtoBack.addEventListener('click', () => {
    howtoPanel.classList.remove('visible');
    introButtons.style.display = 'flex';
});

// Revive Screen Logic
const reviveScreen = document.getElementById('revive-screen');
const reviveText = document.getElementById('revive-text');
const reviveCheesecake = document.getElementById('revive-cheesecake');
const btnReviveNext = document.getElementById('btn-revive-next');

let reviveStep = 0;

function triggerRevive() {
    reviveScreen.style.display = 'flex';
    reviveStep = 0;
    reviveCheesecake.classList.add('hidden');
    reviveText.innerText = "Priyanshi your low on\nhealth ! You need\nto eatt!";
}

btnReviveNext.addEventListener('click', () => {
    if (reviveStep === 0) {
        reviveStep = 1;
        reviveText.innerText = "Here is a cheese cake,\nYou can do thiss!!!";
        reviveCheesecake.classList.remove('hidden');
    } else {
        reviveScreen.style.display = 'none';
        gameState = 'playing';
        playSound(sfxCheesecake);
        
        // Restore lives one by one with animation
        let restoreCount = 0;
        let restoreInterval = setInterval(() => {
            if (restoreCount < 3) {
                lives++;
                updateLivesUI();
                playSound(sfxPickup);
                restoreCount++;
            } else {
                clearInterval(restoreInterval);
            }
        }, 400);
    }
});

let lastTime = performance.now();
let spawnTimer = 0;

const TARGET_SCORE = 1000;
const POPUP_INTERVAL = 50;
let lastPopupScore = 0;

// ==========================================
// INDIE PIXEL ART GENERATION SYSTEM (WARM RPG VIBE)
// ==========================================
const PIXEL_SCALE = 6;
const COLORS = {
    '1': '#5c3a21', '2': '#3d2314', // Hair/Browns
    '3': '#f5c396', '4': '#d99b6c', // Skin
    '5': '#e05a3d', '6': '#b53a22', // Warm Orange/Red (Dress/Heart)
    '7': '#3a4f63', '8': '#223345', // Dark Blue/Grey (Pants/Shoes)
    '9': '#ffffff', '0': '#d1d5d6', // White/Grey (Shirt/Cloud)
    'a': '#ffd166', 'b': '#d49b2a', // Warm Yellow (Star/Cheesecake)
    'c': '#8ab56c', 'd': '#5a823f', // Muted Green (Grapes stem)
    'e': '#6a2c70', 'f': '#401345', // Purple (Grapes)
    'g': '#8b5a2b', 'h': '#613b16', // Dog brown
    'i': '#111111'                  // Black
};

function createSprite(art) {
    const lines = art.trim().split('\n');
    const h = lines.length;
    const w = lines[0].length;
    const canvas = document.createElement('canvas');
    canvas.width = w * PIXEL_SCALE;
    canvas.height = h * PIXEL_SCALE;
    const pctx = canvas.getContext('2d');
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const char = lines[y][x];
            if (char !== ' ' && COLORS[char]) {
                pctx.fillStyle = COLORS[char];
                pctx.fillRect(x * PIXEL_SCALE, y * PIXEL_SCALE, PIXEL_SCALE, PIXEL_SCALE);
            }
        }
    }
    return canvas;
}

// Draw the sprites with ASCII matrices (Warm Shaded Style)
const ART = {
    girl: `
   111111   
  11211211  
  1 3333 1  
 11 3i3i 11 
  1 4334 1  
    1111    
   555555   
  55655655  
  55    55  
   3    3   
   8    8   
   8    8   
`,
    guy: `
   222222   
  22211222  
  2 3333 2  
 22 3i3i 22 
  2 4334 2  
    2222    
   999099   
  99900999  
  77    77  
   7    7   
   7    7   
   8    8   
`,
    heart: `
  55  55  
 55555555 
 56555555 
 56655555 
  566555  
   5665   
    56    
     6    
`,
    grape: `
    cc    
   eeee   
  efefee  
  effeee  
   efee   
    ee    
`,
    cheesecake: `
    aa    
   aaba   
  aabbaa  
 33333333 
 44444444 
`,
    dog: `
 g      g 
 gg    gg 
 gghhgghh 
 ggg55ggg 
  gggggg  
   gggg   
`,
    rain: `
   9999   
 99990099 
9909900099
 90000009 
  8  8  8 
  8  8  8 
`,
    star: `
    aa    
   abba   
 aabbbbaa 
  aabbaa  
  aa  aa  
`
};

const sprites = {};
for (let key in ART) {
    sprites[key] = createSprite(ART[key]);
}

const imgAssets = {
    heart: new Image(),
    grape: new Image(),
    cheesecake: new Image(),
    dog: new Image(),
    anirudh: new Image(),
    shower: new Image()
};

imgAssets.heart.src = 'Assets/Falling%20Assets/Heart.png';
imgAssets.grape.src = 'Assets/Falling%20Assets/Grapes.png';
imgAssets.cheesecake.src = 'Assets/Falling%20Assets/Cheesecake.png';
imgAssets.dog.src = 'Assets/Falling%20Assets/Angry%20Dog.png';
imgAssets.anirudh.src = 'Assets/Falling%20Assets/Anirudh.png';
imgAssets.shower.src = 'Assets/Falling%20Assets/Shower.png';

const playerImg = new Image();
playerImg.src = 'Assets/Player/Priyanshi%20Sprite.png';

const ITEM_TYPES = {
    HEART: { type: 'collectible', pts: 10, sprite: imgAssets.heart, radius: 42 },
    GRAPE: { type: 'collectible', pts: 20, sprite: imgAssets.grape, radius: 38 },
    CHEESECAKE: { type: 'collectible', pts: 50, sprite: imgAssets.cheesecake, radius: 46 },
    DOG: { type: 'obstacle', dmg: 1, sprite: imgAssets.dog, radius: 46 },
    RAIN: { type: 'obstacle', dmg: 1, sprite: imgAssets.shower, radius: 63 },
    ME_POWERUP: { type: 'powerup', sprite: imgAssets.anirudh, radius: 46 }
};

const ENCOURAGING_MESSAGES = [
    "You're amazing!",
    "Keep going!",
    "You're doing\ngreat!",
    "Niceee one"
];

// ==========================================
// PHYSICS & CONTROLS
// ==========================================
const keys = { left: false, right: false, jump: false };
const GRAVITY = 1800;
const GROUND_LEVEL = 100;

const player = {
    x: 0, y: 0,
    vx: 0, vy: 0,
    radius: 40,
    speed: 675,
    jumpForce: 850,
    grounded: false,
    facingRight: true,
    drawW: 80,
    drawH: 110
};

const objects = [];

// Input handling (Keyboard)
window.addEventListener('keydown', e => {
    if (e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'ArrowUp' || e.code === 'Space') keys.jump = true;
});
window.addEventListener('keyup', e => {
    if (e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'ArrowRight') keys.right = false;
    if (e.code === 'ArrowUp' || e.code === 'Space') keys.jump = false;
});

// Input handling (Mobile buttons)
function bindBtn(id, key) {
    const btn = document.getElementById(id);
    const press = (e) => { e.preventDefault(); keys[key] = true; };
    const release = (e) => { e.preventDefault(); keys[key] = false; };
    btn.addEventListener('touchstart', press, {passive: false});
    btn.addEventListener('touchend', release, {passive: false});
    btn.addEventListener('mousedown', press);
    btn.addEventListener('mouseup', release);
    btn.addEventListener('mouseleave', release);
}
bindBtn('btn-left', 'left');
bindBtn('btn-right', 'right');
bindBtn('btn-jump', 'jump');

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    ctx.imageSmoothingEnabled = false; // Need to reset on resize
    
    if (player.x === 0 && player.y === 0) {
        player.x = width / 2;
        player.y = height - GROUND_LEVEL - player.radius;
    }
}
window.addEventListener('resize', resize);
resize();

function spawnObject() {
    let template;
    
    let maxScore = 900;
    let progress = Math.min(1, score / maxScore);

    // Scale difficulty: start with 30% obstacles right away, scale slightly to 40%
    let obstacleChance = 0.30 + (progress * 0.10); // 30% to 40%
    let isObstacle = Math.random() < obstacleChance;
    
    let spawnX = Math.random() * (width - 60) + 30;
    let spawnVx = (Math.random() - 0.5) * 76; // 0.95X speed

    if (isObstacle) {
        template = Math.random() < 0.5 ? ITEM_TYPES.DOG : ITEM_TYPES.RAIN;
        
        // 85% chance to aim actively at the player to force dodging
        if (Math.random() < 0.85) {
            let targetX = player.x + (player.vx * 0.5); // Predict where player is going
            spawnX = targetX + (Math.random() - 0.5) * 80; // Tight spread around player
            spawnX = Math.max(50, Math.min(width - 50, spawnX));
        }
    } else {
        const rand = Math.random();
        if (rand < 0.12) { // 3X frequency for Anirudh
            template = protectorMode ? ITEM_TYPES.CHEESECAKE : ITEM_TYPES.ME_POWERUP;
        } else if (rand < 0.2) {
            template = ITEM_TYPES.CHEESECAKE;
        } else if (rand < 0.5) {
            template = ITEM_TYPES.GRAPE;
        } else {
            template = ITEM_TYPES.HEART;
        }
        
        // 40% chance to spawn good items away from player so they have to run
        if (Math.random() < 0.4) {
            spawnX = player.x > width / 2 ? Math.random() * (width/2) : width/2 + Math.random() * (width/2);
        }
    }

    objects.push({
        ...template,
        x: spawnX,
        y: -template.radius * 2,
        vx: spawnVx,
        vy: (Math.random() * 38) + (progress * 15), // Fall slightly faster as game progresses (max +15)
        lifeTime: 0,
        bounces: 0
    });
}

const bg1 = document.getElementById('bg-layer-1');
const bg2 = document.getElementById('bg-layer-2');
const bg3 = document.getElementById('bg-layer-3');

function updateBackground() {
    if (score >= 660) {
        if (!bg3.classList.contains('active')) {
            bg1.classList.remove('active');
            bg2.classList.remove('active');
            bg3.classList.add('active');
        }
    } else if (score >= 330) {
        if (!bg2.classList.contains('active')) {
            bg1.classList.remove('active');
            bg2.classList.add('active');
            bg3.classList.remove('active');
        }
    } else {
        if (!bg1.classList.contains('active')) {
            bg1.classList.add('active');
            bg2.classList.remove('active');
            bg3.classList.remove('active');
        }
    }
}

let exclusivePopupTimer = null;
let exclusivePopupActive = false;

function showPopup(text, exclusive = false, large = false) {
    if (exclusive) {
        popupContainer.innerHTML = '';
        exclusivePopupActive = true;
        clearTimeout(exclusivePopupTimer);
        exclusivePopupTimer = setTimeout(() => {
            exclusivePopupActive = false;
        }, 2500);
    } else if (exclusivePopupActive) {
        return; // Skip normal popups if an exclusive one is active
    }

    const msg = document.createElement('div');
    msg.className = 'popup-message';
    if (large) msg.classList.add('large-popup');
    msg.innerText = text;
    popupContainer.appendChild(msg);
    setTimeout(() => {
        if (msg.parentNode) msg.parentNode.removeChild(msg);
    }, 2500);
}

function updateLivesUI() {
    let hearts = '';
    for (let i = 0; i < Math.max(0, lives); i++) hearts += '❤️';
    livesEl.textContent = `LIVES: ${hearts}`;
}

function triggerWin() {
    gameState = 'game_win';
    scoreEl.textContent = `SCORE: ${score}`;
    finaleOverlay.style.display = 'flex';
    void finaleOverlay.offsetWidth;
    finaleOverlay.style.opacity = '1';
    
    bgMusic.pause();
    finaleVideo.play().catch(e => console.log("Video autoplay blocked:", e));
}

function update(dt) {
    if (gameState !== 'playing') return;

    // Player Horizontal Movement
    if (keys.left) {
        player.vx = -player.speed;
        player.facingRight = false;
    } else if (keys.right) {
        player.vx = player.speed;
        player.facingRight = true;
    } else {
        player.vx = 0;
    }

    // Player Jump
    if (keys.jump && player.grounded) {
        player.vy = -player.jumpForce;
        player.grounded = false;
        playSound(sfxJump);
    }

    // Gravity
    player.vy += GRAVITY * dt;
    
    player.x += player.vx * dt;
    player.y += player.vy * dt;

    // Ground Collision
    const floorY = height - GROUND_LEVEL - (player.drawH / 2);
    if (player.y > floorY) {
        player.y = floorY;
        player.vy = 0;
        player.grounded = true;
    }

    // Wall Collision
    if (player.x < player.radius) player.x = player.radius;
    if (player.x > width - player.radius) player.x = width - player.radius;

    // Powerup logic
    if (protectorMode) {
        protectorTimer -= dt;
        if (protectorTimer <= 0) {
            protectorMode = false;
            showPopup("Fatty has to\ngo to eat!", true, true);
        }
    }

    // Spawn mechanism
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
        spawnObject();
        let maxScore = 900;
        let progress = Math.min(1, score / maxScore);
        
        // Prevent late-game clutter: 0.5-1.1s initially, down to 0.4-0.8s at peak
        let minDelay = 0.5 - (progress * 0.1); // 0.5 -> 0.4
        let rangeDelay = 0.6 - (progress * 0.2); // 0.6 -> 0.4
        spawnTimer = minDelay + Math.random() * rangeDelay; 
    }

    // Update items
    for (let i = objects.length - 1; i >= 0; i--) {
        let obj = objects[i];
        obj.lifeTime += dt;

        obj.vy += GRAVITY * 0.095 * dt; // Objects fall at 0.95x speed
        
        obj.x += obj.vx * dt;
        obj.y += obj.vy * dt;

        if (obj.type === 'popped') {
            // Popped objects fly off screen freely
            if (obj.x < -200 || obj.x > width + 200 || obj.y > height + 200) {
                objects.splice(i, 1);
            }
            continue; // Skip wall bounce and normal collisions
        }

        // Remove objects completely off screen (if they fly off after 1 bounce)
        if (obj.x < -100 || obj.x > width + 100) {
            objects.splice(i, 1);
            continue;
        }

        // Wall bounce for objects (max 1 bounce)
        if (obj.x < obj.radius) {
            if (obj.bounces < 1) {
                obj.x = obj.radius;
                obj.vx *= -1;
                obj.bounces++;
            }
        } else if (obj.x > width - obj.radius) {
            if (obj.bounces < 1) {
                obj.x = width - obj.radius;
                obj.vx *= -1;
                obj.bounces++;
            }
        }

        // Floor collision for objects (disappear instead of bouncing forever)
        if (obj.y > height - GROUND_LEVEL - obj.radius) {
            obj.y = height - GROUND_LEVEL - obj.radius;
            objects.splice(i, 1);
            continue;
        }

        // Collision logic
        // Guy stands 40px in front of her to block
        let guyHitboxX = player.x;
        if (protectorMode) {
            guyHitboxX = player.facingRight ? player.x + 40 : player.x - 40;
        }

        const dxGirl = player.x - obj.x;
        const dyGirl = player.y - obj.y;
        const distGirl = Math.sqrt(dxGirl * dxGirl + dyGirl * dyGirl);

        const dxGuy = guyHitboxX - obj.x;
        const dyGuy = player.y - obj.y;
        const distGuy = Math.sqrt(dxGuy * dxGuy + dyGuy * dyGuy);

        const hitGirl = distGirl < player.radius + obj.radius;
        const hitGuy = protectorMode && (distGuy < player.radius + obj.radius);

        if (hitGirl || hitGuy) {
            let remove = true;

            if (obj.type === 'collectible') {
                let oldScore = score;
                score += obj.pts;
                scoreEl.textContent = `SCORE: ${score}`;
                updateBackground();
                
                if (oldScore < 900 && score >= 900) {
                    showPopup("Almost at\nthe end!", true, true);
                }
                
                if (obj.pts === 50) {
                    playSound(sfxCheesecake);
                } else if (obj.pts === 10 || obj.pts === 20) {
                    playSound(sfxPickup);
                }
                
                if (Math.random() < 0.08 && score < TARGET_SCORE && !exclusivePopupActive) {
                    let msg = ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)];
                    showPopup(msg, true);
                }
                
            } else if (obj.type === 'obstacle') {
                if (protectorMode) {
                    // Anirudh pops it away!
                    playSound(sfxProtectorImpact);
                    obj.type = 'popped'; // disable future collisions
                    obj.vy = -700; // Shoot upwards
                    obj.vx = (player.facingRight ? 1 : -1) * 800 + (Math.random() - 0.5) * 400; // Throw forward
                    remove = false; // let it fly off screen
                } else {
                    lives -= obj.dmg;
                    updateLivesUI();
                    playSound(sfxDamage);
                    // Flash screen
                    document.body.style.filter = 'brightness(0.5) sepia(1) hue-rotate(-50deg) saturate(5)';
                    setTimeout(() => { document.body.style.filter = 'none'; }, 150);

                    if (lives <= 0) {
                        gameState = 'reviving';
                        triggerRevive();
                    }
                }
            } else if (obj.type === 'powerup') {
                protectorMode = true;
                protectorTimer = 10; 
                playSound(sfxProtectorAcquire);
                showPopup("Anirudh here\nto help!", true, true);
                
                // Clear any other Anirudhs currently falling
                for (let j = objects.length - 1; j >= 0; j--) {
                    if (objects[j].type === 'powerup' && j !== i) {
                        objects.splice(j, 1);
                    }
                }
            }
            
            if (remove) {
                objects.splice(i, 1);
                
                if (score >= TARGET_SCORE && gameState !== 'game_over') {
                    triggerWin();
                }
                continue;
            }
        }
    }
}

// Background is handled by DOM layers
function draw() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw falling objects
    for (let obj of objects) {
        if (obj.sprite) {
            let drawable = null;
            let drawWidth = 0;
            let drawHeight = 0;
            
            // If it's a procedural canvas sprite
            if (obj.sprite instanceof HTMLCanvasElement) {
                drawable = obj.sprite;
                drawWidth = drawable.width * 1.4;
                drawHeight = drawable.height * 1.4;
            } 
            // If it's our uploaded image asset
            else if (obj.sprite instanceof HTMLImageElement) {
                if (!obj.sprite.complete || obj.sprite.naturalWidth === 0) continue;
                drawable = obj.sprite;
                drawWidth = obj.radius * 2.6;  // stretched horizontally
                drawHeight = obj.radius * 2;
            }
            
            if (drawable) {
                ctx.drawImage(drawable, obj.x - drawWidth/2, obj.y - drawHeight/2, drawWidth, drawHeight);
            }
        }
    }

    // Draw Player (Girl)
    const pReady = playerImg.complete && playerImg.naturalWidth > 0;
    ctx.save();
    if (!player.facingRight) {
        ctx.translate(player.x, player.y);
        ctx.scale(-1, 1);
        if (pReady) {
            ctx.drawImage(playerImg, -player.drawW/2, -player.drawH/2, player.drawW, player.drawH);
        } else {
            ctx.drawImage(sprites.girl, -sprites.girl.width/2, -sprites.girl.height/2);
        }
    } else {
        if (pReady) {
            ctx.drawImage(playerImg, player.x - player.drawW/2, player.y - player.drawH/2, player.drawW, player.drawH);
        } else {
            ctx.drawImage(sprites.girl, player.x - sprites.girl.width/2, player.y - sprites.girl.height/2);
        }
    }
    ctx.restore();

    // Draw Protector (Anirudh)
    if (protectorMode) {
        let guyX = player.facingRight ? player.x + 60 : player.x - 60;
        let guyY = player.y; // Follows her jump vertically too
        
        const aReady = imgAssets.anirudh.complete && imgAssets.anirudh.naturalWidth > 0;
        const aW = 120; // Render width (Bigger than player's 80)
        const aH = 160; // Render height (Bigger than player's 110)

        ctx.save();
        if (!player.facingRight) {
            ctx.translate(guyX, guyY);
            ctx.scale(-1, 1);
            if (aReady) ctx.drawImage(imgAssets.anirudh, -aW/2, -aH/2, aW, aH);
        } else {
            if (aReady) ctx.drawImage(imgAssets.anirudh, guyX - aW/2, guyY - aH/2, aW, aH);
        }
        ctx.restore();
    }
}

function loop(currentTime) {
    let dt = (currentTime - lastTime) / 1000;
    if (dt > 0.1) dt = 0.1;
    lastTime = currentTime;

    update(dt);
    draw();

    requestAnimationFrame(loop);
}

// Start loop
requestAnimationFrame(loop);
