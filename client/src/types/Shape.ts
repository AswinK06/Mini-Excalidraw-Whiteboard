export type ShapeType = 'rectangle'|'circle'|'line'|'arrow'|'text'|'pencil'

export interface Point {
  x: number
  y: number
}

export interface Shape {
  id: string
  type: ShapeType
  x: number
  y: number
  x2?: number
  y2?: number
  width?: number
  height?: number
  radius?: number
  rotation?: number
  color?: string
  fontSize?: number
  fontFamily?: string
  content?: string
  pageId?: string
  points?: Point[] // For pencil/freehand drawing
}
