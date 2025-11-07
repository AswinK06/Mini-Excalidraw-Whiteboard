import React, { useState, useEffect, useCallback } from 'react';
import Toolbar from './components/Toolbar';
import Whiteboard from './components/Whiteboard';
import PageManager from './components/PageManager';
import { Shape } from './types/Shape';
import { loadShapes, saveShapes, clearPageData } from './utils/storage';
import { FiRefreshCw, FiPlus, FiDownload } from 'react-icons/fi';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [tool, setTool] = useState('pencil');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(16);
  const [color, setColor] = useState('#333');

  const [pages, setPages] = useState<Array<{id: string, name: string}>>([]);
  const [currentPageId, setCurrentPageId] = useState<string>('');
  const [pageShapes, setPageShapes] = useState<Record<string, Shape[]>>({});
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Load initial data
  const loadPages = useCallback(async () => {
    try {
      const savedPages = localStorage.getItem('pages');
      if (savedPages) {
        const parsedPages = JSON.parse(savedPages);
        setPages(parsedPages);
        if (parsedPages.length > 0) {
          const firstPageId = parsedPages[0].id;
          setCurrentPageId(firstPageId);
          const shapes = await loadShapes(firstPageId);
          setPageShapes(prev => ({ ...prev, [firstPageId]: shapes }));
        }
      } else {
        // Initialize with default page if no saved pages
        const defaultPage = { id: `page_${Date.now()}`, name: 'Page 1' };
        setPages([defaultPage]);
        setCurrentPageId(defaultPage.id);
        setPageShapes({ [defaultPage.id]: [] });
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load the whiteboard. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load pages on initial render
  useEffect(() => {
    loadPages().catch(console.error);
  }, [loadPages]);

  // Save pages to localStorage when they change
  useEffect(() => {
    if (pages.length > 0) {
      try {
        localStorage.setItem('pages', JSON.stringify(pages));
      } catch (err) {
        console.error('Error saving pages:', err);
      }
    }
  }, [pages]);

  const handleShapesUpdate = (shapes: Shape[]) => {
    try {
      const updatedShapes = { ...pageShapes, [currentPageId]: shapes };
      setPageShapes(updatedShapes);
      saveShapes(shapes, currentPageId);
    } catch (err) {
      console.error('Error saving shapes:', err);
      setError('Failed to save changes. Please try again.');
    }
  };

  // Save all data
  const saveAllData = useCallback(async () => {
    try {
      // Save pages to localStorage
      localStorage.setItem('pages', JSON.stringify(pages));
      
      // Save shapes for each page to backend
      const savePromises = Object.entries(pageShapes).map(([pageId, shapes]) => 
        saveShapes(shapes, pageId)
      );
      await Promise.all(savePromises);
      
      // Show success message (you can replace this with a toast notification)
      alert('All changes saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Failed to save changes. Please try again.');
    }
  }, [pages, pageShapes]);

  const addPage = useCallback(() => {
    const newPage = { id: `page_${Date.now()}`, name: `Page ${pages.length + 1}` };
    const updatedPages = [...pages, newPage];
    setPages(updatedPages);
    setCurrentPageId(newPage.id);
    setPageShapes(prev => ({ ...prev, [newPage.id]: [] }));
    // Don't save to localStorage here - only on explicit save
  }, [pages]);

  const renamePage = (id: string, name: string) => {
    try {
      setPages(pages.map(p => (p.id === id ? { ...p, name } : p)));
    } catch (err) {
      console.error('Error renaming page:', err);
      setError('Failed to rename the page. Please try again.');
    }
  };

  const deletePage = async (id: string) => {
    try {
      if (pages.length <= 1) {
        // If it's the last page, just reset it instead of deleting
        const newId = `page_${Date.now()}`;
        const newPage = { id: newId, name: 'Page 1' };
        
        // Clear existing shapes
        await clearPageData(id);
        
        setPages([newPage]);
        setCurrentPageId(newId);
        setPageShapes({ [newId]: [] });
      } else {
        const newPages = pages.filter(p => p.id !== id);
        const newPageShapes = { ...pageShapes };
        
        // Clear the deleted page's data
        await clearPageData(id);
        delete newPageShapes[id];
        
        setPages(newPages);
        setPageShapes(newPageShapes);
        
        // If we deleted the current page, switch to the first available page
        if (id === currentPageId && newPages.length > 0) {
          await switchPage(newPages[0].id);
        }
      }
      
      // Save the updated pages list
      localStorage.setItem('pages', JSON.stringify(pages));
    } catch (err) {
      console.error('Error deleting page:', err);
      setError('Failed to delete the page. Please try again.');
    }
  };

  const switchPage = async (id: string) => {
    try {
      if (!pageShapes[id]) {
        const shapes = await loadShapes(id);
        setPageShapes(prev => ({ ...prev, [id]: shapes }));
      }
      setCurrentPageId(id);
    } catch (err) {
      console.error('Error switching page:', err);
      setError('Failed to switch page. Please try again.');
    }
  };

  const clearCurrentPage = () => {
    try {
      // Clear shapes for the current page
      setPageShapes(prev => ({ ...prev, [currentPageId]: [] }));
    } catch (err) {
      console.error('Error clearing page:', err);
      setError('Failed to clear the page. Please try again.');
    }
  };

  const exportCurrentPage = (format: 'png' | 'pdf') => {
    try {
      // Find the canvas element
      const originalCanvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!originalCanvas) {
        alert('Canvas not found. Please try again.');
        return;
      }

      // Create a new canvas with white background
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = originalCanvas.width;
      exportCanvas.height = originalCanvas.height;
      const ctx = exportCanvas.getContext('2d');
      
      if (!ctx) {
        alert('Failed to create export canvas.');
        return;
      }

      // Fill with white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      
      // Draw the original canvas content on top
      ctx.drawImage(originalCanvas, 0, 0);

      const currentPage = pages.find(p => p.id === currentPageId);
      const fileName = `${currentPage?.name || 'drawing'}_${new Date().toISOString().slice(0, 10)}`;

      if (format === 'png') {
        // Export as PNG with white background
        exportCanvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileName}.png`;
            link.click();
            URL.revokeObjectURL(url);
          }
        }, 'image/png');
      } else if (format === 'pdf') {
        // Export as PDF using jsPDF
        const imgData = exportCanvas.toDataURL('image/png');
        
        // Calculate dimensions to fit canvas in PDF
        const imgWidth = exportCanvas.width;
        const imgHeight = exportCanvas.height;
        
        // Dynamically import jsPDF
        import('jspdf').then(({ jsPDF }) => {
          // Calculate PDF dimensions
          const pdfWidth = 297; // A4 width in mm (landscape)
          const pdfHeight = 210; // A4 height in mm (landscape)
          const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
          const imgPdfWidth = imgWidth * ratio;
          const imgPdfHeight = imgHeight * ratio;
          
          // Center the image on the page
          const x = (pdfWidth - imgPdfWidth) / 2;
          const y = (pdfHeight - imgPdfHeight) / 2;
          
          const pdf = new jsPDF({
            orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
            unit: 'mm',
            format: 'a4'
          });
          
          pdf.addImage(imgData, 'PNG', x, y, imgPdfWidth, imgPdfHeight);
          pdf.save(`${fileName}.pdf`);
        }).catch(() => {
          alert('PDF export failed. Please try PNG export instead.');
        });
      }
    } catch (err) {
      console.error('Error exporting page:', err);
      alert('Failed to export. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Loading Whiteboard...</h2>
        <p className="text-gray-500 mt-2">Getting everything ready for you</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-br from-red-50 to-pink-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <FiRefreshCw className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={loadPages}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium text-sm leading-tight rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
            >
              <FiRefreshCw className="h-4 w-4" />
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium text-sm leading-tight rounded-lg shadow-md hover:bg-gray-100 hover:shadow-lg focus:outline-none focus:ring-0 active:bg-gray-200 transition duration-150 ease-in-out"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
      {/* Header */}
      <div className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Mini Excalidraw
            </h1>
            <div className="flex items-center gap-3">
              {/* Export Button with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm"
                >
                  <FiDownload className="h-4 w-4" />
                  Export
                </button>
                
                {showExportMenu && (
                  <>
                    {/* Backdrop to close menu */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowExportMenu(false)}
                    />
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <button
                        onClick={() => {
                          exportCurrentPage('png');
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        📷 Export as PNG
                      </button>
                      <button
                        onClick={() => {
                          exportCurrentPage('pdf');
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        📄 Export as PDF
                      </button>
                    </div>
                  </>
                )}
              </div>
              
              {/* Save All Button */}
              <button
                onClick={saveAllData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 shadow-sm"
              >
                Save All
              </button>
            </div>
          </div>
          
          {/* Page Tabs */}
          <div className="flex justify-between items-center p-2 bg-gray-100 border-b">
            <div className="flex-1">
              <PageManager
                pages={pages}
                currentPageId={currentPageId}
                onClear={clearCurrentPage}
                onRename={renamePage}
                onSwitch={switchPage}
                onDelete={deletePage}
              />
            </div>
            <button
              onClick={addPage}
              className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-1 text-sm whitespace-nowrap"
            >
              <FiPlus className="h-4 w-4" />
              New Page
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <Toolbar 
            currentTool={tool} 
            setTool={setTool} 
            fontFamily={fontFamily} 
            setFontFamily={setFontFamily} 
            fontSize={fontSize} 
            setFontSize={setFontSize} 
            color={color} 
            setColor={setColor} 
          />
        </div>
        
        {/* Whiteboard Area */}
        <div className="flex-1 overflow-auto p-4">
          <div className="h-full bg-white rounded-lg shadow-inner border border-gray-200">
            {currentPageId ? (
              <Whiteboard 
                currentTool={tool} 
                fontFamily={fontFamily} 
                fontSize={fontSize} 
                color={color} 
                shapes={pageShapes[currentPageId] || []} 
                setShapes={handleShapesUpdate} 
                pageId={currentPageId} 
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center p-6 max-w-md">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                    <FiPlus className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No page selected</h3>
                  <p className="text-sm text-gray-500 mb-4">Create a new page or select an existing one to start drawing.</p>
                  <button
                    onClick={addPage}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiPlus className="-ml-1 mr-2 h-4 w-4" />
                    New Page
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App
