// Generates /.well-known/agent-skills/index.json (Agent Skills Discovery
// RFC v0.2.0) from the SKILL.md files in public/.well-known/agent-skills/.
// Runs on prebuild so digests stay in sync with the published artifacts.
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const skillsDir = new URL("../public/.well-known/agent-skills", import.meta.url)
  .pathname;

const skills = readdirSync(skillsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((dir) => {
    const skillPath = join(skillsDir, dir.name, "SKILL.md");
    const content = readFileSync(skillPath);
    const digest = `sha256:${createHash("sha256").update(content).digest("hex")}`;

    // Pull the description out of the YAML frontmatter.
    const frontmatter = content.toString("utf8").match(/^---\n([\s\S]*?)\n---/);
    const description = frontmatter?.[1]
      .match(/^description:\s*(.+)$/m)?.[1]
      .trim();

    if (!description) {
      throw new Error(`${skillPath} is missing a description in its frontmatter`);
    }

    return {
      name: dir.name,
      type: "skill-md",
      description,
      url: `/.well-known/agent-skills/${dir.name}/SKILL.md`,
      digest,
    };
  });

const index = {
  $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
  skills,
};

const outPath = join(skillsDir, "index.json");
writeFileSync(outPath, JSON.stringify(index, null, 2) + "\n");
console.log(`Wrote ${outPath} with ${skills.length} skill(s)`);
