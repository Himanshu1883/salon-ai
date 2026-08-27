export const INDIAN_TIME_MENU_ATTR = "data-indian-time-menu";

export function isIndianTimeMenuTarget(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    Boolean(target.closest(`[${INDIAN_TIME_MENU_ATTR}]`))
  );
}

export function preventDialogDismissForIndianTimeMenu(event: {
  preventDefault: () => void;
  detail?: { originalEvent?: Event };
}) {
  const pointerTarget = event.detail?.originalEvent?.target ?? null;
  if (isIndianTimeMenuTarget(pointerTarget)) {
    event.preventDefault();
  }
}

/** Trap wheel events inside a scroll container so parent modals don't scroll. */
export function handleScrollContainerWheel(
  event: React.WheelEvent<HTMLDivElement>
) {
  event.stopPropagation();

  const node = event.currentTarget;
  if (node.scrollHeight <= node.clientHeight) return;

  const { scrollTop, scrollHeight, clientHeight } = node;
  const scrollingDown = event.deltaY > 0;
  const scrollingUp = event.deltaY < 0;
  const atTop = scrollTop <= 0;
  const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

  if ((scrollingUp && !atTop) || (scrollingDown && !atBottom)) {
    event.preventDefault();
  }
}
