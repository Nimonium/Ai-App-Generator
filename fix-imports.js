const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      if (dirPath.endsWith('.ts') || dirPath.endsWith('.tsx')) {
        callback(dirPath);
      }
    }
  });
}

walkDir('./src', (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content.replace(/from\s+["'](\.\.\/)+(lib|components|server|app)\/(.*)["']/g, 'from "@/$2/$3"');
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Fixed', filePath);
  }
});
