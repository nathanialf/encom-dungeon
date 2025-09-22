// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Suppress specific React Three Fiber warnings in tests
// These warnings are expected behavior when testing RTF components outside WebGL context
const originalError = console.error;

beforeEach(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' && (
        // React Three Fiber element casing warnings (these are intentional in RTF)
        args[0].includes('incorrect casing') ||
        args[0].includes('unrecognized in this browser') ||
        // Three.js elements like ambientLight, mesh, etc. are expected to be lowercase in RTF
        (args[0].includes('unrecognized') && /(?:ambient|directional|point)Light|mesh|group|geometry|Material/.test(args[0]))
      )
    ) {
      return; // Suppress only RTF-specific warnings
    }
    originalError.call(console, ...args);
  };
});

afterEach(() => {
  console.error = originalError;
});