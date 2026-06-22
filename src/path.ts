import type { SeatPosition, TableGeometry } from './types';

function normalizeAngle(angle: number): number {
  const tau = Math.PI * 2;
  return ((angle % tau) + tau) % tau;
}

function getSeatAngle(index: number): number {
  return (2 * Math.PI * index) / 14 - Math.PI / 2;
}

function polarToCartesian(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  angle: number,
): { x: number; y: number } {
  return {
    x: cx + rx * Math.cos(angle),
    y: cy + ry * Math.sin(angle),
  };
}

export function computeSeatPositions(geometry: TableGeometry): SeatPosition[] {
  return Array.from({ length: 14 }, (_, index) => {
    const angle = getSeatAngle(index);
    const { x, y } = polarToCartesian(
      geometry.cx,
      geometry.cy,
      geometry.rx,
      geometry.ry,
      angle,
    );
    return { index, x, y, angle };
  });
}

export function buildArcPath(
  fromIndex: number,
  toIndex: number,
  geometry: TableGeometry,
): string {
  const fromAngle = getSeatAngle(fromIndex);
  const toAngle = getSeatAngle(toIndex);

  const delta = normalizeAngle(toAngle - fromAngle);
  const sweepFlag = delta <= Math.PI ? 1 : 0;

  const start = polarToCartesian(
    geometry.cx,
    geometry.cy,
    geometry.pathRx,
    geometry.pathRy,
    fromAngle,
  );
  const end = polarToCartesian(
    geometry.cx,
    geometry.cy,
    geometry.pathRx,
    geometry.pathRy,
    toAngle,
  );

  const largeArcFlag = delta <= Math.PI ? 0 : 1;

  return [
    `M ${start.x.toFixed(2)} ${start.y.toFixed(2)}`,
    `A ${geometry.pathRx} ${geometry.pathRy} 0 ${largeArcFlag} ${sweepFlag} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`,
  ].join(' ');
}

export function buildAllPaths(
  speakOrder: number[],
  geometry: TableGeometry,
): string[] {
  const paths: string[] = [];
  for (let i = 1; i < speakOrder.length; i++) {
    paths.push(buildArcPath(speakOrder[i - 1], speakOrder[i], geometry));
  }
  return paths;
}
