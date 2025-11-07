import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Shape } from '../types/Shape';
import { FiAlertCircle, FiRotateCw } from 'react-icons/fi';

interface Props {
  currentTool: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  shapes: Shape[];
  setShapes: (s: Shape[]) => void;
  pageId?: string;
}

const Whiteboard: React.FC<Props> = ({ 
  currentTool, 
  fontFamily, 
  fontSize, 
  color, 
  shapes, 
  setShapes, 
  pageId 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Set up canvas dimensions and event listeners
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.floor(width) - 2, // Account for border
          height: Math.floor(height) - 2
        });
      }
    };

    // Initial setup
    updateDimensions();
    
    // Handle keyboard events for shift key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Calculate the constrained point based on shift key state
  const getConstrainedPoint = useCallback((start: {x: number, y: number}, x: number, y: number) => {
    if (!isShiftPressed) return { x, y };
    
    const dx = x - start.x;
    const dy = y - start.y;
    
    // If shift is pressed, snap to 90 degree angles (horizontal or vertical)
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal line (snap y to start y)
      return { x, y: start.y };
    } else {
      // Vertical line (snap x to start x)
      return { x: start.x, y };
    }
  }, [isShiftPressed]);

  // Draw the canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Could not initialize canvas context');
      return;
    }
    
    // Clear the entire canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    try {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw a subtle grid background
      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 1;
      const gridSize = 20;
      
      // Draw vertical lines
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Draw horizontal lines
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Draw all shapes
      shapes.forEach(shape => {
        try {
          ctx.save();
          
          // Set common styles
          ctx.strokeStyle = shape.color || color;
          ctx.fillStyle = shape.color || color;
          ctx.lineWidth = shape.type === 'pencil' ? 2.5 : 2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
      
      switch (shape.type) {
        case 'line':
        case 'arrow':
          ctx.beginPath();
          ctx.moveTo(shape.x, shape.y);
          ctx.lineTo(shape.x2 || shape.x, shape.y2 || shape.y);
          ctx.stroke();
          
          // Draw arrow head if it's an arrow
          if (shape.type === 'arrow' && shape.x2 !== undefined && shape.y2 !== undefined) {
            const headlen = 15;
            const angle = Math.atan2(shape.y2 - shape.y, shape.x2 - shape.x);
            
            // Draw arrow head
            ctx.beginPath();
            ctx.moveTo(shape.x2, shape.y2);
            ctx.lineTo(
              shape.x2 - headlen * Math.cos(angle - Math.PI / 6),
              shape.y2 - headlen * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(shape.x2, shape.y2);
            ctx.lineTo(
              shape.x2 - headlen * Math.cos(angle + Math.PI / 6),
              shape.y2 - headlen * Math.sin(angle + Math.PI / 6)
            );
            ctx.stroke();
          }
          break;
          
        case 'circle':
          ctx.beginPath();
          ctx.arc(shape.x, shape.y, shape.radius || 10, 0, Math.PI * 2);
          ctx.stroke();
          break;
          
        case 'rectangle':
          ctx.strokeRect(
            shape.x,
            shape.y,
            shape.width || 50,
            shape.height || 30
          );
          break;
          
        case 'text':
          if (shape.content) {
            ctx.font = `${shape.fontSize || 16}px ${shape.fontFamily || 'Arial'}`;
            ctx.fillText(shape.content, shape.x, shape.y);
          }
          break;
          
        case 'pencil':
          if (shape.points && shape.points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(shape.points[0].x, shape.points[0].y);
            
            for (let i = 1; i < shape.points.length; i++) {
              ctx.lineTo(shape.points[i].x, shape.points[i].y);
            }
            
            ctx.stroke();
          }
          break;
      }
      
          ctx.restore();
        } catch (err) {
          console.error('Error drawing shape:', err);
          // Continue with other shapes even if one fails
        }
      });
    } catch (err) {
      console.error('Error drawing canvas:', err);
      setError('Failed to draw canvas. Please try again.');
    }
  }, [shapes, color]);

  const getCoords = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    return { 
      x: (e.clientX - rect.left) * scaleX, 
      y: (e.clientY - rect.top) * scaleY 
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    try {
      const {x, y} = getCoords(e);
      
      // Check if we're clicking on an existing shape
      const clicked = shapes.find(s => {
        if (s.type === 'text') {
          return Math.abs(s.x - x) < 50 && Math.abs(s.y - y) < 20; // Larger hit area for text
        }
        return Math.abs(s.x - x) < 10 && Math.abs(s.y - y) < 10;
      });

      if (clicked) { 
        setDragId(clicked.id); 
        return; 
      }

      if (currentTool === 'text') {
        const text = prompt('Enter text:');
        if (!text) return;
        
        const newText: Shape = { 
          id: 't_' + Date.now(), 
          type: 'text', 
          content: text, 
          x, y, 
          color, 
          fontSize, 
          fontFamily, 
          pageId 
        };
        setShapes([...shapes, newText]);
        return;
      }

      setStart({x, y});
      setIsDrawing(true);
      
      // Add a new shape
      const id = 's_' + Date.now();
      const newShape: Shape = { 
        id, 
        type: currentTool as any, 
        x, y, 
        color,
        pageId 
      };
      
      // Set shape-specific properties
      if (currentTool === 'circle') {
        newShape.radius = 0;
      } else if (currentTool === 'line' || currentTool === 'arrow') { 
        newShape.x2 = x; 
        newShape.y2 = y; 
      } else if (currentTool === 'rectangle') { 
        newShape.width = 0; 
        newShape.height = 0; 
      } else if (currentTool === 'pencil') {
        newShape.points = [{x, y}];
      }
      
      setShapes([...shapes, newShape]);
    } catch (error) {
      console.error('Error in handleMouseDown:', error);
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing && !dragId) return;
    
    const {x: rawX, y: rawY} = getCoords(e);
    
    // Apply constraints if shift is pressed
    const {x, y} = start && (currentTool === 'line' || currentTool === 'arrow')
      ? getConstrainedPoint(start, rawX, rawY)
      : { x: rawX, y: rawY };
    
    if (dragId) {
      // Update the position of the dragged shape
      const updatedShapes = shapes.map(s => {
        if (s.id === dragId) {
          if (s.type === 'pencil' && s.points) {
            // For pencil drawings, adjust all points by the drag delta
            const deltaX = x - (s.x2 || s.x);
            const deltaY = y - (s.y2 || s.y);
            return {
              ...s,
              x: s.x + deltaX,
              y: s.y + deltaY,
              x2: s.x2 ? s.x2 + deltaX : undefined,
              y2: s.y2 ? s.y2 + deltaY : undefined,
              points: s.points.map(p => ({
                x: p.x + deltaX,
                y: p.y + deltaY
              }))
            };
          }
          // For other shapes, just update the position
          return {
            ...s,
            x: x - (s.x2 ? (s.x2 - s.x) / 2 : 0),
            y: y - (s.y2 ? (s.y2 - s.y) / 2 : 0),
            x2: s.x2 ? x + (s.x2 - s.x) / 2 : undefined,
            y2: s.y2 ? y + (s.y2 - s.y) / 2 : undefined
          };
        }
        return s;
      });
      setShapes(updatedShapes);
      return;
    }
    
    if (!start) return;
    
    // Update the shape being drawn
    const updatedShapes = [...shapes];
    const lastIndex = updatedShapes.length - 1;
    
    if (lastIndex < 0) return;
    
    const lastShape = { ...updatedShapes[lastIndex] };
    
    switch (lastShape.type) {
      case 'circle': {
        const dx = x - lastShape.x;
        const dy = y - lastShape.y;
        lastShape.radius = Math.sqrt(dx * dx + dy * dy);
        break;
      }
      case 'rectangle':
        lastShape.width = x - lastShape.x;
        lastShape.height = y - lastShape.y;
        
        // Apply square constraint when shift is pressed
        if (isShiftPressed) {
          const size = Math.max(Math.abs(lastShape.width), Math.abs(lastShape.height));
          lastShape.width = Math.sign(lastShape.width) * size;
          lastShape.height = Math.sign(lastShape.height) * size;
        }
        break;
        
      case 'line':
      case 'arrow':
        lastShape.x2 = x;
        lastShape.y2 = y;
        break;
        
      case 'pencil':
        if (!lastShape.points) {
          lastShape.points = [];
        }
        lastShape.points.push({ x, y });
        lastShape.x2 = x;
        lastShape.y2 = y;
        break;
    }
    
    updatedShapes[lastIndex] = lastShape;
    setShapes(updatedShapes);
  }

  const handleMouseUp = () => {
    setIsDrawing(false);
    setStart(null);
    setDragId(null);
  }

  // Draw canvas when shapes, color, or dimensions change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-red-50 p-4 rounded-lg border border-red-200">
        <FiAlertCircle className="h-8 w-8 text-red-500 mb-2" />
        <p className="text-red-600 font-medium mb-4">Canvas Error</p>
        <p className="text-sm text-red-500 text-center mb-4">{error}</p>
        <button
          onClick={() => {
            setError(null);
            drawCanvas();
          }}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <FiRotateCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  // Handle window resize with debounce
  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout>;
    
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.floor(width),
          height: Math.floor(height)
        });
      }
    };
    
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateCanvasSize, 100);
    };

    // Initial setup
    updateCanvasSize();
    
    // Add event listeners
    window.addEventListener('resize', handleResize);
    const resizeObserver = new ResizeObserver(updateCanvasSize);
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-white"
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute top-0 left-0 w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {/* Tool indicator */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md border border-gray-200 text-sm font-medium text-gray-700 flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: color }}
        />
        <span className="capitalize">{currentTool}</span>
      </div>
    </div>
  )
}

export default Whiteboard
