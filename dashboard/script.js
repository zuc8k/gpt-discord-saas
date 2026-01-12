const API_URL = "http://localhost:3001";

let STAFF_TOKEN = localStorage.getItem("STAFF_TOKEN");
let STAFF_ROLE = null;
let STAFF_USERNAME = null;

/* ================== LOGS CACHE ================== */
let ALL_LOGS = [];

/* ================== AUTO LOGIN ================== */
document.addEventListener("DOMContentLoaded", () => {
  highlightMenu();
  if (STAFF_TOKEN) login(true);
});

/* ================== LOGIN CORE ================== */
async function login(silent = false, requireRole = null) {
  const tokenInput = document.getElementById("token");
  const token = STAFF_TOKEN || tokenInput?.value;

  if (!token) {
    if (!silent) alert("Enter STAFF TOKEN");
    return false;
  }

  const res = await fetch(`${API_URL}/staff/me`, {
    headers: { Authorization: token }
  });

  if (!res.ok) {
    localStorage.removeItem("STAFF_TOKEN");
    STAFF_TOKEN = null;
    if (!silent) alert("❌ Invalid Staff Token");
    return false;
  }

  const data = await res.json();

  if (requireRole && data.role !== requireRole) {
    alert(`❌ ${requireRole} فقط`);
    return false;
  }

  STAFF_TOKEN = token;
  STAFF_ROLE = data.role;
  STAFF_USERNAME = data.username;
  localStorage.setItem("STAFF_TOKEN", token);

  fillProfile();

  if (document.getElementById("guilds")) loadGuilds();
  if (document.getElementById("staffList")) loadStaff();
  if (document.getElementById("logs")) loginLogs();

  return true;
}

/* ================== PROFILE UI ================== */
function fillProfile() {
  const nameEl = document.getElementById("profileName");
  const roleEl = document.getElementById("profileRole");
  const avatarEl = document.getElementById("profileAvatar");

  if (nameEl) nameEl.textContent = STAFF_USERNAME;
  if (roleEl) roleEl.textContent = STAFF_ROLE;

  if (avatarEl) {
    avatarEl.textContent =
      STAFF_USERNAME?.charAt(0)?.toUpperCase() || "👤";
  }
}

/* ================== MENU ACTIVE ================== */
function highlightMenu() {
  const path = location.pathname;

  if (path.includes("index")) setActive("nav-dashboard");
  else if (path.includes("staff")) setActive("nav-staff");
  else if (path.includes("logs")) setActive("nav-logs");
}

function setActive(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}

/* ================== LOGOUT ================== */
function logout() {
  localStorage.removeItem("STAFF_TOKEN");
  location.reload();
}

/* ================== LOAD GUILDS ================== */
async function loadGuilds() {
  const res = await fetch(`${API_URL}/admin/guilds`, {
    headers: { Authorization: STAFF_TOKEN }
  });

  if (!res.ok) return alert("❌ Access denied");

  const guilds = await res.json();
  const container = document.getElementById("guilds");
  if (!container) return;

  container.innerHTML = "";

  guilds.forEach(g => {
    const div = document.createElement("div");
    div.className = "card";

    let actions = "";

    if (["OWNER", "ADMIN"].includes(STAFF_ROLE)) {
      actions += `
        <select id="plan-${g.guildId}">
          <option>FREE</option>
          <option>PRIME</option>
          <option>PREMIUM</option>
          <option>MAX</option>
        </select>

        <select id="duration-${g.guildId}">
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        <button onclick="updatePlan('${g.guildId}')">Update Plan</button>
      `;
    }

    if (["OWNER", "ADMIN", "SUPPORT"].includes(STAFF_ROLE)) {
      actions += `
        <button onclick="resetUsage('${g.guildId}')">Reset Usage</button>
      `;
    }

    div.innerHTML = `
      <b>Guild ID:</b> ${g.guildId}
      <small>Plan: <b>${g.plan}</b></small>
      <small>Daily: ${g.usedDailyLines}/${g.dailyLimit}</small>
      <small>Monthly: ${g.usedLines}/${g.monthlyLimit}</small>
      <br>${actions}
    `;

    container.appendChild(div);

    const planSelect = document.getElementById(`plan-${g.guildId}`);
    if (planSelect) planSelect.value = g.plan;
  });
}

/* ================== UPDATE PLAN ================== */
async function updatePlan(guildId) {
  const plan = document.getElementById(`plan-${guildId}`).value;
  const duration = document.getElementById(`duration-${guildId}`).value;

  const res = await fetch(`${API_URL}/admin/guild/${guildId}/plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: STAFF_TOKEN
    },
    body: JSON.stringify({ plan, duration })
  });

  if (!res.ok) return alert("❌ Failed");

  alert("✅ Plan Updated");
  loadGuilds();
}

/* ================== RESET ================== */
async function resetUsage(guildId) {
  const res = await fetch(`${API_URL}/staff/reset/${guildId}`, {
    method: "POST",
    headers: { Authorization: STAFF_TOKEN }
  });

  if (!res.ok) return alert("❌ Failed");

  alert("♻️ Reset Done");
  loadGuilds();
}

/* ================== STAFF ================== */
function loginStaff() {
  login(false, "OWNER");
}

async function loadStaff() {
  const res = await fetch(`${API_URL}/staff/list`, {
    headers: { Authorization: STAFF_TOKEN }
  });

  const staff = await res.json();
  const container = document.getElementById("staffList");
  if (!container) return;

  container.innerHTML = "";

  staff.forEach(s => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <b>${s.username}</b>
      <small>Role: ${s.role}</small>
      <small>${new Date(s.createdAt).toLocaleString()}</small>
      <button onclick="deleteStaff('${s.username}')">Delete</button>
    `;

    container.appendChild(div);
  });
}

/* ================== LOGS ================== */
async function loginLogs() {
  const ok = await login(true);
  if (!ok) return;

  const res = await fetch(`${API_URL}/admin/logs`, {
    headers: { Authorization: STAFF_TOKEN }
  });

  if (!res.ok) return alert("❌ Failed to load logs");

  ALL_LOGS = await res.json();
  renderLogs();
}

function renderLogs() {
  const container = document.getElementById("logs");
  if (!container) return;

  const search = document.getElementById("searchInput")?.value.toLowerCase() || "";
  const action = document.getElementById("actionFilter")?.value || "";
  const sort = document.getElementById("sortFilter")?.value || "desc";

  let logs = [...ALL_LOGS];

  if (search) {
    logs = logs.filter(l =>
      l.action?.toLowerCase().includes(search) ||
      l.guildId?.toLowerCase().includes(search) ||
      l.staff?.username?.toLowerCase().includes(search)
    );
  }

  if (action) logs = logs.filter(l => l.action === action);

  logs.sort((a, b) => {
    const da = new Date(a.createdAt);
    const db = new Date(b.createdAt);
    return sort === "asc" ? da - db : db - da;
  });

  container.innerHTML = "";

  if (!logs.length) {
    container.innerHTML = `<div class="card">No logs found</div>`;
    return;
  }

  logs.forEach(log => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <b>${log.action}</b>
      <small>👤 ${log.staff?.username || "System"}</small>
      <small>🏠 ${log.guildId || "-"}</small>
      <small>🕒 ${new Date(log.createdAt).toLocaleString()}</small>
    `;

    container.appendChild(div);
  });
}