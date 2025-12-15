import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { create } from 'zustand';
import { Node } from '../../types/graph/models';
import ContentEditor from '../ContentEditor';
import { GraphStore, useGraphStore } from '../../stores/graph';

// Mock the store
vi.mock('../../stores/graph', async () => {
  const actual = await vi.importActual('../../stores/graph');
  return {
    ...actual,
    useGraphStore: vi.fn(),
  };
});

// Mock the validation functions
vi.mock('../../utils/validation', () => ({
  validateNodeContent: vi.fn(() => ({ isValid: true, errors: [] })),
}));

describe('ContentEditor', () => {
  const mockNode: Node = {
    id: 'test-node',
    type: 'node',
    title: 'Test Node',
    content: 'This is test content',
    position: { x: 0, y: 0 },
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: ['test', 'example'],
    attributes: { priority: 'high', category: 'feature' },
    summary: 'Test summary',
  };

  const mockUpdateNode = vi.fn();

  beforeEach(() => {
    (useGraphStore as vi.Mock).mockReturnValue({
      updateNode: mockUpdateNode,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders node title and content correctly', () => {
    render(<ContentEditor node={mockNode} />);
    
    expect(screen.getByText('Test Node')).toBeInTheDocument();
    expect(screen.getByText('This is test content')).toBeInTheDocument();
  });

  it('switches to edit mode when clicked', () => {
    render(<ContentEditor node={mockNode} />);
    
    const container = screen.getByText('Test Node').closest('div');
    fireEvent.click(container!);
    
    expect(screen.getByDisplayValue('Test Node')).toBeInTheDocument();
    expect(screen.getByDisplayValue('This is test content')).toBeInTheDocument();
  });

  it('updates node content when saved', async () => {
    render(<ContentEditor node={mockNode} />);
    
    // Enter edit mode
    const container = screen.getByText('Test Node').closest('div');
    fireEvent.click(container!);
    
    // Change title and content
    const titleInput = screen.getByDisplayValue('Test Node');
    const contentInput = screen.getByDisplayValue('This is test content');
    
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    fireEvent.change(contentInput, { target: { value: 'Updated content' } });
    
    // Click save button
    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdateNode).toHaveBeenCalledWith(
        'test-node',
        expect.objectContaining({
          title: 'Updated Title',
          content: 'Updated content',
          isEditing: false
        })
      );
    });
  });

  it('cancels edit when cancel button is clicked', async () => {
    render(<ContentEditor node={mockNode} />);
    
    // Enter edit mode
    const container = screen.getByText('Test Node').closest('div');
    fireEvent.click(container!);
    
    // Change title and content
    const titleInput = screen.getByDisplayValue('Test Node');
    const contentInput = screen.getByDisplayValue('This is test content');
    
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    fireEvent.change(contentInput, { target: { value: 'Updated content' } });
    
    // Click cancel button
    const cancelButton = screen.getByText('取消');
    fireEvent.click(cancelButton);
    
    // Check that the content editor is back in display mode
    await waitFor(() => {
      expect(screen.getByText('Test Node')).toBeInTheDocument();
      expect(screen.getByText('This is test content')).toBeInTheDocument();
    });
    
    // UpdateNode should not have been called with the updated values
    expect(mockUpdateNode).not.toHaveBeenCalledWith(
      'test-node',
      expect.objectContaining({
        title: 'Updated Title', // Should not have this value
        content: 'Updated content' // Should not have this value
      })
    );
  });

  it('saves when Ctrl+Enter is pressed', async () => {
    render(<ContentEditor node={mockNode} />);
    
    // Enter edit mode
    const container = screen.getByText('Test Node').closest('div');
    fireEvent.click(container!);
    
    // Change title and content
    const titleInput = screen.getByDisplayValue('Test Node');
    const contentInput = screen.getByDisplayValue('This is test content');
    
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    fireEvent.change(contentInput, { target: { value: 'Updated content' } });
    
    // Press Ctrl+Enter
    fireEvent.keyDown(contentInput, { key: 'Enter', ctrlKey: true });
    
    await waitFor(() => {
      expect(mockUpdateNode).toHaveBeenCalledWith(
        'test-node',
        expect.objectContaining({
          title: 'Updated Title',
          content: 'Updated content',
          isEditing: false
        })
      );
    });
  });

  it('cancels when Escape is pressed', async () => {
    render(<ContentEditor node={mockNode} />);
    
    // Enter edit mode
    const container = screen.getByText('Test Node').closest('div');
    fireEvent.click(container!);
    
    // Change title and content
    const titleInput = screen.getByDisplayValue('Test Node');
    const contentInput = screen.getByDisplayValue('This is test content');
    
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    fireEvent.change(contentInput, { target: { value: 'Updated content' } });
    
    // Press Escape
    fireEvent.keyDown(contentInput, { key: 'Escape' });
    
    // Check that the content editor is back in display mode
    await waitFor(() => {
      expect(screen.getByText('Test Node')).toBeInTheDocument();
      expect(screen.getByText('This is test content')).toBeInTheDocument();
    });
    
    // UpdateNode should not have been called with the updated values
    expect(mockUpdateNode).not.toHaveBeenCalledWith(
      'test-node',
      expect.objectContaining({
        title: 'Updated Title', // Should not have this value
        content: 'Updated content' // Should not have this value
      })
    );
  });
});

// Test for validation functionality
describe('Validation', () => {
  const mockNode: Node = {
    id: 'test-node',
    type: 'node',
    title: 'Test Node',
    content: 'This is test content',
    position: { x: 0, y: 0 },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUpdateNode = vi.fn();

  beforeEach(() => {
    (useGraphStore as vi.Mock).mockReturnValue({
      updateNode: mockUpdateNode,
    });
  });

  it('shows validation error when title is empty', async () => {
    const mockValidate = vi.fn(() => ({ 
      isValid: false, 
      errors: ['Title cannot be empty'] 
    }));
    vi.doMock('../../utils/validation', () => ({
      validateNodeContent: mockValidate,
    }));

    render(<ContentEditor node={mockNode} />);
    
    // Enter edit mode
    const container = screen.getByText('Test Node').closest('div');
    fireEvent.click(container!);
    
    // Change title to empty
    const titleInput = screen.getByDisplayValue('Test Node');
    fireEvent.change(titleInput, { target: { value: '' } });
    
    // Click save button
    const saveButton = screen.getByText('保存');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockValidate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '',
          content: 'This is test content',
          id: 'test-node',
          position: { x: 0, y: 0 },
        })
      );
    });
  });
});