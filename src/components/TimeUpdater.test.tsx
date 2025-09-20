import { TimeUpdater } from './TimeUpdater';

// Mock the store
const mockUpdateTime = jest.fn();
jest.mock('../store/timeStore', () => ({
  useTimeStore: () => ({
    updateTime: mockUpdateTime
  })
}));

// Mock useShaderTime hook to avoid R3F dependency
jest.mock('../hooks/useShaderTime', () => ({
  useShaderTime: () => 16.67 // Simulate ~60fps timing
}));

describe('TimeUpdater', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should be a functional component', () => {
    expect(typeof TimeUpdater).toBe('function');
  });

  test('should be exported correctly', () => {
    expect(TimeUpdater).toBeDefined();
  });

  test('should be testable without R3F context', () => {
    // Component exists and can be imported
    expect(typeof TimeUpdater).toBe('function');
  });
});