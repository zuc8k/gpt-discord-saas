const router = require("express").Router();
const axios = require("axios");

router.get("/login", (req, res) => {
  const redirect = 
    `https://discord.com/oauth2/authorize` +
    `?client_id=${process.env.CLIENT_ID}` +
    `&redirect_uri=${process.env.REDIRECT_URI}` +
    `&response_type=code` +
    `&scope=identify guilds`;

  res.redirect(redirect);
});

router.get("/callback", async (req, res) => {
  const code = req.query.code;

  const data = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.REDIRECT_URI
  });

  const tokenRes = await axios.post(
    "https://discord.com/api/oauth2/token",
    data
  );

  res.json(tokenRes.data);
});

module.exports = router;