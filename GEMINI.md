# Project Guidelines & Rules: EasyLearn

## Mandatory Icon Policy

### Use Lucide Icons ONLY Across the Entire Project
**All icons throughout EasyLearn must strictly and exclusively be imported from `lucide-react`.**

### Directives:
- **Sole Source of Icons**: Every icon in any component, page, layout, modal, player, or studio must be imported directly from `'lucide-react'`.
- **Prohibited Libraries**: Under no circumstances should `react-icons`, `@heroicons`, `font-awesome`, `boxicons`, or any other icon package be installed or used.
- **No Inline SVG Icons**: UI icons must never be inline `<svg>` blocks; always utilize the matching `lucide-react` component.
- **Enforcement**: Any code addition or refactoring must abide by this constraint.

```tsx
// Correct:
import { Play, Pause, ChevronRight, Settings, Radio } from 'lucide-react';

// Forbidden:
import { FaPlay } from 'react-icons/fa'; // NOT ALLOWED
import { PlayIcon } from '@heroicons/react/24/solid'; // NOT ALLOWED
```
