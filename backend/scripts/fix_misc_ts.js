import fs from 'fs';
import path from 'path';

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // Catches
    content = content.replace(/catch\s*\(\s*error\s*\)/g, 'catch (error: any)');
    content = content.replace(/catch\s*\(\s*err\s*\)/g, 'catch (err: any)');
    content = content.replace(/catch\s*\(\s*e\s*\)/g, 'catch (e: any)');

    // Common callbacks/params
    content = content.replace(/\(payload\)\s*=>/g, '(payload: any) =>');
    content = content.replace(/\(\s*user\s*\)\s*=>/g, '(user: any) =>');
    content = content.replace(/\(\s*id\s*\)\s*=>/g, '(id: string) =>');
    content = content.replace(/\(\s*doc\s*\)\s*=>/g, '(doc: any) =>');
    content = content.replace(/function\s*\(\s*err\s*\)/g, 'function(err: any)');
    content = content.replace(/\(\s*err\s*,\s*result\s*\)\s*=>/g, '(err: any, result: any) =>');
    content = content.replace(/\(\s*req,\s*file,\s*cb\s*\)/g, '(req: any, file: any, cb: any)');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log('Fixed implicit any in:', filePath);
    }
}

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.ts')) {
            fixFile(fullPath);
        }
    }
}

const targetDirs = [
    path.join(process.cwd(), 'controllers'),
    path.join(process.cwd(), 'routes'),
    path.join(process.cwd(), 'src', 'routes'),
    path.join(process.cwd(), 'services'),
    path.join(process.cwd(), 'src', 'utils')
];

for (const p of targetDirs) {
    if (fs.existsSync(p)) {
        processDir(p);
    }
}

console.log('Implicit any batch fix finished!');
