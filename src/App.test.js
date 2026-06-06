import { render, screen } from '@testing-library/react';
import App from './App';

test('renders controls and robotics portfolio hero content', () => {
  window.location.hash = '';
  render(<App />);
  expect(screen.getByText(/controls and robotics engineer/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /^contact$/i })).toBeInTheDocument();
});

test('renders a dedicated project detail page from the project route', () => {
  window.location.hash = '#/projects/qcar';
  render(<App />);

  expect(
    screen.getByRole('heading', {
      name: /end-to-end autonomous vehicle control/i,
    })
  ).toBeInTheDocument();
  expect(screen.getByText(/engineering challenge/i)).toBeInTheDocument();
  expect(screen.getByText(/system flow/i)).toBeInTheDocument();
});

test('renders the MuJoCo legged robot project page', () => {
  window.location.hash = '#/projects/mujoco-legged-robot';
  render(<App />);

  expect(
    screen.getByRole('heading', {
      name: /hybrid control of a legged robot in mujoco/i,
    })
  ).toBeInTheDocument();
  expect(screen.getByText(/stance, flight, touchdown, and liftoff/i)).toBeInTheDocument();
});
