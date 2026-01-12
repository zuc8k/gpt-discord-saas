const API_URL = "http://localhost:3001"; // عدّل لو السيرفر مختلف

let STAFF_TOKEN = null;
let STAFF_ROLE = null;

// ================== LOGIN ==================
async function login() {
  const token = document.getElementById("token").value;
  if (!token) return alert("Enter STAFF TOKEN");

  const res = await fetch(`${API_URL}/staff/me`, {
    headers: { Authorization: token }
  });

  if (!res.ok) {
    return alert("❌ Invalid Staff Token");
  }

  const data = await res.json();
  STAFF_TOKEN = token;
  STAFF_ROLE = data.role;

  document.getElementById("info").innerHTML =
    `👤 <b>${data.username}</b> | 🔑 Role: <b>${data.role}</b>`;

  loadGuilds();
}

// ================== LOAD GUILDS ==================
async function loadGuilds() {
  const res = await fetch(`${API_URL}/admin/guilds`, {
    headers: { Authorization: STAFF_TOKEN }
  });

  if (!res.ok) {
    return alert("❌ Access denied");
  }

  const guilds = await res.json();
  const container = document.getElementById("guilds");
  container.innerHTML = "";

  guilds.forEach(g => {
    const div = document.createElement("div");
    div.className = "card";

    let actions = "";

    // OWNER + ADMIN → تغيير باقة
    if (STAFF_ROLE === "OWNER" || STAFF_ROLE === "ADMIN") {
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

        <button onclick="updatePlan('${g.guildId}')">Update Plan</button>
      `;
    }

    // SUPPORT + ADMIN + OWNER → Reset
    if (["OWNER", "ADMIN", "SUPPORT"].includes(STAFF_ROLE)) {
      actions += `
        <button onclick="resetUsage('${g.guildId}')">Reset Usage</button>
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
  });
}

// ================== UPDATE PLAN ==================
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

  if (!res.ok) {
    return alert("❌ Failed to update plan");
  }

  alert("✅ Plan Updated");
  loadGuilds();
}

// ================== RESET USAGE ==================
async function resetUsage(guildId) {
  const res = await fetch(`${API_URL}/staff/reset/${guildId}`, {
    method: "POST",
    headers: { Authorization: STAFF_TOKEN }
  });

  if (!res.ok) {
    return alert("❌ Reset failed");
  }

  alert("♻️ Usage Reset");
  loadGuilds();
}