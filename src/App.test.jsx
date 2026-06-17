import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Global DesignAI Studio logo', () => {
  render(<App />);
  const logoElements = screen.getAllByText(/Global DesignAI Studio/i);
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

test('renders Global Ads mode option', () => {
  render(<App />);
  const modeOption = screen.getByText(/Global Ads/i);
  expect(modeOption).toBeDefined();
});

test('renders Games Design & Dev feature card', () => {
  render(<App />);
  const featureElement = screen.getByText(/Games Design & Dev/i);
  expect(featureElement).toBeDefined();
});

test('renders Games mode option', () => {
  render(<App />);
  const modeOptions = screen.getAllByText(/games/i);
  expect(modeOptions.length).toBeGreaterThan(0);
});

test('renders Automotive & Aero feature card', () => {
  render(<App />);
  const featureElement = screen.getByText(/Automotive & Aero/i);
  expect(featureElement).toBeDefined();
});

test('renders Automotive mode option', () => {
  render(<App />);
  const modeOptions = screen.getAllByText(/automotive/i);
  expect(modeOptions.length).toBeGreaterThan(0);
});

test('renders Health AI feature card', () => {
  render(<App />);
  const featureElements = screen.getAllByText(/Health AI/i);
  expect(featureElements.length).toBeGreaterThan(0);
});

test('renders Finance AI feature card', () => {
  render(<App />);
  const featureElements = screen.getAllByText(/Finance AI/i);
  expect(featureElements.length).toBeGreaterThan(0);
});

test('renders Global Finance mode option', () => {
  render(<App />);
  const modeOptions = screen.getAllByText(/Global Finance/i);
  expect(modeOptions.length).toBeGreaterThan(0);
});

test('renders Art AI Painter feature card', () => {
  render(<App />);
  const featureElements = screen.getAllByText(/Art AI Painter/i);
  expect(featureElements.length).toBeGreaterThan(0);
});

test('renders Global Art AI mode option', () => {
  render(<App />);
  const modeOptions = screen.getAllByText(/Global Art AI Painter/i);
  expect(modeOptions.length).toBeGreaterThan(0);
});
