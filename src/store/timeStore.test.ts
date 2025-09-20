import { useTimeStore } from './timeStore';

describe('timeStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useTimeStore.setState({
      time: 0,
    });
  });

  test('should have initial state', () => {
    const state = useTimeStore.getState();
    
    expect(state.time).toBe(0);
    expect(typeof state.updateTime).toBe('function');
  });

  test('should update time incrementally', () => {
    const { updateTime } = useTimeStore.getState();
    const delta = 16.67; // One frame at 60fps
    
    updateTime(delta);
    
    const state = useTimeStore.getState();
    expect(state.time).toBe(delta);
  });

  test('should accumulate time updates', () => {
    const { updateTime } = useTimeStore.getState();
    
    updateTime(10);
    expect(useTimeStore.getState().time).toBe(10);
    
    updateTime(5);
    expect(useTimeStore.getState().time).toBe(15);
  });

  test('should handle negative deltas', () => {
    const { updateTime } = useTimeStore.getState();
    
    updateTime(100);
    updateTime(-50);
    
    const state = useTimeStore.getState();
    expect(state.time).toBe(50);
  });

  test('should handle large time deltas', () => {
    const { updateTime } = useTimeStore.getState();
    const largeDelta = 1000.999;
    
    updateTime(largeDelta);
    
    const state = useTimeStore.getState();
    expect(state.time).toBe(largeDelta);
  });
});