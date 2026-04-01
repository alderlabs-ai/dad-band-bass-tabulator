import { SLOTS_PER_BAR } from '../src/utils/tabLayout.ts';
import { getNoteRenderStyle } from '../src/utils/tabPreviewTimeline.ts';

const stringNames = ['G', 'D'];

const fillSlots = (slots: (string | undefined)[]) =>
  Array.from({ length: SLOTS_PER_BAR }, (_, index) => slots[index] ?? '-');

const makeBar = (cells: Record<string, (string | undefined)[]>) => ({
  cells: Object.fromEntries(
    stringNames.map((stringName) => [
      stringName,
      fillSlots(cells[stringName] ?? []),
    ]),
  ),
});

const runTest = (name: string, fn: () => void) => {
  try {
    fn();
    console.log(`[ok] ${name}`);
  } catch (error) {
    console.error(`[fail] ${name}`);
    throw error;
  }
};

runTest('consecutive slots are short notes', () => {
  const rowBars = [makeBar({ G: Array.from({ length: 8 }, () => '7') })];
  const result = getNoteRenderStyle({
    rowBars,
    stringName: 'G',
    barIndex: 0,
    slotIndex: 0,
  });

  if (result !== 'short') {
    throw new Error(`Expected short got ${result}`);
  }
});

runTest('note followed by one empty is beat', () => {
  const rowBars = [makeBar({ G: ['7', undefined, '9'] })];
  const result = getNoteRenderStyle({
    rowBars,
    stringName: 'G',
    barIndex: 0,
    slotIndex: 0,
  });

  if (result !== 'beat') {
    throw new Error(`Expected beat got ${result}`);
  }
});

runTest('note with three empty slots becomes hold4', () => {
  const rowBars = [makeBar({ G: ['7', undefined, undefined, undefined, '10'] })];
  const result = getNoteRenderStyle({
    rowBars,
    stringName: 'G',
    barIndex: 0,
    slotIndex: 0,
  });

  if (result !== 'hold4') {
    throw new Error(`Expected hold4 got ${result}`);
  }
});

console.log('note render style tests passed');
