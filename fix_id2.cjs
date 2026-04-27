const fs = require('fs');

try {
  let db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
  
  // Also remove old u3 if it's there
  db.users = db.users.filter(u => u.id !== 'u3');
  
  // Replace u99 with u3
  const user = db.users.find(u => u.id === 'u99');
  if (user) user.id = 'u3';
  
  fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
  console.log('Fixed db.json id to u3');
} catch (e) {
  console.error(e);
}
