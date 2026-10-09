const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\casa\\.gemini\\antigravity-ide\\brain\\3d29defc-0c7c-4ca4-9043-52b696fb9f61';
const destDir = 'c:\\Users\\casa\\Desktop\\telegram miniapp\\public\\assets\\fighter';

const files = [
  ['enemy_ninja_idle_1791511924731.jpg', 'enemy_ninja_idle.png'],
  ['enemy_ninja_attack_1791511943894.jpg', 'enemy_ninja_attack.png'],
  ['enemy_brawler_attack_1791511995784.jpg', 'enemy_brawler_attack.png'],
  ['enemy_samurai_idle_1791512022482.jpg', 'enemy_samurai_idle.png'],
  ['enemy_samurai_attack_1791512068281.jpg', 'enemy_samurai_attack.png'],
  ['enemy_beast_idle_1791512106029.jpg', 'enemy_beast_idle.png'],
];

files.forEach(([srcName, destName]) => {
  const srcPath = path.join(srcDir, srcName);
  const destPath = path.join(destDir, destName);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${srcName} -> ${destName}`);
  } else {
    console.error(`Source file missing: ${srcPath}`);
  }
});
