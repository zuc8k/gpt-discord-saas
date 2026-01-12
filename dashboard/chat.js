/* ================== ELEMENTS ================== */
const chatContainer = document.getElementById("chatContainer");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const imageInput = document.getElementById("imageInput");

/* ================== CONFIG ================== */
const API_URL = "http://localhost:3001"; // عدّل لو VPS
const STAFF_TOKEN = localStorage.getItem("STAFF_TOKEN");

// جيلد افتراضي – لاحقًا تختاره من UI
const CURRENT_GUILD_ID =
  localStorage.getItem("CHAT_GUILD_ID") || "TEST_GUILD";

/* ================== STATE ================== */
let selectedImage = null;

/* ================== INIT ================== */
document.addEventListener("DOMContentLoaded", () => {
  if (!STAFF_TOKEN) {
    addSystemMessage("🔐 لازم تسجل دخول الأول");
    disableChat();
    return;
  }

  loadHistory();
});

/* ================== EVENTS ================== */
sendBtn.addEventListener("click", sendMessage);

chatInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// اختيار صورة
imageInput?.addEventListener("change", handleImageSelect);

/* ================== IMAGE HANDLER ================== */
function handleImageSelect() {
  const file = imageInput.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    addSystemMessage("❌ الملف لازم يكون صورة");
    imageInput.value = "";
    return;
  }

  selectedImage = file;

  // Preview للصورة
  const reader = new FileReader();
  reader.onload = () => {
    addImageMessage(reader.result, "user");
  };
  reader.readAsDataURL(file);
}

/* ================== LOAD HISTORY ================== */
async function loadHistory() {
  try {
    const res = await fetch(
      `${API_URL}/chat/history/${CURRENT_GUILD_ID}`,
      {
        headers: {
          Authorization: STAFF_TOKEN
        }
      }
    );

    if (!res.ok) return;

    const messages = await res.json();
    chatContainer.innerHTML = "";

    messages.forEach(m => {
      if (m.imageUrl) {
        addImageMessage(m.imageUrl, m.role);
      } else {
        addMessage(m.content, m.role);
      }
    });

  } catch (err) {
    console.error("❌ History error:", err);
    addSystemMessage("⚠️ فشل تحميل المحادثات السابقة");
  }
}

/* ================== SEND MESSAGE ================== */
async function sendMessage() {
  const text = chatInput.value.trim();

  if (!text && !selectedImage) return;

  if (!STAFF_TOKEN) {
    addMessage("❌ لازم تسجل دخول الأول", "assistant");
    return;
  }

  // عرض رسالة المستخدم
  if (text) addMessage(text, "user");

  chatInput.value = "";
  chatInput.style.height = "auto";

  showTyping();

  try {
    const formData = new FormData();
    formData.append("guildId", CURRENT_GUILD_ID);
    formData.append("message", text);

    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    const res = await fetch(`${API_URL}/chat/send`, {
      method: "POST",
      headers: {
        Authorization: STAFF_TOKEN
      },
      body: formData
    });

    removeTyping();
    selectedImage = null;
    imageInput.value = "";

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      handleChatError(data);
      return;
    }

    // رد GPT
    addMessage(data.reply, "assistant");

    // Info خفيف
    if (data.plan && data.usage) {
      addSystemMessage(
        `📦 ${data.plan} | اليومي: ${data.usage.daily}/${data.usage.dailyLimit}`
      );
    }

  } catch (err) {
    console.error("❌ Chat Error:", err);
    removeTyping();
    addMessage("❌ السيرفر مش متاح دلوقتي", "assistant");
  }
}

/* ================== ERROR HANDLER ================== */
function handleChatError(data) {
  switch (data.code) {
    case "EXPIRED":
      addMessage("⏳ الاشتراك منتهي، جدده علشان تكمل", "assistant");
      disableChat();
      break;

    case "DAILY_LIMIT":
      addMessage("🚫 وصلت للحد اليومي للرسائل", "assistant");
      break;

    case "MONTHLY_LIMIT":
      addMessage("📆 وصلت للحد الشهري", "assistant");
      break;

    case "BLOCKED":
      addMessage("🚫 الرسالة دي غير مسموح بيها", "assistant");
      break;

    default:
      addMessage(data.message || data.error || "❌ حصل خطأ", "assistant");
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

function addImageMessage(src, type) {
  const div = document.createElement("div");
  div.className = `message ${type}`;

  const img = document.createElement("img");
  img.src = src;
  img.className = "chat-image";

  div.appendChild(img);
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
  removeTyping();

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

function disableChat() {
  chatInput.disabled = true;
  sendBtn.disabled = true;
}