const API_URL = "http://localhost:3000/admin"; // عدّل لو السيرفر مختلف

async function loadGuilds() {
  const token = document.getElementById("token").value;
  if (!token) return alert("Enter Admin Token");

  const res = await fetch(`${API_URL}/guilds`, {
    headers: {
      Authorization: token
    }
  });

  if (!res.ok) {
    return alert("Unauthorized");
  }

  const guilds = await res.json();
  const container = document.getElementById("guilds");
  container.innerHTML = "";

  guilds.forEach(g => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <b>Guild ID:</b> ${g.guildId}<br>
      <small>Plan: ${g.plan}</small><br>
      <small>Daily: ${g.usedDailyLines}/${g.dailyLimit}</small><br>
      <small>Monthly: ${g.usedLines}/${g.monthlyLimit}</small><br><br>

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
      <button onclick="resetUsage('${g.guildId}')">Reset Usage</button>
    `;

    container.appendChild(div);
  });
}

async function updatePlan(guildId) {
  const token = document.getElementById("token").value;
  const plan = document.getElementById(`plan-${guildId}`).value;
  const duration = document.getElementById(`duration-${guildId}`).value;

  await fetch(`${API_URL}/guild/${guildId}/plan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token
    },
    body: JSON.stringify({ plan, duration })
  });

  alert("Plan Updated");
  loadGuilds();
}

async function resetUsage(guildId) {
  const token = document.getElementById("token").value;

  await fetch(`${API_URL}/guild/${guildId}/reset`, {
    method: "POST",
    headers: {
      Authorization: token
    }
  });

  alert("Usage Reset");
  loadGuilds();
}