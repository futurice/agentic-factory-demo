import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('vitest smoke test', () => {
  it('renders and matches jest-dom assertions', () => {
    render(<h1>Hello</h1>);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hello');
  });
});
