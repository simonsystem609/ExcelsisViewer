export function confirmFileAction({ kind, name, path, dirty, execute }) {
  const get = (id) => document.getElementById(id);
  const dialog = get("fileActionDialog");
  const form = dialog.querySelector("form");
  const input = get("fileActionName");
  const error = get("fileActionError");
  const cancel = get("fileActionCancelBtn");
  const confirm = get("fileActionConfirmBtn");
  const deleting = kind === "delete";
  const renaming = kind === "rename";
  get("fileActionTitle").textContent = deleting ? "Delete file?" : renaming ? "Rename file" : "Discard changes?";
  get("fileActionPath").textContent = path;
  get("fileActionNameRow").hidden = !renaming;
  input.value = name;
  input.disabled = !renaming;
  get("fileActionNote").textContent = deleting
    ? `Move “${name}” to the Recycle Bin? You can restore it from there.${dirty ? " Unsaved changes will be discarded." : ""}`
    : renaming ? `Keep the ${name.slice(name.lastIndexOf("."))} extension. The file stays in this folder.${dirty ? " Your unsaved changes will be kept." : ""}`
      : `Discard unsaved changes to “${name}” and restore the original document?`;
  confirm.textContent = deleting ? "Move to Recycle Bin" : renaming ? "Rename" : "Discard Changes";
  confirm.classList.toggle("danger", !renaming);
  confirm.disabled = false;
  cancel.disabled = false;
  error.textContent = "";
  let busy = false;
  return new Promise((resolve) => {
    const stopKeys = (event) => event.stopPropagation();
    const finish = (result) => {
      form.removeEventListener("submit", submit);
      cancel.removeEventListener("click", onCancel);
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("keydown", stopKeys);
      dialog.close();
      resolve(result);
    };
    const onCancel = (event) => { event.preventDefault(); if (!busy) finish(null); };
    const submit = async (event) => {
      event.preventDefault();
      if (busy) return;
      if (renaming && !input.value.trim()) { error.textContent = "Enter a filename."; input.focus(); return; }
      busy = true;
      confirm.disabled = cancel.disabled = input.disabled = true;
      error.textContent = "";
      try {
        const result = await execute(input.value);
        finish(result);
      } catch (failure) {
        error.textContent = String(failure.message || failure).replace(/^Error invoking remote method '[^']+': (Error: )?/, "");
        busy = false;
        confirm.disabled = cancel.disabled = false;
        input.disabled = !renaming;
      }
    };
    form.addEventListener("submit", submit);
    cancel.addEventListener("click", onCancel);
    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("keydown", stopKeys);
    dialog.showModal();
    if (!renaming) cancel.focus();
    else {
      input.focus();
      input.setSelectionRange(0, name.lastIndexOf(".") > 0 ? name.lastIndexOf(".") : name.length);
    }
  });
}
