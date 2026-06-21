export default defineBackground(() => {
  // Inject the content script on demand when the user clicks the action or
  // uses the keyboard shortcut. The content script itself handles auto-mount
  // on file:// pages, so the service worker only needs to ensure it can
  // re-trigger if needed (e.g. after a tab was closed without unmount).
  browser.action?.onClicked.addListener(async (tab) => {
    if (!tab.id) return;
    try {
      await browser.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['/content-scripts/content.js'],
      });
    } catch (err) {
      console.warn('[files-explorer] executeScript failed:', err);
    }
  });

  // Optional: open the help page in a new tab via Alt+Shift+F if the action
  // button isn't directly accessible.
  browser.commands?.onCommand.addListener(async (command) => {
    if (command === '_execute_action') {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        try {
          await browser.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['/content-scripts/content.js'],
          });
        } catch (err) {
          console.warn('[files-explorer] command executeScript failed:', err);
        }
      }
    }
  });
});
