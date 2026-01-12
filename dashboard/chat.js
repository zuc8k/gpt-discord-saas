/* ================== ELEMENTS ================== */
const chatContainer = document.getElementById("chatContainer");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

/* ================== CONFIG ================== */
const API_URL = "http://localhost:3001"; // عدّل لو VPS
const STAFF_TOKEN = localStorage.getItem("STAFF_TOKEN");

// مؤقت – بعدين ممكن تجيبه من اختيار جيلد
const CURRENT_GUILD_ID = localStorage.getItem("CHAT_GUILD_ID") || "TEST_GUILD";

/* ================== EVENTS ================== */
sendBtn.addEventListener("click", sendMessage);

chatInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

/* ================== SEND MESSAGE ================== */
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
    const res = await fetch(`${API_URL}/chat/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: STAFF_TOKEN
      },
      body: JSON.stringify({
        guildId: CURRENT_GUILD_ID,
        message: text
      })
    });

    removeTyping();

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // اشتراك منتهي
      if (data.code === "EXPIRED") {
        addMessage("⏳ الاشتراك منتهي، جدده علشان تكمل", "assistant");
        return;
      }

      // ليميت يومي
      if (data.code === "DAILY_LIMIT") {
        addMessage("🚫 وصلت للحد اليومي للرسائل", "assistant");
        return;
      }

      addMessage(data.error || "❌ حصل خطأ غير متوقع", "assistant");
      return;
    }

    // رد GPT
    addMessage(data.reply, "assistant");

    // عرض معلومات الخطة (اختياري)
    if (data.plan) {
      addSystemMessage(
        `📦 Plan: ${data.plan} | Daily: ${data.usage.daily}/${data.usage.dailyLimit}`
      );
    }

  } catch (err) {
    console.error("Chat Error:", err);
    removeTyping();
    addMessage("❌ السيرفر مش متاح دلوقتي", "assistant");
  }
}

/* ================== UI HELPERS ================== */
function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.textContent = text;
  chatContainer.appendChild(div);
  scrollDown();
}

function addSystemMessage(text) {
  const div = document.createElement("div");
  div.className = "message system";
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