import { EncomMapService, mapService } from './api';

// Mock fetch for testing
global.fetch = jest.fn();

describe('EncomMapService', () => {
  let service: EncomMapService;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
  const originalEnv = process.env;

  beforeEach(() => {
    service = new EncomMapService();
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
    process.env = originalEnv;
  });

  test('should create instance', () => {
    expect(service).toBeInstanceOf(EncomMapService);
  });

  test('should have generateMap method', () => {
    expect(typeof service.generateMap).toBe('function');
  });

  test('should have getMapStatus method', () => {
    expect(typeof service.getMapStatus).toBe('function');
  });

  describe('generateMap', () => {
    test('should call API with correct parameters', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ mapId: 'test-id', hexagons: [] })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await service.generateMap(100);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/map/generate'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('"hexagonCount":100')
        })
      );
    });

    test('should handle API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await expect(service.generateMap(100)).rejects.toThrow('Failed to generate map: 500 Internal Server Error');
    });

    test('should limit hexagon count to maximum', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ mapId: 'test-id', hexagons: [] })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await service.generateMap(2000); // Over limit

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: expect.stringContaining('"hexagonCount":1000') // Should be clamped to 1000
        })
      );
    });
  });

  describe('getMapStatus', () => {
    test('should call status API correctly', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ status: 'completed', progress: 100 })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await service.getMapStatus('test-map-id');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/map/status/test-map-id'),
        expect.objectContaining({
          headers: expect.any(Object)
        })
      );
    });

    test('should handle status API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await expect(service.getMapStatus('invalid-id')).rejects.toThrow('Failed to get map status: 404 Not Found');
    });
  });

  test('mapService should be exported instance', () => {
    expect(mapService).toBeInstanceOf(EncomMapService);
  });

  describe('environment configuration', () => {
    test('should use prod API URL when environment is prod', () => {
      process.env = { ...originalEnv, REACT_APP_ENVIRONMENT: 'prod' };
      
      const prodService = new EncomMapService();
      expect(prodService).toBeInstanceOf(EncomMapService);
      
      // We can't directly test private baseUrl, but we can test it indirectly through API calls
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ mapId: 'test-id', hexagons: [] })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      prodService.generateMap(100);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://encom-api.riperoni.com/api/v1/map/generate',
        expect.anything()
      );
    });

    test('should include API key in headers when available', () => {
      process.env = { ...originalEnv, REACT_APP_API_KEY: 'test-api-key' };
      
      const serviceWithApiKey = new EncomMapService();
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ mapId: 'test-id', hexagons: [] })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      serviceWithApiKey.generateMap(100);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Key': 'test-api-key'
          })
        })
      );
    });

    test('should include API key in getMapStatus when available', async () => {
      process.env = { ...originalEnv, REACT_APP_API_KEY: 'test-api-key' };
      
      const serviceWithApiKey = new EncomMapService();
      
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ status: 'completed', progress: 100 })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await serviceWithApiKey.getMapStatus('test-map-id');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Key': 'test-api-key'
          })
        })
      );
    });
  });

  describe('generateMap with seed', () => {
    test('should include seed in request body when provided', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ mapId: 'test-id', hexagons: [] })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await service.generateMap(100, 'test-seed');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: expect.stringContaining('"seed":"test-seed"')
        })
      );
    });

    test('should include numeric seed in request body when provided', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ mapId: 'test-id', hexagons: [] })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await service.generateMap(100, 12345);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: expect.stringContaining('"seed":12345')
        })
      );
    });

    test('should not include seed in request body when not provided', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ mapId: 'test-id', hexagons: [] })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await service.generateMap(100);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: expect.not.stringContaining('"seed"')
        })
      );
    });
  });
});