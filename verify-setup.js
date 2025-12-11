#!/usr/bin/env node

/**
 * HLPFL.io Setup Verification Script
 * Verifies that all components are configured correctly for hlpfl.io deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 HLPFL.io Setup Verification\n');

// Configuration to verify
const checks = [
  {
    name: 'React Component API URL',
    file: 'components/ChatWidget.jsx',
    pattern: /apiUrl\s*=\s*['"](https:\/\/hlpfl\.io\/api\/chat)['"]/
  },
  {
    name: 'Vue Component API URL',
    file: 'components/ChatWidget.vue',
    pattern: /default:\s*['"](https:\/\/hlpfl\.io\/api\/chat)['"]/
  },
  {
    name: 'Universal Widget API URL',
    file: 'chat-widget.js',
    pattern: /this\.apiUrl\s*=\s*options\.apiUrl\s*\|\|\s*['"](https:\/\/hlpfl\.io\/api\/chat)['"]/
  },
  {
    name: 'Production Route Configuration',
    file: 'wrangler.toml',
    pattern: /pattern\s*=\s*["]hlpfl\.io\/api\/\*["]/
  },
  {
    name: 'Staging Route Configuration',
    file: 'wrangler.toml',
    pattern: /pattern\s*=\s*["]staging\.hlpfl\.io\/api\/\*["]/
  },
  {
    name: 'Zone Configuration',
    file: 'wrangler.toml',
    pattern: /zone_name\s*=\s*["]hlpfl\.io["]/
  },
  {
    name: 'Deployment Script Exists',
    file: 'deploy-hlpfl-io.sh',
    pattern: /hlpfl\.io/
  },
  {
    name: 'GitHub Actions Workflow',
    file: '.github/workflows/deploy.yml',
    pattern: /hlpfl\.io/
  }
];

let allPassed = true;

// Run each check
checks.forEach((check, index) => {
  try {
    const content = fs.readFileSync(path.join(__dirname, check.file), 'utf8');
    const passed = check.pattern.test(content);
    
    if (passed) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name}`);
      console.log(`   File: ${check.file}`);
      allPassed = false;
    }
  } catch (error) {
    console.log(`❌ ${check.name} (File not found: ${check.file})`);
    allPassed = false;
  }
});

console.log('\n📋 Summary:');
if (allPassed) {
  console.log('🎉 All checks passed! Your setup is ready for hlpfl.io deployment.');
  console.log('\n🚀 Next Steps:');
  console.log('1. Add CLOUDFLARE_API_TOKEN to GitHub secrets');
  console.log('2. Push to main branch to trigger deployment');
  console.log('3. Verify at https://hlpfl.io/api/health');
  console.log('4. Test: curl https://hlpfl.io/api/chat');
} else {
  console.log('⚠️  Some checks failed. Please review and fix the issues above.');
  console.log('\n🔧 Quick Fix:');
  console.log('1. Ensure all API URLs point to https://hlpfl.io/api/chat');
  console.log('2. Update wrangler.toml routes for hlpfl.io/api/*');
  console.log('3. Verify deployment scripts are up to date');
}

// Check deployment prerequisites
console.log('\n🔍 Deployment Prerequisites:');
console.log('□ Cloudflare account with hlpfl.io domain');
console.log('□ Cloudflare API token created');
console.log('□ DNS configured for hlpfl.io');
console.log('□ GitHub secrets configured');
console.log('□ Worker script syntax valid');

console.log('\n📚 Documentation:');
console.log('• Full Guide: HLPFL_IO_DEPLOYMENT_GUIDE.md');
console.log('• Quick Start: QUICK_DEPLOY_HLPFL_IO.md');
console.log('• Component Setup: API_EMBEDDING_GUIDE.md');
console.log('• Repository: https://github.com/HLPFLCG/hlpflchatbot');

process.exit(allPassed ? 0 : 1);