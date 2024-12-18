// setup canvas
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

// function to generate random number
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// function to generate random color
function randomRGB() {
  return `rgb(${random(0, 255)},${random(0, 255)},${random(0, 255)})`;
}

class Shape {
  constructor(x, y, velX, velY) {
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
  }
}

class Ball extends Shape {
  constructor(x, y, velX, velY, color, size) {
    super(x, y, velX, velY);
    this.color = color;
    this.size = size;
    this.exists = true;
  }

  draw() {
    if (this.exists) {
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  update() {
    if ((this.x + this.size) >= width || (this.x - this.size) <= 0) {
      this.velX = -(this.velX);
    }

    if ((this.y + this.size) >= height || (this.y - this.size) <= 0) {
      this.velY = -(this.velY);
    }

    this.x += this.velX;
    this.y += this.velY;
  }

  collisionDetect() {
    for (const ball of balls) {
      if (!(this === ball) && ball.exists) {
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.size + ball.size) {
          ball.color = this.color = randomRGB();
        }
      }
    }
  }
}

class EvilCircle extends Shape {
  constructor(x, y) {
    super(x, y, 20, 20);
    this.color = 'white';
    this.size = 10;

    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          this.x -= this.velX;
          break;
        case 'ArrowRight':
          this.x += this.velX;
          break;
        case 'ArrowUp':
          this.y -= this.velY;
          break;
        case 'ArrowDown':
          this.y += this.velY;
          break;
      }
    });
  }

  draw() {
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.stroke();
  }

  checkBounds() {
    if ((this.x + this.size) >= width) {
      this.x = width - this.size;
    }

    if ((this.x - this.size) <= 0) {
      this.x = this.size;
    }

    if ((this.y + this.size) >= height) {
      this.y = height - this.size;
    }

    if ((this.y - this.size) <= 0) {
      this.y = this.size;
    }
  }

  collisionDetect() {
    for (const ball of balls) {
      if (ball.exists) {
        const dx = this.x - ball.x;
        const dy = this.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.size + ball.size) {
          ball.exists = false;
          ballCount--;
          ballCountParagraph.textContent = `${ballCount}`;
          score++;
          scoreParagraph.textContent = `${score}`;
          if (ballCount === 0) {
            document.getElementById('game-over').style.display = 'block';
          }
        }
      }
    }
  }
}

class Destroyer extends Shape {
  constructor(x, y, velX, velY) {
    super(x, y, velX, velY);
    this.color = 'red';
    this.size = 10;
  }

  draw() {
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.stroke();
  }

  update() {
    const dx = evilCircle.x - this.x;
    const dy = evilCircle.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    this.velX = (dx / distance) * 3;
    this.velY = (dy / distance) * 3;

    this.x += this.velX;
    this.y += this.velY;
  }

  checkBounds() {
    if ((this.x + this.size) >= width) {
      this.x = width - this.size;
    }

    if ((this.x - this.size) <= 0) {
      this.x = this.size;
    }

    if ((this.y + this.size) >= height) {
      this.y = height - this.size;
    }

    if ((this.y - this.size) <= 0) {
      this.y = this.size;
    }
  }

  collisionDetect() {
    const dx = this.x - evilCircle.x;
    const dy = this.y - evilCircle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.size + evilCircle.size) {
      document.getElementById('game-over').style.display = 'block';
      ballCount = 0; // Set ballCount to 0 to stop the game
    }
  }
}

const balls = [];
const ballCountParagraph = document.getElementById('ball-count');
const scoreParagraph = document.getElementById('score');
let ballCount = 0;
let score = 0;

while (balls.length < 25) {
  const size = random(10, 20);
  const ball = new Ball(
    random(0 + size, width - size),
    random(0 + size, height - size),
    random(-7, 7),
    random(-7, 7),
    randomRGB(),
    size
  );

  balls.push(ball);
  ballCount++;
}

ballCountParagraph.textContent = `${ballCount}`;
scoreParagraph.textContent = `${score}`;

const evilCircle = new EvilCircle(width / 2, height / 2);
const destroyer = new Destroyer(random(0, width), random(0, height), 3, 3);

function loop() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
  ctx.fillRect(0, 0, width, height);

  for (const ball of balls) {
    if (ball.exists) {
      ball.draw();
      ball.update();
      ball.collisionDetect();
    }
  }

  evilCircle.draw();
  evilCircle.checkBounds();
  evilCircle.collisionDetect();

  destroyer.draw();
  destroyer.update();
  destroyer.checkBounds();
  destroyer.collisionDetect();

  if (ballCount > 0) {
    requestAnimationFrame(loop);
  }
}

loop();
