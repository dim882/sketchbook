import type { Config } from './boids.schema';

export class ParamsUI {
  private form: HTMLFormElement;
  private statusDiv: HTMLDivElement;

  constructor() {
    this.form = document.getElementById('params-form') as HTMLFormElement;
    this.statusDiv = document.getElementById('status') as HTMLDivElement;

    this.initializeForm();
    this.loadCurrentParams();
  }

  private async loadCurrentParams() {
    try {
      const response = await fetch('/api/sketches/boids/params');
      if (!response.ok) throw new Error('Failed to load parameters');

      const data = await response.json();
      this.populateForm(data.params);
    } catch (error) {
      console.error('Error loading parameters:', error);
      this.showStatus('Error loading parameters', 'error');
    }
  }

  private populateForm(config: Config) {
    const fp = config.FLOCK_PARAMS;
    (document.getElementById('separationDist') as HTMLInputElement).value = fp.separationDist.toString();
    (document.getElementById('alignDist') as HTMLInputElement).value = fp.alignDist.toString();
    (document.getElementById('cohesionDist') as HTMLInputElement).value = fp.cohesionDist.toString();
    (document.getElementById('separationWeight') as HTMLInputElement).value = fp.separationWeight.toString();
    (document.getElementById('alignmentWeight') as HTMLInputElement).value = fp.alignmentWeight.toString();
    (document.getElementById('cohesionWeight') as HTMLInputElement).value = fp.cohesionWeight.toString();
  }

  private async saveParams(config: Config) {
    try {
      const response = await fetch('/api/sketches/boids/params', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ params: config }),
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
        FLOCK_PARAMS: {
          separationDist: parseFloat(formData.get('separationDist') as string),
          alignDist: parseFloat(formData.get('alignDist') as string),
          cohesionDist: parseFloat(formData.get('cohesionDist') as string),
          separationWeight: parseFloat(formData.get('separationWeight') as string),
          alignmentWeight: parseFloat(formData.get('alignmentWeight') as string),
          cohesionWeight: parseFloat(formData.get('cohesionWeight') as string),
        },
        BOID_COUNT: parseFloat(formData.get('BOID_COUNT') as string) || 500,
        WOIM_LENGTH: parseFloat(formData.get('WOIM_LENGTH') as string) || 20,
        BACKGROUND_COLOR: (formData.get('BACKGROUND_COLOR') as string) || '#fcfaf7',
      });
    });
  }
}
