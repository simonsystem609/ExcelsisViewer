const api = window.excelsisApp;
    const status = document.getElementById("status");
    const version = document.getElementById("version");

    async function showVersion() {
      if (!api?.getAppVersion) return;
      try {
        const value = await api.getAppVersion();
        version.textContent = value ? `v${value}` : "";
      } catch {
        version.textContent = "";
      }
    }

    async function openModule(moduleName) {
      if (!api?.openModule) {
        status.textContent = "Desktop bridge is unavailable.";
        return;
      }
      const result = await api.openModule(moduleName, { closeLauncher: true });
      if (!result?.ok) status.textContent = result?.error || "Could not open viewer.";
    }

    for (const button of document.querySelectorAll("[data-module]")) {
      button.addEventListener("click", () => openModule(button.dataset.module));
    }

    showVersion();
