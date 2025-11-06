import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import HistoryControl from '../HistoryControl';
import { useGraphStore } from '../../stores/graph';

// Mock the store
vi.mock('../../stores/graph', () => ({
  useGraphStore: vi.fn(),
}));

describe('HistoryControl', () => {
  const mockCanUndo = vi.fn();
  const mockCanRedo = vi.fn();
  const mockUndo = vi.fn();
  const mockRedo = vi.fn();

  beforeEach(() => {
    (useGraphStore as vi.Mock).mockImplementation(() => ({
      canUndo: mockCanUndo(),
      canRedo: mockCanRedo(),
      undo: mockUndo,
      redo: mockRedo,
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders undo and redo buttons', () => {
    mockCanUndo.mockReturnValue(true);
    mockCanRedo.mockReturnValue(true);
    
    render(<HistoryControl />);
    
    const undoButton = screen.getByTitle('撤销');
    const redoButton = screen.getByTitle('重做');
    
    expect(undoButton).toBeInTheDocument();
    expect(redoButton).toBeInTheDocument();
  });

  it('disables undo button when canUndo returns false', () => {
    mockCanUndo.mockReturnValue(false);
    mockCanRedo.mockReturnValue(true);
    
    render(<HistoryControl />);
    
    const undoButton = screen.getByTitle('撤销');
    expect(undoButton).toBeDisabled();
  });

  it('enables undo button when canUndo returns true', () => {
    mockCanUndo.mockReturnValue(true);
    mockCanRedo.mockReturnValue(true);
    
    render(<HistoryControl />);
    
    const undoButton = screen.getByTitle('撤销');
    expect(undoButton).not.toBeDisabled();
  });

  it('disables redo button when canRedo returns false', () => {
    mockCanUndo.mockReturnValue(true);
    mockCanRedo.mockReturnValue(false);
    
    render(<HistoryControl />);
    
    const redoButton = screen.getByTitle('重做');
    expect(redoButton).toBeDisabled();
  });

  it('enables redo button when canRedo returns true', () => {
    mockCanUndo.mockReturnValue(true);
    mockCanRedo.mockReturnValue(true);
    
    render(<HistoryControl />);
    
    const redoButton = screen.getByTitle('重做');
    expect(redoButton).not.toBeDisabled();
  });

  it('calls undo function when undo button is clicked', () => {
    mockCanUndo.mockReturnValue(true);
    mockCanRedo.mockReturnValue(true);
    
    render(<HistoryControl />);
    
    const undoButton = screen.getByTitle('撤销');
    fireEvent.click(undoButton);
    
    expect(mockUndo).toHaveBeenCalled();
  });

  it('calls redo function when redo button is clicked', () => {
    mockCanUndo.mockReturnValue(true);
    mockCanRedo.mockReturnValue(true);
    
    render(<HistoryControl />);
    
    const redoButton = screen.getByTitle('重做');
    fireEvent.click(redoButton);
    
    expect(mockRedo).toHaveBeenCalled();
  });

  it('does not call undo function when undo button is disabled', () => {
    mockCanUndo.mockReturnValue(false);
    mockCanRedo.mockReturnValue(true);
    
    render(<HistoryControl />);
    
    const undoButton = screen.getByTitle('撤销');
    fireEvent.click(undoButton);
    
    expect(mockUndo).not.toHaveBeenCalled();
  });

  it('does not call redo function when redo button is disabled', () => {
    mockCanUndo.mockReturnValue(true);
    mockCanRedo.mockReturnValue(false);
    
    render(<HistoryControl />);
    
    const redoButton = screen.getByTitle('重做');
    fireEvent.click(redoButton);
    
    expect(mockRedo).not.toHaveBeenCalled();
  });
});

// Test the history functionality in the store
describe('Store History Functionality', () => {
  // Since we can't directly test the Zustand store implementation through UI,
  // we can only test the UI interface to the store.
  // For full testing of store functionality, we would need to create a separate
  // test file specifically for the historySlice.
});