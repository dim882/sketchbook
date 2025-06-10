import { createNoise2D } from 'simplex-noise';
import alea from 'alea';

import { createParticles, getCanvas, getCanvasContext, loop, visualizeFlowField } from './flowfield.utils';
import { type IParticle, applyForce, handleEdges } from './Particle';
import * as Vec from './Vector';

const DEBUG = false;
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
    60,
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
    const particle = particles[i];
    const { x, y } = particle.position;
    const noiseValue = noise2D(x * noiseScale, y * noiseScale);
    const particleAfterForce = applyForce({
      particle,
      force: Vec.multiply(Vec.fromAngle(noiseValue * Math.PI * 2), particleSpeed),
      deltaTime: 1 / 60,
      maxVelocity: 540,
    });
    const finalParticle = handleEdges(particleAfterForce, width, height);

    // Draw particle
    context.beginPath();
    context.arc(finalParticle.position.x, finalParticle.position.y, 2, 0, 2 * Math.PI);
    context.fillStyle = 'white';
    context.fill();

    particles[i] = finalParticle;
  }

  if (DEBUG) {
    visualizeFlowField(context, width, height, noise2D, noiseScale, gridSize);
  }
};
