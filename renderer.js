const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const overlay = document.getElementById('overlay');
const startButton = document.getElementById('start');
const scoreEl = document.getElementById('score');
const distanceEl = document.getElementById('distance');
const bestEl = document.getElementById('best');

const groundY = canvas.height - 80;
const state = {
  running: false,
  score: 0,
  distance: 0,
  speed: 4,
  best: 0,
  spawnTimer: 0,
  coinTimer: 0
};

const player = {
  x: 120,
  y: groundY,
  width: 40,
  height: 50,
  vy: 0,
  speed: 5,
  jumping: false
};

const keys = new Set();
const coins = [];
const enemies = [];

const resetGame = () => {
  state.running = true;
  state.score = 0;
  state.distance = 0;
  state.speed = 4;
  state.spawnTimer = 0;
  state.coinTimer = 0;
  coins.length = 0;
  enemies.length = 0;
  player.x = 120;
  player.y = groundY;
  player.vy = 0;
  player.jumping = false;
};

const spawnEnemy = () => {
  const size = 40 + Math.random() * 20;
  enemies.push({
    x: canvas.width + 40,
    y: groundY - size + 10,
    width: size,
    height: size,
    color: '#e63946'
  });
};

const spawnCoin = () => {
  const heightOffset = Math.random() * 120;
  coins.push({
    x: canvas.width + 40,
    y: groundY - 60 - heightOffset,
    radius: 12,
    collected: false
  });
};

const isColliding = (rect, circle) => {
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy < circle.radius * circle.radius;
};

const hitEnemy = (rect, enemy) => {
  return (
    rect.x < enemy.x + enemy.width &&
    rect.x + rect.width > enemy.x &&
    rect.y < enemy.y + enemy.height &&
    rect.y + rect.height > enemy.y
  );
};

const update = () => {
  if (!state.running) {
    return;
  }

  if (keys.has('ArrowRight')) {
    player.x = Math.min(canvas.width - 80, player.x + player.speed);
  }
  if (keys.has('ArrowLeft')) {
    player.x = Math.max(60, player.x - player.speed);
  }

  player.vy += 0.6;
  player.y += player.vy;

  if (player.y >= groundY) {
    player.y = groundY;
    player.vy = 0;
    player.jumping = false;
  }

  state.distance += state.speed * 0.1;
  state.speed = Math.min(8, 4 + state.distance / 300);

  state.spawnTimer += 1;
  if (state.spawnTimer > 80) {
    spawnEnemy();
    state.spawnTimer = 0;
  }

  state.coinTimer += 1;
  if (state.coinTimer > 50) {
    spawnCoin();
    state.coinTimer = 0;
  }

  enemies.forEach((enemy) => {
    enemy.x -= state.speed + 1;
  });

  coins.forEach((coin) => {
    coin.x -= state.speed;
  });

  for (const enemy of enemies) {
    if (hitEnemy(player, enemy)) {
      state.running = false;
      state.best = Math.max(state.best, state.score);
      bestEl.textContent = state.best;
      overlay.classList.add('show');
      return;
    }
  }

  coins.forEach((coin) => {
    if (!coin.collected && isColliding(player, { x: coin.x, y: coin.y, radius: coin.radius })) {
      coin.collected = true;
      state.score += 1;
    }
  });

  for (let i = coins.length - 1; i >= 0; i -= 1) {
    if (coins[i].x < -50 || coins[i].collected) {
      coins.splice(i, 1);
    }
  }

  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    if (enemies[i].x < -80) {
      enemies.splice(i, 1);
    }
  }

  scoreEl.textContent = state.score;
  distanceEl.textContent = Math.floor(state.distance);
};

const drawBackground = () => {
  ctx.fillStyle = '#0b0f1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#1b263b');
  gradient.addColorStop(1, '#0b0f1a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#203354';
  for (let i = 0; i < 10; i += 1) {
    const x = ((i * 150) - (state.distance * 2)) % canvas.width;
    ctx.fillRect(x, groundY - 120, 80, 120);
  }

  ctx.fillStyle = '#1f2f46';
  ctx.fillRect(0, groundY + 40, canvas.width, 40);
  ctx.fillStyle = '#2f3e5c';
  ctx.fillRect(0, groundY, canvas.width, 40);
};

const drawPlayer = () => {
  ctx.fillStyle = '#f4d35e';
  ctx.fillRect(player.x, player.y - player.height, player.width, player.height);
  ctx.fillStyle = '#0b0f1a';
  ctx.fillRect(player.x + 10, player.y - player.height + 12, 8, 8);
  ctx.fillRect(player.x + 24, player.y - player.height + 12, 8, 8);
};

const drawEnemies = () => {
  enemies.forEach((enemy) => {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });
};

const drawCoins = () => {
  coins.forEach((coin) => {
    ctx.beginPath();
    ctx.fillStyle = '#ffd166';
    ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f4a261';
    ctx.lineWidth = 3;
    ctx.stroke();
  });
};

const loop = () => {
  update();
  drawBackground();
  drawCoins();
  drawEnemies();
  drawPlayer();
  requestAnimationFrame(loop);
};

startButton.addEventListener('click', () => {
  overlay.classList.remove('show');
  resetGame();
});

window.addEventListener('keydown', (event) => {
  if (['ArrowRight', 'ArrowLeft', 'ArrowUp', ' '].includes(event.key)) {
    event.preventDefault();
  }
  keys.add(event.key);
  if ((event.key === 'ArrowUp' || event.key === ' ') && !player.jumping && state.running) {
    player.vy = -12;
    player.jumping = true;
  }
  if (!state.running && (event.key === 'Enter' || event.key === ' ')) {
    overlay.classList.remove('show');
    resetGame();
  }
});

window.addEventListener('keyup', (event) => {
  keys.delete(event.key);
});

overlay.classList.add('show');
loop();
