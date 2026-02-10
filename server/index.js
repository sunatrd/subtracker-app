require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize, Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- DATABASE SETUP ---
const sequelize = new Sequelize('postgres://admin:password123@localhost:5432/subtracker', { logging: false });
const User = require('./models/User')(sequelize);
const Contract = require('./models/Contract')(sequelize);

sequelize.sync({ alter: true }).then(() => console.log('DB Synced'));

// --- MIDDLEWARE: AUTHENTICATION ---
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);
    jwt.verify(token.split(' ')[1], 'SECRET_KEY', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- FILE UPLOAD SETUP (FR-09) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// --- NOTIFICATION ENGINE (FR-10, FR-11, FR-12) ---
// Runs every day at 9:00 AM
cron.schedule('0 9 * * *', async () => {
    console.log('Running Daily Expiry Check...');
    const today = new Date();
    
    // Find contracts expiring in 30, 7, or 1 days
    const contracts = await Contract.findAll({ where: { status: 'active' } });
    
    contracts.forEach(contract => {
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
        service: 'gmail', // Placeholder: Setup real SMTP in .env
        auth: { user: 'your-email@gmail.com', pass: 'your-password' }
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

// FR-01: Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(403).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user.id, email: user.email }, 'SECRET_KEY');
    res.json({ token });
});

// Register (Helper to create your first admin user)
app.post('/api/register', async (req, res) => {
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
    try {
        const user = await User.create({ email: req.body.email, password: hashedPassword });
        res.json(user);
    } catch(e) { res.status(500).json(e); }
});

// CRUD for Contracts
app.get('/api/contracts', authenticateToken, async (req, res) => {
    const contracts = await Contract.findAll({ order: [['renewalDate', 'ASC']] });
    res.json(contracts);
});

app.post('/api/contracts', authenticateToken, upload.single('attachment'), async (req, res) => {
    try {
        const data = JSON.parse(req.body.data); // FormData sends JSON as string
        if (req.file) data.attachmentPath = req.file.filename;
        
        const newContract = await Contract.create(data);
        res.json(newContract);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/contracts/:id', authenticateToken, async (req, res) => {
    await Contract.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
});

app.listen(5000, () => console.log('Server running on 5000'));