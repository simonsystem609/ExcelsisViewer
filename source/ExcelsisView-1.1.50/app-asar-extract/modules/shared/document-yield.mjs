// Hidden document views may not receive animation frames. Yield for a paint
// when available, but never suspend loading/export indefinitely in a tile.
export function yieldDocumentWork() {
  return new Promise(resolve => {
    let frame;
    const finish = () => { clearTimeout(timer); if (frame !== undefined) cancelAnimationFrame(frame); resolve(); };
    const timer = setTimeout(finish, 32);
    if (typeof requestAnimationFrame === 'function') frame = requestAnimationFrame(finish);
  });
}
