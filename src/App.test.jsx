import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders DesignAI Studio logo', () => {
  render(<App />);
  const logoElements = screen.getAllByText(/DesignAI Studio/i);
  expect(logoElements.length).toBeGreaterThan(0);
});

test('renders Try for Free button', () => {
  render(<App />);
  const buttonElement = screen.getByText(/Try for Free/i);
  expect(buttonElement).toBeDefined();
});
