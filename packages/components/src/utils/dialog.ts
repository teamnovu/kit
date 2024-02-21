import { ref, unref, type Ref } from 'vue';
import { selectFocussableElement } from './selectors';

export function useDialogFocus(
  dialogRef: Ref<HTMLElement | undefined>,
) {
  const focusStash = ref<HTMLElement>();

  const stashFocus = () => {
    focusStash.value = (document.activeElement ?? undefined) as
      | HTMLElement
      | undefined;
  };

  const findSelectionTarget = () => {
    const dialog = unref(dialogRef);
    if (!dialog) return null;

    const elementWithAutofocus = dialog.querySelector('[autofocus]');
    if (elementWithAutofocus) return elementWithAutofocus as HTMLElement;

    const selectableDescendants = dialog.querySelectorAll(
      selectFocussableElement,
    );
    const firstSelectableElement = Array.from(selectableDescendants).find(
      (element) => element instanceof HTMLElement,
    ) as HTMLElement | undefined;

    return firstSelectableElement as HTMLElement;
  };

  const applyFocus = () => {
    const focusElement = unref(focusStash);
    if (!focusElement) return;

    focusElement.focus();
  };

  const focusTrap = (event: FocusEvent) => {
    const dialog = unref(dialogRef);
    if (!dialog) return;

    if (!dialog.contains(event.target as Element | null)) {
      event.stopPropagation();
      findSelectionTarget()?.focus();
    }
  };

  const moveFocusInside = () => {
    // Find first selectable element and focus it.
    // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/dialog_role#required_javascript_features
    const selectionTarget = findSelectionTarget();
    if (selectionTarget) {
      selectionTarget.focus();
    } else {
      console.warn(
        'Dialog without focussable element detected. Please ensure that your '
        + 'dialog contains at least one focussable element! This may be a close button.',
      );
    }
    document.addEventListener('focus', focusTrap, true);
  };

  const restoreFocus = () => {
    const dialog = unref(dialogRef);
    if (!dialog) return;

    applyFocus();
    document.removeEventListener('focus', focusTrap);
  };

  return {
    stashFocus,
    restoreFocus,
    moveFocusInside,
  };
}
