import { render, screen } from '@testing-library/react';
import App from './App';

test('renders updated portfolio hero content', () => {
  render(<App />);
  expect(screen.getByText(/mechanical engineering graduate researcher/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /email me/i })).toBeInTheDocument();
});
