import { findReact } from "./lib/findReact";

export interface Follower {
  username: string;
  name: string;
  bio: string;
}

const chromeSendMessage = (data: any) => {
  const event = new CustomEvent("send-message-to-background", {
    detail: data,
  });
  window.dispatchEvent(event);
};

export const scrapeFollowers = async () => {
  const userCells = document.querySelectorAll('[data-testid="UserCell"]');
  console.log({ userCells });
  // Get first user cell
  const firstUserCell = userCells[0];
  if (!firstUserCell) return [];
  const reactData = findReact(firstUserCell, 11);
  console.log(reactData);
  if (!reactData) {
    alert("Failed to scrape followers");
    return [];
  }
  // FindReact(userCells[0],11).context.store.getState
  const appState = reactData.context.store.getState();
  // entities.users.entities
  const users = appState.entities.users.entities as Record<string, any>;

  const followers: Follower[] = [];
  for (const user of Object.keys(users)) {
    // Only when he is following me
    if (users[user].followed_by) {
      followers.push({
        username: users[user].screen_name,
        name: users[user].name,
        bio: users[user].description,
      });
    }
  }
  return followers;
};

window.addEventListener("scrapeFollowers", async () => {
  const followers = await scrapeFollowers();
  console.log(followers);
  const confirmed = confirm("Are you sure you want to send this data?");
  if (confirmed) {
    chromeSendMessage({
      type: "followers-list",
      data: followers,
    });
  }
});

export const sendDM = async (message: string) => {
  // Click on the send DM button data-testid="sendDMFromProfile"
  const sendDMButton = document.querySelector(
    '[data-testid="sendDMFromProfile"]'
  ) as HTMLElement;
  if (!sendDMButton) return;

  sendDMButton.click();

  // Wait for 2 seconds
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Find the textarea
  const textarea = document.querySelector(
    '[data-testid="dmComposerTextInput"]'
  ) as HTMLDivElement;
  if (!textarea) return;

  const typeIntoDOM = (message: string, dom: HTMLDivElement) => {
    dom.focus();
    const formattedMessage = message.replace(/\n/g, "<br/>");
    document.execCommand("insertHtml", false, formattedMessage);
  };

  typeIntoDOM(message, textarea);

  // Wait for 2 seconds
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Find the send button
  const sendButton = document.querySelector(
    '[data-testid="dmComposerSendButton"]'
  ) as HTMLButtonElement;
  if (!sendButton) return;

  sendButton.click();
  return true;
};

window.addEventListener("sendDM", async (event: any) => {
  const message = event.detail.message;
  const username = event.detail.username;
  const success = await sendDM(message);
  if (success) {
    chromeSendMessage({
      type: "DM_SENT",
      data: {
        username: username,
        message: message,
      },
    });
  } else {
    chromeSendMessage({
      type: "DM_FAILED",
      data: {
        username: username,
        message: message,
      },
    });
  }
});
