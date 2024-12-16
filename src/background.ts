import { Follower } from "./inject";
import { getFollowersList } from "./lib/getFollowersList";
import { sendDM } from "./lib/sendDM";

export enum BackgroundEvent {
  START_GETTING_FOLLOWERS_LIST = "START_GETTING_FOLLOWERS_LIST",
  START_CAMPAIGN = "START_CAMPAIGN",
  PAUSE_CAMPAIGN = "PAUSE_CAMPAIGN",
  CLEANUP_CAMPAIGN = "CLEANUP_CAMPAIGN",
  DM_SENT = "DM_SENT",
  DM_FAILED = "DM_FAILED",
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === BackgroundEvent.START_GETTING_FOLLOWERS_LIST) {
    // Create a tab and redirect user to x/<username>/followers?collectFollowers=true
    const followersList = await getFollowersList(message.username);
    sendResponse({ status: "success", followersList });
  }

  const getFirstName = (fullName: string) => {
    const nameParts = fullName.split(" ");
    return nameParts.length > 0 ? nameParts[0] : fullName;
  };

  // On start campaign
  if (message.type === BackgroundEvent.START_CAMPAIGN) {
    // Send DM to all followers
    const followers = await chrome.storage.local.get("LATEST_FOLLOWERS_LIST");
    const campaignMessage = await chrome.storage.local.get("messageTemplate");
    const followersList: Follower[] = followers.LATEST_FOLLOWERS_LIST;
    for (const follower of followersList) {
      const campaignStatus = await chrome.storage.local.get("campaignStatus");
      if (campaignStatus.campaignStatus === "paused") {
        break;
      }
      const personalizedMessage = campaignMessage.messageTemplate
        .replace(/{username}/g, follower.username)
        .replace(/{firstName}/g, getFirstName(follower.name))
        .replace(/{name}/g, follower.name);
      await sendDM(follower.username, personalizedMessage);
      // Cooldown
      // Random cooldown between 10 seconds and 30 seconds
      const cooldown = Math.floor(Math.random() * 20000) + 10000;
      await new Promise((resolve) => setTimeout(resolve, cooldown));
    }
  }
});
