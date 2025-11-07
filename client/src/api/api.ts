import { 
  Shape, 
  Page, 
  ApiResponse, 
  ApiError, 
  CreateShapePayload, 
  CreatePagePayload 
} from '@/types/api';

const API_BASE_URL = 'http://localhost:5000';

// Helper function to handle responses
async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    const error: ApiError = {
      message: data.error || 'Something went wrong',
      status: response.status,
      details: data.details
    };
    throw error;
  }
  
  return data as T;
}

// Pages API
export const pageApi = {
  // Get all pages
  getAll: async (): Promise<ApiResponse<Page[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pages`);
      const data = await handleResponse<Page[]>(response);
      return { data, success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to fetch pages', 
        success: false 
      };
    }
  },

  // Create a new page
  create: async (payload: CreatePagePayload): Promise<ApiResponse<Page>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await handleResponse<Page>(response);
      return { data, success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to create page', 
        success: false 
      };
    }
  },

  // Delete a page
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pages/${id}`, {
        method: 'DELETE',
      });
      const data = await handleResponse<{ message: string }>(response);
      return { data, success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to delete page', 
        success: false 
      };
    }
  },

  // Get shapes for a specific page
  getShapes: async (pageId: string): Promise<ApiResponse<Shape[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pages/${pageId}/shapes`);
      const data = await handleResponse<Shape[]>(response);
      return { data, success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to fetch shapes', 
        success: false 
      };
    }
  },
};

// Shapes API
export const shapeApi = {
  // Get all shapes across all pages
  getAll: async (): Promise<ApiResponse<Shape[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/shapes`);
      const data = await handleResponse<Shape[]>(response);
      return { data, success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to fetch all shapes', 
        success: false 
      };
    }
  },

  // Create a new shape
  create: async (shape: CreateShapePayload): Promise<ApiResponse<Shape>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/shapes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shape),
      });
      const data = await handleResponse<Shape>(response);
      return { data, success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to create shape', 
        success: false 
      };
    }
  },

  // Update a shape
  update: async (id: string, updates: Partial<Shape>): Promise<ApiResponse<Shape>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/shapes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      const data = await handleResponse<Shape>(response);
      return { data, success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to update shape', 
        success: false 
      };
    }
  },

  // Delete a shape
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/shapes/${id}`, {
        method: 'DELETE',
      });
      const data = await handleResponse<{ message: string }>(response);
      return { data, success: true };
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Failed to delete shape', 
        success: false 
      };
    }
  },
};

export default {
  page: pageApi,
  shape: shapeApi,
};
