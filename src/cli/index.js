#!/usr/bin/env node

/**
 * KidTech CLI — Agent-Native Command Interface
 * 
 * Structured CLI for both humans and AI agents.
 * All commands support --json flag for machine-readable output.
 * 
 * Usage:
 *   kt <group> <command> [options]
 *   kt status              Check system status
 *   kt db seed             Seed demo data
 *   kt student list        List students
 *   kt course list         List courses
 * 
 * @see .agent/skills/kidtech-cli/SKILL.md for agent discovery
 */

import { Command } from 'commander';
import { statusCommand } from './commands/status.js';
import { dbCommand } from './commands/db.js';
import { studentCommand } from './commands/student.js';
import { courseCommand } from './commands/course.js';
import { loadLocalEnv } from './utils/env.js';

const program = new Command();

loadLocalEnv();

program
  .name('kt')
  .description('KidTech CLI — Agent-Native Platform Management')
  .version('0.1.0');

// Register command groups
program.addCommand(statusCommand);
program.addCommand(dbCommand);
program.addCommand(studentCommand);
program.addCommand(courseCommand);

program.parse(process.argv);
