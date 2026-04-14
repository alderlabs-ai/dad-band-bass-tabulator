export interface LandingTabSnippetBarSeed {
  note: string | null;
  beatCount?: number;
  cells: Record<string, string[]>;
}

export interface LandingTabSnippetSeed {
  id: string;
  label: string;
  beforeText: string;
  afterText: string;
  bars: LandingTabSnippetBarSeed[];
}

export const LANDING_TAB_SNIPPET_SEEDS: LandingTabSnippetSeed[] = [
  {
    id: 'row-7evcsvj5',
    label: '',
    beforeText: 'Intro, Verse * 3 (softly)',
    afterText: '',
    bars: [
      {
        note: null,
        cells: {
          A: ['7-', '--', '.-', '7-', '6-', '--', '.-', '6-'],
          D: ['--', '--', '--', '--', '--', '--', '--', '--'],
          E: ['--', '--', '--', '--', '--', '--', '--', '--'],
          G: ['--', '--', '--', '--', '--', '--', '--', '--'],
        },
      },
      {
        note: null,
        cells: {
          A: ['4-', '--', '.-', '4-', '--', '--', '--', '--'],
          D: ['--', '--', '--', '--', '--', '--', '--', '--'],
          E: ['--', '--', '--', '--', '5-', '--', '.-', '5-'],
          G: ['--', '--', '--', '--', '--', '--', '--', '--'],
        },
      },
    ],
  },
  {
    id: 'row-landing-alt-1',
    label: 'Intro',
    beforeText: 'Twice - 8 bars',
    afterText: '',
    bars: [
      {
        note: null,
        cells: {
          A: ['7-', '--', '.-', '7-', '--', '--', '--', '5-'],
          D: ['--', '--', '--', '--', '5-', '7-', '--', '--'],
          E: ['--', '--', '--', '--', '--', '--', '--', '--'],
          G: ['--', '--', '--', '--', '--', '--', '--', '--'],
        },
      },
      {
        note: null,
        cells: {
          A: ['7-', '--', '.-', '7-', '--', '--', '--', '5-'],
          D: ['--', '--', '--', '--', '5-', '7-', '--', '--'],
          E: ['--', '--', '--', '--', '--', '--', '--', '--'],
          G: ['--', '--', '--', '--', '--', '--', '--', '--'],
        },
      },
    ],
  },
  {
    id: 'row-landing-alt-2',
    label: '',
    beforeText: 'Bridge (dig in)',
    afterText: '',
    bars: [
      {
        note: null,
        cells: {
          A: ['--', '--', '--', '--', '--', '--', '--', '--'],
          D: ['--', '--', '--', '--', '--', '--', '--', '--'],
          E: ['3-', '--', '.-', '3-', '5-', '--', '.-', '5-'],
          G: ['--', '--', '--', '--', '--', '--', '--', '--'],
        },
      },
      {
        note: null,
        cells: {
          A: ['7-', '--', '.-', '7-', '--', '--', '--', '--'],
          D: ['--', '--', '--', '--', '--', '--', '--', '--'],
          E: ['--', '--', '--', '--', '1-', '--', '.-', '1-'],
          G: ['--', '--', '--', '--', '--', '--', '--', '--'],
        },
      },
    ],
  },
];
