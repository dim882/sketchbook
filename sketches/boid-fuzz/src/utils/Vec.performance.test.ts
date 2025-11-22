import { describe, it } from 'node:test';
import assert from 'node:assert';
import { performance, PerformanceObserver } from 'node:perf_hooks';
import * as Vec from './Vec.js';
import * as Vector from './Vector.js';

// Configuration
const DEFAULT_ITERATIONS = 100_000;
const ITERATIONS = parseInt(process.env.VEC_PERF_ITERATIONS || String(DEFAULT_ITERATIONS), 10);

// Helper to check if GC is available
const hasGC = typeof globalThis.gc === 'function';

// Memory statistics interface
interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
}

// GC event tracking
interface GCEvent {
  kind: number;
  flags: number;
  duration: number;
}

// Performance results
interface PerformanceResult {
  executionTime: number;
  memoryBefore: MemoryStats;
  memoryAfter: MemoryStats;
  memoryAfterGC: MemoryStats;
  gcEvents: GCEvent[];
  gcEventCount: number;
  heapGrowth: number;
  heapGrowthAfterGC: number;
}

// Helper functions
function getMemoryStats(): MemoryStats {
  const usage = process.memoryUsage();
  return {
    heapUsed: usage.heapUsed,
    heapTotal: usage.heapTotal,
    external: usage.external,
    rss: usage.rss,
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0 || isNaN(bytes)) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function setupGCWatcher(): { observer: PerformanceObserver; events: GCEvent[] } {
  const events: GCEvent[] = [];
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'gc') {
        const detail = (entry as any).detail || {};
        events.push({
          kind: detail.kind || 0,
          flags: detail.flags || 0,
          duration: entry.duration,
        });
      }
    }
  });

  try {
    observer.observe({ entryTypes: ['gc'], buffered: false });
  } catch (e) {
    // GC observation may not be available
  }

  return { observer, events };
}

// Simulate realistic boid operations with Vec.ts (pooled)
function runVecTest(iterations: number): PerformanceResult {
  const gcWatcher = setupGCWatcher();
  const memoryBefore = getMemoryStats();

  // Force GC before starting if available
  if (hasGC) {
    globalThis.gc!();
  }

  const startTime = performance.now();

  // Simulate boid operations: create vectors, perform operations, dispose
  for (let i = 0; i < iterations; i++) {
    // Create multiple vectors per iteration (simulating boid calculations)
    using pos = Vec.vec(Math.random() * 100, Math.random() * 100);
    using vel = Vec.vec(Math.random() * 10 - 5, Math.random() * 10 - 5);
    using accel = Vec.vec(Math.random() * 2 - 1, Math.random() * 2 - 1);

    // Perform various operations
    using newVel = Vec.add(vel, Vec.scale(accel, 0.1));
    using newPos = Vec.add(pos, Vec.scale(newVel, 0.1));
    using normalized = Vec.normalize(newVel);
    using limited = Vec.limit(newVel, 5);
    const dist = Vec.distance(pos, newPos);

    // Use the values to prevent optimization
    const _ = dist + normalized.x + limited.y;
    void _;
  }

  const endTime = performance.now();
  const memoryAfter = getMemoryStats();

  // Force GC after operations if available
  if (hasGC) {
    globalThis.gc!();
  }

  const memoryAfterGC = getMemoryStats();
  gcWatcher.observer.disconnect();

  return {
    executionTime: endTime - startTime,
    memoryBefore,
    memoryAfter,
    memoryAfterGC,
    gcEvents: gcWatcher.events,
    gcEventCount: gcWatcher.events.length,
    heapGrowth: memoryAfter.heapUsed - memoryBefore.heapUsed,
    heapGrowthAfterGC: memoryAfterGC.heapUsed - memoryBefore.heapUsed,
  };
}

