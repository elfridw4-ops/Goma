import { useEffect, useRef } from 'react';

/**
 * Intercepte Escape et le bouton Retour du navigateur quand un modal est ouvert,
 * applique l'attribut `inert` sur le reste de l'application (#app-shell)
 * et restaure le focus précédent à la fermeture.
 */
export function useModalAccessibility(
  isOpen: boolean,
  onClose: () => void,
  initialFocusRef?: { current: HTMLElement | null },
) {
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const pushedHistoryRef = useRef(false);
  const openedPathRef = useRef('');
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const shell = document.getElementById('app-shell');

    if (!isOpen) {
      if (shell) {
        shell.removeAttribute('inert');
      }
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    openedPathRef.current = window.location.pathname + window.location.search;
    if (shell) {
      shell.setAttribute('inert', '');
    }

    const currentUrl = window.location.href;
    window.history.pushState({ gomaModal: true }, '', currentUrl);
    pushedHistoryRef.current = true;

    const focusTimer = window.setTimeout(() => {
      initialFocusRef?.current?.focus?.();
    }, 10);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
      }
    };

    const handlePopState = () => {
      pushedHistoryRef.current = false;
      onCloseRef.current();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
      if (shell) {
        shell.removeAttribute('inert');
      }
      const currentFullPath = window.location.pathname + window.location.search;
      if (
        pushedHistoryRef.current &&
        window.history.state?.gomaModal === true &&
        currentFullPath === openedPathRef.current
      ) {
        pushedHistoryRef.current = false;
        window.history.back();
      }
      if (currentFullPath === openedPathRef.current) {
        previousFocusRef.current?.focus?.();
      }
    };
  }, [isOpen, initialFocusRef]);
}

/**
 * Fait défiler vers le premier champ en erreur et lui donne le focus programmatique.
 */
export function focusFirstInvalidField(
  orderedFieldIds: Array<{ id: string; hasError: boolean }>,
) {
  const firstInvalid = orderedFieldIds.find((item) => item.hasError);
  if (!firstInvalid) return;
  const el = document.getElementById(firstInvalid.id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => el.focus({ preventScroll: true }), 120);
  }
}
