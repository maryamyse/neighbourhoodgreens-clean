const fs = require('fs');

try {
  let db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
  
  // Replace u_admin_mary with u99
  const user = db.users.find(u => u.id === 'u_admin_mary');
  if (user) user.id = 'u99';
  
  fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
  console.log('Fixed db.json id');
} catch (e) {
  console.error(e);
}
