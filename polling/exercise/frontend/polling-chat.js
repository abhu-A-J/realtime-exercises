const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");

let timeForNextRequest = 0;
let BACK_OFF = 5000;
let failTries = 0;

// let's store all current messages here
let allChat = [];

// the interval to poll at in milliseconds
const INTERVAL = 3000;

// a submit listener on the form in the HTML
chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

// Submit the message
async function postNewMsg(user, text) {
  // post to /poll a new message
  // write code here

  const payload = { user, text };

  const options = {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = await fetch("/poll", options);
  const json = await res.json();
}

// Get all messages
async function getNewMsgs() {
  // poll the server
  // write code here
  let json;
  try {
    const res = await fetch("/poll");
    json = await res.json();

    if (res.status >= 400) {
      throw new Error("request did not succeed: " + res.status);
    }

    failTries = 0;
  } catch (err) {
    console.error("Polling Error", err);
    failTries++;
  }
  allChat = json.msg;
  render();

  // setTimeout(getNewMsgs, INTERVAL);
}

// Render messages on UI
function render() {
  // as long as allChat is holding all current messages, this will render them
  // into the ui. yes, it's inefficent. yes, it's fine for this example
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  );
  msgs.innerHTML = html.join("\n");
}

// given a user and a msg, it returns an HTML string to render to the UI
const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

async function rafTime(time) {
  if (timeForNextRequest <= time) {
    await getNewMsgs();

    // linear backoff time
    timeForNextRequest = time + INTERVAL + failTries * BACK_OFF;
  }

  requestAnimationFrame(rafTime);
}

// make the first request
requestAnimationFrame(rafTime);
