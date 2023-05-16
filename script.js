const fieldWidth = 500;
const fieldfHeight = 400;
const rows = 3;
const cols = 6;
const gapSize = 3;

const requestAnimationFrame = window.requestAnimationFrame;

class Tile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.isAlive = true;
  };

  draw(context) {
    if (!this.isAlive) {
      return;
    };
    context.fillStyle = Tile.color;
    context.fillRect(
      this.x,
      this.y,
      Tile.width,
      Tile.height
    );
  };
};

Tile.color = 'rgba(0, 0, 200, 0.7)';
Tile.width = fieldWidth / cols - 2 * gapSize;
Tile.height = 25;

const generateTiles = () => {
  const tiles = [];
  for (let i = 0; i < rows; i += 1) {
    tiles[i] = [];
    for (let j = 0; j < cols; j += 1) {
      const x = (2 * j + 1) * gapSize + j * Tile.width;
      const y = (2 * i + 1) * gapSize + i * Tile.height;
      tiles[i][j] = new Tile(x, y);
    }
  }
  return tiles;
};

const drawTiles = (tiles, context) => {
  for (let i = 0; i < rows; i += 1) {
    for (let j = 0; j < cols; j += 1) {
      tiles[i][j].draw(context);
    };
  };
};

class Platform {
  constructor() {
    this.x = (fieldWidth - Platform.width) / 2;
    this.y = fieldfHeight - Platform.height;
  };

  draw(context) {
    context.fillStyle = Platform.color;
    context.fillRect(
      this.x,
      this.y,
      Platform.width,
      Platform.height
    );
  };
  move(e) {
    const modifier = 1;
    switch(e.key) {
      case 'ArrowLeft': {
        if (this.x > 0) {
          this.x -= Platform.speed * modifier;
        }
        break;
      }
      case 'ArrowRight': {
        if (this.x < fieldWidth - Platform.width) {
          this.x += Platform.speed * modifier;
        }
        break;
      }
    }
  }
};

Platform.width = 150;
Platform.height = 15;
Platform.color = 'white';
Platform.speed = 20;

class Ball {
  constructor() {
    this.x = fieldWidth / 2;
    this.y = fieldfHeight - Ball.radius - Platform.height;
    this.angle = -(Math.random() * (Math.PI / 2) + Math.PI / 4);
  }
  draw(context) {
    context.beginPath();
    context.arc(
      this.x,
      this.y,
      Ball.radius,
      0,
      2 * Math.PI,
      false
    );
    context.fillStyle = Ball.color;
    context.fill();
  };
};

Ball.radius = 10;
Ball.color = 'green';
Ball.speed = 3;

const play = (arkanoid) => {
  const {
    tiles,
    platform,
    ball
  } = arkanoid;

  if (ball.y <= Ball.radius) {
    Ball.speed = -Ball.speed;
    return;
  };
  if (ball.y >= fieldfHeight - Platform.height - Ball.radius) {
    if (
      (ball.x + (Ball.radius * 2) >= platform.x) &&
      (ball.x - (Ball.radius * 2) <= platform.x + Platform.width)
    ) {
      const shift = (platform.x + (Platform.width / 2) - ball.x) / (Platform.width / 2);
      const shiftCoef = (shift / 2) + 0.5;
      ball.angle = -(shiftCoef * (Math.PI / 2) + Math.PI / 4);
      return;
    } else if (ball.y >= fieldfHeight - Ball.radius) {
      arkanoid.status = 'finish';
      arkanoid.finish();
      return;
    }
  }
  if (
    (ball.x <= Ball.radius) ||
    (ball.x >= fieldWidth - Ball.radius)
  ) {
    ball.angle = Math.PI - ball.angle;
    return;
  }

  for (let tilesRow of tiles) {
    for (let tile of tilesRow) {
      if (!tile.isAlive) continue;
      if (
        (ball.x - Ball.radius <= tile.x + Tile.width) &&
        (ball.x + Ball.radius >= tile.x) &&
        (ball.y - Ball.radius <= tile.y + Tile.height) &&
        (ball.y + Ball.radius >= tile.y)
      ) {
        tile.isAlive = false;
        ball.angle *= -1;
        return;
      }
    }
  }
};

const render = (context, arkanoid) => {
  const {
    tiles,
    platform,
    ball
  } = arkanoid;

  ball.y += (Ball.speed * Math.sin(ball.angle));
  ball.x += (Ball.speed * Math.cos(ball.angle));

  context.clearRect(0, 0, fieldWidth, fieldfHeight); 
  drawTiles(tiles, context);
  platform.draw(context);
  ball.draw(context);

  if (arkanoid.status === 'play') {
    requestAnimationFrame(() => render(context, arkanoid));
  }
  play(arkanoid);
};

window.onload = () => {
  const canvas = document.getElementById('arkanoid');
  const context = canvas.getContext('2d');

  const arkanoid = {
    tiles: generateTiles(),
    platform: new Platform(),
    ball: new Ball(),
    status: 'play',
    finish() {
      context.font = '40px Arial';
      context.fillStyle = 'red';
      context.textAlign = 'center';
      context.fillText('Game over', fieldWidth / 2, fieldfHeight / 2);
    },
  };

  addEventListener(
    'keydown',
    arkanoid.platform.move.bind(arkanoid.platform)
  );
  render(context, arkanoid);
};
