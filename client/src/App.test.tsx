import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the header with app name', () => {
    render(<App />);
    expect(screen.getByText('Grade Alchemy')).toBeInTheDocument();
  });

  it('renders navigation tabs', () => {
    render(<App />);
    expect(screen.getByText('Calculator')).toBeInTheDocument();
    expect(screen.getByText('Theory')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('shows calculator tab by default', () => {
    render(<App />);
    expect(screen.getByText('Grade Boundaries')).toBeInTheDocument();
    expect(screen.getByText('Class Grades')).toBeInTheDocument();
    expect(screen.getByText('Student Score')).toBeInTheDocument();
  });

  it('switches to theory tab when clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText('Theory'));
    expect(screen.getByText('Mean & Standard Deviation')).toBeInTheDocument();
  });

  it('switches to about tab when clicked', () => {
    render(<App />);
    fireEvent.click(screen.getByText('About'));
    expect(screen.getByText('About Grade Alchemy')).toBeInTheDocument();
  });
});
