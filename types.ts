export interface NodeData {
  label: string;
  content: string; // HTML content from rich text editor
  color?: string;
  tags?: string[];
}

export interface SavedMapData {
  nodes: any[]; // React Flow nodes
  edges: any[]; // React Flow edges
  viewport: { x: number; y: number; zoom: number };
}

export enum ExportType {
  PNG = 'PNG',
  PDF = 'PDF' // Simplified to Image for this implementation, but enum allows expansion
}