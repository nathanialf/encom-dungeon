import { EncomMapService, mapService } from './api';

// Mock fetch for testing
global.fetch = jest.fn();

describe('EncomMapService', () => {
  let service: EncomMapService;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    service = new EncomMapService();
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
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
});