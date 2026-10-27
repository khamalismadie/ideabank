// Workaround: this project lives on an NTFS drive (tuxera), where esbuild's
// Go binaries SIGBUS when executed in place. Copy the platform binaries to
// /tmp (APFS) and symlink them back into node_modules.
import {
  cpSync,
  chmodSync,
  symlinkSync,
  existsSync,
  readdirSync,
  rmSync,
  mkdirSync,
} from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const binDir = '/tmp/ideabank-bin'
const pnpmDir = join(root, 'node_modules/.pnpm')

if (!existsSync(pnpmDir)) {
  console.log('fix-esbuild: no node_modules/.pnpm found, skipping')
  process.exit(0)
}

const versions = readdirSync(pnpmDir).filter((d) => /^@esbuild\+darwin-/.test(d))
if (versions.length === 0) {
  console.log('fix-esbuild: no @esbuild darwin packages found, skipping')
  process.exit(0)
}

mkdirSync(binDir, { recursive: true })

for (const dir of versions) {
  const src = join(pnpmDir, dir, 'node_modules/@esbuild/darwin-x64/bin/esbuild')
  if (!existsSync(src)) continue
  const version = dir.replace('@esbuild+darwin-x64@', '')
  const tmpBin = join(binDir, `esbuild-${version}`)

  // Refresh the copy so a new install replaces a stale binary
  if (existsSync(tmpBin)) rmSync(tmpBin)
  cpSync(src, tmpBin)
  chmodSync(tmpBin, 0o755)

  const target = join(pnpmDir, `esbuild@${version}`, 'node_modules/esbuild/bin/esbuild')
  if (!existsSync(join(target, '..'))) continue
  try {
    rmSync(target, { force: true })
    symlinkSync(tmpBin, target)
  } catch {
    // best-effort: some layout variants don't have this path
  }
}

console.log(`fix-esbuild: ${versions.length} esbuild binary(ies) relocated to ${binDir}`)
