// Prints brand.json as ONE line, ready to paste into Vercel as the BRAND_JSON environment variable.
// Run from travel-site/:  node tools/brand_env.js brand.json
const fs = require('fs'); const f = process.argv[2] || 'brand.json';
try { console.log(JSON.stringify(JSON.parse(fs.readFileSync(f, 'utf8')))); } catch (e) { console.error('cannot read ' + f + ': ' + e.message); process.exit(1); }
