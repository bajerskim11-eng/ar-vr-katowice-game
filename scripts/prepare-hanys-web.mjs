import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync, cpSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const target = join(root, 'public', 'hanys-3d');
const tmp = '/tmp/image-to-mesh-web';

rmSync(tmp, { recursive: true, force: true });
rmSync(target, { recursive: true, force: true });
mkdirSync(join(root, 'public'), { recursive: true });

execFileSync('git', ['clone', '--depth', '1', 'https://github.com/tomosud/Image_to_Mesh_web.git', tmp], { stdio: 'inherit' });
mkdirSync(target, { recursive: true });
cpSync(join(tmp, 'index.html'), join(target, 'index.html'));
cpSync(join(tmp, 'css'), join(target, 'css'), { recursive: true });
cpSync(join(tmp, 'js'), join(target, 'js'), { recursive: true });

const indexPath = join(target, 'index.html');
let html = readFileSync(indexPath, 'utf8');
const autoLoad = `\n<script>\n(async function autoLoadHanys(){\n  const URL = 'https://cdn.shopify.com/s/files/1/1019/1903/1622/files/hanys.jpg?v=1787742427';\n  const start = async () => {\n    try {\n      const input = document.getElementById('fileInput');\n      if (!input) return;\n      const response = await fetch(URL, { mode: 'cors', cache: 'no-store' });\n      if (!response.ok) throw new Error('Hanys image HTTP ' + response.status);\n      const blob = await response.blob();\n      const file = new File([blob], 'hanys.jpg', { type: blob.type || 'image/jpeg' });\n      const transfer = new DataTransfer();\n      transfer.items.add(file);\n      input.files = transfer.files;\n      input.dispatchEvent(new Event('change', { bubbles: true }));\n    } catch (error) {\n      console.error('Automatic Hanys load failed', error);\n      const hint = document.getElementById('dropText');\n      if (hint) hint.textContent = 'Hanys — kliknij tutaj, aby uruchomić generator 3D';\n    }\n  };\n  window.addEventListener('load', () => setTimeout(start, 1200));\n})();\n</script>\n`;
html = html.replace('</body>', autoLoad + '</body>');
html = html.replace('<title>Image to Mesh — World Position Viewer</title>', '<title>Hanys 3D — Bebok AI</title>');
writeFileSync(indexPath, html);
console.log('Prepared Hanys 3D browser generator at /hanys-3d/');
