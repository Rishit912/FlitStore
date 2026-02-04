const express = require('express');
const router = express.Router();

const {
    registerUser,
    authUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');    



// Route to authenticate user and get token
router.post('/login', authUser);
// Route to register a new user
router.post('/', registerUser);


module.exports = router;