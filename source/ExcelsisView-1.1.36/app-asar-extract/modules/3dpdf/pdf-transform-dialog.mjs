export function showPdfTransformDialog({ kind, page, pageCount, execute }) {
  const dialog = document.getElementById("pdfTransformDialog");
  if (dialog.open) return Promise.resolve(null);
  const field = id => document.getElementById(id);
  const form = dialog.querySelector("form");
  const axis = field("pdfTransformAxis"), x = field("pdfScaleX"), y = field("pdfScaleY");
  const linked = field("pdfScaleLinked"), scope = field("pdfTransformScope");
  const error = field("pdfTransformError"), cancel = field("pdfTransformCancel");
  field("pdfTransformTitle").textContent = kind === "mirror" ? "Mirror PDF" : "Scale PDF";
  field("pdfMirrorOptions").hidden = kind !== "mirror";
  field("pdfScaleOptions").hidden = kind !== "scale";
  scope.options[0].textContent = `All ${pageCount} page(s)`;
  scope.options[1].textContent = `Current page (${page})`;
  scope.value = "all"; axis.value = "horizontal"; x.value = "100"; y.value = "100"; linked.checked = true;
  error.textContent = "";
  let busy = false, result = null;
  const sync = () => { if (linked.checked) y.value = x.value; y.disabled = busy || linked.checked; };
  const setBusy = value => {
    busy = value;
    for (const control of form.elements) control.disabled = value;
    field("pdfTransformConfirm").textContent = value ? "Saving..." : "Save transformed copy...";
    sync();
  };
  setBusy(false);
  return new Promise(resolve => {
    const controller = new AbortController(), options = { signal: controller.signal };
    x.addEventListener("input", sync, options); linked.addEventListener("change", sync, options);
    dialog.addEventListener("keydown", event => event.stopPropagation(), options);
    dialog.addEventListener("cancel", event => { if (busy) event.preventDefault(); }, options);
    cancel.addEventListener("click", () => { if (!busy) dialog.close(); }, options);
    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (busy) return;
      error.textContent = "";
      const config = { kind, axis: axis.value, scope: scope.value, page, xPercent: Number(x.value), yPercent: linked.checked ? Number(x.value) : Number(y.value) };
      setBusy(true);
      try { result = await execute(config); if (result) dialog.close(); }
      catch (failure) { error.textContent = failure?.message || String(failure); }
      finally { setBusy(false); }
    }, options);
    dialog.addEventListener("close", () => { controller.abort(); resolve(result); }, { ...options, once: true });
    dialog.showModal();
    (kind === "scale" ? x : axis).focus();
    if (kind === "scale") x.select();
  });
}
