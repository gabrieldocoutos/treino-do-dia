const path = require('path')
const { getDefaultConfig } = require('expo/metro-config')
const { withTamagui } = require('@tamagui/metro-plugin')

const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// Watch the monorepo packages so Metro can resolve them
config.watchFolders = [monorepoRoot]

// Let Metro resolve packages from both the app and monorepo node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
]

// Resolve .ts/.tsx before .js/.jsx so TypeScript source imports with .js extensions work
config.resolver.sourceExts = ['ts', 'tsx', 'js', 'jsx', 'json', 'cjs', 'mjs']

// Strip .js extensions from imports so Metro finds the .ts source files
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.endsWith('.js')) {
    const tsName = moduleName.replace(/\.js$/, '')
    try {
      return context.resolveRequest(context, tsName, platform)
    } catch {
      // Fall through to default resolution
    }
  }
  return context.resolveRequest(context, moduleName, platform)
}

module.exports = withTamagui(config, {
  components: ['tamagui'],
  config: './tamagui.config.ts',
})
