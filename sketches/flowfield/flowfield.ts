import { createNoise2D } from 'simplex-noise';
import alea from 'alea';

import { createParticles, getCanvas, getCanvasContext, loop, visualizeFlowField } from './flowfield.utils';
import { type IParticle, applyForce } from './Particle';
import * as Vec from './Vector';

const DEBUG = true;
const gridSize = 40;
const particleCount = 500;
const noiseScale = 0.005;
const particleSpeed = 1;

document.body.onload = () => {
  const canvas = getCanvas();
  const context = getCanvasContext(canvas);
  const { width, height } = canvas;

  const prng = alea('flowfield-seed');
  const noise2D = createNoise2D(prng);
  const particles: IParticle[] = createParticles(width, height, particleCount);

  loop(
    render(context, {
      particles,
      noise2D,
      noiseScale,
      particleSpeed,
    }),
    60
  );
};

interface ISketchData {
  particles: IParticle[];
  noise2D: (x: number, y: number) => number;
  noiseScale: number;
  particleSpeed: number;
}

const render = (context: CanvasRenderingContext2D, data: ISketchData) => (t: number) => {
  const { width, height } = context.canvas;
  const { particles, noise2D, noiseScale, particleSpeed } = data;

  context.clearRect(0, 0, width, height);
  context.fillStyle = 'black';
  context.fillRect(0, 0, width, height);

  // Update and draw each particle
  for (let i = 0; i < particles.length; i++) {
    let particle = particles[i];

    const { x, y } = particle.position;
    const noiseValue = noise2D(x * noiseScale, y * noiseScale);
    const angle = noiseValue * Math.PI * 2;
    const force = Vec.multiply(Vec.fromAngle(angle), particleSpeed);

    particle = applyForce({
      particle,
      force,
      deltaTime: 1 / 60,
      maxVelocity: 40,
    });

    // Handle edge wrapping using the width and height from context.canvas
    if (particle.position.x < 0) particle.position.x = width;
    if (particle.position.x > width) particle.position.x = 0;
    if (particle.position.y < 0) particle.position.y = height;
    if (particle.position.y > height) particle.position.y = 0;

    // Draw particle
    context.beginPath();
    context.arc(particle.position.x, particle.position.y, 2, 0, 2 * Math.PI);
    context.fillStyle = 'white';
    context.fill();

    particles[i] = particle;
  }

  if (DEBUG) {
    // Pass width and height obtained from context.canvas
    visualizeFlowField(context, width, height, noise2D, noiseScale, gridSize);
  }
};
