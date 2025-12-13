import { getFloat } from './random';
import { parse, converter } from 'culori';
export function toTuple(point) {
    return [point.x, point.y];
}
export var Edge;
(function (Edge) {
    Edge[Edge["Top"] = 0] = "Top";
    Edge[Edge["Right"] = 1] = "Right";
    Edge[Edge["Bottom"] = 2] = "Bottom";
    Edge[Edge["Left"] = 3] = "Left";
})(Edge || (Edge = {}));
export function getRandomEdge(rand) {
    return Math.floor(rand() * 4);
}
export function getRandomEdgePoint(rand, width, height, edge) {
    switch (edge) {
        case Edge.Top:
            return {
                x: getFloat(rand, 0, width),
                y: 0,
            };
        case Edge.Right:
            return {
                x: width,
                y: getFloat(rand, 0, height),
            };
        case Edge.Bottom:
            return {
                x: getFloat(rand, 0, width),
                y: height,
            };
        case Edge.Left:
            return {
                x: 0,
                y: getFloat(rand, 0, height),
            };
        default:
            return {
                x: 0,
                y: 0,
            };
    }
}
export function normalizeVector(vec) {
    const length = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
    return length === 0
        ? { x: 0, y: 0 }
        : {
            x: vec.x / length,
            y: vec.y / length,
        };
}
export function getPointAlongPath(start, dir, stepSize, stepIndex) {
    return {
        x: start.x + dir.x * stepSize * stepIndex,
        y: start.y + dir.y * stepSize * stepIndex,
    };
}
export function getOppositeEdgePoint(dir, width, height) {
    const center = { x: width / 2, y: height / 2 };
    const maxDist = Math.max(width, height) * 2;
    let t = maxDist;
    if (dir.x > 0) {
        const tRight = (width - center.x) / dir.x;
        if (tRight > 0 && tRight < t)
            t = tRight;
    }
    else if (dir.x < 0) {
        const tLeft = -center.x / dir.x;
        if (tLeft > 0 && tLeft < t)
            t = tLeft;
    }
    if (dir.y > 0) {
        const tBottom = (height - center.y) / dir.y;
        if (tBottom > 0 && tBottom < t)
            t = tBottom;
    }
    else if (dir.y < 0) {
        const tTop = -center.y / dir.y;
        if (tTop > 0 && tTop < t)
            t = tTop;
    }
    return {
        x: center.x + dir.x * t,
        y: center.y + dir.y * t,
    };
}
export function createBlobStreamData({ point, width, height, center, stepCount }) {
    const OVERSHOOT_DISTANCE = 200;
    const dir = normalizeVector({
        x: center.x - point.x,
        y: center.y - point.y,
    });
    const opposite = getOppositeEdgePoint(dir, width, height);
    const distToOpposite = Math.sqrt((opposite.x - point.x) * (opposite.x - point.x) + (opposite.y - point.y) * (opposite.y - point.y));
    const totalDist = distToOpposite + OVERSHOOT_DISTANCE;
    const step = totalDist / stepCount;
    return {
        point,
        dir,
        step,
    };
}
export const calculateMetaball = (x, y, metaballs) => {
    return metaballs.reduce((acc, ball) => {
        const dx = x - ball.position.x;
        const dy = y - ball.position.y;
        const distanceSquared = dx * dx + dy * dy;
        return acc + (ball.radius * ball.radius) / distanceSquared;
    }, 0);
};
export function createOffscreenCanvas(width, height) {
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
        throw new Error('Failed to get 2d context from OffscreenCanvas');
    }
    return { canvas, context };
}
export function isWithinThreshold(sum, metaballs) {
    const averageRadius = metaballs.reduce((sum, ball) => sum + ball.radius, 0) / metaballs.length;
    const baseThreshold = 0.2;
    const rangeWidth = 0.01 - (averageRadius / 50) * (0.01 - 0.003);
    return sum > baseThreshold && sum < baseThreshold + rangeWidth;
}
export function colorToRgba(color, defaultAlpha = 255) {
    const parsed = parse(color);
    const rgb = parsed.mode === 'rgb' ? parsed : converter('rgb')(parsed);
    return {
        r: Math.round(rgb.r * 255),
        g: Math.round(rgb.g * 255),
        b: Math.round(rgb.b * 255),
        a: rgb.alpha !== undefined ? Math.round(rgb.alpha * 255) : defaultAlpha,
    };
}
