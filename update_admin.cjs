const fs = require('fs');

// Update db.json
try {
  if (fs.existsSync('db.json')) {
    const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
    const admin = db.users.find(u => u.role === 'admin');
    if (admin) {
      admin.email = 'maryambasa06@gmail.com';
      admin.password = 'Ambasa1928';
      admin.firstName = 'Mary';
      admin.lastName = 'Ambasa';
      fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
      console.log('Updated db.json');
    }
  }
} catch (e) {
  console.error(e);
}
