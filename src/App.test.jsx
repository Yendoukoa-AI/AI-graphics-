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

test('renders Global Ad Creative AI feature card', () => {
  render(<App />);
  const featureElement = screen.getByText(/Global Ad Creative AI/i);
  expect(featureElement).toBeDefined();
});

test('renders Ads mode option', () => {
  render(<App />);
  const modeOptions = screen.getAllByText(/Global Ads/i);
  expect(modeOptions.length).toBeGreaterThan(0);
});

test('renders Global Games Design & Dev feature card', () => {
  render(<App />);
  const featureElement = screen.getByText(/Global Games Design & Dev/i);
  expect(featureElement).toBeDefined();
});

test('renders Games mode option', () => {
  render(<App />);
  const modeOptions = screen.getAllByText(/Global Games/i);
  expect(modeOptions.length).toBeGreaterThan(0);
});

test('renders Global Automotive & Aero feature card', () => {
  render(<App />);
  const featureElement = screen.getByText(/Global Automotive & Aero/i);
  expect(featureElement).toBeDefined();
});

test('renders Automotive mode option', () => {
  render(<App />);
  const modeOptions = screen.getAllByText(/Global Automotive/i);
  expect(modeOptions.length).toBeGreaterThan(0);
});

test('renders Global Health AI feature card', () => {
  render(<App />);
  const featureElements = screen.getAllByText(/Global Health AI/i);
  expect(featureElements.length).toBeGreaterThan(0);
});

test('renders Global Finance AI feature card', () => {
  render(<App />);
  const featureElements = screen.getAllByText(/Global Finance AI/i);
  expect(featureElements.length).toBeGreaterThan(0);
});

test('renders Finance mode option', () => {
  render(<App />);
  const modeOptions = screen.getAllByText(/Global Finance/i);
  expect(modeOptions.length).toBeGreaterThan(0);
});

test('renders Global Art AI Painter feature card', () => {
  render(<App />);
  const featureElements = screen.getAllByText(/Global Art AI Painter/i);
  expect(featureElements.length).toBeGreaterThan(0);
});

test('renders Art AI mode option', () => {
  render(<App />);
  const modeOptions = screen.getAllByText(/Global Art AI Painter/i);
  expect(modeOptions.length).toBeGreaterThan(0);
});
