import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(ROOT_DIR, 'skills');
const home = os.homedir();

function hasGhSkillCommand() {
  try {
    execFileSync('gh', ['skill', '--help'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function main() {
  if (!fs.existsSync(SKILLS_DIR)) {
    console.error('skills/ directory not found.');
    process.exit(1);
  }

  const skillNames = fs
    .readdirSync(SKILLS_DIR)
    .filter((name) => fs.statSync(path.join(SKILLS_DIR, name)).isDirectory())
    .filter((name) => fs.existsSync(path.join(SKILLS_DIR, name, 'SKILL.md')));

  if (skillNames.length === 0) {
    console.log('No skills found under skills/.');
    return;
  }

  // 1. Antigravity (~/.gemini/config/skills/) へ同期
  const agySkillsDir = path.join(home, '.gemini', 'config', 'skills');
  fs.mkdirSync(agySkillsDir, { recursive: true });
  for (const name of skillNames) {
    const src = path.join(SKILLS_DIR, name);
    const dst = path.join(agySkillsDir, name);
    fs.cpSync(src, dst, { recursive: true, force: true });
    console.log(`[Antigravity] synced: ${name} -> ${dst}`);
  }

  // 2. --agents=claude-code,cursor 等が指定された場合は gh skill で配布
  const agentsArg = process.argv.find((arg) => arg.startsWith('--agents='));
  const agents = agentsArg
    ? agentsArg
        .replace('--agents=', '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  if (agents.length > 0) {
    if (!hasGhSkillCommand()) {
      console.warn('[gh skill] gh v2.90.0+ is required for --agents sync. Skipped.');
      return;
    }
    for (const agent of agents) {
      for (const name of skillNames) {
        const skillPath = `./skills/${name}`;
        execFileSync(
          'gh',
          ['skill', 'install', skillPath, '--from-local', '--scope', 'user', '--agent', agent],
          { cwd: ROOT_DIR, stdio: 'inherit' },
        );
        console.log(`[${agent}] installed via gh skill: ${name}`);
      }
    }
  }
}

main();
