import '../styles/main.css';
import { ExportError, downloadSession, importSessionFromFile } from './export';
import {
  createInitialState,
  getSeatLabel,
  recordSpeaker,
  resetDiscussion,
  restoreState,
  setMode,
  setNotes,
  toggleTeacher,
  undoLastSpeaker,
  updateSeatName,
} from './session';
import { TableView } from './table';
import type { SessionState } from './types';

let state: SessionState = createInitialState();

const tableContainer = document.getElementById('table-container')!;
const btnMode = document.getElementById('btn-mode') as HTMLButtonElement;
const btnUndo = document.getElementById('btn-undo') as HTMLButtonElement;
const btnReset = document.getElementById('btn-reset') as HTMLButtonElement;
const btnExport = document.getElementById('btn-export') as HTMLButtonElement;
const inputImport = document.getElementById('input-import') as HTMLInputElement;
const notesInput = document.getElementById('notes') as HTMLTextAreaElement;
const speakOrderList = document.getElementById('speak-order-list')!;
const modeHint = document.getElementById('mode-hint')!;

const tableView = new TableView(tableContainer, {
  onSeatClick: (index) => {
    state = recordSpeaker(state, index);
    render();
  },
  onSeatNameChange: (index, name) => {
    state = updateSeatName(state, index, name);
  },
  onSeatTeacherToggle: (index) => {
    state = toggleTeacher(state, index);
    render();
  },
});

function render(): void {
  tableView.render(state);
  renderToolbar();
  renderSpeakOrder();
  notesInput.value = state.notes;
}

function renderToolbar(): void {
  const isDiscuss = state.mode === 'discuss';

  btnMode.textContent = isDiscuss ? 'Edit Names' : 'Start Discussion';
  btnMode.classList.toggle('btn-primary', !isDiscuss);
  btnMode.classList.toggle('btn-secondary', isDiscuss);

  btnUndo.disabled = !isDiscuss || state.speakOrder.length === 0;
  btnReset.disabled = !isDiscuss || state.speakOrder.length === 0;

  modeHint.textContent = isDiscuss
    ? 'Click a name each time that person speaks. Use Undo to remove the last turn.'
    : 'Click a seat to enter a name. Right-click to mark as Teacher.';
}

function renderSpeakOrder(): void {
  speakOrderList.innerHTML = '';

  if (state.speakOrder.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'speak-order-empty';
    empty.textContent = 'No speakers yet';
    speakOrderList.appendChild(empty);
    return;
  }

  state.speakOrder.forEach((seatIndex, turnIndex) => {
    const seat = state.seats[seatIndex];
    const item = document.createElement('li');
    item.className = 'speak-order-item';
    if (turnIndex === state.speakOrder.length - 1) {
      item.classList.add('speak-order-latest');
    }

    const number = document.createElement('span');
    number.className = 'speak-order-number';
    number.textContent = String(turnIndex + 1);

    const name = document.createElement('span');
    name.className = 'speak-order-name';
    name.textContent = getSeatLabel(seat);

    item.append(number, name);
    speakOrderList.appendChild(item);
  });
}

btnMode.addEventListener('click', () => {
  state = setMode(state, state.mode === 'setup' ? 'discuss' : 'setup');
  render();
});

btnUndo.addEventListener('click', () => {
  state = undoLastSpeaker(state);
  render();
});

btnReset.addEventListener('click', () => {
  if (state.speakOrder.length === 0) return;
  const confirmed = window.confirm('Clear the discussion path and speak order?');
  if (!confirmed) return;
  state = resetDiscussion(state);
  render();
});

btnExport.addEventListener('click', () => {
  downloadSession(state);
});

inputImport.addEventListener('change', async () => {
  const file = inputImport.files?.[0];
  if (!file) return;

  try {
    const imported = await importSessionFromFile(file);
    state = restoreState({
      title: imported.title,
      createdAt: imported.createdAt,
      seats: imported.seats,
      speakOrder: imported.speakOrder,
      notes: imported.notes,
      mode: imported.speakOrder.length > 0 ? 'discuss' : 'setup',
    });
    render();
  } catch (error) {
    const message =
      error instanceof ExportError ? error.message : 'Failed to import session.';
    window.alert(message);
  } finally {
    inputImport.value = '';
  }
});

notesInput.addEventListener('input', () => {
  state = setNotes(state, notesInput.value);
});

render();
