#!/usr/bin/env node

/**
 * Chrome DevTools Debug Helper
 * 
 * This script helps launch Chrome with the correct debugging configuration
 * for the Help-me-choose application.
 */

const { spawn } = require('child_process');
const puppeteer = require('puppeteer');

const INSPECTOR_PORT = 9229;
const SERVER_PORT = process.env.PORT || 3000;

async function launchChromeForDebugging() {
  console.log('🚀 Launching Chrome with DevTools debugging...');
  
  try {
    const browser = await puppeteer.launch({
      headless: false,
      devtools: true,
      args: [
        `--remote-debugging-port=${INSPECTOR_PORT + 1}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-web-security',
        '--allow-running-insecure-content'
      ]
    });

    const pages = await browser.pages();
    const page = pages[0];
    
    // Navigate to the application
    await page.goto(`http://localhost:${SERVER_PORT}`);
    
    console.log('✅ Chrome launched with DevTools');
    console.log(`📱 Application: http://localhost:${SERVER_PORT}`);
    console.log(`🔧 Debug endpoint: http://localhost:${SERVER_PORT}/debug`);
    console.log('🔍 To debug server-side code:');
    console.log(`   1. Open chrome://inspect in a new tab`);
    console.log(`   2. Click "Configure" and add localhost:${INSPECTOR_PORT}`);
    console.log(`   3. Click "inspect" under Remote Target`);
    
    // Keep the process running
    process.on('SIGINT', async () => {
      console.log('\n🛑 Closing browser...');
      await browser.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to launch Chrome:', error.message);
    process.exit(1);
  }
}

async function checkServerStatus() {
  try {
    const fetch = require('node-fetch');
    const response = await fetch(`http://localhost:${SERVER_PORT}/healthz`);
    if (response.ok) {
      console.log('✅ Server is running');
      return true;
    }
  } catch (error) {
    console.log('❌ Server is not running. Please start it first with:');
    console.log('   npm run start:debug');
    return false;
  }
}

async function main() {
  console.log('🔧 Chrome DevTools Debug Helper');
  console.log('================================\n');
  
  const serverRunning = await checkServerStatus();
  if (!serverRunning) {
    process.exit(1);
  }
  
  await launchChromeForDebugging();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { launchChromeForDebugging, checkServerStatus };