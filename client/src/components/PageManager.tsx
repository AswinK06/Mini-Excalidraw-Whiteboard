import React, { useState, useRef, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';

interface Page { id: string; name: string }

interface Props {
  pages: Page[]
  currentPageId: string
  onClear: () => void
  onRename: (id: string, name: string) => void
  onSwitch: (id: string) => void
  onDelete: (id: string) => void
}

const PageManager: React.FC<Props> = ({ pages, currentPageId, onClear, onRename, onSwitch, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showScrollLeft, setShowScrollLeft] = useState(false);
  const [showScrollRight, setShowScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Handle scroll events
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollLeft > 0) {
        setShowScrollLeft(true);
      } else {
        setShowScrollLeft(false);
      }

      if (container.scrollWidth > container.clientWidth + container.scrollLeft) {
        setShowScrollRight(true);
      } else {
        setShowScrollRight(false);
      }
    };

    // Initial check
    handleScroll();
    
    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [pages]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === 'left' ? -200 : 200;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const startEditing = (e: React.MouseEvent, page: Page) => {
    e.stopPropagation();
    setEditingId(page.id);
    setEditValue(page.name);
  };

  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && editValue.trim()) {
      onRename(editingId, editValue.trim());
      setEditingId(null);
    }
  };

  const handlePageClick = (id: string) => {
    if (editingId) return; // Don't switch pages while editing
    onSwitch(id);
  };

  return (
    <div className="relative">
      {showScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 flex items-center justify-center bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          aria-label="Scroll left"
        >
          <FiChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
      )}
      
      <div 
        ref={scrollContainerRef}
        className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2 px-1"
        style={{ scrollbarWidth: 'none' }}
      >
        <div ref={tabsRef} className="flex items-center gap-2">
          {pages.map(page => (
            <div 
              key={page.id} 
              onClick={() => handlePageClick(page.id)}
              className={`
                group relative flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 min-w-[120px] max-w-[200px]
                ${page.id === currentPageId 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'}
              `}
            >
              {editingId === page.id ? (
                <form onSubmit={handleRename} className="flex-1">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={handleRename}
                    autoFocus
                    className="w-full bg-transparent border-b border-white/50 outline-none text-white placeholder-white/70"
                  />
                </form>
              ) : (
                <span className="truncate flex-1 text-sm font-medium">
                  {page.name}
                </span>
              )}
              
              {page.id === currentPageId && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => startEditing(e, page)}
                    className="p-1 rounded-full hover:bg-white/20 transition-colors"
                    aria-label="Rename page"
                  >
                    <FiEdit2 className="h-3.5 w-3.5" />
                  </button>
                  {pages.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete "${page.name}"?`)) {
                          onDelete(page.id);
                        }
                      }}
                      className="p-1 rounded-full hover:bg-white/20 transition-colors"
                      aria-label="Delete page"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
              
              {page.id === currentPageId && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-white rounded-t-full"></div>
              )}
            </div>
          ))}
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Clear all content on this page? This cannot be undone until you save.')) {
                  onClear();
                }
              }}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center gap-1 text-sm whitespace-nowrap"
              title="Clear current page content"
            >
              <FiX className="h-4 w-4" />
              Clear Page
            </button>
          </div>
        </div>
      </div>
      
      {showScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 flex items-center justify-center bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
          aria-label="Scroll right"
        >
          <FiChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      )}
    </div>
  );
};

export default PageManager;
