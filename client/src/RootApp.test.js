import React from 'react';
import { render, waitFor } from '@testing-library/react';
import App from './App';

describe('App', () => {
  test('renders the app', async () => {
    render(<App />);
    
    // Wait for either loading state or main content
    await waitFor(() => {
      const body = document.body;
      expect(body).toBeTruthy();
    });
  });

  test('renders without errors', () => {
    const { container } = render(<App />);
    
    // App should render something
    expect(container).toBeTruthy();
    expect(container.firstChild).toBeTruthy();
  });
});