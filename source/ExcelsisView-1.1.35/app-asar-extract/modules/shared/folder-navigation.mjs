// Bare arrow presses use the same guarded actions as the file buttons.
export function bindFolderNavigation({ previous, next, isBlocked = () => false }) {
  window.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key) || event.defaultPrevented ||
        event.ctrlKey || event.altKey || event.metaKey || event.shiftKey ||
        event.repeat || event.isComposing || isBlocked() || document.querySelector("dialog[open]")) return;
    const focused = document.activeElement;
    if ([event.target, focused].some(element => element?.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(element?.tagName))) return;
    const button = event.key === "ArrowLeft" ? previous : next;
    if (!button || button.disabled || button.hidden) return;
    event.preventDefault();
    button.click();
  });
}
