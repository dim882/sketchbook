let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

const G = 6.6743e-11; // gravitational constant
const timestep = 3600; // seconds per frame

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

interface Thing {
  mass: number;
  position: Position;
  velocity: Velocity;
}

const createThing = (
  mass: number,
  x: number,
  y: number,
  vx: number,
  vy: number
): Thing => ({
  mass,
  position: { x, y },
  velocity: { x: vx, y: vy },
});

const updatePosition = (
  body: Thing,
  forceX: number,
  forceY: number
): Thing => ({
  ...body,
  velocity: {
    x: body.velocity.x + (forceX / body.mass) * timestep,
    y: body.velocity.y + (forceY / body.mass) * timestep,
  },
  position: {
    x: body.position.x + body.velocity.x * timestep,
    y: body.position.y + body.velocity.y * timestep,
  },
});

const calculateForces = (bodies: Thing[]): Thing[] => {
  return bodies.map((body, index) => {
    const otherBodies = bodies.filter((_, i) => i !== index);
    const { x, y } = otherBodies.reduce(
      (acc, otherThing) => {
        const dx = otherThing.position.x - body.position.x;
        const dy = otherThing.position.y - body.position.y;
        const distanceSquared = dx * dx + dy * dy;
        const forceMagnitude =
          (G * body.mass * otherThing.mass) / distanceSquared;
        const angle = Math.atan2(dy, dx);
        return {
          x: acc.x + Math.cos(angle) * forceMagnitude,
          y: acc.y + Math.sin(angle) * forceMagnitude,
        };
      },
      { x: 0, y: 0 }
    );
    return updatePosition(body, x, y);
  });
};

const draw = (bodies: Thing[]): void => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bodies.forEach((body) => {
    ctx.beginPath();
    ctx.arc(body.position.x, body.position.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
  });
};

let bodies: Thing[];

export const animate = (): void => {
  bodies = calculateForces(bodies);
  // console.log(bodies);

  draw(bodies);
  requestAnimationFrame(animate);
};

document.body.onload = () => {
  console.log("loaded");

  canvas = document.getElementById("canvas") as HTMLCanvasElement;

  ctx = canvas.getContext("2d");
  console.log({ canvas, ctx });

  bodies = [
    createThing(5.972e24, canvas.width / 2, canvas.height / 2, 0, -29780), // Earth
    createThing(
      7.34767309e22,
      canvas.width / 2 + 384400,
      canvas.height / 2,
      0,
      0
    ), // Moon
    createThing(1000, canvas.width / 2 - 384400, canvas.height / 2, 0, 1022.23), // Third body
  ];

  animate();
};
