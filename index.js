import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { User } from './models/User.js';
import { Note } from './models/Note.js';
import validateToken from './middlewares/JWT.js';

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: 'https://todolist-iypm.onrender.com',
    optionSuccessStatus: 200,
  })
);
dotenv.config();
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);

mongoose.connect(
  'mongodb+srv://adelsamy984:08iQI2qHWISnPtbt@cluster0.gws79sb.mongodb.net/?retryWrites=true&w=majority'
);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});
app.post('/register', async (req, res) => {
  console.log(req.body);
  const { username, email, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
    const createdUser = await User.create({
      username,
      password: hashedPassword,
      email,
    });
    jwt.sign({ id: createdUser._id }, jwtSecret, {}, (err, token) => {
      if (err) throw err;
      res.cookie('token', token).status(201).json({
        id: createdUser._id,
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  const foundUser = await User.findOne({ email });
  if (foundUser) {
    const passOk = bcrypt.compareSync(password, foundUser.password);
    if (passOk) {
      jwt.sign({ id: foundUser._id }, jwtSecret, {}, (err, token) => {
        res.cookie('token', token).json({
          id: foundUser._id,
        });
      });
    }
  }
});
app.get('/profile', validateToken, (req, res) => {
  //res.json('profile');
});

app.post('/logout', (req, res) => {
  res.cookie('token', '').json('ok');
});

app.get('/getUser/:id', async (req, res) => {
  const { id } = req.params;
  const foundUser = await User.findById({ _id: id }).populate('notes');
  //console.log(foundUser);
  res.status(200).json({ user: foundUser });
});

app.post('/addTask', async (req, res) => {
  const { newTask, deadline, userId } = req.body;
  console.log(newTask, deadline, userId);
  const date = deadline.split('-');
  const reverseDeadline = `${date[2]}-${date[1]}-${date[0]}`;
  console.log(reverseDeadline);
  try {
    const addTask = await Note.create({
      body: newTask,
      deadline: reverseDeadline,
      status: 'panding',
    });
    const user = await User.findById({ _id: userId });
    user.notes.push(addTask);
    await user.save();
    res.status(201).json({ message: 'Added Successfully' });
  } catch (error) {
    console.log(error);
  }
});
app.put('/completeTask', async (req, res) => {
  const { noteId } = req.body;
  try {
    const task = await Note.findByIdAndUpdate(
      { _id: noteId },
      { status: 'completed' }
    );
    res.status(200).json({ message: 'Completed' });
  } catch (error) {
    console.log(error);
  }
});

app.delete('/deleteTask/:userId&:noteId', async (req, res) => {
  const { userId, noteId } = req.params;
  console.log(userId, noteId);
  try {
    const user = await User.findByIdAndUpdate(
      { _id: userId },
      { $pull: { notes: noteId } }
    );
    const task = await Note.findByIdAndDelete({ _id: noteId });
    res.status(200).json({ message: 'Deleted' });
  } catch (error) {
    console.log(error);
  }
});

app.listen(3000, () => {
  try {
    console.log('Server Running on 3000.');
  } catch (error) {
    console.log(error);
  }
});
