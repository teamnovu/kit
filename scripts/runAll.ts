import pkg from '../package.json';
import concurrently from 'concurrently';
import path from 'path';
import { readFile } from 'fs/promises';

function workspacePackageJson(workspace) {
  return path.resolve(process.cwd(), workspace, 'package.json');
}

async function readPackage(workspace) {
  try {
    const pkgJson = await readFile(workspacePackageJson(workspace));
    return JSON.parse(pkgJson.toString());
  } catch (e) {
    return null;
  }
}

const workspaces = pkg.workspaces;
let packages = await Promise.all(workspaces.map(readPackage));
packages = packages.filter((pkg) => !!pkg);

const packageNamesWithWatch = packages
  .filter((pkg) => typeof pkg.scripts?.watch === 'string')
  .map((pkg) => pkg.name);

const commands = packageNamesWithWatch.map((pkg) => ({
  command: `"pnpm --filter ${pkg} ${process.argv.at(-1)}"`,
  name: pkg,
}));

concurrently(commands);
