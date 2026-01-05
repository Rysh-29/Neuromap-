import { Node, Edge, Viewport } from 'reactflow';
import { SavedMapData } from '../types';

const STORAGE_KEY = 'neuromap-data';

export const saveMap = (nodes: Node[], edges: Edge[], viewport: Viewport) => {
  const data: SavedMapData = {
    nodes,
    edges,
    viewport
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save to local storage", e);
  }
};

export const loadMap = (): SavedMapData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Failed to load from local storage", e);
    return null;
  }
};

export const clearMap = () => {
    localStorage.removeItem(STORAGE_KEY);
}