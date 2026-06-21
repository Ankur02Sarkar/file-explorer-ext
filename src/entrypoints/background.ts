export default defineBackground(() => {
  const SCRIPT_PATH = '/files-explorer.js';

  const isFilePage = (url?: string) =>
    !!url && url.startsWith('file://') && url.endsWith('/');

  const inject = async (tabId: number) => {
    try {
      await browser.scripting.executeScript({
        target: { tabId },
        files: [SCRIPT_PATH],
        world: 'ISOLATED',
      });
    } catch (err) {
      console.warn('[files-explorer] inject failed:', err);
    }
  };

  const focusHost = async (tabId: number) => {
    try {
      await browser.scripting.executeScript({
        target: { tabId },
        func: () => {
          const host = document.getElementById('files-explorer-host');
          if (host instanceof HTMLElement) {
            host.scrollIntoView({ block: 'start', behavior: 'smooth' });
            return true;
          }
          return false;
        },
      });
    } catch (err) {
      console.warn('[files-explorer] focus failed:', err);
    }
  };

  // Auto-inject on file:// tab navigations.
  browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'complete') return;
    if (!isFilePage(tab.url)) return;
    void inject(tabId);
  });

  // Action button click → focus existing host, or inject if missing.
  browser.action?.onClicked.addListener(async (tab) => {
    if (!tab?.id) return;
    if (!isFilePage(tab.url)) {
      // Not on a file:// page — open the help page instead.
      await browser.tabs.create({
        url: browser.runtime.getURL('/file-access-help.html'),
      });
      return;
    }
    await focusHost(tab.id);
    // Also (re)inject in case the script hasn't run yet.
    await inject(tab.id);
  });

  // Keyboard shortcut → same as action.
  browser.commands?.onCommand.addListener(async (command) => {
    if (command !== '_execute_action') return;
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    if (!isFilePage(tab.url)) {
      await browser.tabs.create({
        url: browser.runtime.getURL('/file-access-help.html'),
      });
      return;
    }
    await focusHost(tab.id);
    await inject(tab.id);
  });
});
