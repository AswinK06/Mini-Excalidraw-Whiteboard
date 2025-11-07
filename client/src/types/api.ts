// Shape type definition
export interface Shape {
  id: string;
  type: 'rectangle' | 'circle' | 'arrow' | 'text' | 'pencil';
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  text?: string;
  points?: Array<{ x: number; y: number }>;
  pageId: string;
  [key: string]: any; // For additional properties
}

// Page type definition
export interface Page {
  id: string;
  name: string;
  shapes: Shape[];
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// API Error type
export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

// Shape creation payload
export interface CreateShapePayload extends Omit<Shape, 'id'> {}

// Page creation payload
export interface CreatePagePayload {
  name: string;
}