// Simulate realistic boid operations with Vector.ts (non-pooled)
function runVectorTest(iterations: number): PerformanceResult {
  const gcWatcher = setupGCWatcher();
  const memoryBefore = getMemoryStats();

  // Force GC before starting if available
  if (hasGC) {
    globalThis.gc!();
  }

  const startTime = performance.now();

  // Simulate boid operations: create vectors, perform operations (no disposal)
  for (let i = 0; i < iterations; i++) {
    // Create multiple vectors per iteration (simulating boid calculations)
    const pos = Vector.create(Math.random() * 100, Math.random() * 100);
    const vel = Vector.create(Math.random() * 10 - 5, Math.random() * 10 - 5);
    const accel = Vector.create(Math.random() * 2 - 1, Math.random() * 2 - 1);

    // Perform various operations
    const newVel = Vector.add(vel, Vector.multiply(accel, 0.1));
    const newPos = Vector.add(pos, Vector.multiply(newVel, 0.1));
    const normalized = Vector.normalize(newVel);
    const limited = Vector.limit(newVel, 5);
    const dist = Vector.distance(pos, newPos);

    // Use the values to prevent optimization
    const _ = dist + normalized.x + limited.y;
    void _;
  }

  const endTime = performance.now();
  const memoryAfter = getMemoryStats();

  // Force GC after operations if available
  if (hasGC) {
    globalThis.gc!();
  }

  const memoryAfterGC = getMemoryStats();
  gcWatcher.observer.disconnect();

  return {
    executionTime: endTime - startTime,
    memoryBefore,
    memoryAfter,
    memoryAfterGC,
    gcEvents: gcWatcher.events,
    gcEventCount: gcWatcher.events.length,
    heapGrowth: memoryAfter.heapUsed - memoryBefore.heapUsed,
    heapGrowthAfterGC: memoryAfterGC.heapUsed - memoryBefore.heapUsed,
  };
}

