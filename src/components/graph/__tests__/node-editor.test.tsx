import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Node } from '../../types/graph/models';
import NodeEditor from '../NodeEditor';
import { useGraphStore } from '../../stores/graph';

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

vi.mock('../StructuredAttributeEditor', () => ({
  default: ({ attributes, onChange }: { attributes: any; onChange: (attrs: any) => void }) => (
    <div data-testid="structured-attribute-editor">
      <span>Structured Attribute Editor</span>
      <button 
        onClick={() => onChange({ ...attributes, test: 'value' })} 
        data-testid="add-attribute-btn"
      >
        Add Attribute
      </button>
    </div>
  ),
}));

describe('NodeEditor', () => {
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

  const mockGetNodeById = vi.fn().mockReturnValue(mockNode);
  const mockGetNodes = vi.fn().mockReturnValue([]);
  const mockUpdateNode = vi.fn();

  beforeEach(() => {
    (useGraphStore as vi.Mock).mockReturnValue({
      getNodeById: mockGetNodeById,
      getNodes: mockGetNodes,
      updateNode: mockUpdateNode,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders node editor with node data', () => {
    render(<NodeEditor nodeId="test-node" />);
    
    expect(screen.getByDisplayValue('Test Node')).toBeInTheDocument();
    expect(screen.getByDisplayValue('This is test content')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test summary')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test, example')).toBeInTheDocument();
  });

  it('updates node when save is clicked', async () => {
    render(<NodeEditor nodeId="test-node" />);
    
    // Change some values
    const titleInput = screen.getByDisplayValue('Test Node');
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    
    const contentTextarea = screen.getByDisplayValue('This is test content');
    fireEvent.change(contentTextarea, { target: { value: 'Updated content' } });
    
    const summaryTextarea = screen.getByDisplayValue('Test summary');
    fireEvent.change(summaryTextarea, { target: { value: 'Updated summary' } });
    
    // Click save button
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdateNode).toHaveBeenCalledWith(
        'test-node',
        expect.objectContaining({
          id: 'test-node',
          title: 'Updated Title',
          content: 'Updated content',
          summary: 'Updated summary',
          tags: ['test', 'example'], // unchanged
          attributes: { priority: 'high', category: 'feature' }, // unchanged
        })
      );
    });
  });

  it('handles tag updates correctly', async () => {
    render(<NodeEditor nodeId="test-node" />);
    
    const tagInput = screen.getByDisplayValue('test, example');
    fireEvent.change(tagInput, { target: { value: 'new, tags, here' } });
    
    // Click save button
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdateNode).toHaveBeenCalledWith(
        'test-node',
        expect.objectContaining({
          tags: ['new', 'tags', 'here'],
        })
      );
    });
  });

  it('handles structured attribute updates', async () => {
    render(<NodeEditor nodeId="test-node" />);
    
    // Click the mock attribute button to trigger attribute change
    const addAttributeBtn = screen.getByTestId('add-attribute-btn');
    fireEvent.click(addAttributeBtn);
    
    // Click save button
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockUpdateNode).toHaveBeenCalledWith(
        'test-node',
        expect.objectContaining({
          attributes: { 
            priority: 'high', 
            category: 'feature',
            test: 'value' // Added by the mock component
          },
        })
      );
    });
  });

  it('resets to original values when reset is clicked', () => {
    render(<NodeEditor nodeId="test-node" />);
    
    // Change some values
    const titleInput = screen.getByDisplayValue('Test Node');
    fireEvent.change(titleInput, { target: { value: 'Changed Title' } });
    
    const contentTextarea = screen.getByDisplayValue('This is test content');
    fireEvent.change(contentTextarea, { target: { value: 'Changed content' } });
    
    // Click reset button
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    // Values should be reset to original
    expect(titleInput).toHaveValue('Test Node');
    expect(contentTextarea).toHaveValue('This is test content');
  });

  it('shows validation error when validation fails', async () => {
    const mockValidate = vi.fn(() => ({ 
      isValid: false, 
      errors: ['Title cannot exceed 100 characters'] 
    }));
    vi.doMock('../../utils/validation', () => ({
      validateNodeContent: mockValidate,
    }));

    // Mock alert to track if it's called
    const originalAlert = window.alert;
    const alertMock = vi.fn();
    window.alert = alertMock;

    render(<NodeEditor nodeId="test-node" />);
    
    // Change title to trigger validation
    const titleInput = screen.getByDisplayValue('Test Node');
    fireEvent.change(titleInput, { target: { value: 'A very long title that exceeds 100 characters limit and should trigger validation error' } });
    
    // Click save button
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('验证错误: Title cannot exceed 100 characters');
    });

    // Restore original alert
    window.alert = originalAlert;
  });
});