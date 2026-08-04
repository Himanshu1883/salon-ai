import type { CSSProperties } from "react";

export function resolvePortalContainer(anchor: HTMLElement | null): HTMLElement {
  if (!anchor) return document.body;
  return anchor.closest('[role="dialog"]') ?? document.body;
}

type AnchoredDropdownStyleOptions = {
  gap?: number;
  minWidth?: number;
};

export function computeAnchoredDropdownStyle(
  anchor: HTMLElement,
  portalContainer: HTMLElement,
  options: AnchoredDropdownStyleOptions = {}
): CSSProperties {
  const { gap = 8, minWidth = 0 } = options;
  const rect = anchor.getBoundingClientRect();
  const width = Math.max(rect.width, minWidth);

  if (portalContainer === document.body) {
    return {
      position: "fixed",
      top: rect.bottom + gap,
      left: rect.left,
      width,
      zIndex: 9999,
    };
  }

  // Dialog uses transform for centering, which makes `fixed` relative to the
  // dialog instead of the viewport — use absolute coords within the portal.
  const containerRect = portalContainer.getBoundingClientRect();
  return {
    position: "absolute",
    top: rect.bottom - containerRect.top + gap,
    left: rect.left - containerRect.left,
    width,
    zIndex: 9999,
  };
}
