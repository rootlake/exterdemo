export type AppMode = 'setup' | 'discuss';

export interface Seat {
  index: number;
  name: string;
  isTeacher: boolean;
}

export interface SessionState {
  version: 1;
  title: string;
  createdAt: string;
  mode: AppMode;
  seats: Seat[];
  speakOrder: number[];
  notes: string;
}

export interface TableGeometry {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  pathRx: number;
  pathRy: number;
}

export interface SeatPosition {
  index: number;
  x: number;
  y: number;
  angle: number;
}

export interface ExportedSession {
  version: 1;
  title: string;
  createdAt: string;
  seats: Seat[];
  speakOrder: number[];
  notes: string;
}
