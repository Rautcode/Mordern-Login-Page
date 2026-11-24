const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const regex = /(?:src|poster)=["']([^"']+\.(?:webp|png|svg|jpg|mp4|webm))["']/g;
let match;
const files = new Set();
while ((match = regex.exec(content)) !== null) {
  files.add(match[1]);
}
console.log('Referenced media files:');
let missingCount = 0;
for (const file of files) {
  const p = path.join(__dirname, '..', file);
  const exists = fs.existsSync(p);
  console.log(file, '->', exists ? 'OK' : 'MISSING');
  if (!exists) missingCount++;
}
if (missingCount === 0) {
  console.log('All media files verified successfully!');
} else {
  console.log(`Warning: ${missingCount} files missing`);
}
