const API_URL = "http://localhost:3001"; // عدّل لو السيرفر مختلف

let STAFF_TOKEN = localStorage.getItem("STAFF_TOKEN");
let STAFF_ROLE = null;
let STAFF_USERNAME = null;

// ================== AUTO LOGIN ==================
document.addEventListener("DOMContentLoaded", () => {
  if (STAFF_TOKEN) login(true);
});

// ================== CORE LOGIN ==================
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

  const info = document.getElementById("info");
  if (info) {
    info.innerHTML =
      `👤 <b>${STAFF_USERNAME}</b> | 🔑 Role: <b>${STAFF_ROLE}</b>`;
  }

  if (document.getElementById("guilds")) loadGuilds();
  if (document.getElementById("staffList")) loadStaff();

  return true;
}

// ================== LOGOUT ==================
function logout() {
  localStorage.removeItem("STAFF_TOKEN");
  STAFF_TOKEN = null;
  STAFF_ROLE = null;
  STAFF_USERNAME = null;
  location.reload();
}

// ================== LOAD GUILDS ==================
async function loadGuilds() {
  if (!STAFF_TOKEN) return;

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
          <option value="FREE">FREE</option>
          <option value="PRIME">PRIME</option>
          <option value="PREMIUM">PREMIUM</option>
          <option value="MAX">MAX</option>
        </select>

        <select id="duration-${g.guildId}">
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        <button id="btn-plan-${g.guildId}"
          onclick="updatePlan('${g.guildId}')">Update Plan</button>
      `;
    }

    if (["OWNER", "ADMIN", "SUPPORT"].includes(STAFF_ROLE)) {
      actions += `
        <button id="btn-reset-${g.guildId}"
          onclick="resetUsage('${g.guildId}')">Reset Usage</button>
      `;
    }

    div.innerHTML = `
      <b>Guild ID:</b> ${g.guildId}<br>
      <small>Plan: <b>${g.plan}</b></small><br>
      <small>Daily: ${g.usedDailyLines}/${g.dailyLimit}</small><br>
      <small>Monthly: ${g.usedLines}/${g.monthlyLimit}</small><br><br>
      ${actions}
    `;

    container.appendChild(div);

    const planSelect = document.getElementById(`plan-${g.guildId}`);
    if (planSelect) planSelect.value = g.plan;
  });
}

// ================== UPDATE PLAN ==================
async function updatePlan(guildId) {
  const plan = document.getElementById(`plan-${guildId}`)?.value;
  const duration = document.getElementById(`duration-${guildId}`)?.value;
  const btn = document.getElementById(`btn-plan-${guildId}`);

  if (!plan || !duration) return;
  btn.disabled = true;

  const res = await fetch(`${API_URL}/admin/guild/${guildId}/plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: STAFF_TOKEN
    },
    body: JSON.stringify({ plan, duration })
  });

  btn.disabled = false;
  if (!res.ok) return alert("❌ Failed to update plan");

  alert("✅ Plan Updated");
  loadGuilds();
}

// ================== RESET USAGE ==================
async function resetUsage(guildId) {
  const btn = document.getElementById(`btn-reset-${guildId}`);
  btn.disabled = true;

  const res = await fetch(`${API_URL}/staff/reset/${guildId}`, {
    method: "POST",
    headers: { Authorization: STAFF_TOKEN }
  });

  btn.disabled = false;
  if (!res.ok) return alert("❌ Reset failed");

  alert("♻️ Usage Reset");
  loadGuilds();
}

// ================== STAFF MANAGEMENT ==================
async function loginStaff() {
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
      <b>${s.username}</b><br>
      <small>Role: ${s.role}</small><br>
      <small>Created: ${new Date(s.createdAt).toLocaleString()}</small><br>
      <button onclick="deleteStaff('${s.username}')">Delete</button>
    `;

    container.appendChild(div);
  });
}

async function createStaff() {
  const username = document.getElementById("username")?.value;
  const role = document.getElementById("role")?.value;
  if (!username) return alert("Enter username");

  const res = await fetch(`${API_URL}/staff/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: STAFF_TOKEN
    },
    body: JSON.stringify({ username, role })
  });

  if (!res.ok) return alert("❌ Failed to create staff");

  const data = await res.json();
  alert(
    `✅ Staff Created\n\nUsername: ${data.staff.username}\nRole: ${data.staff.role}\nToken:\n${data.staff.token}`
  );

  loadStaff();
}

async function deleteStaff(username) {
  if (!confirm(`Delete ${username}?`)) return;

  await fetch(`${API_URL}/staff/delete/${username}`, {
    method: "DELETE",
    headers: { Authorization: STAFF_TOKEN }
  });

  loadStaff();
}