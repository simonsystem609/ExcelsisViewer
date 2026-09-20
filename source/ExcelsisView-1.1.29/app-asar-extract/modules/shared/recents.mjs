const api = window.excelsisRecents;

if (api) {
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const button = make("button", "recents-toggle", "Recents");
  button.id = "recentsButton";
  button.type = "button";
  button.title = "Open recent files for this viewer section";
  button.setAttribute("aria-haspopup", "dialog");
  const dialog = make("dialog", "recents-dialog");
  dialog.id = "recentsDialog";
  dialog.setAttribute("aria-labelledby", "recentsTitle");
  const header = make("header", "recents-header");
  const heading = make("div");
  const title = make("h2", "", "Recent files");
  title.id = "recentsTitle";
  heading.append(title, make("p", "", "Shared across your Viewer windows. Open files are brought to the front; other files open in a new window."));
  const close = make("button", "recents-close", "Close ×");
  close.type = "button";
  close.setAttribute("aria-label", "Close recent files");
  header.append(heading, close);
  const search = make("input", "recents-search");
  search.type = "search";
  search.placeholder = "Search by file name or folder";
  search.setAttribute("aria-label", "Search recent files");
  const status = make("p", "recents-status");
  status.setAttribute("role", "status");
  const list = make("div", "recents-list");
  list.setAttribute("aria-label", "Recent files");
  dialog.append(header, search, status, list);
  document.body.append(button, dialog);
  let data = { section: "", entries: [] };
  let opening = false;
  let revision = 0;

  function render() {
    title.textContent = `Recent ${data.section.toUpperCase()} files`;
    list.replaceChildren();
    const query = search.value.trim().toLocaleLowerCase();
    const entries = data.entries.filter((entry) => `${entry.name}\n${entry.path}`.toLocaleLowerCase().includes(query));
    status.textContent = data.warning || (entries.length ? `${entries.length} recent file${entries.length === 1 ? "" : "s"} · Stored only on this computer` : "");
    if (!entries.length) {
      list.append(make("p", "recents-empty", query ? "No matching recent files." : `No recent ${data.section.toUpperCase()} files yet. Files appear here after you open them.`));
    }
    for (const entry of entries) {
      const row = make("button", "recents-file");
      row.type = "button";
      row.disabled = opening;
      const info = make("span", "recents-file-info");
      info.append(make("strong", "", entry.name), make("span", "recents-path", entry.path));
      const time = make("time", "recents-time", new Date(entry.lastOpened).toLocaleString());
      row.append(make("span", "recents-type", data.section.toUpperCase()), info, time, make("span", "recents-open", "Open ↗"));
      row.addEventListener("click", async () => {
        if (opening) return;
        opening = true;
        button.disabled = true;
        render();
        status.textContent = `Opening ${entry.name}…`;
        try {
          const result = await api.open(entry.id);
          if (!result?.ok) throw new Error(result?.error || "Could not open this file.");
          dialog.close();
        } catch (error) {
          opening = false;
          render();
          status.textContent = error.message || "Could not open this file. It may have been moved or removed.";
        } finally {
          opening = false;
          button.disabled = false;
        }
      });
      list.append(row);
    }
  }

  async function refresh() {
    const request = ++revision;
    try {
      const result = await api.list();
      if (request !== revision || !dialog.open || opening) return;
      data = result;
      render();
    } catch {
      if (request === revision) status.textContent = "Recent files could not be loaded. Close this popup and try again.";
    }
  }

  button.addEventListener("click", () => {
    if (dialog.open) return;
    search.value = "";
    list.replaceChildren();
    status.textContent = "Loading recent files…";
    dialog.showModal();
    search.focus();
    refresh();
  });
  close.addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => { revision += 1; button.focus(); });
  // Modal keystrokes must never trigger editing/deletion/undo in the document.
  window.addEventListener("keydown", (event) => {
    if (!dialog.open) return;
    event.stopImmediatePropagation();
    if (event.key === "Escape") { event.preventDefault(); dialog.close(); }
  }, true);
  dialog.addEventListener("drop", (event) => { event.preventDefault(); event.stopPropagation(); });
  search.addEventListener("input", render);
  api.onChanged(() => { if (dialog.open && !opening) refresh(); });
}
