import React from 'react';
import './ColorPicker.css';

const ColorPicker = ({ colors, selectedColor, onColorChange }) => {
  const colorMap = {
    yellow: { bg: '#E6CA97', name: 'Yellow Gold' },
    white: { bg: '#D9D9D9', name: 'White Gold' },
    rose: { bg: '#E1A4A9', name: 'Rose Gold' }
  };

  return (
    <div className="color-picker">
      <div className="color-options">
        {Object.keys(colors).map(color => (
          <button
            key={color}
            className={`color-option ${selectedColor === color ? 'selected' : ''}`}
            style={{ backgroundColor: colorMap[color]?.bg }}
            onClick={() => onColorChange(color)}
            title={colorMap[color]?.name}
            aria-label={`Select ${colorMap[color]?.name}`}
          />
        ))}
      </div>
      <div className="color-name">{colorMap[selectedColor]?.name}</div>
    </div>
  );
};

export default ColorPicker;