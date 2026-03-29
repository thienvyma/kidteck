/**
 * kt status — Check system health
 * 
 * Checks: dev server, Supabase connectivity, build status, environment variables.
 * Output: JSON (for agent) or formatted table (for human).
 */

import { Command } from 'commander';
import { formatOutput, error } from '../utils/output.js';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Check if a TCP port is open
 * @param {number} port 
 * @param {string} [host='localhost']
 * @returns {Promise<boolean>}
 */
async function checkPort(port, host = 'localhost') {
  return new Promise((resolve) => {
    import('net').then(({ default: net }) => {
      const socket = new net.Socket();
      socket.setTimeout(2000);
      socket.on('connect', () => { socket.destroy(); resolve(true); });
      socket.on('timeout', () => { socket.destroy(); resolve(false); });
      socket.on('error', () => { socket.destroy(); resolve(false); });
      socket.connect(port, host);
    });
  });
}

/**
 * Check environment variables
 * @returns {Object} env status
 */
function checkEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  const envExists = existsSync(envPath);
  
  let supabaseUrl = false;
  let supabaseKey = false;
  
  if (envExists) {
    const content = readFileSync(envPath, 'utf-8');
    supabaseUrl = content.includes('NEXT_PUBLIC_SUPABASE_URL=') && 
                  !content.includes('NEXT_PUBLIC_SUPABASE_URL=your_');
    supabaseKey = content.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=') && 
                  !content.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_');
  }
  
  return {
    env_file: envExists ? 'found' : 'missing',
    supabase_url: supabaseUrl ? 'configured' : 'missing',
    supabase_anon_key: supabaseKey ? 'configured' : 'missing'
  };
}

/**
 * Check project files exist
 * @returns {Object} file status
 */
function checkFiles() {
  const files = {
    'package.json': 'package.json',
    'next.config.mjs': 'next.config.mjs',
    'RULES.md': 'RULES.md',
    'SESSIONS.md': 'SESSIONS.md',
    'PROGRESS.md': 'PROGRESS.md',
    'architecture_state.json': 'architecture_state.json',
    'CLAUDE.md': 'CLAUDE.md',
  };
  
  const result = {};
  for (const [key, path] of Object.entries(files)) {
    result[key] = existsSync(resolve(process.cwd(), path)) ? '✅' : '❌';
  }
  return result;
}

export const statusCommand = new Command('status')
  .description('Check KidTech system health and configuration')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const devServer = await checkPort(3000);
      const env = checkEnv();
      const docs = checkFiles();
      
      // Read architecture state
      let archState = {};
      const archPath = resolve(process.cwd(), 'architecture_state.json');
      if (existsSync(archPath)) {
        archState = JSON.parse(readFileSync(archPath, 'utf-8'));
      }
      
      const status = {
        project: archState.project || 'kidtech-app',
        version: archState.version || '0.1.0',
        phase: archState.phase || 'unknown',
        current_session: archState.current_session || 'unknown',
        services: {
          dev_server: devServer ? 'running (port 3000)' : 'stopped',
        },
        environment: env,
        documentation: docs,
        known_issues: archState.known_issues || [],
        tech_stack: archState.tech_stack || {}
      };

      formatOutput(status, options);
    } catch (err) {
      error(`Status check failed: ${err.message}`, options);
      process.exit(1);
    }
  });
