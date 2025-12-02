import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Simple example test
describe('Example Test Suite', () => {
  it('should pass basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('should render a simple component', () => {
    const TestComponent = () => <div>Hello Test</div>;
    render(<TestComponent />);
    expect(screen.getByText('Hello Test')).toBeTruthy();
  });
});
