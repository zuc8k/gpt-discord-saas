const chatContainer = document.getElementById("chatContainer");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  addMessage(text, "user");
  chatInput.value = "";
  chatInput.style.height = "auto";

  showTyping();

  // مؤقت – بعدين نربطه بـ API
  setTimeout(() => {
    removeTyping();
    addMessage("ده رد تجريبي من GPT 👋", "assistant");
  }, 1200);
}

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.textContent = text;
  chatContainer.appendChild(div);
  scrollDown();
}

function showTyping() {
  const typing = document.createElement("div");
  typing.className = "message assistant typing";
  typing.id = "typing";

  typing.innerHTML = `
    <span></span><span></span><span></span>
  `;

  chatContainer.appendChild(typing);
  scrollDown();
}

function removeTyping() {
  document.getElementById("typing")?.remove();
}

function scrollDown() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}