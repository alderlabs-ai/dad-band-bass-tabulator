import { createId } from './ids';
import { parseTab, renderTab } from './tabLayout';
import { Song, SongChart, SongRow, TabRowAnnotation } from '../types/models';

const defaultBarsPerRow = 4;
const maxBarsPerRow = 8;

const cloneAnnotation = (annotation?: Partial<TabRowAnnotation>): TabRowAnnotation => ({
  label: annotation?.label ?? '',
  beforeText: annotation?.beforeText ?? '',
  afterText: annotation?.afterText ?? '',
});

export const normalizeRowBarCounts = (
  totalBars: number,
  rowBarCounts?: number[],
): number[] => {
  if (totalBars <= 0) {
    return [];
  }

  const counts: number[] = [];
  let consumedBars = 0;

  (rowBarCounts ?? []).forEach((count) => {
    if (consumedBars >= totalBars) {
      return;
    }

    const safeCount = Math.max(1, Math.min(maxBarsPerRow, Math.floor(count || 0)));
    const nextCount = Math.min(safeCount, totalBars - consumedBars);
    counts.push(nextCount);
    consumedBars += nextCount;
  });

  while (consumedBars < totalBars) {
    const nextCount = Math.min(defaultBarsPerRow, totalBars - consumedBars);
    counts.push(nextCount);
    consumedBars += nextCount;
  }

  return counts;
};

export const flattenSongRowsToChart = (song: Pick<Song, 'stringNames' | 'rows'>): SongChart => {
  const bars = song.rows.flatMap((row) => row.bars);

  return {
    id: 'chart',
    tab: renderTab(song.stringNames, bars),
    rowAnnotations: song.rows.map((row) =>
      cloneAnnotation({
        label: row.label,
        beforeText: row.beforeText,
        afterText: row.afterText,
      }),
    ),
    rowBarCounts: song.rows.map((row) => row.bars.length),
  };
};

export const mergeChartIntoSongRows = (
  sourceSong: Pick<Song, 'stringNames' | 'rows'>,
  editedChart: Pick<SongChart, 'tab' | 'rowAnnotations' | 'rowBarCounts'>,
): Pick<Song, 'stringNames' | 'rows'> => {
  const parsed = parseTab(editedChart.tab);
  const stringNames =
    parsed.stringNames.length > 0 ? parsed.stringNames : sourceSong.stringNames;
  const rowBarCounts = normalizeRowBarCounts(parsed.bars.length, editedChart.rowBarCounts);
  const rowAnnotations = editedChart.rowAnnotations ?? [];

  let barCursor = 0;

  const rows: SongRow[] = rowBarCounts.map((barCount, rowIndex) => {
    const sourceRow = sourceSong.rows[rowIndex];
    const annotation = cloneAnnotation(rowAnnotations[rowIndex]);
    const nextRowBars = parsed.bars.slice(barCursor, barCursor + barCount);

    barCursor += barCount;

    return {
      id: sourceRow?.id ?? createId('row'),
      label: annotation.label.trim(),
      beforeText: annotation.beforeText,
      afterText: annotation.afterText,
      bars: nextRowBars,
    };
  });

  return {
    stringNames,
    rows,
  };
};
