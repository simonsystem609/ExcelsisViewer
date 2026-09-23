const api = window.excelsisUpdater;
const status = document.getElementById("status");
const refreshButton = document.getElementById("refresh");
const productElements = new Map(
  [...document.querySelectorAll("[data-product]")].map((element) => [element.dataset.product, element]),
);
let busyProduct = null;
let lastRefreshAt = 0;

function setStatus(message, isError = false) {
  status.textContent = message || "";
  status.classList.toggle("error", isError);
}

function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  return `${(value / (1024 * 1024)).toFixed(1)} MiB`;
}

function renderProduct(update) {
  const element = productElements.get(update.key);
  if (!element) return;
  const version = element.querySelector(".version");
  const detail = element.querySelector(".detail");
  const button = element.querySelector(".install");
  const progress = element.querySelector("progress");
  progress.hidden = true;
  progress.value = 0;
  const installedText = update.installedVersionError
    ? "Unknown"
    : (update.installedVersion || "Not installed");
  if (update.error) {
    version.textContent = `Installed: ${installedText} · Latest: unavailable`;
    detail.textContent = update.error;
    button.disabled = true;
    button.dataset.available = "false";
    button.textContent = "Unavailable";
    return;
  }
  const releaseLabel = update.releaseLabel && update.releaseLabel !== update.latestVersion
    ? ` (release ${update.releaseLabel})`
    : "";
  version.textContent =
    `Installed: ${installedText} · Latest: ${update.latestVersion}${releaseLabel}`;
  const stateMessages = {
    "not-installed": "Not installed",
    "update-available": "Update available",
    "up-to-date": "Up to date",
    "newer-installed": "Installed version is newer than the public release",
    unknown: update.installedVersionError || "Installed version could not be compared safely",
  };
  detail.textContent =
    `${stateMessages[update.status] || "Version status unavailable"} · ` +
    `${update.assetName} · ${formatBytes(update.size)}`;
  button.disabled = busyProduct !== null || !update.canInstall;
  button.dataset.available = String(!!update.canInstall);
  button.textContent = update.status === "not-installed"
    ? "Install"
    : (update.status === "update-available" ? "Update" : "No update needed");
  button.onclick = () => install(update.key);
}

function renderMacros(update) {
  const element = productElements.get("macros");
  const version = element.querySelector(".version");
  const detail = element.querySelector(".detail");
  const button = element.querySelector(".install");
  const progress = element.querySelector("progress");
  progress.hidden = true;
  progress.value = 0;
  version.textContent = `Helper: ${update.installedVersion || "Not installed"} · Macro revision: ${update.revision || "unavailable"}`;
  detail.textContent = update.error || update.detail || "No compatible macro revision.";
  button.disabled = busyProduct !== null || !update.canInstall;
  button.dataset.available = String(!!update.canInstall);
  button.textContent = update.canInstall ? "Update macros" :
    (update.status === "up-to-date" ? "Macros up to date" : "Unavailable");
  button.onclick = () => install("macros");
}

async function refresh() {
  if (!api?.getCatalog || busyProduct) return;
  refreshButton.disabled = true;
  setStatus("Checking GitHub releases...");
  try {
    const catalog = await api.getCatalog();
    for (const update of catalog.products || []) renderProduct(update);
    renderMacros(catalog.macros || { status: "unknown", error: "Macro revision lookup was unavailable." });
    setStatus("Release information is current.");
  } catch (error) {
    setStatus(error?.message || "Could not check for updates.", true);
  } finally {
    lastRefreshAt = Date.now();
    refreshButton.disabled = false;
  }
}

async function install(productKey) {
  if (!api?.install || busyProduct) return;
  busyProduct = productKey;
  for (const element of productElements.values()) element.querySelector(".install").disabled = true;
  const product = productElements.get(productKey);
  const progress = product.querySelector("progress");
  progress.hidden = false;
  progress.value = 0;
  setStatus("Preparing download...");
  try {
    const result = productKey === "macros" ? await api.installMacros() : await api.install(productKey);
    if (productKey === "macros") {
      setStatus(result.deferred ? "Macro update deferred; save work and restart SOLIDWORKS before retrying."
        : result.cancelled ? "Macro update cancelled."
          : `Macro revision ${result.revision} is ready. Restart SOLIDWORKS before using it.`);
      if (result.ok) {
        product.querySelector(".install").dataset.available = "false";
        product.querySelector(".install").textContent = "Macros up to date";
        product.querySelector(".detail").textContent =
          "Verified macros installed. Restart SOLIDWORKS before using them.";
      }
    } else {
      setStatus(`Installer opened: ${result.path}`);
    }
  } catch (error) {
    setStatus(error?.message || "The update could not be downloaded.", true);
  } finally {
    busyProduct = null;
    for (const element of productElements.values()) {
      const button = element.querySelector(".install");
      button.disabled = button.dataset.available !== "true";
    }
  }
}

api?.onProgress?.((progressState) => {
  const product = productElements.get(progressState?.productKey);
  if (!product) return;
  const progress = product.querySelector("progress");
  const detail = product.querySelector(".detail");
  progress.hidden = false;
  progress.value = Math.max(0, Math.min(100, Number(progressState.percent) || 0));
  detail.textContent = String(progressState.message || "Downloading...");
});

refreshButton.addEventListener("click", refresh);
window.addEventListener("focus", () => {
  if (!busyProduct && Date.now() - lastRefreshAt > 5000) refresh();
});
refresh();
