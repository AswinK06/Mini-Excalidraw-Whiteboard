import { Shape } from '../types/Shape';

const API_BASE_URL = 'http://localhost:5000';

/**
 * Save shapes for a specific page to the backend using batch endpoint
 * @param shapes Array of shapes to save
 * @param pageId ID of the page to save shapes for
 */
export const saveShapes = async (shapes: Shape[], pageId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pages/${pageId}/shapes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shapes),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save shapes to the server.');
    }
  } catch (err) {
    console.error('Error saving shapes:', err);
    throw new Error('Failed to save shapes to the server.');
  }
};

/**
 * Load shapes for a specific page from the backend
 * @param pageId ID of the page to load shapes for
 * @returns Array of shapes for the specified page
 */
export const loadShapes = async (pageId: string): Promise<Shape[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pages/${pageId}/shapes`);
    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
    return [];
  } catch (err) {
    console.error('Error loading shapes:', err);
    return [];
  }
};

/**
 * Clear all shapes for a specific page from the backend
 * @param pageId ID of the page to clear shapes for
 */
export const clearPageData = async (pageId: string): Promise<void> => {
  try {
    // Save empty array to clear all shapes for this page
    await saveShapes([], pageId);
  } catch (err) {
    console.error('Error clearing page data:', err);
    throw new Error('Failed to clear page data from the server.');
  }
};

/**
 * Clear all shapes from the backend
 */
export const clearAllData = async (): Promise<void> => {
  try {
    // This would need to be implemented if needed
    console.warn('clearAllData not fully implemented');
  } catch (err) {
    console.error('Error clearing all data:', err);
    throw new Error('Failed to clear all data from the server.');
  }
};
