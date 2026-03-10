import type { IBoidsParams } from './boids.schema';
import paramsJson from './boids.params.json';

const defaultParams: IBoidsParams = paramsJson;

const showStatus = (statusDiv: HTMLDivElement, message: string, type: 'success' | 'error') => {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';

  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 3000);
};

const populateForm = (params: IBoidsParams) => {
  const fp = params.FLOCK_PARAMS;
  (document.getElementById('separationDist') as HTMLInputElement).value = fp.separationDist.toString();
  (document.getElementById('alignDist') as HTMLInputElement).value = fp.alignDist.toString();
  (document.getElementById('cohesionDist') as HTMLInputElement).value = fp.cohesionDist.toString();
  (document.getElementById('separationWeight') as HTMLInputElement).value = fp.separationWeight.toString();
  (document.getElementById('alignmentWeight') as HTMLInputElement).value = fp.alignmentWeight.toString();
  (document.getElementById('cohesionWeight') as HTMLInputElement).value = fp.cohesionWeight.toString();
};

const saveParams = async (statusDiv: HTMLDivElement, sketchParams: IBoidsParams) => {
  try {
    const response = await fetch('/api/sketches/boids/params', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ params: sketchParams }),
    });

    if (!response.ok) throw new Error('Failed to save parameters');

    showStatus(statusDiv, 'Parameters saved successfully!', 'success');

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } catch (error) {
    console.error('Error saving parameters:', error);
    showStatus(statusDiv, 'Error saving parameters', 'error');
  }
};

const loadCurrentParams = async (statusDiv: HTMLDivElement): Promise<IBoidsParams> => {
  try {
    const response = await fetch('/api/sketches/boids/params');
    if (!response.ok) throw new Error('Failed to load parameters');

    const data = await response.json();
    populateForm(data.params);
    return data.params;
  } catch (error) {
    console.error('Error loading parameters:', error);
    showStatus(statusDiv, 'Error loading parameters', 'error');
    return defaultParams;
  }
};

const readFormFlockParams = (form: HTMLFormElement) => {
  const formData = new FormData(form);
  return {
    separationDist: parseFloat(formData.get('separationDist') as string),
    alignDist: parseFloat(formData.get('alignDist') as string),
    cohesionDist: parseFloat(formData.get('cohesionDist') as string),
    separationWeight: parseFloat(formData.get('separationWeight') as string),
    alignmentWeight: parseFloat(formData.get('alignmentWeight') as string),
    cohesionWeight: parseFloat(formData.get('cohesionWeight') as string),
  };
};

export const createParamsUI = async () => {
  const form = document.getElementById('params-form') as HTMLFormElement;
  const statusDiv = document.getElementById('status') as HTMLDivElement;

  let currentParams = await loadCurrentParams(statusDiv);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveParams(statusDiv, {
      ...currentParams,
      FLOCK_PARAMS: readFormFlockParams(form),
    });
  });
};
