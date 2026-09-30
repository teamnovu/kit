# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.1] - 2026-09-30

### Added

- `form.canSubmit`: `true` if `submitHandler` would let the submission through, i.e. like `isValid` but ignoring server errors. Use it e.g. to disable the submit button.
- `isValidResult` is exported to check the result of `validateForm`.

### Changed

- `isValid` now takes `serverErrors` into account, so it is `false` whenever `form.errors` contains errors. Use `canSubmit` where server errors should be ignored, e.g. to disable the submit button.

## [0.4.0] - 2026-09-29

### Added

- `useForm` accepts `serverErrors`: they are displayed in `form.errors` and the field errors, but are not part of the validation (`validateForm`, `isValid`, `submitHandler`), so errors returned by the server no longer prevent the next submission. `errors` keeps blocking the submission as before.
- `validateForm` now returns the parsed `data`.

### Changed

- **Breaking:** `submitHandler` now receives the parsed schema output (and `data` returned by a valid `validateFn`), deep-merged over the form data so that keys unknown to the schema are kept. Previously it always received the raw form data.
  - Schemas using `transform`, `coerce`, `default` or `preprocess` now deliver the converted values to the handler. Remove manual conversions in the handler that compensated for this.
  - The handler receives a copy instead of the reactive form data, so mutating it no longer changes the form.
  - Arrays are merged by index: if a transform shortens an array, the surplus raw items remain.
  - Forms without a schema and without a `validateFn` returning `data` are unaffected.
- **Breaking:** `form.errors` is now read-only. Assigning `form.errors.value` has no effect; use `field.setErrors` instead. In-place mutations of `form.errors.value` are lost while `serverErrors` are present.

### Fixed

- A subform's `submitHandler` receives only its subtree of the parsed data.

## [0.3.1] - 2026-07-08

### Changed

- `FormFieldWrapper` now applies `componentProps` and `$attrs` after its built-in bindings (`model-value`, `errors`, `on-blur`, `on-focus`, `name`), so consumer-provided props and attributes take precedence over the wrapper's defaults.

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
