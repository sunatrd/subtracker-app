require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Sequelize, Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- DATABASE SETUP ---
const sequelize = new Sequelize(
  "postgres://admin:password123@localhost:5432/subtracker",
  { logging: false },
);
const User = require("./models/User")(sequelize);
const Contract = require("./models/Contract")(sequelize);

// Define the relationship
User.hasMany(Contract, { foreignKey: "userId" });
Contract.belongsTo(User, { foreignKey: "userId" });

// IMPORTANT: Use force: true ONCE to update the table structure, then change back to alter: true
sequelize.sync({ alter: true }).then(() => console.log("DB Synced"));

// --- MIDDLEWARE: AUTHENTICATION ---
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.sendStatus(401);
  jwt.verify(token.split(" ")[1], "SECRET_KEY", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- FILE UPLOAD SETUP (FR-09) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// --- NOTIFICATION ENGINE (FR-10, FR-11, FR-12) ---
// Runs every day at 9:00 AM
cron.schedule("0 9 * * *", async () => {
  console.log("Running Daily Expiry Check...");
  const today = new Date();

  // Find contracts expiring in 30, 7, or 1 days
  const contracts = await Contract.findAll({ where: { status: "active" } });

  contracts.forEach((contract) => {
    const renewal = new Date(contract.renewalDate);
    const diffTime = renewal - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if ([30, 7, 1].includes(diffDays)) {
      sendEmailAlert(contract, diffDays);
    }
  });
});

async function sendEmailAlert(contract, daysLeft) {
  // NOTE: For Production, use a real SMTP service like SendGrid or AWS SES
  let transporter = nodemailer.createTransport({
    service: "gmail", // Placeholder: Setup real SMTP in .env
    auth: { user: "your-email@gmail.com", pass: "your-password" },
  });

  const message = `
        Subject: ACTION REQUIRED: ${contract.name} expires in ${daysLeft} days
        Item: ${contract.name}
        Cost: ${contract.amount} ${contract.currency}
        Renewal Date: ${contract.renewalDate}
        Action Required: Please login to review.
    `;

  console.log(`[Mock Email] Sending alert for ${contract.name}`);
  // await transporter.sendMail({ from: 'admin@subtracker.com', to: contract.owner, subject: ..., text: ... });
}

// --- API ROUTES ---

// --- AUTHENTICATION ROUTES (Public) ---

// Register
app.post("/api/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    // Hash the password before saving
    const hashedPassword = bcrypt.hashSync(password, 8);
    const user = await User.create({ email, password: hashedPassword });
    res.json({
      message: "User registered successfully",
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    // Handle "Email already exists" error
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });

    // Check if user exists AND password matches
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(403).json({ error: "Invalid email or password" });
    }

    // Generate Token
    const token = jwt.sign({ id: user.id, email: user.email }, "SECRET_KEY");
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------

// 1. GET: Fetch ONLY the logged-in user's contracts
app.get("/api/contracts", authenticateToken, async (req, res) => {
  try {
    const contracts = await Contract.findAll({
      where: { userId: req.user.id }, // <--- FILTER HERE
      order: [["renewalDate", "ASC"]],
    });
    res.json(contracts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST: Create a contract attached to the user
app.post(
  "/api/contracts",
  authenticateToken,
  upload.single("attachment"),
  async (req, res) => {
    try {
      const data = JSON.parse(req.body.data);

      delete data.id;

      // <--- ATTACH USER ID FROM TOKEN
      data.userId = req.user.id;

      if (req.file) data.attachmentPath = req.file.filename;

      const newContract = await Contract.create(data);
      res.json(newContract);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  },
);

// 3. PUT: Update (Securely)
app.put(
  "/api/contracts/:id",
  authenticateToken,
  upload.single("attachment"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const data = JSON.parse(req.body.data);

      // Find contract ensuring it belongs to THIS user
      const existing = await Contract.findOne({
        where: { id: id, userId: req.user.id }, // <--- SECURITY CHECK
      });

      if (!existing)
        return res.status(404).json({ error: "Not found or unauthorized" });

      if (req.file) data.attachmentPath = req.file.filename;
      else data.attachmentPath = existing.attachmentPath;

      await Contract.update(data, { where: { id } });
      res.json({ message: "Updated successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

// 4. DELETE: Delete (Securely)
app.delete("/api/contracts/:id", authenticateToken, async (req, res) => {
  try {
    const deleted = await Contract.destroy({
      where: { id: req.params.id, userId: req.user.id }, // <--- SECURITY CHECK
    });

    if (!deleted)
      return res.status(404).json({ error: "Not found or unauthorized" });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log("Server running on 5000"));
