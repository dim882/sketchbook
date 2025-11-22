import { IFPSTracker } from '../utils/fps';

export class FPSDisplay extends HTMLElement {
  private rafFpsSpan: HTMLSpanElement | null = null;
  private renderFpsSpan: HTMLSpanElement | null = null;
  private frameTimeSpan: HTMLSpanElement | null = null;
  private initialized = false;
  private tracker: IFPSTracker | null = null;
  private animationFrameId: number | null = null;

  connectedCallback() {
    if (this.initialized) return;
    this.initialized = true;

    const template = document.createElement('template');
    template.innerHTML = `
      <div class="fps-display">
        <h3>Performance</h3>
        <div class="fps-stat">
          <label>RAF FPS:</label>
          <span id="raf-fps">--</span>
        </div>
        <div class="fps-stat">
          <label>Render FPS:</label>
          <span id="render-fps">--</span>
        </div>
        <div class="fps-stat">
          <label>Frame Time:</label>
          <span id="frame-time">--</span> ms
        </div>
      </div>
    `;

    const content = template.content.cloneNode(true) as DocumentFragment;
    this.appendChild(content);

    this.rafFpsSpan = this.querySelector('#raf-fps') as HTMLSpanElement;
    this.renderFpsSpan = this.querySelector('#render-fps') as HTMLSpanElement;
    this.frameTimeSpan = this.querySelector('#frame-time') as HTMLSpanElement;
  }

  disconnectedCallback() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  startTracking(tracker: IFPSTracker) {
    this.tracker = tracker;

    const update = () => {
      if (this.tracker) {
        const stats = this.tracker.getStats();
        this.update(stats);
      }

      this.animationFrameId = requestAnimationFrame(update);
    };

    update();
  }

  private update(stats: { rafFPS: number; renderFPS: number; frameTimeMs: number }) {
    if (!this.initialized) {
      this.connectedCallback();
    }

    if (this.rafFpsSpan) {
      this.rafFpsSpan.textContent = stats.rafFPS.toFixed(1);
    }
    if (this.renderFpsSpan) {
      this.renderFpsSpan.textContent = stats.renderFPS.toFixed(1);
    }
    if (this.frameTimeSpan) {
      this.frameTimeSpan.textContent = stats.frameTimeMs.toFixed(2);
    }
  }
}

customElements.define('fps-display', FPSDisplay);
