import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Palette } from 'lucide-react';

// Simple drag and drop implementation for React 19 compatibility
const DraggableItem = ({ item, onDragStart, onDragEnd, disabled = false, categoryColor = null }) => {
  const handleDragStart = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    console.log('DragStart event for:', item.text);
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(item);
  };

  const handleDragEnd = (e) => {
    if (disabled) return;
    console.log('DragEnd event for:', item.text);
    onDragEnd?.();
  };

  return (
    <div
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`px-3 py-2 bg-white border rounded-lg shadow-sm transition-all select-none ${
        disabled 
          ? 'cursor-default opacity-60' 
          : 'cursor-grab hover:shadow-md active:cursor-grabbing hover:scale-105'
      }`}
      style={{ 
        borderColor: categoryColor || '#d1d5db',
        borderWidth: categoryColor ? '2px' : '1px'
      }}
    >
      {item.text}
    </div>
  );
};

// Droppable zone component
const DroppableZone = ({ 
  children, 
  onDrop, 
  onDragOver, 
  onDragLeave,
  className = '', 
  style = {},
  disabled = false,
  isDragOver = false
}) => {
  const handleDragOver = (e) => {
    if (disabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    console.log('DragOver event');
    onDragOver?.(e);
  };

  const handleDrop = (e) => {
    if (disabled) return;
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    console.log('Drop event, itemId:', itemId);
    onDrop?.(itemId, e);
  };

  const handleDragLeave = (e) => {
    if (disabled) return;
    console.log('DragLeave event');
    onDragLeave?.(e);
  };

  const handleDragEnter = (e) => {
    if (disabled) return;
    e.preventDefault();
    console.log('DragEnter event');
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      onDragEnter={handleDragEnter}
      className={`${className} ${isDragOver ? 'bg-opacity-30' : ''}`}
      style={style}
    >
      {children}
    </div>
  );
};

// Component for the form builder - editing categories and items
export const CategorizeQuestionBuilder = ({ config, onUpdate }) => {
  const [categories, setCategories] = useState(config?.categories || []);
  const [items, setItems] = useState(config?.items || []);

  // Color options for categories
  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ];

  useEffect(() => {
    onUpdate({
      ...config,
      categories,
      items
    });
  }, [categories, items]);

  const addCategory = () => {
    const newCategory = {
      id: `cat-${Date.now()}`,
      label: `Category ${categories.length + 1}`,
      color: colorOptions[categories.length % colorOptions.length]
    };
    setCategories([...categories, newCategory]);
  };

  const updateCategory = (id, updates) => {
    setCategories(cats => cats.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    ));
  };

  const deleteCategory = (id) => {
    setCategories(cats => cats.filter(cat => cat.id !== id));
    // Update items that referenced this category
    setItems(items => items.map(item => 
      item.correctCategory === id ? { ...item, correctCategory: categories[0]?.id || '' } : item
    ));
  };

  const addItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      text: `Item ${items.length + 1}`,
      correctCategory: categories[0]?.id || ''
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id, updates) => {
    setItems(items => items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const deleteItem = (id) => {
    setItems(items => items.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Categories Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Categories</h4>
          <button
            onClick={addCategory}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Category
          </button>
        </div>
        
        <div className="space-y-2">
          {categories.map((category, index) => (
            <div key={category.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-6 h-6 rounded-full cursor-pointer border-2 border-white shadow-md"
                  style={{ backgroundColor: category.color }}
                  title="Click to change color"
                />
                <select
                  value={category.color}
                  onChange={(e) => updateCategory(category.id, { color: e.target.value })}
                  className="sr-only"
                >
                  {colorOptions.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
                {/* Color picker buttons */}
                <div className="flex space-x-1">
                  {colorOptions.slice(0, 5).map(color => (
                    <button
                      key={color}
                      onClick={() => updateCategory(category.id, { color })}
                      className="w-4 h-4 rounded-full border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={`Change to ${color}`}
                    />
                  ))}
                </div>
              </div>
              
              <input
                type="text"
                value={category.label}
                onChange={(e) => updateCategory(category.id, { label: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Category name"
              />
              
              <button
                onClick={() => deleteCategory(category.id)}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg"
                disabled={categories.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Items Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Items to Categorize</h4>
          <button
            onClick={addItem}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Item
          </button>
        </div>
        
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <span className="text-sm text-gray-500 w-8">#{index + 1}</span>
              
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateItem(item.id, { text: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Item text"
              />
              
              <select
                value={item.correctCategory}
                onChange={(e) => updateItem(item.id, { correctCategory: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-w-[140px]"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
              
              <button
                onClick={() => deleteItem(item.id)}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Preview:</h4>
        <CategorizeQuestionPreview 
          categories={categories} 
          items={items}
          disabled={true}
        />
      </div>

      {/* Tips */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips for Categorize Questions:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Create 2-5 meaningful categories with clear labels</li>
          <li>• Add 4-12 items that clearly belong to specific categories</li>
          <li>• Use different colors to help distinguish categories</li>
          <li>• Set correct categories for automatic scoring</li>
        </ul>
      </div>
    </div>
  );
};

// Component for form preview and public forms - interactive categorization
export const CategorizeQuestionPreview = ({ categories, items, onResponseChange, responses, disabled = false }) => {
  const [localItems, setLocalItems] = useState(() => {
    // Initialize items in "uncategorized" state or from responses
    const uncategorizedItems = items?.map(item => ({
      ...item,
      currentCategory: responses?.[item.id] || null
    })) || [];
    return uncategorizedItems;
  });

  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverZone, setDragOverZone] = useState(null);

  const handleDragStart = (item) => {
    console.log('Drag started:', item.text);
    setDraggedItem(item);
  };

  const handleDragEnd = () => {
    console.log('Drag ended');
    setDraggedItem(null);
    setDragOverZone(null);
  };

  const handleDrop = (itemId, targetZone) => {
    console.log('Drop:', itemId, 'to zone:', targetZone);
    if (disabled || !itemId) return;

    const newCategory = targetZone === 'uncategorized' ? null : targetZone;
    
    // Update the item's category
    const newItems = localItems.map(item => {
      if (item.id === itemId) {
        onResponseChange?.(item.id, newCategory);
        return { ...item, currentCategory: newCategory };
      }
      return item;
    });

    setLocalItems(newItems);
    setDragOverZone(null);
  };

  const handleDragOver = (zone) => {
    console.log('Drag over zone:', zone);
    setDragOverZone(zone);
  };

  const handleDragLeave = () => {
    setDragOverZone(null);
  };

  const getItemsForCategory = (categoryId) => {
    return localItems.filter(item => item.currentCategory === categoryId);
  };

  const getUncategorizedItems = () => {
    return localItems.filter(item => !item.currentCategory);
  };

  return (
    <div className="space-y-4">
      {/* Items Pool */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <h5 className="font-medium text-gray-700 mb-3">Items to Categorize:</h5>
        <DroppableZone
          onDrop={(itemId) => handleDrop(itemId, 'uncategorized')}
          onDragOver={() => handleDragOver('uncategorized')}
          onDragLeave={handleDragLeave}
          disabled={disabled}
          isDragOver={dragOverZone === 'uncategorized'}
          className={`flex flex-wrap gap-2 min-h-[60px] p-2 rounded-lg transition-all ${
            dragOverZone === 'uncategorized' ? 'bg-gray-200' : 'bg-gray-50'
          }`}
        >
          {getUncategorizedItems().map((item) => (
            <DraggableItem
              key={item.id}
              item={item}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              disabled={disabled}
            />
          ))}
          {getUncategorizedItems().length === 0 && (
            <div className="text-gray-400 italic text-sm py-4 w-full text-center">
              {disabled ? 'All items categorized' : 'Drag items here to uncategorize them'}
            </div>
          )}
        </DroppableZone>
      </div>

      {/* Category Drop Zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories?.map(category => (
          <div key={category.id} className="border-2 border-dashed rounded-lg p-4" style={{ borderColor: category.color }}>
            <h5 className="font-medium mb-3" style={{ color: category.color }}>
              {category.label}
            </h5>
            <DroppableZone
              onDrop={(itemId) => handleDrop(itemId, category.id)}
              onDragOver={() => handleDragOver(category.id)}
              onDragLeave={handleDragLeave}
              disabled={disabled}
              isDragOver={dragOverZone === category.id}
              className={`min-h-[100px] p-2 rounded-lg transition-all ${
                dragOverZone === category.id 
                  ? 'bg-opacity-30' 
                  : 'bg-opacity-10'
              }`}
              style={{ 
                backgroundColor: dragOverZone === category.id 
                  ? category.color + '50' 
                  : category.color + '20' 
              }}
            >
              <div className="space-y-2">
                {getItemsForCategory(category.id).map((item) => (
                  <DraggableItem
                    key={item.id}
                    item={item}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    disabled={disabled}
                    categoryColor={category.color}
                  />
                ))}
                {getItemsForCategory(category.id).length === 0 && (
                  <div className="text-gray-400 italic text-sm py-8 text-center">
                    Drop items here
                  </div>
                )}
              </div>
            </DroppableZone>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorizeQuestionPreview;
