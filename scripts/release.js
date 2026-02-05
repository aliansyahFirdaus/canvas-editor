import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const pkgPath = path.resolve('package.json')

// Validate package integrity
fs.accessSync(path.resolve('dist'), fs.constants.F_OK)
fs.accessSync(path.resolve('dist/canvas-editor.es.js'), fs.constants.F_OK)
fs.accessSync(path.resolve('dist/canvas-editor.umd.js'), fs.constants.F_OK)

// Cache project package.json
const sourcePkg = fs.readFileSync(pkgPath, 'utf-8')

// Remove unused properties
const targetPkg = JSON.parse(sourcePkg)
Reflect.deleteProperty(targetPkg, 'dependencies')
Reflect.deleteProperty(targetPkg.scripts, 'postinstall')
fs.writeFileSync(pkgPath, JSON.stringify(targetPkg, null, 2))

// Publish package
try {
  execSync('npm publish')
} catch (error) {
  throw new Error(error)
} finally {
  // Restore
  fs.writeFileSync(pkgPath, sourcePkg)
}
