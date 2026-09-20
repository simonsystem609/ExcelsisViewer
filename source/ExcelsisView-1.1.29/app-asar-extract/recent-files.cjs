const path = require("node:path");
const crypto = require("node:crypto");

const SECTIONS = new Set(["dxf", "dwg", "pdf"]);
const LIMIT_PER_SECTION = 60;
const MAX_HISTORY_BYTES = 2 * 1024 * 1024;

function sectionForPath(filePath) {
  if (typeof filePath !== "string" || filePath.length > 32768 || filePath.includes("\0")) return null;
  if (!path.isAbsolute(filePath)) return null;
  const section = path.extname(filePath).slice(1).toLowerCase();
  return SECTIONS.has(section) ? section : null;
}

function recentId(filePath) {
  const key = path.resolve(filePath).toLowerCase();
  return crypto.createHash("sha256").update(key).digest("hex");
}

// One main-process store owns all document windows. Injected I/O keeps ordering,
// validation and privacy rules testable without touching a user's history.
function createRecentFiles({ read, write, now = Date.now }) {
  let entries = [];
  let warning = "";
  const ready = (async () => {
    try {
      const raw = await read();
      if (!raw) return;
      if (Buffer.byteLength(raw, "utf8") > MAX_HISTORY_BYTES) throw new Error("History too large");
      const saved = JSON.parse(raw);
      if (saved.version !== 1 || !Array.isArray(saved.entries)) throw new Error("Invalid history");
      const seen = new Set();
      const counts = { dxf: 0, dwg: 0, pdf: 0 };
      entries = saved.entries
        .filter((entry) => sectionForPath(entry?.path) && Number.isFinite(entry.lastOpened) && entry.lastOpened > 0)
        .sort((a, b) => b.lastOpened - a.lastOpened)
        .filter((entry) => {
          const section = sectionForPath(entry.path);
          const id = recentId(entry.path);
          if (seen.has(id) || counts[section] >= LIMIT_PER_SECTION) return false;
          seen.add(id);
          counts[section] += 1;
          return true;
        })
        .map((entry) => ({ path: path.resolve(entry.path), lastOpened: entry.lastOpened }));
    } catch {
      warning = "The saved recent-file history could not be loaded. New entries will still be shown.";
    }
  })();
  let pending = ready;

  function list(section) {
    return pending.then(() => {
      if (!SECTIONS.has(section)) throw new Error("Unsupported recent-file section.");
      return {
        section,
        warning,
        entries: entries.filter((entry) => sectionForPath(entry.path) === section).map((entry) => ({
          ...entry,
          id: recentId(entry.path),
          name: path.basename(entry.path),
        })),
      };
    });
  }

  function remember(filePath) {
    const section = sectionForPath(filePath);
    if (!section) return Promise.resolve(false);
    pending = pending.then(async () => {
      const resolved = path.resolve(filePath);
      const id = recentId(resolved);
      const sameSection = entries.filter((entry) => sectionForPath(entry.path) === section && recentId(entry.path) !== id);
      entries = [
        { path: resolved, lastOpened: now() },
        ...sameSection.slice(0, LIMIT_PER_SECTION - 1),
        ...entries.filter((entry) => sectionForPath(entry.path) !== section),
      ].sort((a, b) => b.lastOpened - a.lastOpened);
      try {
        let text = JSON.stringify({ version: 1, entries });
        while (Buffer.byteLength(text, "utf8") > MAX_HISTORY_BYTES && entries.length > 1) {
          entries.pop();
          text = JSON.stringify({ version: 1, entries });
        }
        await write(text);
        warning = "";
      } catch {
        warning = "Recent files are available for this session, but their history could not be saved.";
      }
      return true;
    });
    return pending;
  }

  async function resolve(section, id) {
    if (typeof id !== "string" || !/^[a-f0-9]{64}$/.test(id)) return null;
    const result = await list(section);
    return result.entries.find((entry) => entry.id === id) || null;
  }

  return { list, remember, resolve };
}

module.exports = { createRecentFiles, sectionForPath, LIMIT_PER_SECTION, MAX_HISTORY_BYTES };
