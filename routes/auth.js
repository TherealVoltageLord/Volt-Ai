const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const usersFilePath = path.join(__dirname, '../users.json');

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    const usersData = JSON.parse(fs.readFileSync(usersFilePath));
    const userExists = usersData.users.some(user => user.email === email);
    
    if (userExists) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    usersData.users.push(newUser);
    fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));
    
    res.status(201).json({ message: 'Registration successful', user: { id: newUser.id, username: newUser.username } });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const usersData = JSON.parse(fs.readFileSync(usersFilePath));
    const user = usersData.users.find(user => user.email === email);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ 
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
