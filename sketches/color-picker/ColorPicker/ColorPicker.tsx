import { rgb, hsl } from 'culori';
import { h, FunctionComponent } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import register from 'preact-custom-element';
import { drawColorWheel, getDistance, convertLchToXy } from './ColorPicker.utils';

import styles from './ColorPicker.module.css';

interface IColorPickerProps {
  onChange: (color: string) => void;
  lch?: [number, number, number];
}

const ColorPicker: FunctionComponent<IColorPickerProps> = ({ onChange, lch }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loupeRef = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState<string>('');
  const [lightness, setLightness] = useState<number>(50);
  const [coords, setCoords] = useState<[number, number]>([0, 0]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  let context: CanvasRenderingContext2D;

  useEffect(() => drawColorWheel(canvasRef, lightness), [lightness]);

  useEffect(() => {
    if (canvasRef.current) {
      context = canvasRef.current.getContext('2d', { willReadFrequently: true });
      handleColorChange(context, ...coords);
    }
  }, [lightness, canvasRef.current]);

  // Handle initial color from prop
  useEffect(() => {
    if (lch) {
      setLightness(lch[0]);

      if (context) {
        const radius = Math.min(context.canvas.width, context.canvas.height) / 2;
        const [x, y] = convertLchToXy(lch, radius);

        handleColorChange(context, x, y);
      }
    }
  }, [lch]);

  const handleLightnessInput: h.JSX.GenericEventHandler<HTMLInputElement> = (e) => {
    setLightness(parseInt(e.currentTarget.value));
  };

  function handleColorChange(context: CanvasRenderingContext2D, x: number, y: number) {
    const imageData = context.getImageData(x, y, 1, 1).data;

    const rgbColor = rgb({
      mode: 'rgb',
      r: imageData[0] / 255,
      g: imageData[1] / 255,
      b: imageData[2] / 255,
    });
    const hslColor = hsl(rgbColor);
    const hslString = `hsl(${Math.round(hslColor.h)}, ${Math.round(hslColor.s * 100)}%, ${Math.round(
      hslColor.l * 100
    )}%)`;

    setCoords([x, y]);
    setColor(hslString);
    onChange(hslString);
  }

  const handlePointerDown: h.JSX.PointerEventHandler<HTMLCanvasElement> = (event) => {
    setIsDragging(true);
    moveLoupe(event);
  };

  const handlePointerMove: h.JSX.PointerEventHandler<HTMLCanvasElement> = (event) => {
    if (isDragging) {
      moveLoupe(event);
    }
  };

  const handlePointerUp: h.JSX.PointerEventHandler<HTMLCanvasElement> = () => {
    setIsDragging(false);
  };

  const moveLoupe = (event: h.JSX.TargetedPointerEvent<HTMLCanvasElement>) => {
    const context = canvasRef.current.getContext('2d', { willReadFrequently: true });

    if (!context) return;

    const { width, height } = context.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2;

    const distance = getDistance([event.offsetX, event.offsetY], [centerX, centerY]);

    if (distance <= radius) {
      handleColorChange(context, event.offsetX, event.offsetY);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.leftColumn}>
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className={styles.canvas}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        <div ref={loupeRef} className={styles.loupe} style={{ left: coords[0], top: coords[1] }} />

        <div style={{ backgroundColor: color }} className={styles.colorSwatch}></div>
        <input type="text" value={color} />
      </div>

      <div className={styles.rightColumn}>
        <label for="lightness" className={styles.labelLightness}>
          Lightness
        </label>
        <input
          className={styles.lightness}
          type="range"
          id="lightness"
          min="0"
          max="100"
          value={lightness}
          onInput={handleLightnessInput}
        />
      </div>
    </div>
  );
};

register(ColorPicker, 'color-picker', [], { shadow: true });

export default ColorPicker;
