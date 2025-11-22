import {
  FLOCK_PARAMS,
  BOID_COUNT,
  WOIM_LENGTH,
  BACKGROUND_COLOR,
  BOID_COLOR,
  FLOCK_LIFETIME_FRAMES,
  FLOCK_SPAWN_INTERVAL_FRAMES,
  FLOCK_SPAWN_DISTANCE,
} from '../boid-fuzz.params';

interface IFlockParams {
  separationDist: number;
  alignDist: number;
  cohesionDist: number;
  separationWeight: number;
  alignmentWeight: number;
  cohesionWeight: number;
}

interface IAllParams extends IFlockParams {
  BOID_COUNT: number;
  WOIM_LENGTH: number;
  BACKGROUND_COLOR: string;
  BOID_COLOR: string;
  FLOCK_LIFETIME_FRAMES: number;
  FLOCK_SPAWN_INTERVAL_FRAMES: number;
  FLOCK_SPAWN_DISTANCE: number;
}

const DEFAULT_PARAMS: IAllParams = {
  ...FLOCK_PARAMS,
  BOID_COUNT,
  WOIM_LENGTH,
  BACKGROUND_COLOR,
  BOID_COLOR,
  FLOCK_LIFETIME_FRAMES,
  FLOCK_SPAWN_INTERVAL_FRAMES,
  FLOCK_SPAWN_DISTANCE,
};

const getTemplate = () => {
  const template = document.createElement('template');
  template.innerHTML = `
    <form id="params-form">
      <div class="param-group">
        <label for="separationDist">Separation Distance</label>
        <input type="number" id="separationDist" name="separationDist" step="1" min="0" />
      </div>

      <div class="param-group">
        <label for="alignDist">Alignment Distance</label>
        <input type="number" id="alignDist" name="alignDist" step="1" min="0" />
      </div>

      <div class="param-group">
        <label for="cohesionDist">Cohesion Distance</label>
        <input type="number" id="cohesionDist" name="cohesionDist" step="1" min="0" />
      </div>

      <div class="param-group">
        <label for="separationWeight">Separation Weight</label>
        <input type="number" id="separationWeight" name="separationWeight" step="0.1" min="0" />
      </div>

      <div class="param-group">
        <label for="alignmentWeight">Alignment Weight</label>
        <input type="number" id="alignmentWeight" name="alignmentWeight" step="0.1" min="0" />
      </div>

      <div class="param-group">
        <label for="cohesionWeight">Cohesion Weight</label>
        <input type="number" id="cohesionWeight" name="cohesionWeight" step="0.1" min="0" />
      </div>

      <h3>Constants</h3>

      <div class="param-group">
        <label for="BOID_COUNT">Boid Count</label>
        <input type="number" id="BOID_COUNT" name="BOID_COUNT" step="1" min="1" />
      </div>

      <div class="param-group">
        <label for="WOIM_LENGTH">Path Length</label>
        <input type="number" id="WOIM_LENGTH" name="WOIM_LENGTH" step="1" min="1" />
      </div>

      <div class="param-group">
        <label for="BACKGROUND_COLOR">Background Color</label>
        <input type="color" id="BACKGROUND_COLOR" name="BACKGROUND_COLOR" />
      </div>

      <div class="param-group">
        <label for="BOID_COLOR">Boid Color</label>
        <input type="color" id="BOID_COLOR" name="BOID_COLOR" />
      </div>

      <div class="param-group">
        <label for="FLOCK_LIFETIME_FRAMES">Flock Lifetime (frames)</label>
        <input type="number" id="FLOCK_LIFETIME_FRAMES" name="FLOCK_LIFETIME_FRAMES" step="1" min="1" />
      </div>

      <div class="param-group">
        <label for="FLOCK_SPAWN_INTERVAL_FRAMES">Flock Spawn Interval (frames)</label>
        <input type="number" id="FLOCK_SPAWN_INTERVAL_FRAMES" name="FLOCK_SPAWN_INTERVAL_FRAMES" step="1" min="1" />
      </div>

      <div class="param-group">
        <label for="FLOCK_SPAWN_DISTANCE">Flock Spawn Distance</label>
        <input type="number" id="FLOCK_SPAWN_DISTANCE" name="FLOCK_SPAWN_DISTANCE" step="1" min="1" />
      </div>

      <button type="submit" class="save-button">Save Parameters</button>
    </form>
    <div id="status" class="status" style="display: none"></div>
  `;
  return template;
};

export class ParamsUI extends HTMLElement {
  private form: HTMLFormElement;
  private statusDiv: HTMLDivElement;

