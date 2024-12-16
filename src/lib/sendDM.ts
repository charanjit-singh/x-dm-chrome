import { BackgroundEvent } from "../background";

export const sendDM = async (username: string, message: string) => {
  const tab = await chrome.tabs.create({
    url: `https://x.com/${username}`,
  });
  if (!tab.id) {
    throw new Error("Failed to open tab");
  }
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (message: string, username: string) => {
      // Wait for 1 second
      setTimeout(() => {
        const customEvent = new CustomEvent("sendDM", {
          detail: { message, username },
        });
        window.dispatchEvent(customEvent);
      }, 1000);
    },
    args: [message, username],
  });

  // Wait for event DM_SENT or DM_FAILED
  await new Promise((resolve) => {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === BackgroundEvent.DM_SENT) {
        resolve(message);
      }
      if (message.type === BackgroundEvent.DM_FAILED) {
        resolve(message);
      }
    });
  });

  // Close the tab
  await chrome.tabs.remove(tab.id);
};
