const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://seekmebackend:Shane@new.xgeymob.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Models
const User = require('./models/user');
const Job = require('./models/job');

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Routes
app.get('/', async (req, res) => {
    const { user } = req.session;
    let jobs = [];

    if (user) {
        jobs = await Job.find({ city: user.city }); // Fetching jobs only in the same location as the user
    }

    res.render('index', { jobs, user });
});

app.get('/dashboard', async (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else {
        const userJobs = await Job.find({ userId: req.session.user._id });
        const cityJobs = await Job.find({ city: req.session.user.city });
        res.render('dashboard', { user: req.session.user, userJobs, cityJobs });
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = user;
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    const { name, email, password, city } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, city: city.toLowerCase() }); // Convert city to lowercase
    await newUser.save();
    res.redirect('/login');
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/job/:id', async (req, res) => {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    res.render('job-details', { job });
});

app.post('/post-job', async (req, res) => {
    const { title, description, phoneNumber, address, price, availability, city } = req.body;
    const user = await User.findById(req.session.user._id);
    
    if (!user) {
        return res.redirect('/login');
    }

    const newJob = new Job({ 
        title, 
        description, 
        userId: user._id, 
        city: city.toLowerCase(), // Convert city to lowercase
        phoneNumber,
        address,
        price,
        availability,
        posterName: user.name // Saving the name of the poster along with the job
    });

    await newJob.save();
    res.redirect('dashboard'); // Redirecting to the index page after posting the job
});

// Start server
const PORT = process.env.PORT || 10000; // Use the specified port or default to 10000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
