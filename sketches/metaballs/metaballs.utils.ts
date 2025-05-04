import { converter } from 'culori';

export type IRenderFunc = (context: CanvasRenderingContext2D, t: number) => void;
export type IPointTuple = [number, number];

const rgbConverter = converter('rgb');

export interface IMetaball {
  position: IVector;
  velocity: IVector;
  radius: number;
}

export interface IVector {
  x: number;
  y: number;
  z?: number;
}

export function loop(context: CanvasRenderingContext2D, render: IRenderFunc, fps = 60) {
  const frameDuration = 1000 / fps;
  let lastFrameTime = 0;

  let t = 0;
  function animate(time: number) {
    requestAnimationFrame(animate);

    if (time - lastFrameTime < frameDuration) return;

    lastFrameTime = time;

    render(context, t);
    t++;
  }

  requestAnimationFrame(animate);
}

export const createMetaball = (x: number, y: number, vx: number, vy: number, radius: number): IMetaball => ({
  position: { x, y },
  velocity: { x: vx, y: vy },
  radius,
});

export const updateMetaball = (metaball: IMetaball, width: number, height: number): IMetaball => {
  const newPosition = {
    x: metaball.position.x + metaball.velocity.x,
    y: metaball.position.y + metaball.velocity.y,
  };

  const newVelocity = { ...metaball.velocity };

  if (newPosition.x - metaball.radius < 0 || newPosition.x + metaball.radius > width) {
    newVelocity.x = -newVelocity.x;
  }

  if (newPosition.y - metaball.radius < 0 || newPosition.y + metaball.radius > height) {
    newVelocity.y = -newVelocity.y;
  }

  return {
    position: {
      x: metaball.position.x + newVelocity.x,
      y: metaball.position.y + newVelocity.y,
    },
    velocity: newVelocity,
    radius: metaball.radius,
  };
};

export const calculateMetaballField = (x: number, y: number, metaballs: IMetaball[], threshold: number): boolean => {
  const sum = metaballs.reduce((acc, ball) => {
    const dx = x - ball.position.x;
    const dy = y - ball.position.y;
    const distanceSquared = dx * dx + dy * dy;

    return acc + (ball.radius * ball.radius) / distanceSquared;
  }, 0);

  return sum > threshold;
};

export const getRgbValues = (cssColor: string): { r: number; g: number; b: number; a: number } => {
  const rgbColor = rgbConverter(cssColor);

  if (!rgbColor) return { r: 0, g: 0, b: 0, a: 0 };

  return {
    r: Math.round(rgbColor.r * 255),
    g: Math.round(rgbColor.g * 255),
    b: Math.round(rgbColor.b * 255),
    a: 255, // Full opacity
  };
};
