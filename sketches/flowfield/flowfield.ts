import { type IParticle, create, applyForce } from './Particle';
import { getCanvas, getCanvasContext, type IPointTuple, loop } from './flowfield.utils';
import * as Vec from './Vector';
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';

document.body.onload = () => {
  const canvas = getCanvas();
  const context = getCanvasContext(canvas);
  const { width, height } = canvas;

  // Configuration
  const particleCount = 500;
  const noiseScale = 0.005;
  const particleSpeed = 1;

  // Create a seeded random number generator
  const prng = alea('flowfield-seed');

  // Create noise function
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

  // Start animation loop
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

  // Clear the canvas
  context.clearRect(0, 0, width, height);

  // Update and draw each particle
  for (let i = 0; i < particles.length; i++) {
    let particle = particles[i];
    const { x, y } = particle.position;

    // Get noise value at particle position
    const noiseValue = noise2D(x * noiseScale, y * noiseScale);

    // Convert noise to angle (0 to 2π)
    const angle = noiseValue * Math.PI * 2;

    // Create force vector from angle
    const force = Vec.multiply(Vec.fromAngle(angle), particleSpeed);

    // Apply force to particle
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

    // Update particle in array
    particles[i] = particle;
  }

  // Visualize the flow field
  const gridSize = 40;
  context.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  context.lineWidth = 1;

  for (let x = 0; x < width; x += gridSize) {
    for (let y = 0; y < height; y += gridSize) {
      const noiseValue = noise2D(x * noiseScale, y * noiseScale);
      const angle = noiseValue * Math.PI * 2;

      context.save();
      context.translate(x, y);
      context.rotate(angle);
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(gridSize * 0.6, 0);
      context.stroke();
      context.restore();
    }
  }
};