  constructor() {
    super();
    const template = getTemplate();
    const content = template.content.cloneNode(true) as DocumentFragment;
    this.appendChild(content);

    this.form = this.querySelector('#params-form') as HTMLFormElement;
    this.statusDiv = this.querySelector('#status') as HTMLDivElement;

    // Populate with defaults immediately
    this.populateForm(DEFAULT_PARAMS);

    this.initializeForm();
    this.loadCurrentParams();
  }

  private async loadCurrentParams() {
    try {
      const response = await fetch('/api/sketches/boid-fuzz/params');
      if (!response.ok) throw new Error('Failed to load parameters');

      const data = await response.json();
      if (data.params) {
        // Merge with defaults to ensure all fields are present
        const mergedParams = { ...DEFAULT_PARAMS, ...data.params };
        this.populateForm(mergedParams);
      }
    } catch (error) {
      console.error('Error loading parameters:', error);
      // Already populated with defaults, so just log the error
    }
  }

  private populateForm(params: IAllParams) {
    (this.querySelector('#separationDist') as HTMLInputElement).value = params.separationDist.toString();
    (this.querySelector('#alignDist') as HTMLInputElement).value = params.alignDist.toString();
    (this.querySelector('#cohesionDist') as HTMLInputElement).value = params.cohesionDist.toString();
    (this.querySelector('#separationWeight') as HTMLInputElement).value = params.separationWeight.toString();
    (this.querySelector('#alignmentWeight') as HTMLInputElement).value = params.alignmentWeight.toString();
    (this.querySelector('#cohesionWeight') as HTMLInputElement).value = params.cohesionWeight.toString();
    (this.querySelector('#BOID_COUNT') as HTMLInputElement).value = params.BOID_COUNT.toString();
    (this.querySelector('#WOIM_LENGTH') as HTMLInputElement).value = params.WOIM_LENGTH.toString();
    (this.querySelector('#BACKGROUND_COLOR') as HTMLInputElement).value = params.BACKGROUND_COLOR;
    (this.querySelector('#BOID_COLOR') as HTMLInputElement).value = params.BOID_COLOR;
    (this.querySelector('#FLOCK_LIFETIME_FRAMES') as HTMLInputElement).value = params.FLOCK_LIFETIME_FRAMES.toString();
    (this.querySelector('#FLOCK_SPAWN_INTERVAL_FRAMES') as HTMLInputElement).value =
      params.FLOCK_SPAWN_INTERVAL_FRAMES.toString();
    (this.querySelector('#FLOCK_SPAWN_DISTANCE') as HTMLInputElement).value = params.FLOCK_SPAWN_DISTANCE.toString();
  }

  private async saveParams(params: IAllParams) {
    try {
      const response = await fetch('/api/sketches/boid-fuzz/params', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ params }),
      });

      if (!response.ok) throw new Error('Failed to save parameters');

      this.showStatus('Parameters saved successfully!', 'success');

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error saving parameters:', error);
      this.showStatus('Error saving parameters', 'error');
    }
  }

  private showStatus(message: string, type: 'success' | 'error') {
    this.statusDiv.textContent = message;
    this.statusDiv.className = `status ${type}`;
    this.statusDiv.style.display = 'block';

    setTimeout(() => {
      this.statusDiv.style.display = 'none';
    }, 3000);
  }

  private initializeForm() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(this.form);

      this.saveParams({
        separationDist: parseFloat(formData.get('separationDist') as string),
        alignDist: parseFloat(formData.get('alignDist') as string),
        cohesionDist: parseFloat(formData.get('cohesionDist') as string),
        separationWeight: parseFloat(formData.get('separationWeight') as string),
        alignmentWeight: parseFloat(formData.get('alignmentWeight') as string),
        cohesionWeight: parseFloat(formData.get('cohesionWeight') as string),
        BOID_COUNT: parseFloat(formData.get('BOID_COUNT') as string),
        WOIM_LENGTH: parseFloat(formData.get('WOIM_LENGTH') as string),
        BACKGROUND_COLOR: formData.get('BACKGROUND_COLOR') as string,
        BOID_COLOR: formData.get('BOID_COLOR') as string,
        FLOCK_LIFETIME_FRAMES: parseFloat(formData.get('FLOCK_LIFETIME_FRAMES') as string),
        FLOCK_SPAWN_INTERVAL_FRAMES: parseFloat(formData.get('FLOCK_SPAWN_INTERVAL_FRAMES') as string),
        FLOCK_SPAWN_DISTANCE: parseFloat(formData.get('FLOCK_SPAWN_DISTANCE') as string),
      });
    });
  }
}

customElements.define('params-ui', ParamsUI);

export function createParamsUI(): ParamsUI {
  return new ParamsUI();
}
