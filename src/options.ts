import { BackgroundEvent } from "./background";
import { Follower } from "./inject";

// Load settings from chrome.storage
function loadSettings() {
  chrome.storage.local.get(
    ["rateLimitHour", "rateLimitDay", "twitterUsername"],
    (result) => {
      const rateLimitHour = result.rateLimitHour || 100;
      const rateLimitDay = result.rateLimitDay || 1000;
      const twitterUsername = result.twitterUsername || "";
      const rateLimitHourInput = document.getElementById(
        "rate-limit-hour"
      ) as HTMLInputElement;
      const rateLimitDayInput = document.getElementById(
        "rate-limit-day"
      ) as HTMLInputElement;
      const twitterUsernameInput = document.getElementById(
        "twitter-username"
      ) as HTMLInputElement;
      if (rateLimitHourInput && rateLimitDayInput && twitterUsernameInput) {
        rateLimitHourInput.value = rateLimitHour.toString();
        rateLimitDayInput.value = rateLimitDay.toString();
        twitterUsernameInput.value = twitterUsername;
      }
    }
  );
}

// Save settings to chrome.storage
function saveSettings() {
  const twitterUsernameInput = document.getElementById(
    "twitter-username"
  ) as HTMLInputElement;
  const twitterUsername = twitterUsernameInput?.value || "";
  const rateLimitHourInput = document.getElementById(
    "rate-limit-hour"
  ) as HTMLInputElement;
  const rateLimitDayInput = document.getElementById(
    "rate-limit-day"
  ) as HTMLInputElement;
  if (rateLimitHourInput && rateLimitDayInput) {
    const rateLimitHour = rateLimitHourInput.value;
    const rateLimitDay = rateLimitDayInput.value;
    chrome.storage.local.set(
      {
        rateLimitHour: rateLimitHour,
        rateLimitDay: rateLimitDay,
        twitterUsername: twitterUsername,
      },
      () => {
        alert("Settings saved successfully!");
      }
    );
  }
}

// Load campaign data from chrome.storage
function loadCampaign() {
  chrome.storage.local.get(["messageTemplate", "campaignStatus"], (result) => {
    const messageTemplate = result.messageTemplate || "";
    const status = result.campaignStatus || "paused";
    const messageTemplateInput = document.getElementById(
      "message-template"
    ) as HTMLInputElement;
    if (messageTemplateInput) {
      messageTemplateInput.value = messageTemplate;
    }
    updateCampaignControls(status);
  });
}

// Save campaign data to chrome.storage
function saveCampaign() {
  const messageTemplateInput = document.getElementById(
    "message-template"
  ) as HTMLInputElement;
  if (messageTemplateInput) {
    const messageTemplate = messageTemplateInput.value;
    chrome.storage.local.get("campaignStatus", (result) => {
      const status = result.campaignStatus || "paused";
      chrome.storage.local.set({
        messageTemplate: messageTemplate,
        campaignStatus: status,
      });
    });
  }
}

// Update campaign controls based on status
function updateCampaignControls(status: string) {
  const isRunning = status === "active";
  const messageTemplateInput = document.getElementById(
    "message-template"
  ) as HTMLInputElement;
  if (messageTemplateInput) {
    messageTemplateInput.disabled = isRunning;
  }
  
  const startBtn = document.getElementById("start-btn") as HTMLButtonElement;
  if (startBtn) {
    startBtn.disabled = isRunning;
  }
  const pauseBtn = document.getElementById("pause-btn") as HTMLButtonElement;
  if (pauseBtn) {
    pauseBtn.disabled = !isRunning;
  }
}

function onStartCampaign() {
  chrome.storage.local.get(["CampaignRunning"], (result) => {
    if (result.CampaignRunning) {
      alert("Campaign is already running.");
      return;
    }

    chrome.storage.local.set(
      { CampaignRunning: true, campaignStatus: "active" },
      () => {
        saveCampaign();
        updateCampaignControls("active");
        // Fire background task with campaign data
        chrome.runtime.sendMessage({ type: BackgroundEvent.START_CAMPAIGN });
      }
    );
  });
}

