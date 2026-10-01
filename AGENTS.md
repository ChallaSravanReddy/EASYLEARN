# Project Rules & Guidelines: EasyLearn

## 1. Icon Library Rule (MANDATORY & ENFORCED)

### Rule: Use Lucide Icons ONLY
**Across the entire EasyLearn codebase, all UI icons must strictly and exclusively come from `lucide-react`.**

#### Constraints:
1. **Exclusive Import**:
   - Only import icons from `'lucide-react'`.
   - Example:
     ```tsx
     import { Play, Pause, Search, Settings, Volume2, ArrowRight } from 'lucide-react';
     ```
2. **Forbidden Libraries**:
   - **DO NOT** install, import, or use any other icon libraries, including but not limited to:
     - `react-icons` (or any sub-package like `react-icons/fa`, `react-icons/bi`, `react-icons/ai`, etc.)
     - `@heroicons/react`
     - `@fortawesome/*` or `font-awesome`
     - `feather-icons`
     - `boxicons`
     - `material-ui/icons` / `@mui/icons-material`
     - `tabler-icons-react`
3. **No Inline SVGs for Standard Icons**:
   - Do NOT handcode raw `<svg>` elements for UI buttons, tabs, chevrons, navigation items, or actions.
   - Always find and use the official equivalent from `lucide-react`.
   - *Exception*: Custom data visualizations, canvas graphics, and progress rings (e.g. SVG circular progress bars).
4. **Consistency**:
   - Maintain uniform sizing with Tailwind (`w-3.5 h-3.5`, `w-4 h-4`, `w-5 h-5`, etc.).
   - Use standard stroke widths and colors via Tailwind CSS classes (`text-slate-400 hover:text-white`).

---

## 2. Technology Stack & Coding Standards

1. **Framework & Runtime**: React 18 with Vite and TypeScript / Modern JavaScript (ESNext).
2. **Styling**: Tailwind CSS with custom CSS variables for themes (Light & Dark modes).
3. **Audio-Telemetry Synchronization**: Scrim player and recording studio must use high-precision clock mechanisms (`requestAnimationFrame` / `audio.currentTime`).
4. **State Management**: React hooks (`useState`, `useRef`, `useCallback`, `useMemo`) and React Context for Auth and Theme.
5. **Quality Assurance**: Always run `npx tsc --noEmit` and `npm run build` after code modifications to guarantee production-ready builds.
