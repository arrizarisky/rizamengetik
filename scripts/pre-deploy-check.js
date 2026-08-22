#!/usr/bin/env node

/**
 * Pre-Deployment Check Script
 * Validates that the project is ready for production deployment
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

let hasErrors = false;

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
  hasErrors = true;
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function section(title) {
  log(`\n${'='.repeat(50)}`, 'blue');
  log(title, 'blue');
  log('='.repeat(50), 'blue');
}

// Check 1: Required files exist
section('1. Checking Required Files');
const requiredFiles = [
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'index.html',
  'vercel.json',
  '.gitignore',
  '.env.example',
];

requiredFiles.forEach(file => {
  const filePath = join(rootDir, file);
  if (existsSync(filePath)) {
    success(`${file} exists`);
  } else {
    error(`${file} is missing`);
  }
});

// Check 2: .env should not be committed
section('2. Checking Git Status');
const gitignorePath = join(rootDir, '.gitignore');
if (existsSync(gitignorePath)) {
  const gitignoreContent = readFileSync(gitignorePath, 'utf-8');
  if (gitignoreContent.includes('.env')) {
    success('.env is in .gitignore');
  } else {
    error('.env is NOT in .gitignore - sensitive data may be exposed!');
  }
}

try {
  const gitStatus = execSync('git status --porcelain', { cwd: rootDir, encoding: 'utf-8' });
  if (gitStatus.includes('.env\n') || gitStatus.includes('.env ')) {
    error('.env file is tracked by git! Remove it immediately with: git rm --cached .env');
  } else {
    success('.env is not tracked by git');
  }
} catch (e) {
  warning('Git is not initialized or not available');
}

// Check 3: Environment variables in code
section('3. Checking Environment Variables Usage');
const filesToCheck = [
  'src/lib/supabase.ts',
  'src/lib/gemini.ts',
  'vite.config.ts',
];

filesToCheck.forEach(file => {
  const filePath = join(rootDir, file);
  if (existsSync(filePath)) {
    const content = readFileSync(filePath, 'utf-8');
    
    // Check for hardcoded sensitive data patterns
    const sensitivePatterns = [
      /apiKey\s*=\s*["'][A-Za-z0-9_-]{20,}["']/,
      /api_key\s*=\s*["'][A-Za-z0-9_-]{20,}["']/,
      /password\s*=\s*["'][^"']+["']/,
      /secret\s*=\s*["'][A-Za-z0-9_-]{20,}["']/,
    ];

    let hasSensitiveData = false;
    sensitivePatterns.forEach(pattern => {
      if (pattern.test(content)) {
        hasSensitiveData = true;
      }
    });

    if (hasSensitiveData) {
      warning(`${file} may contain hardcoded sensitive data`);
    }

    // Check for VITE_ prefix usage
    if (content.includes('import.meta.env.VITE_')) {
      success(`${file} uses VITE_ prefixed env vars`);
    } else if (content.includes('import.meta.env.')) {
      warning(`${file} uses env vars without VITE_ prefix - they won't be exposed to client`);
    }
  }
});

// Check 4: TypeScript compilation
section('4. Running TypeScript Check');
try {
  execSync('npm run lint', { cwd: rootDir, stdio: 'inherit' });
  success('TypeScript check passed');
} catch (e) {
  error('TypeScript check failed - fix errors before deploying');
}

// Check 5: Build test
section('5. Testing Production Build');
try {
  info('Running production build... (this may take a minute)');
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
  success('Production build successful');
  
  // Check if dist folder was created
  const distPath = join(rootDir, 'dist');
  if (existsSync(distPath)) {
    success('dist/ folder created');
  } else {
    error('dist/ folder not created after build');
  }
} catch (e) {
  error('Production build failed - fix errors before deploying');
}

// Check 6: Package.json validation
section('6. Validating package.json');
const packageJsonPath = join(rootDir, 'package.json');
if (existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  
  if (packageJson.scripts && packageJson.scripts.build) {
    success('Build script defined');
    if (packageJson.scripts.build.includes('tsc')) {
      success('Build script includes TypeScript check');
    } else {
      warning('Build script does not include TypeScript check (tsc)');
    }
  } else {
    error('Build script not defined in package.json');
  }

  if (packageJson.name && packageJson.name !== 'react-example') {
    success(`Package name: ${packageJson.name}`);
  } else {
    warning('Package name should be updated from default');
  }

  if (packageJson.version) {
    success(`Version: ${packageJson.version}`);
  }
}

// Check 7: Vercel configuration
section('7. Validating vercel.json');
const vercelJsonPath = join(rootDir, 'vercel.json');
if (existsSync(vercelJsonPath)) {
  try {
    const vercelConfig = JSON.parse(readFileSync(vercelJsonPath, 'utf-8'));
    
    if (vercelConfig.buildCommand) {
      success(`Build command: ${vercelConfig.buildCommand}`);
    }
    
    if (vercelConfig.outputDirectory) {
      success(`Output directory: ${vercelConfig.outputDirectory}`);
    }
    
    if (vercelConfig.rewrites && vercelConfig.rewrites.length > 0) {
      success('SPA rewrites configured for client-side routing');
    } else {
      warning('No rewrites configured - may cause 404 on route refresh');
    }
  } catch (e) {
    error('vercel.json is not valid JSON');
  }
}

// Final summary
section('Pre-Deployment Check Summary');

if (hasErrors) {
  log('\n❌ Pre-deployment check FAILED', 'red');
  log('Fix the errors above before deploying to production.', 'red');
  process.exit(1);
} else {
  log('\n✅ All checks PASSED!', 'green');
  log('Your project is ready for production deployment.', 'green');
  log('\nNext steps:', 'cyan');
  log('1. Commit and push your changes to Git', 'cyan');
  log('2. Connect your repository to Vercel', 'cyan');
  log('3. Add environment variables in Vercel Dashboard', 'cyan');
  log('4. Deploy! 🚀\n', 'cyan');
  process.exit(0);
}
