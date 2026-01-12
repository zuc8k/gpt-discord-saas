import { useEffect, useState } from "react";

export default function Dashboard() {
  const [guild, setGuild] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/api/guild/YOUR_GUILD_ID")
      .then(res => res.json())
      .then(setGuild);
  }, []);

  if (!guild) return <p>Loading...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h2>📊 Server Info</h2>

      <p><b>Plan:</b> {guild.plan}</p>
      <p><b>Usage:</b> {guild.usedLines} / {guild.monthlyLimit}</p>
      <p><b>Expires:</b> {new Date(guild.expiresAt).toLocaleDateString()}</p>
    </div>
  );
}