function onPauseCampaign() {
  chrome.storage.local.set(
    { CampaignRunning: false, campaignStatus: "paused" },
    () => {
      saveCampaign();
      updateCampaignControls("paused");
      // Fire background task to pause campaign
      chrome.runtime.sendMessage({ type: BackgroundEvent.PAUSE_CAMPAIGN });
    }
  );
}

function onNewCampaign() {
  const confirmed = confirm("Are you sure you want to start a new campaign?");
  if (!confirmed) {
    return;
  }
  chrome.storage.local.remove(["messageTemplate", "CampaignRunning"], () => {
    chrome.storage.local.set({ campaignStatus: "paused" }, () => {
      const messageTemplateInput = document.getElementById(
        "message-template"
      ) as HTMLInputElement;
      if (messageTemplateInput) {
        messageTemplateInput.value = "";
      }
      updateCampaignControls("paused");
    });
  });
}

function onGetFollowers() {
  // Fire background task with campaign data
  const twitterUsernameInput = document.getElementById(
    "twitter-username"
  ) as HTMLInputElement;
  const twitterUsername = twitterUsernameInput?.value || "";
  if (twitterUsername) {
    chrome.runtime.sendMessage({
      type: BackgroundEvent.START_GETTING_FOLLOWERS_LIST,
      username: twitterUsername,
    });
  } else {
    alert("Please enter a Twitter username");
  }
}

function loadFollowersList() {
  chrome.storage.local.get("LATEST_FOLLOWERS_LIST", (result) => {
    const followersList = result.LATEST_FOLLOWERS_LIST || [];
    const followersListElement = document.getElementById(
      "followers-list"
    ) as HTMLDivElement;
    const followersCountElement = document.getElementById(
      "followers-count"
    ) as HTMLParagraphElement;
    if (followersListElement && followersCountElement) {
      followersListElement.innerHTML = followersList
        .map(
          (follower: Follower) =>
            `<div class="follower-item">
              <div class="follower-name">${follower.username}</div>
              <div class="follower-bio">${
                follower.bio || "No bio available"
              }</div>
            </div>`
        )
        .join("");
      followersCountElement.textContent = `Followers Count: ${followersList.length}`;
    }
  });
}

function downloadCSV() {
  chrome.storage.local.get("LATEST_FOLLOWERS_LIST", (result) => {
    const followersList = result.LATEST_FOLLOWERS_LIST || [];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      followersList
        .map((follower: Follower) => `${follower.username},${follower.bio}`)
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "followers_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

// Clear all data from chrome.storage
function clearAllData() {
  const confirmed = confirm("Are you sure you want to clear all data?");
  if (confirmed) {
    chrome.storage.local.clear(() => {
      alert("All data cleared successfully!");
      // Optionally, reset UI elements to default values
      loadSettings();
      loadCampaign();
      loadFollowersList();
    });
  }
}

// Initialize the page
function init() {
  loadSettings();
  loadCampaign();
  loadFollowersList();

  const getFollowersBtn = document.getElementById(
    "get-followers-btn"
  ) as HTMLButtonElement;
  if (getFollowersBtn) {
    getFollowersBtn.addEventListener("click", onGetFollowers);
  }

  const downloadCsvBtn = document.getElementById(
    "download-csv-btn"
  ) as HTMLButtonElement;
  if (downloadCsvBtn) {
    downloadCsvBtn.addEventListener("click", downloadCSV);
  }

  const saveSettingsBtn = document.getElementById(
    "save-settings-btn"
  ) as HTMLButtonElement;
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener("click", saveSettings);
  }

  const startBtn = document.getElementById("start-btn") as HTMLButtonElement;
  if (startBtn) {
    startBtn.addEventListener("click", onStartCampaign);
  }

  const pauseBtn = document.getElementById("pause-btn") as HTMLButtonElement;
  if (pauseBtn) {
    pauseBtn.addEventListener("click", onPauseCampaign);
  }

  const newCampaignBtn = document.getElementById(
    "new-campaign-btn"
  ) as HTMLButtonElement;
  if (newCampaignBtn) {
    newCampaignBtn.addEventListener("click", onNewCampaign);
  }

  const clearDataBtn = document.getElementById(
    "clear-data-btn"
  ) as HTMLButtonElement;
  if (clearDataBtn) {
    clearDataBtn.addEventListener("click", clearAllData);
  }
}

// Run the initialization
init();
