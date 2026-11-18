import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(ROOT_DIR, 'skills');
const EXTERNAL_FILE = path.join(ROOT_DIR, 'external-skills.json');
const home = os.homedir();

function hasGhSkillCommand() {
  try {
    execFileSync('gh', ['skill', '--help'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function loadExternalSkills() {
  if (!fs.existsSync(EXTERNAL_FILE)) return [];
  const raw = fs.readFileSync(EXTERNAL_FILE, 'utf-8');
  return JSON.parse(raw);
}

function installExternalToAgent(entries, agent) {
  for (const entry of entries) {
    const args = ['skill', 'install', entry.repo];
    if (entry.all) {
      args.push('--all');
    } else if (entry.skill) {
      args.push(entry.skill);
    }
    if (entry.pin) {
      args.push('--pin', entry.pin);
    }
    args.push('--scope', 'user', '--agent', agent, '--force');
    execFileSync('gh', args, { cwd: ROOT_DIR, stdio: 'inherit' });
    console.log(`[${agent}] installed external: ${entry.repo}`);
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

  const includeExternal = process.argv.includes('--include-external');
  const agentsArg = process.argv.find((arg) => arg.startsWith('--agents='));
  const agents = agentsArg
    ? agentsArg
        .replace('--agents=', '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // 1. Antigravity (~/.gemini/config/skills/) へ自作スキルを同期
  const agySkillsDir = path.join(home, '.gemini', 'config', 'skills');
  fs.mkdirSync(agySkillsDir, { recursive: true });
  for (const name of skillNames) {
    const src = path.join(SKILLS_DIR, name);
    const dst = path.join(agySkillsDir, name);
    fs.cpSync(src, dst, { recursive: true, force: true });
    console.log(`[Antigravity] synced: ${name} -> ${dst}`);
  }

  // 2. --include-external 指定時は Antigravity にも外部スキルを同期
  const externalEntries = loadExternalSkills();
  if (includeExternal && externalEntries.length > 0) {
    if (!hasGhSkillCommand()) {
      console.warn('[gh skill] gh v2.90.0+ is required for external skills.');
    } else {
      installExternalToAgent(externalEntries, 'antigravity');
    }
  }

  // 3. --agents=claude-code,cursor 等が指定された場合は自作＋外部スキルを一括配布
  if (agents.length > 0) {
    if (!hasGhSkillCommand()) {
      console.warn('[gh skill] gh v2.90.0+ is required for --agents sync. Skipped.');
      return;
    }
    for (const agent of agents) {
      for (const name of skillNames) {
        execFileSync(
          'gh',
          ['skill', 'install', `./skills/${name}`, '--from-local', '--scope', 'user', '--agent', agent, '--force'],
          { cwd: ROOT_DIR, stdio: 'inherit' },
        );
        console.log(`[${agent}] installed local: ${name}`);
      }
      if (externalEntries.length > 0) {
        installExternalToAgent(externalEntries, agent);
      }
    }
  }
}

main();
