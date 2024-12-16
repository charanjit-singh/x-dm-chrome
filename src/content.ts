const sendMessage = (data: any) => {
  chrome.runtime.sendMessage(data);
};

window.addEventListener("send-message-to-background", (event: any) => {
  sendMessage(event.detail);
});
