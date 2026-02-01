const fs = require('fs');
const path = require('path');

const requiredFiles = [
    'package.json',
    'packages/agent/package.json',
    'packages/agent/src/index.ts',
    'packages/agent/src/system/audio.ts',
    'packages/agent/scripts/install-service.js',
    'packages/dashboard/package.json',
    'packages/dashboard/Dockerfile',
    'packages/dashboard/src/App.tsx'
];

let missing = [];

console.log('Verifying project structure...');
requiredFiles.forEach(file => {
    const fullPath = path.resolve(__dirname, file);
    if (fs.existsSync(fullPath)) {
        console.log(`[OK] ${file}`);
    } else {
        console.error(`[MISSING] ${file}`);
        missing.push(file);
    }
});

if (missing.length === 0) {
    console.log('\nSUCCESS: All critical files are present.');
    process.exit(0);
} else {
    console.error('\nFAILURE: Some files are missing.');
    process.exit(1);
}
