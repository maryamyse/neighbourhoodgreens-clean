const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const helper = `
function extractToken(req: any) {
  let token = req.params?.token || req.headers?.authorization;
  if (token && typeof token === 'string' && token.startsWith('Bearer ')) {
    token = token.replace('Bearer ', '');
  }
  if (!token || token === 'null' || token === 'undefined') return null;
  return token;
}
`;

code = code.replace('// API Routes', helper + '\n// API Routes');

// Replace standard boilerplate
code = code.replace(/const token = req\.headers\.authorization\?\.replace\('Bearer ', ''\);\s+if \(!token\) return res\.status\(401\)\.json\({ detail: '(.*?)' }\);/g, 
  "const token = extractToken(req);\n  if (!token) return res.status(401).json({ detail: '$1' });");

// Replace the larger ones
code = code.replace(/let token = req\.params\.token \|\| req\.headers\.authorization;\s+if \(token && token\.startsWith\('Bearer '\)\) \{\s+token = token\.replace\('Bearer ', ''\);\s+\}\s+console\.log\('\[Auth Profile Endpoint\] Received token:', token\);\s+if \(!token \|\| token === 'null' \|\| token === 'undefined'\) \{\s+console\.error\('\[Auth Profile\] No valid token provided'\);\s+return res\.status\(401\)\.json\(\{ detail: 'Authentication credentials were not provided\.' \}\);\s+\}/g,
  "const token = extractToken(req);\n  console.log('[Auth Profile Endpoint] Received token:', token);\n\n  if (!token) {\n    console.error('[Auth Profile] No valid token provided');\n    return res.status(401).json({ detail: 'Authentication credentials were not provided.' });\n  }");

code = code.replace(/let token = req\.params\.token \|\| req\.headers\.authorization;\s+if \(token && token\.startsWith\('Bearer '\)\) token = token\.replace\('Bearer ', ''\);\s+if \(!token \|\| token === 'null' \|\| token === 'undefined'\) \{\s+return res\.status\(401\)\.json\(\{ detail: 'Authentication credentials were not provided\.' \}\);\s+\}/g,
  "const token = extractToken(req);\n  if (!token) {\n    return res.status(401).json({ detail: 'Authentication credentials were not provided.' });\n  }");

fs.writeFileSync('server.ts', code);
console.log('rewritten');
