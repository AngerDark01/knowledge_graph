import React, { useState } from 'react';

interface AttributeItem {
  key: string;
  value: string;
}

interface StructuredAttributeEditorProps {
  attributes: Record<string, any>;
  onChange: (attributes: Record<string, any>) => void;
}

const StructuredAttributeEditor: React.FC<StructuredAttributeEditorProps> = ({ attributes, onChange }) => {
  const [items, setItems] = useState<AttributeItem[]>(() => {
    return Object.entries(attributes).map(([key, value]) => ({
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value)
    }));
  });
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const addItem = () => {
    if (newKey.trim() && !items.some(item => item.key === newKey)) {
      const newItems = [...items, { key: newKey, value: newValue }];
      setItems(newItems);
      updateAttributes(newItems);
      setNewKey('');
      setNewValue('');
    }
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    updateAttributes(newItems);
  };

  const updateItem = (index: number, field: 'key' | 'value', value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
    updateAttributes(newItems);
  };

  const updateAttributes = (items: AttributeItem[]) => {
    const newAttributes: Record<string, any> = {};
    items.forEach(item => {
      try {
        // 尝试将值解析为JSON，如果失败则作为字符串
        newAttributes[item.key] = JSON.parse(item.value);
      } catch {
        newAttributes[item.key] = item.value;
      }
    });
    onChange(newAttributes);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-2 font-medium text-sm">
        <div className="col-span-5">Key</div>
        <div className="col-span-6">Value</div>
        <div className="col-span-1">Actions</div>
      </div>
      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-12 gap-2 items-center">
          <input
            type="text"
            value={item.key}
            onChange={(e) => updateItem(index, 'key', e.target.value)}
            className="col-span-5 p-2 border rounded"
            placeholder="Attribute key"
          />
          <input
            type="text"
            value={item.value}
            onChange={(e) => updateItem(index, 'value', e.target.value)}
            className="col-span-6 p-2 border rounded"
            placeholder="Attribute value"
          />
          <button
            onClick={() => removeItem(index)}
            className="col-span-1 p-2 text-red-500 hover:bg-red-100 rounded"
          >
            ×
          </button>
        </div>
      ))}
      <div className="grid grid-cols-12 gap-2 pt-2">
        <input
          type="text"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className="col-span-5 p-2 border rounded"
          placeholder="New key"
        />
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="col-span-6 p-2 border rounded"
          placeholder="New value"
        />
        <button
          onClick={addItem}
          className="col-span-1 p-2 bg-blue-500 text-white hover:bg-blue-600 rounded"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default StructuredAttributeEditor;