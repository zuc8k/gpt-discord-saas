const router = require("express").Router();
const { createCheckout } = require("../services/stripe");

router.post("/stripe", async (req, res) => {
  const session = await createCheckout(req.body);
  res.json({ url: session.url });
});

module.exports = router;