import { EncomMapResponse } from '../types';

const getApiBaseUrl = (): string => {
  const environment = process.env.REACT_APP_ENVIRONMENT || 'dev';
  
  if (environment === 'prod') {
    return 'https://3901ff1oz1.execute-api.us-west-1.amazonaws.com/prod';
  }
  
  // Use dev API Gateway endpoint from encom-frontend
  return 'https://kxt2knsej3.execute-api.us-west-1.amazonaws.com/dev';
};

const getApiKey = (): string | undefined => {
  return process.env.REACT_APP_API_KEY;
};

export class EncomMapService {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = getApiBaseUrl();
    this.apiKey = getApiKey();
  }

  async generateMap(hexagonCount: number = 500): Promise<EncomMapResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const response = await fetch(`${this.baseUrl}/api/v1/map/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        hexagonCount: Math.min(hexagonCount, 1000),
        seed: Math.floor(Math.random() * 1000000),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate map: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  async getMapStatus(mapId: string): Promise<{ status: string; progress?: number }> {
    const headers: Record<string, string> = {};

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    const response = await fetch(`${this.baseUrl}/api/v1/map/status/${mapId}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to get map status: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}

export const mapService = new EncomMapService();