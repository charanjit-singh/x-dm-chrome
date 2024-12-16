const div = document.createElement("div");
div.style.position = "fixed";
div.style.bottom = "10px";
div.style.right = "10px";
div.style.backgroundColor = "white";
div.style.color = "black";
div.style.padding = "10px";
div.style.borderRadius = "5px";
div.style.border = "1px solid #0099ff";
//   Flex with a span and a button
div.style.display = "flex";
div.style.flexDirection = "column";
div.style.alignItems = "center";
div.style.justifyContent = "center";
div.style.gap = "10px";
document.body.appendChild(div);
const span = document.createElement("span");
span.style.fontSize = "16px";
span.style.fontWeight = "bold";
span.textContent =
  "Scroll down to the bottom of the page and click 'Start Scraping'";
div.appendChild(span);

// Create a button in the dom that will be clicked when the user scrolls down to the bottom of the page
const button = document.createElement("button");
// Blue background
button.style.backgroundColor = "#0099ff";
button.style.color = "white";
button.style.padding = "10px 20px";
button.style.borderRadius = "5px";
button.textContent = "Start Scraping";
button.addEventListener("click", () => {
  const event = new Event("scrapeFollowers");
  window.dispatchEvent(event);
});

div.appendChild(button);
