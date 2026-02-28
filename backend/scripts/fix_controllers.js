import fs from 'fs';
import path from 'path';

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // Replace (req, res) with (req: Request, res: Response)
    content = content.replace(/\(req, res\)/g, '(req: Request, res: Response)');
    // Replace (req, res, next)
    content = content.replace(/\(req, res, next\)/g, '(req: Request, res: Response, next: NextFunction)');
    // Replace async (req, res)
    content = content.replace(/async\s*\(\s*req,\s*res\s*\)/g, 'async (req: Request, res: Response)');
    content = content.replace(/async\s+function\s*\(\s*req,\s*res\s*\)/g, 'async function(req: Request, res: Response)');

    // Inject import ONLY if we replaced something and it's not already there
    if (content !== original) {
        if (!content.includes("import { Request, Response")) {
            const hasNext = content.includes('NextFunction');
            const importStr = hasNext
                ? "import { Request, Response, NextFunction } from 'express';\n"
                : "import { Request, Response } from 'express';\n";
            content = importStr + content;
        }
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log('Fixed:', filePath);
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
    path.join(process.cwd(), 'services')
];

for (const p of targetDirs) {
    if (fs.existsSync(p)) {
        processDir(p);
    }
}

console.log('Batch fix finished!');
