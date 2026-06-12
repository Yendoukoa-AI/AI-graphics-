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

test('renders Ad Creative AI feature card', () => {
  render(<App />);
  const featureElement = screen.getByText(/Ad Creative AI/i);
  expect(featureElement).toBeDefined();
});

test('renders Ads mode button', () => {
  render(<App />);
  const modeButton = screen.getByText(/^Ads$/i);
  expect(modeButton).toBeDefined();
});

test('renders Games Design & Dev feature card', () => {
  render(<App />);
  const featureElement = screen.getByText(/Games Design & Dev/i);
  expect(featureElement).toBeDefined();
});

test('renders Games mode button', () => {
  render(<App />);
  const modeButton = screen.getByText(/^Games$/i);
  expect(modeButton).toBeDefined();
});

test('renders Automotive & Aero feature card', () => {
  render(<App />);
  const featureElement = screen.getByText(/Automotive & Aero/i);
  expect(featureElement).toBeDefined();
});

test('renders Automotive mode button', () => {
  render(<App />);
  const modeButtons = screen.getAllByText(/^Automotive$/i);
  expect(modeButtons.length).toBeGreaterThan(0);
});
