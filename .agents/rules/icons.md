---
name: lucide-icons-only
description: Mandatory rule requiring all icons across the project to be imported exclusively from lucide-react.
trigger: always_on
---

# Mandatory Rule: Lucide Icons Exclusively

1. **All UI icons must come from `lucide-react`.**
2. No other icon library may be added or imported (`react-icons`, `@heroicons`, `@fortawesome`, `feather-icons`, etc.).
3. Standard UI action buttons, indicators, and navigation must use Lucide components, never ad-hoc inline SVGs.
4. When adding or modifying any feature, check that all icons import from `'lucide-react'`.
