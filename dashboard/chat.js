const chatContainer = document.getElementById("chatContainer");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

const API_URL = "http://localhost:3001"; // عدّل لو السيرفر مختلف
const STAFF_TOKEN = localStorage.getItem("STAFF_TOKEN");

// ================== EVENTS ==================
sendBtn.addEventListener("click", sendMessage);

chatInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ================== SEND MESSAGE ==================
async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  if (!STAFF_TOKEN) {
    addMessage("❌ لازم تسجل دخول الأول", "assistant");
    return;
  }

  // رسالة المستخدم
  addMessage(text, "user");
  chatInput.value = "";
  chatInput.style.height = "auto";

  showTyping();

  try {
    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: STAFF_TOKEN
      },
      body: JSON.stringify({
        message: text
      })
    });

    removeTyping();

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      addMessage(
        err.error || "❌ حصل خطأ أثناء الرد",
        "assistant"
      );
      return;
    }

    const data = await res.json();

    addMessage(data.reply, "assistant");

  } catch (err) {
    console.error("Chat Error:", err);
    removeTyping();
    addMessage("❌ السيرفر مش متاح دلوقتي", "assistant");
  }
}

// ================== UI HELPERS ==================
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
    <span></span>
    <span></span>
    <span></span>
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