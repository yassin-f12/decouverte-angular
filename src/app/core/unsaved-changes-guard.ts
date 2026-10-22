import { CanDeactivateFn } from '@angular/router';

interface HasUnsavedChanges {
  dirty(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (component.dirty()) {
    return confirm(
      'Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter cette page ?',
    );
  }

  return true;
};
