import { build } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { cpSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = resolve(__dirname, 'dist');

// Build each entry point as a self-contained IIFE bundle
const entries = [
  { name: 'content', input: 'src/content/content.js', format: 'iife' },
  { name: 'background', input: 'src/background/background.js', format: 'iife' },
  { name: 'popup', input: 'src/popup/popup.js', format: 'iife' },
];

for (let i = 0; i < entries.length; i++) {
  const { name, input, format } = entries[i];
  await build({
    configFile: false,
    build: {
      outDir: dist,
      emptyOutDir: i === 0, // only clear on first build
      minify: true,
      lib: {
        entry: resolve(__dirname, input),
        name,
        fileName: () => `${name}.js`,
        formats: [format === 'iife' ? 'iife' : 'es'],
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
    },
    logLevel: 'warn',
  });
  console.log(`  Built ${name}.js`);
}

// Copy static files
mkdirSync(resolve(dist, 'assets/icons'), { recursive: true });

cpSync(resolve(__dirname, 'src/manifest.json'), resolve(dist, 'manifest.json'));
cpSync(resolve(__dirname, 'src/content/content.css'), resolve(dist, 'content.css'));
cpSync(resolve(__dirname, 'src/popup/popup.html'), resolve(dist, 'popup.html'));

for (const size of [16, 48, 128]) {
  cpSync(
    resolve(__dirname, `src/assets/icon-${size}.png`),
    resolve(dist, `assets/icons/icon-${size}.png`),
  );
}

console.log('  Copied static files');
console.log('Done! Load dist/ as unpacked extension in Chrome.');
