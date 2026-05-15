import { runCommand } from "./commands.js";

const result = runCommand(process.argv.slice(2));

if (result.stdout) {
  console.log(result.stdout);
}

if (result.stderr) {
  console.error(result.stderr);
}

process.exitCode = result.exitCode;
