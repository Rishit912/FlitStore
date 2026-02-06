const bcrypt = require('bcryptjs');

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123', // We will encrypt this in the script
    isAdmin: true,
    isVerified: true, // Admin is already verified
  },
  {
    name: 'Admin Dangir',
    email: 'dangirishit912@gmail.com',
    password: 'password123',
    isAdmin: true,
    isVerified: true,
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    isAdmin: false,
    isVerified: false,
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    isAdmin: false,
    isVerified: false,
  },
];

module.exports = users;