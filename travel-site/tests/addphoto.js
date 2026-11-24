// The route-photo helper: swaps a card's illustration for a real photo, strips camera metadata, refuses bad input.
// Needs Python's Pillow; skips (with a note) where it is not installed, e.g. a bare CI runner.
const assert = require('assert'); const { spawnSync } = require('child_process'); const fs = require('fs'); const os = require('os'); const path = require('path');
const ROOT = path.join(__dirname, '..'); const py = (...a) => spawnSync('python3', a, { encoding: 'utf8' });
if (py('-c', 'import PIL').status !== 0) { console.log('ADDPHOTO SKIPPED: Pillow is not installed (pip install pillow)'); process.exit(0); }
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'photo-')); const site = path.join(tmp, 'site'); fs.mkdirSync(path.join(site, 'img'), { recursive: true });
fs.copyFileSync(path.join(ROOT, 'index.html'), path.join(site, 'index.html'));
// a 1600x900 test photo carrying fake EXIF GPS data, to prove the metadata is removed
const make = py('-c', `
from PIL import Image
im = Image.new('RGB', (1600, 900), (200, 120, 60)); ex = im.getexif(); ex[0x010F] = 'TestCam'; ex[0x8825] = {1: 'N'}
im.save(r'${path.join(tmp, 'photo.jpg')}', exif=ex)`); assert.equal(make.status, 0, make.stderr);
const run = (...a) => py(path.join(ROOT, 'tools', 'add_route_photo.py'), '--root', site, ...a);
let r = run('rajasthan', path.join(tmp, 'photo.jpg'), '--alt', 'Camels crossing dunes near Jaisalmer at sunset'); assert.equal(r.status, 0, r.stderr + r.stdout);
const html = fs.readFileSync(path.join(site, 'index.html'), 'utf8'); const card = html.match(/<div class="art" data-photo="rajasthan">.*?<div class="postmark">/s)[0];
assert(card.includes('img/trip-rajasthan-800.webp') && card.includes('Camels crossing dunes near Jaisalmer at sunset') && !card.includes('<svg'), 'the illustration is replaced by the photo');
const check = py('-c', `
from PIL import Image
for w in (480, 800):
    im = Image.open(r'${path.join(site, 'img')}/trip-rajasthan-%d.webp' % w); assert im.size == (w, round(w * 10 / 16)), im.size; assert not im.getexif() and 'exif' not in im.info, 'metadata survived'
print('ok')`); assert.equal(check.status, 0, check.stderr);
assert.notEqual(run('nowhere', path.join(tmp, 'photo.jpg'), '--alt', 'A valid description here').status, 0, 'unknown route refused');
assert.notEqual(run('rajasthan', path.join(tmp, 'missing.jpg'), '--alt', 'A valid description here').status, 0, 'missing file refused');
assert.notEqual(run('rajasthan', path.join(tmp, 'photo.jpg'), '--alt', 'short').status, 0, 'too-short description refused');
py('-c', `from PIL import Image; Image.new('RGB',(300,200)).save(r'${path.join(tmp, 'small.jpg')}')`); assert.notEqual(run('rajasthan', path.join(tmp, 'small.jpg'), '--alt', 'A valid description here').status, 0, 'low-resolution photo refused');
fs.rmSync(tmp, { recursive: true, force: true }); console.log('ADDPHOTO OK: card swapped, two sizes at 16:10, metadata removed, bad input refused');
