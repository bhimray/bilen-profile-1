import { render, screen } from '@testing-library/react';
import App from './App';

test('renders controls and robotics portfolio hero content', () => {
  render(<App />);
  expect(screen.getByText(/controls and robotics engineer/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
});