describe('Vec Performance', () => {
  describe('memory stability', () => {
    it('Vec pooling should maintain stable memory', () => {
      const result = runVecTest(ITERATIONS);

      console.log(`\nVec.ts Performance (${ITERATIONS.toLocaleString()} iterations):`);
      console.log(`  Execution time: ${result.executionTime.toFixed(2)}ms`);
      console.log(`  Heap growth: ${formatBytes(result.heapGrowth)}`);
      console.log(`  Heap growth after GC: ${formatBytes(result.heapGrowthAfterGC)}`);
      console.log(`  GC events: ${result.gcEventCount}`);

      // Vec.ts should show minimal heap growth (< 10MB for 100k iterations)
      const maxHeapGrowth = 10 * 1024 * 1024; // 10MB
      assert.ok(
        result.heapGrowth < maxHeapGrowth,
        `Heap growth ${formatBytes(result.heapGrowth)} exceeds ${formatBytes(maxHeapGrowth)}`
      );
    });
  });

  describe('GC events', () => {
    it('Vec pooling should minimize GC events', () => {
      const result = runVecTest(ITERATIONS);

      console.log(`\nVec.ts GC Events (${ITERATIONS.toLocaleString()} iterations):`);
      console.log(`  GC event count: ${result.gcEventCount}`);
      if (result.gcEvents.length > 0) {
        const totalGCDuration = result.gcEvents.reduce((sum, e) => sum + e.duration, 0);
        console.log(`  Total GC duration: ${totalGCDuration.toFixed(2)}ms`);
      }

      // With pooling, we should have very few or no GC events
      // Allow some GC events for initial pool setup, but should be minimal
      assert.ok(
        result.gcEventCount <= 5,
        `Too many GC events: ${result.gcEventCount} (expected <= 5)`
      );
    });
  });

  describe('comparison with Vector.ts', () => {
    it('Vec pooling vs Vector.ts memory comparison', () => {
      const vecResult = runVecTest(ITERATIONS);
      const vectorResult = runVectorTest(ITERATIONS);

      console.log(`\nMemory Comparison (${ITERATIONS.toLocaleString()} iterations):`);
      console.log(`  Vec.ts heap growth: ${formatBytes(vecResult.heapGrowth)}`);
      console.log(`  Vector.ts heap growth: ${formatBytes(vectorResult.heapGrowth)}`);
      console.log(`  Vec.ts heap growth after GC: ${formatBytes(vecResult.heapGrowthAfterGC)}`);
      console.log(`  Vector.ts heap growth after GC: ${formatBytes(vectorResult.heapGrowthAfterGC)}`);

      // The key metric is memory after GC - Vec.ts pool should stabilize
      // Vec.ts may show more growth during execution (pool growth), but after GC it should be better
      // Allow Vec.ts to use up to 2x memory during execution (pool overhead), but after GC should be better
      if (vecResult.heapGrowth > vectorResult.heapGrowth) {
        console.log(`  Note: Vec.ts shows more heap growth during execution (pool growth), but this is expected`);
      }

      // After GC, Vec.ts should show better or comparable memory characteristics
      // The pool objects remain, but they're reusable, not garbage
      assert.ok(
        vecResult.heapGrowthAfterGC <= vectorResult.heapGrowthAfterGC * 1.5,
        `Vec.ts heap growth after GC ${formatBytes(vecResult.heapGrowthAfterGC)} should be <= 1.5x Vector.ts ${formatBytes(vectorResult.heapGrowthAfterGC)}`
      );
    });

    it('Vec pooling vs Vector.ts GC event comparison', () => {
      const vecResult = runVecTest(ITERATIONS);
      const vectorResult = runVectorTest(ITERATIONS);

      console.log(`\nGC Event Comparison (${ITERATIONS.toLocaleString()} iterations):`);
      console.log(`  Vec.ts GC events: ${vecResult.gcEventCount}`);
      console.log(`  Vector.ts GC events: ${vectorResult.gcEventCount}`);

      // Vec.ts should trigger fewer GC events than Vector.ts
      assert.ok(
        vecResult.gcEventCount <= vectorResult.gcEventCount,
        `Vec.ts should have fewer or equal GC events (${vecResult.gcEventCount} vs ${vectorResult.gcEventCount})`
      );
    });

    it('Vec pooling vs Vector.ts execution time', () => {
      const vecResult = runVecTest(ITERATIONS);
      const vectorResult = runVectorTest(ITERATIONS);

      console.log(`\nExecution Time Comparison (${ITERATIONS.toLocaleString()} iterations):`);
      console.log(`  Vec.ts: ${vecResult.executionTime.toFixed(2)}ms`);
      console.log(`  Vector.ts: ${vectorResult.executionTime.toFixed(2)}ms`);
      
      const slowdown = vecResult.executionTime / vectorResult.executionTime;
      const speedupRatio = vectorResult.executionTime / vecResult.executionTime;
      const speedupPercent = ((vectorResult.executionTime - vecResult.executionTime) / vectorResult.executionTime) * 100;
      console.log(`  Speedup: ${speedupPercent > 0 ? '+' : ''}${speedupPercent.toFixed(2)}%`);
      
      // PERFORMANCE GOAL: Vec.ts should be at least as fast as Vector.ts
      // Current performance issues:
      // 1. Creating a new arrow function closure for [Symbol.dispose] on every vec() call
      // 2. 'using' statement overhead (tracking disposables, calling dispose at scope exit)
      // 3. Pool operations (pop/push) for each vector
      //
      // The goal is performance parity or better. Pooling should not come at the cost of speed.
      
      if (slowdown > 1.0) {
        console.log(`  ❌ PERFORMANCE FAILURE: Vec.ts is ${slowdown.toFixed(2)}x slower than Vector.ts`);
        console.log(`     Goal: Vec.ts should be at least as fast as Vector.ts`);
        console.log(`     Current slowdown: ${((slowdown - 1) * 100).toFixed(1)}%`);
      } else if (speedupRatio > 1.0) {
        console.log(`  ✅ PERFORMANCE SUCCESS: Vec.ts is ${speedupRatio.toFixed(2)}x faster than Vector.ts`);
      } else {
        console.log(`  ✅ PERFORMANCE PARITY: Vec.ts matches Vector.ts performance`);
      }

      // Vec.ts must be at least as fast as Vector.ts (within 5% tolerance for measurement variance)
      const tolerance = 1.05; // Allow 5% slower due to measurement variance
      assert.ok(
        vecResult.executionTime <= vectorResult.executionTime * tolerance,
        `Vec.ts execution time ${vecResult.executionTime.toFixed(2)}ms is ${slowdown.toFixed(2)}x slower than Vector.ts ${vectorResult.executionTime.toFixed(2)}ms. Goal: Vec.ts should be at least as fast as Vector.ts (within ${((tolerance - 1) * 100).toFixed(0)}% tolerance).`
      );
    });
  });
});

