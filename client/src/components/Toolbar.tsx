import React from 'react';
import { FiPenTool, FiMinus, FiCircle, FiArrowRight, FiType, FiSave, FiTrash2 } from 'react-icons/fi';

interface Props {
  currentTool: string;
  setTool: (t: string) => void;
  fontFamily: string;
  setFontFamily: (f: string) => void;
  fontSize: number;
  setFontSize: (n: number) => void;
  color: string;
  setColor: (c: string) => void;
  onClear?: () => void;
  onSave?: () => void;
}

const Toolbar: React.FC<Props> = ({
  currentTool,
  setTool,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  color,
  setColor,
  onClear,
  onSave
}) => {
  const tools = [
    { id: 'pencil', icon: <FiPenTool size={18} />, label: 'Pencil' },
    { id: 'line', icon: <FiMinus size={18} />, label: 'Line' },
    { id: 'circle', icon: <FiCircle size={18} />, label: 'Circle' },
    { id: 'arrow', icon: <FiArrowRight size={18} />, label: 'Arrow' },
    { id: 'text', icon: <FiType size={18} />, label: 'Text' },
  ];

  const fonts = [
    { id: 'Arial', name: 'Arial' },
    { id: 'Verdana', name: 'Verdana' },
    { id: 'Courier New', name: 'Courier' },
    { id: 'Times New Roman', name: 'Times' },
    { id: 'Georgia', name: 'Georgia' },
  ];

  const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42];

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left side: Drawing tools */}
        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setTool(tool.id)}
              className={`p-2 rounded-md flex items-center justify-center transition-colors ${
                currentTool === tool.id
                  ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              title={tool.label}
            >
              {tool.icon}
            </button>
          ))}
        </div>

        {/* Center: Text formatting (only shown when text tool is selected) */}
        {currentTool === 'text' && (
          <div className="flex items-center space-x-3 px-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-600">Font:</label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {fonts.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-600">Size:</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {fontSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-600">Color:</label>
              <div className="relative">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 cursor-pointer rounded border border-gray-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* Right side: Action buttons */}
        <div className="flex items-center space-x-2">
          {onClear && (
            <button
              onClick={onClear}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md border border-red-200 transition-colors"
              title="Clear canvas"
            >
              <FiTrash2 size={16} />
              <span>Clear</span>
            </button>
          )}
          
          {onSave && (
            <button
              onClick={onSave}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              title="Save changes"
            >
              <FiSave size={16} />
              <span>Save</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
