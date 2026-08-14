import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResultsPanel from './ResultsPanel';
import '@testing-library/jest-dom';

describe('ResultsPanel Component', () => {
  it('renders placeholder when no result is provided', () => {
    render(<ResultsPanel result={null} />);
    expect(screen.getByText(/Results and Messages will appear here/i)).toBeInTheDocument();
  });

  it('renders tabular data correctly for SELECT queries', () => {
    const mockResult = {
      type: 'success',
      data: 'id\tname\n1\tAlice\n2\tBob',
      timeMs: 45
    };

    render(<ResultsPanel result={mockResult} />);
    
    // Check headers
    expect(screen.getByText('id')).toBeInTheDocument();
    expect(screen.getByText('name')).toBeInTheDocument();
    
    // Check rows
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();

    // Check footer metrics
    expect(screen.getByText('Execution time: 45ms')).toBeInTheDocument();
    expect(screen.getByText('2 rows')).toBeInTheDocument();
  });

  it('renders error messages correctly and switches to Messages tab', () => {
    const mockResult = {
      type: 'error',
      data: 'Access denied. You do not have access to this database.',
      timeMs: 12
    };

    render(<ResultsPanel result={mockResult} />);
    
    expect(screen.getByText(/Access denied/i)).toBeInTheDocument();
    expect(screen.getByText('Execution time: 12ms')).toBeInTheDocument();
  });

  it('renders success messages correctly for non-SELECT queries', () => {
    const mockResult = {
      type: 'success',
      data: 'Query executed successfully. Rows affected: 1',
      timeMs: 15
    };

    render(<ResultsPanel result={mockResult} />);
    
    expect(screen.getByText(/Query executed successfully/i)).toBeInTheDocument();
  });
});
