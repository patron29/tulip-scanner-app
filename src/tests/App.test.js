import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    // App should render either the loading spinner or main content
    expect(document.body).toBeTruthy();
  });
});