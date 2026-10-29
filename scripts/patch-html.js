// Runs after `expo export`. Adds the tags that the Expo template does not write:
// the home-screen manifest and icon, and "noindex" so search engines skip the trainee app.
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'dist', 'index.html');
let html = fs.readFileSync(file, 'utf8');

const tags = [
  '<meta name="robots" content="noindex, nofollow">',
  '<link rel="manifest" href="/manifest.webmanifest">',
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
  '<meta name="mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-capable" content="yes">',
  '<meta name="apple-mobile-web-app-title" content="Stage">',
  '<meta name="apple-mobile-web-app-status-bar-style" content="default">',
].join('\n');

if (!html.includes('</head>')) throw new Error('dist/index.html has no </head>');
html = html.replace('</head>', tags + '\n</head>');
fs.writeFileSync(file, html);
console.log('Patched dist/index.html');
