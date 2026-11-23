// src/hooks/useFocusTrap.js
import { useEffect, useRef } from 'react';

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input[type="text"]:not([disabled])',
  'input[type="radio"]:not([disabled])',
  'input[type="checkbox"]:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
];

export const useFocusTrap = (isActive = true) => {
  const containerRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(FOCUSABLE_ELEMENTS.join(','));
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Focus the first focusable element
    if (firstFocusable) {
      firstFocusable.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }

      if (e.key === 'Escape') {
        // Dispatch custom event for escape key
        const escapeEvent = new CustomEvent('modal-escape', { bubbles: true });
        container.dispatchEvent(escapeEvent);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus to the previously focused element
      if (previousActiveElement.current && previousActiveElement.current.focus) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
};