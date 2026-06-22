import { buildAllPaths, computeSeatPositions } from './path';
import {
  getLatestSpeakerIndex,
  getSeatLabel,
  getSpeakerCounts,
} from './session';
import type { AppMode, Seat, SessionState, TableGeometry } from './types';

const TABLE_GEOMETRY: TableGeometry = {
  cx: 400,
  cy: 280,
  rx: 320,
  ry: 210,
  pathRx: 280,
  pathRy: 175,
};

export class TableView {
  private container: HTMLElement;
  private svg: SVGSVGElement;
  private onSeatClick: (index: number) => void;
  private onSeatNameChange: (index: number, name: string) => void;
  private onSeatTeacherToggle: (index: number) => void;

  constructor(
    container: HTMLElement,
    handlers: {
      onSeatClick: (index: number) => void;
      onSeatNameChange: (index: number, name: string) => void;
      onSeatTeacherToggle: (index: number) => void;
    },
  ) {
    this.container = container;
    this.onSeatClick = handlers.onSeatClick;
    this.onSeatNameChange = handlers.onSeatNameChange;
    this.onSeatTeacherToggle = handlers.onSeatTeacherToggle;

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttribute('viewBox', '0 0 800 560');
    this.svg.setAttribute('class', 'harkness-table');
    this.svg.setAttribute('role', 'img');
    this.svg.setAttribute('aria-label', 'Harkness oval table with fourteen seats');
    this.container.appendChild(this.svg);
  }

  render(state: SessionState): void {
    const positions = computeSeatPositions(TABLE_GEOMETRY);
    const speakerCounts = getSpeakerCounts(state.speakOrder);
    const latestSpeaker = getLatestSpeakerIndex(state.speakOrder);
    const paths = buildAllPaths(state.speakOrder, TABLE_GEOMETRY);

    this.svg.innerHTML = '';

    this.svg.appendChild(this.createDefs());
    this.svg.appendChild(this.createTableSurface());
    this.svg.appendChild(this.createPathLayer(paths));
    this.svg.appendChild(
      this.createSeatLayer(state.seats, positions, state.mode, speakerCounts, latestSpeaker),
    );
  }

