interface FlockParams {
  separationDist: number;
  alignDist: number;
  cohesionDist: number;
  separationWeight: number;
  alignmentWeight: number;
  cohesionWeight: number;
}

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

  private populateForm(params: FlockParams) {
    (document.getElementById('separationDist') as HTMLInputElement).value = params.separationDist.toString();
    (document.getElementById('alignDist') as HTMLInputElement).value = params.alignDist.toString();
    (document.getElementById('cohesionDist') as HTMLInputElement).value = params.cohesionDist.toString();
    (document.getElementById('separationWeight') as HTMLInputElement).value = params.separationWeight.toString();
    (document.getElementById('alignmentWeight') as HTMLInputElement).value = params.alignmentWeight.toString();
    (document.getElementById('cohesionWeight') as HTMLInputElement).value = params.cohesionWeight.toString();
  }

  private async saveParams(params: FlockParams) {
    try {
      const response = await fetch('/api/sketches/boids/params', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ params }),
      });

      if (!response.ok) throw new Error('Failed to save parameters');

      this.showStatus('Parameters saved successfully!', 'success');

      // Reload the page to apply new parameters
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
      });
    });
  }
}
