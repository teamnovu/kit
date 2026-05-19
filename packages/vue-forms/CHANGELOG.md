# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-05-19

### Added

- `setInitialData` now accepts an options argument:
  - `{ replace: true }` replaces the subtree wholesale instead of deep-merging with the external `initialData`.
  - `{ scope: 'subtree' }` anchors the new baseline only for the targeted path and its descendants, so ancestors keep reading the external `initialData` and stay dirty when the override changes the tree shape (e.g. a new array item). `scope: 'tree'` (default) preserves the previous global-baseline behavior.
- `useFieldArray` now exposes `pushPristine(item)` — like `push`, but anchors the new index's subtree as its own baseline so the new item's subfields start non-dirty while the array field itself stays dirty.

### Changed

- Initial-data resolution moved from a per-field local baseline into a form-level override layer (`useInitialDataOverride`). Overrides set via `setInitialData` on a parent path now propagate down to subfields, deep-merging with the external `initialData` by default.
- `form.reset()` rebuilds `data` from the merged tree (external `initialData` + active overrides), so prior `setInitialData` calls survive a reset and act as the new programmatic baseline.
- Reassigning the external `initialData` ref passed to `useForm` clears all active overrides.
- Calling `setInitialData` on a path drops any existing override on that path or below before applying the new one.

## [0.2.18] - 2025-03-03

### Fixed

- Correctly pass `validationState` to subForm creation instead of `formOptions`
- Fix build error through type on `FormFieldWrapper`

## [0.2.17] - 2025-01-22

### Fixed

- `keepValuesOnUnmount` was `false` instead of `true` by default

## [0.1.27] - 2025-01-22

### Fixed

- `keepValuesOnUnmount` was `false` instead of `true` by default
