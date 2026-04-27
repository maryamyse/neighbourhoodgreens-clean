const fs = require('fs');

try {
  const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
  
  // Remove all instances of maryambasa06@gmail.com
  db.users = db.users.filter(u => u.email !== 'maryambasa06@gmail.com');
  
  // Add exactly one admin
  db.users.push({
    "id": "u_admin_mary",
    "email": "maryambasa06@gmail.com",
    "password": "Ambasa1928",
    "role": "admin",
    "firstName": "Mary",
    "lastName": "Ambasa",
    "isVerified": true
  });
  
  fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
  console.log('Fixed db.json admin users');
} catch (e) {
  console.error(e);
}
