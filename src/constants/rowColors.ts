export const ROW_COLOR_KEYS = [
  'mint',
  'sky',
  'blue',
  'lavender',
  'rose',
  'peach',
  'lemon',
  'sage',
] as const;

export type RowColorKey = typeof ROW_COLOR_KEYS[number];

export interface RowColorOption {
  key: RowColorKey;
  swatch: string;
  border: string;
  lightSurface: string;
  darkSurface: string;
  lightStripe: string;
  darkStripe: string;
}

export const ROW_COLOR_OPTIONS: RowColorOption[] = [
  {
    key: 'mint',
    swatch: '#c7f0e6',
    border: '#76cdb5',
    lightSurface: '#f2fdf8',
    darkSurface: '#0f1f1c',
    lightStripe: '#55bfa5',
    darkStripe: '#7fe2ca',
  },
  {
    key: 'sky',
    swatch: '#cfeefe',
    border: '#72bfdf',
    lightSurface: '#f4fbff',
    darkSurface: '#0d1d25',
    lightStripe: '#4aa7cf',
    darkStripe: '#86d4f1',
  },
  {
    key: 'blue',
    swatch: '#d9e6ff',
    border: '#89a9e8',
    lightSurface: '#f5f8ff',
    darkSurface: '#111b2e',
    lightStripe: '#6d8fda',
    darkStripe: '#a7c0ff',
  },
  {
    key: 'lavender',
    swatch: '#e8defd',
    border: '#ad94e8',
    lightSurface: '#faf7ff',
    darkSurface: '#1b1630',
    lightStripe: '#9677db',
    darkStripe: '#c4afff',
  },
  {
    key: 'rose',
    swatch: '#ffdbe7',
    border: '#e79ab3',
    lightSurface: '#fff6f9',
    darkSurface: '#2a1620',
    lightStripe: '#d97f9f',
    darkStripe: '#ffb6cf',
  },
  {
    key: 'peach',
    swatch: '#ffe1cf',
    border: '#e8ab86',
    lightSurface: '#fff8f4',
    darkSurface: '#2a1b15',
    lightStripe: '#db9367',
    darkStripe: '#ffc29d',
  },
  {
    key: 'lemon',
    swatch: '#fff1bf',
    border: '#dfbf66',
    lightSurface: '#fffdf2',
    darkSurface: '#272210',
    lightStripe: '#cda93d',
    darkStripe: '#ffe07a',
  },
  {
    key: 'sage',
    swatch: '#dce8cf',
    border: '#a3be82',
    lightSurface: '#f8fbf4',
    darkSurface: '#182015',
    lightStripe: '#89a866',
    darkStripe: '#bfdc97',
  },
];

export const DEFAULT_ROW_COLOR_SURFACE = '#fffdf8';
export const DEFAULT_ROW_COLOR_SURFACE_DARK = '#111827';

export const getRowColorOption = (rowColor?: string | null): RowColorOption | null =>
  ROW_COLOR_OPTIONS.find((option) => option.key === rowColor) ?? null;

export const isRowColorKey = (value: unknown): value is RowColorKey =>
  typeof value === 'string' && ROW_COLOR_KEYS.includes(value as RowColorKey);
