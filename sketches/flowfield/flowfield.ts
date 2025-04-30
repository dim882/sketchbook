import { type IParticle, create, applyForce } from './Particle';
import { getCanvas, getCanvasContext, type IPointTuple, loop, visualizeFlowField } from './flowfield.utils';
import * as Vec from './Vector';
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';

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

  // Create particles
  const particles: IParticle[] = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push(
      create({
        position: Vec.create(Math.random() * width, Math.random() * height),
        mass: 1,
      })
    );
  }

  loop(
    render(context, {
      particles,
      noise2D,
      noiseScale,
      particleSpeed,
      width,
      height,
    }),
    60
  );
};

interface ISketchData {
  particles: IParticle[];
  noise2D: (x: number, y: number) => number;
  noiseScale: number;
  particleSpeed: number;
  width: number;
  height: number;
}

const render = (context: CanvasRenderingContext2D, data: ISketchData) => (t: number) => {
  const { particles, noise2D, noiseScale, particleSpeed, width, height } = data;

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
    });

    // Handle edge wrapping
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
    visualizeFlowField(context, width, height, noise2D, noiseScale, gridSize);
  }
};
