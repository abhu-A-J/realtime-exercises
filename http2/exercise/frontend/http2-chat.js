const chat = document.getElementById("chat");
const msgs = document.getElementById("msgs");
const presence = document.getElementById("presence-indicator");

// this will hold all the most recent messages
let allChat = [];

chat.addEventListener("submit", function (e) {
  e.preventDefault();
  postNewMsg(chat.elements.user.value, chat.elements.text.value);
  chat.elements.text.value = "";
});

async function postNewMsg(user, text) {
  const data = {
    user,
    text,
  };

  // request options
  const options = {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  };

  // send POST request
  // we're not sending any json back, but we could
  await fetch("/msgs", options);
}

async function getNewMsgs() {
  let reader;

  const utfDecoder = new TextDecoder("utf-8");

  try {
    const res = await fetch("/msgs");
    // res.json basically means finish the connection
    reader = res.body.getReader();
  } catch (err) {
    console.error("Connection err", err);
  }

  presence.innerText = "🟢";
  let readerResponse;
  let done;

  do {
    try {
      readerResponse = await reader.read();
    } catch (e) {
      console.error("Reader failed", e);
      presence.innerText = "🔴";
      return;
    }

    const chunk = utfDecoder.decode(readerResponse.value, { stream: true });

    if (chunk) {
      try {
        const data = JSON.parse(chunk);
        allChat = data.msg;
        render();
      } catch (err) {
        console.error("Parse Error", err);
      }
    }

    done = readerResponse.done;
  } while (!done);

  presence.innerText = "🔴";
}

function render() {
  const html = allChat.map(({ user, text, time, id }) =>
    template(user, text, time, id)
  );
  msgs.innerHTML = html.join("\n");
}

const template = (user, msg) =>
  `<li class="collection-item"><span class="badge">${user}</span>${msg}</li>`;

getNewMsgs();
