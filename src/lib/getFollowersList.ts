export const getFollowersList = async (username: string) => {
  // Open x.com/username/followers, and inject the script
  const tab = await chrome.tabs.create({
    url: `https://x.com/${username}/followers?collectFollowers=true`,
  });
  if (!tab.id) {
    throw new Error("Failed to open tab");
  }
  //   Inject scrape-followers.js
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["./embeds/scrape-followers.js"],
  });
  //   Wait for followers to be returned by frontend (listen for result)
  const result = await new Promise((resolve) => {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === "followers-list") {
        resolve(message.data);
      }
    });
  });
  //   Store it into "LATEST_FOLLOWERS_LIST"
  await chrome.storage.local.set({
    LATEST_FOLLOWERS_LIST: result,
  });
  //   Close the tab
  await chrome.tabs.remove(tab.id);
  return result;
};
