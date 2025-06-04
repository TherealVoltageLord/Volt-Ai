const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../users.json');

// Middleware to check if admin (in a real app, you'd use proper authentication)
const isAdmin = (req, res, next) => {
  // This is a simplified check - in production use proper session/JWT validation
  if (req.headers['x-admin-key'] === 'ADMIN_SECRET_KEY') {
    return next();
  }
  res.status(403).json({ error: 'Access denied' });
};

router.use(isAdmin);

router.get('/users', (req, res) => {
  try {
    const usersData = JSON.parse(fs.readFileSync(usersFilePath));
    res.json(usersData.users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.put('/users/:id/status', (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  
  try {
    const usersData = JSON.parse(fs.readFileSync(usersFilePath));
    const userIndex = usersData.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    usersData.users[userIndex].isActive = isActive;
    fs.writeFileSync(usersFilePath, JSON.stringify(usersData, null, 2));
    
    res.json({ message: User ${isActive ? 'activated' : 'deactivated'} successfully });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

module.exports = router;
