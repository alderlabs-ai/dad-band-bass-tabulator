# BassTab AI Engine Contract

This file defines BOTH:
- how the AI must behave
- how timing and rendering work

If any code contradicts this file, the code is WRONG.

---

# 1. AI OPERATING RULES

Before making ANY change:

- Read this file fully
- Follow it strictly
- Do NOT reinterpret rules
- Do NOT introduce new abstractions unless explicitly asked

CRITICAL:
- Passing tests is NOT success
- Typecheck passing is NOT success
- ONLY visible SVG output correctness = success

---

# 2. PURPOSE

This app is for LIVE bass playing.

Priority:
1. instant readability
2. correct timing
3. simplicity

This is NOT a full music notation engine.

---

# 3. GRID MODEL

- 4 beats per bar
- each beat divided into 2
- total = 8 slots per bar

Slots are the ONLY timing unit.

---

# 4. NOTE MODEL

- non-empty slot = NOTE ONSET
- empty slots = sustain
- duration = distance to next note

A note lasts from:
its slot → next note OR end of bar

---

# 5. SPAN (AUTHORITATIVE)

For a note at slot i:

emptyCount = number of empty slots after it  
span = 1 + emptyCount  

OR

span = nextNoteIndex - i  

If no next note:
span = endOfBar - i  

---

# 6. DOTTED NOTES (CRITICAL)

Dotted notes are REQUIRED.

We support ALL spans from 1 to 8.

| span | meaning |
|------|--------|
| 1 | quaver |
| 2 | crotchet |
| 3 | dotted crotchet |
| 4 | minim |
| 5 | extended |
| 6 | dotted minim |
| 7 | extended |
| 8 | semibreve |

IMPORTANT:
- odd spans MUST be preserved
- DO NOT round durations
- DO NOT collapse to nearest standard value

---

# 7. CORE INSIGHT

DO NOT think in note types.

THINK IN:
→ SLOT SPANS

Rendering is derived from span.

---

# 8. RENDERING MODEL

Rendering is PER NOTE.

NOT:
- per row
- per timeline

Each note decides its own rendering.

---

# 9. RENDER RULES

Minimum mapping:

| span | render |
|------|--------|
| 1 | stem + tail |
| 2 | stem only |
| 3 | medium hold |
| 4 | BOX ONLY |
| 5–8 | strong hold |

---

# 10. BOX RULE (CRITICAL)

For span >= 4:

- draw BOX around fret number
- NO stem
- NO tail

Box must:
- be larger than the text
- be clearly visible
- not be clipped
- not be hidden behind text

If box is not visible → WRONG

---

# 11. VISUAL INVARIANTS

- held notes MUST NOT have stems
- quavers MUST have tails
- crotchets MUST NOT have tails
- longer notes MUST look longer

If visuals look the same → WRONG

---

# 12. IMPLEMENTATION CONTRACT

Preferred approach:

getNoteSpan(slotIndex) => number  
getRenderStyle(span) => style  

Then:

- span == 1 → quaver
- span == 2 → beat
- span >= 3 → hold

Rendering MUST attach to the actual note being drawn.

---

# 13. FORBIDDEN

DO NOT:

- use row-level duration timeline (unless unavoidable)
- assign duration separate from rendered note
- ignore dotted spans
- optimise only for tests
- declare success without visual change

---

# 14. DEBUG REQUIREMENTS

Before completion, you MUST prove:

- correct span is computed
- correct render branch is used
- stem is NOT drawn for held notes
- box IS rendered
- output visibly changes

---

# 15. CANONICAL TEST CASES

Quavers:
[7][7][7][7][7][7][7][7]

Crotchets:
[7][-][7][-][7][-][7][-]

Dotted:
[7][-][-][9][-][-]

Minim:
[7][-][-][-][9][-][-][-]

Dotted minim:
[7][-][-][-][-][-][9][-]

Whole bar:
[7][-][-][-][-][-][-][-]

---

# FINAL RULE

If there is any conflict between:
- abstraction
- correctness
- visuals

CHOOSE:
→ visuals + correctness