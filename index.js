const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateUser, authorizeUser } = require('./middleware');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

//mongoose.connect(`mongodb://127.0.0.1:27017/auth`, {
    mongoose.connect('mongodb+srv://tempAcc:R8IsT7R8AVnoFDVD@cluster0.t7xrj2b.mongodb.net/testtesttest');   // useNewUrlParser: true,
    //useUnifiedTopologu: true,
    //useCreateIndex: true,
    //useFindAndModify: false,
;

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
});

userSchema.pre('save', async function (next) {
    const user = this;

    if (!user.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);

    user.password = hash,

    next();
});

const User = mongoose.model('User', userSchema);

app.post('/register', async (req, res) => {
    try { 
        const { email, password, role } = req.body;
       const roleSet = role ? role : "user";
    
        const user = new User({ email, password, role: roleSet });
        await user.save();
console.log(user);
        res.json({
            success: true,
            message: 'User registered successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'An error occured',
        });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password',
            });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, 'secret');

        res.json({
            success: true, 
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'An error occured',
        });
    }
});

app.get('/protected', authenticateUser, authorizeUser(['admin']), (req, res) => 
    res.json({
        success: true,
        message: 'You have accessed a protected resource',
    }));

    const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});