  private createDefs(): SVGDefsElement {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    const woodGrain = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    woodGrain.setAttribute('id', 'wood-grain');
    woodGrain.setAttribute('x', '0%');
    woodGrain.setAttribute('y', '0%');
    woodGrain.setAttribute('width', '100%');
    woodGrain.setAttribute('height', '100%');

    const turbulence = document.createElementNS('http://www.w3.org/2000/svg', 'feTurbulence');
    turbulence.setAttribute('type', 'fractalNoise');
    turbulence.setAttribute('baseFrequency', '0.9');
    turbulence.setAttribute('numOctaves', '2');
    turbulence.setAttribute('seed', '8');
    turbulence.setAttribute('result', 'noise');

    const colorMatrix = document.createElementNS('http://www.w3.org/2000/svg', 'feColorMatrix');
    colorMatrix.setAttribute('type', 'matrix');
    colorMatrix.setAttribute(
      'values',
      '0 0 0 0 0.45  0 0 0 0 0.32  0 0 0 0 0.18  0 0 0 0.08 0',
    );
    colorMatrix.setAttribute('in', 'noise');
    colorMatrix.setAttribute('result', 'grain');

    const blend = document.createElementNS('http://www.w3.org/2000/svg', 'feBlend');
    blend.setAttribute('mode', 'multiply');
    blend.setAttribute('in', 'SourceGraphic');
    blend.setAttribute('in2', 'grain');

    woodGrain.append(turbulence, colorMatrix, blend);
    defs.appendChild(woodGrain);

    const glow = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    glow.setAttribute('id', 'active-glow');
    glow.setAttribute('x', '-50%');
    glow.setAttribute('y', '-50%');
    glow.setAttribute('width', '200%');
    glow.setAttribute('height', '200%');

    const blur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur');
    blur.setAttribute('stdDeviation', '4');
    blur.setAttribute('result', 'blur');

    const merge = document.createElementNS('http://www.w3.org/2000/svg', 'feMerge');
    const mergeNode1 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    mergeNode1.setAttribute('in', 'blur');
    const mergeNode2 = document.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode');
    mergeNode2.setAttribute('in', 'SourceGraphic');
    merge.append(mergeNode1, mergeNode2);
    glow.append(blur, merge);
    defs.appendChild(glow);

    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'table-gradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '100%');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#c9a56a');

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '45%');
    stop2.setAttribute('stop-color', '#a67c3d');

    const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.setAttribute('stop-color', '#8b5e2a');

    gradient.append(stop1, stop2, stop3);
    defs.appendChild(gradient);

    return defs;
  }

  private createTableSurface(): SVGGElement {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'table-surface');

    const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    shadow.setAttribute('cx', String(TABLE_GEOMETRY.cx));
    shadow.setAttribute('cy', String(TABLE_GEOMETRY.cy + 8));
    shadow.setAttribute('rx', String(TABLE_GEOMETRY.rx + 6));
    shadow.setAttribute('ry', String(TABLE_GEOMETRY.ry + 6));
    shadow.setAttribute('class', 'table-shadow');

    const rim = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    rim.setAttribute('cx', String(TABLE_GEOMETRY.cx));
    rim.setAttribute('cy', String(TABLE_GEOMETRY.cy));
    rim.setAttribute('rx', String(TABLE_GEOMETRY.rx + 14));
    rim.setAttribute('ry', String(TABLE_GEOMETRY.ry + 14));
    rim.setAttribute('class', 'table-rim');

    const surface = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    surface.setAttribute('cx', String(TABLE_GEOMETRY.cx));
    surface.setAttribute('cy', String(TABLE_GEOMETRY.cy));
    surface.setAttribute('rx', String(TABLE_GEOMETRY.rx));
    surface.setAttribute('ry', String(TABLE_GEOMETRY.ry));
    surface.setAttribute('fill', 'url(#table-gradient)');
    surface.setAttribute('filter', 'url(#wood-grain)');
    surface.setAttribute('class', 'table-top');

    const inner = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    inner.setAttribute('cx', String(TABLE_GEOMETRY.cx));
    inner.setAttribute('cy', String(TABLE_GEOMETRY.cy));
    inner.setAttribute('rx', String(TABLE_GEOMETRY.pathRx));
    inner.setAttribute('ry', String(TABLE_GEOMETRY.pathRy));
    inner.setAttribute('class', 'table-inner-ring');

    group.append(shadow, rim, surface, inner);
    return group;
  }

  private createPathLayer(paths: string[]): SVGGElement {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'path-layer');

    paths.forEach((d, index) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('class', 'discussion-path');
      if (index === paths.length - 1) {
        path.classList.add('discussion-path-latest');
      } else {
        path.classList.add('discussion-path-settled');
      }
      path.setAttribute('data-segment', String(index));
      group.appendChild(path);
    });

    return group;
  }

  private createSeatLayer(
    seats: Seat[],
    positions: ReturnType<typeof computeSeatPositions>,
    mode: AppMode,
    speakerCounts: Map<number, number>,
    latestSpeaker: number | null,
  ): SVGGElement {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'seat-layer');

    for (const position of positions) {
      const seat = seats[position.index];
      group.appendChild(
        this.createSeat(seat, position, mode, speakerCounts, latestSpeaker),
      );
    }

    return group;
  }

  private createSeat(
    seat: Seat,
    position: { x: number; y: number },
    mode: AppMode,
    speakerCounts: Map<number, number>,
    latestSpeaker: number | null,
  ): SVGGElement {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'seat');
    group.setAttribute('data-index', String(seat.index));
    group.setAttribute('transform', `translate(${position.x}, ${position.y})`);

    if (latestSpeaker === seat.index) {
      group.classList.add('seat-active');
    }
    if (seat.isTeacher) {
      group.classList.add('seat-teacher');
    }

    const hitArea = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    hitArea.setAttribute('r', '34');
    hitArea.setAttribute('class', 'seat-hit');
    hitArea.setAttribute('tabindex', '0');
    hitArea.setAttribute('role', 'button');
    hitArea.setAttribute('aria-label', getSeatLabel(seat));

    const plate = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    plate.setAttribute('r', '28');
    plate.setAttribute('class', 'seat-plate');

    const foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    foreignObject.setAttribute('x', '-40');
    foreignObject.setAttribute('y', '-12');
    foreignObject.setAttribute('width', '80');
    foreignObject.setAttribute('height', '24');

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'seat-name-input';
    nameInput.value = seat.name;
    nameInput.placeholder = `Seat ${seat.index + 1}`;
    nameInput.disabled = mode === 'discuss';
    nameInput.setAttribute('aria-label', `Name for seat ${seat.index + 1}`);
    nameInput.addEventListener('click', (event) => event.stopPropagation());
    nameInput.addEventListener('keydown', (event) => event.stopPropagation());
    nameInput.addEventListener('input', () => {
      this.onSeatNameChange(seat.index, nameInput.value);
    });

    foreignObject.appendChild(nameInput);

    if (seat.isTeacher) {
      const teacherBadge = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      teacherBadge.setAttribute('class', 'teacher-badge');
      teacherBadge.setAttribute('x', '0');
      teacherBadge.setAttribute('y', '-36');
      teacherBadge.setAttribute('text-anchor', 'middle');
      teacherBadge.textContent = 'Teacher';
      group.appendChild(teacherBadge);
    }

    const speakCount = speakerCounts.get(seat.index) ?? 0;
    if (speakCount > 0) {
      const badgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      badgeGroup.setAttribute('class', 'speak-badge');
      badgeGroup.setAttribute('transform', 'translate(20, -20)');

      const badgeCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      badgeCircle.setAttribute('r', '11');
      badgeCircle.setAttribute('class', 'speak-badge-bg');

      const badgeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      badgeText.setAttribute('class', 'speak-badge-text');
      badgeText.setAttribute('text-anchor', 'middle');
      badgeText.setAttribute('dominant-baseline', 'central');
      badgeText.setAttribute('y', '1');
      badgeText.textContent = String(speakCount);

      badgeGroup.append(badgeCircle, badgeText);
      group.appendChild(badgeGroup);
    }

    const handleActivate = () => {
      if (mode === 'discuss') {
        this.onSeatClick(seat.index);
      }
    };

    hitArea.addEventListener('click', handleActivate);
    hitArea.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleActivate();
      }
    });

    hitArea.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      if (mode === 'setup') {
        this.onSeatTeacherToggle(seat.index);
      }
    });

    group.append(hitArea, plate, foreignObject);
    return group;
  }
}
