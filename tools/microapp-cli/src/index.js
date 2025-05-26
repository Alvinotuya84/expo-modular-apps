// tools/microapp-cli/src/index.js
const { Command } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');

const program = new Command();

program
  .name('microapp-cli')
  .description('CLI for generating microapps in the monorepo')
  .version('1.0.0');

// Create command
program
  .command('create')
  .description('Create a new microapp')
  .argument('[name]', 'Name of the microapp')
  .option('-t, --type <type>', 'Type of microapp (standalone, package, both)', 'both')
  .option('-s, --skip-install', 'Skip installing dependencies')
  .action(async (name, options) => {
    try {
      await createMicroapp(name, options);
    } catch (error) {
      console.error(chalk.red('❌ Error creating microapp:'), error.message);
      process.exit(1);
    }
  });

// List command
program
  .command('list')
  .description('List all microapps in the monorepo')
  .action(() => {
    listMicroapps();
  });

// Add command
program
  .command('add-tab')
  .description('Add a microapp tab to main app')
  .argument('<name>', 'Name of the microapp')
  .action(async (name) => {
    try {
      await addTabToMainApp(name);
    } catch (error) {
      console.error(chalk.red('❌ Error adding tab:'), error.message);
      process.exit(1);
    }
  });

async function createMicroapp(name, options) {
  // If name not provided, prompt for it
  if (!name) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'What is the name of your microapp?',
        validate: (input) => {
          if (!input) return 'Name is required';
          if (!/^[a-z][a-z0-9-]*$/.test(input)) {
            return 'Name must be lowercase, start with a letter, and contain only letters, numbers, and hyphens';
          }
          return true;
        }
      },
      {
        type: 'list',
        name: 'type',
        message: 'What type of microapp do you want to create?',
        choices: [
          { name: 'Both standalone app and package (recommended)', value: 'both' },
          { name: 'Standalone app only', value: 'standalone' },
          { name: 'Package only', value: 'package' }
        ],
        default: 'both'
      }
    ]);
    
    name = answers.name;
    options.type = answers.type;
  }

  console.log(chalk.blue(`\n🚀 Creating microapp: ${name}\n`));

  const rootDir = process.cwd();
  
  // Step 1: Ensure shared-types exists
  const sharedTypesExists = await fs.pathExists(path.join(rootDir, 'packages', 'shared-types'));
  if (!sharedTypesExists) {
    await createSharedTypesPackage(rootDir);
  }
  
  // Step 2: Create microapp package FIRST (no external dependencies needed)
  if (options.type === 'both' || options.type === 'package') {
    await createMicroappPackage(name, rootDir);
  }
  
  // Step 3: Create standalone app (reuses main-app dependencies)
  if (options.type === 'both' || options.type === 'standalone') {
    await createStandaloneApp(name, rootDir);
  }
  
  // Step 4: Add tab to main app
  await addTabToMainApp(name);
  
  // Step 5: Only run yarn install once if needed (usually not needed since deps are shared)
  if (!options.skipInstall) {
    console.log(chalk.blue('📦 Installing workspace dependencies...'));
    const { execSync } = require('child_process');
    try {
      execSync('yarn install', { stdio: 'inherit', cwd: rootDir });
    } catch (error) {
      console.log(chalk.yellow('⚠️  Installation had some warnings, but microapp was created successfully.'));
    }
  }
  
  console.log(chalk.green(`\n✅ Microapp '${name}' created successfully!\n`));
  
  if (options.type === 'both' || options.type === 'standalone') {
    console.log(chalk.cyan(`📱 Standalone app: apps/${name}-app`));
    console.log(chalk.gray(`   → Run: yarn workspace ${name}-app start`));
  }
  if (options.type === 'both' || options.type === 'package') {
    console.log(chalk.cyan(`📦 Microapp package: packages/${name}-microapp`));
  }
  
  console.log(chalk.yellow(`\n🎯 Next steps:`));
  console.log(`   1. Add tab to main app layout: ${chalk.cyan(`apps/main-app/app/(tabs)/_layout.tsx`)}`);
  console.log(`   2. Run main app: ${chalk.cyan('yarn dev')}`);
  console.log(`   3. Run standalone: ${chalk.cyan(`yarn workspace ${name}-app start`)}`);
  console.log(`   4. Edit generated files to add functionality\n`);
}

async function createStandaloneApp(name, rootDir) {
  const appDir = path.join(rootDir, 'apps', `${name}-app`);
  
  console.log(chalk.blue(`📱 Creating standalone app at: apps/${name}-app`));
  
  // Create directory structure
  await fs.ensureDir(path.join(appDir, 'app', '(tabs)'));
  await fs.ensureDir(path.join(appDir, 'components'));
  await fs.ensureDir(path.join(appDir, 'constants'));
  await fs.ensureDir(path.join(appDir, 'assets', 'fonts'));
  await fs.ensureDir(path.join(appDir, 'assets', 'images'));

  // Create minimal package.json (shares dependencies with main-app via workspace)
  const packageJson = {
    name: `${name}-app`,
    main: 'expo-router/entry',
    version: '1.0.0',
    private: true,
    scripts: {
      start: 'expo start',
      android: 'expo run:android',
      ios: 'expo run:ios',
      web: 'expo start --web',
      lint: 'expo lint'
    },
    dependencies: {
      // Reference the microapp package
      [`@packages/${name}-microapp`]: 'workspace:*',
      // All other dependencies are inherited from main-app via workspace
      "expo": "~53.0.9",
      "expo-router": "~5.0.6",
      "react": "19.0.0",
      "react-native": "0.79.2"
    }
  };
  
  await fs.writeJson(path.join(appDir, 'package.json'), packageJson, { spaces: 2 });

  // Create app.json
  const appJson = {
    expo: {
      name: `${name.charAt(0).toUpperCase() + name.slice(1)} App`,
      slug: `${name}-app`,
      version: '1.0.0',
      orientation: 'portrait',
      icon: './assets/images/icon.png',
      scheme: `${name}app`,
      userInterfaceStyle: 'automatic',
      newArchEnabled: true,
      ios: {
        supportsTablet: true
      },
      android: {
        adaptiveIcon: {
          foregroundImage: './assets/images/adaptive-icon.png',
          backgroundColor: '#ffffff'
        }
      },
      web: {
        bundler: 'metro',
        output: 'static',
        favicon: './assets/images/favicon.png'
      },
      plugins: [
        'expo-router'
      ],
      experiments: {
        typedRoutes: true
      }
    }
  };
  
  await fs.writeJson(path.join(appDir, 'app.json'), appJson, { spaces: 2 });

  // Create TypeScript config
  const tsConfig = {
    extends: 'expo/tsconfig.base',
    compilerOptions: {
      strict: true,
      baseUrl: '.',
      paths: {
        '@/*': ['./*'],
        '@packages/*': ['../../packages/*']
      }
    }
  };
  
  await fs.writeJson(path.join(appDir, 'tsconfig.json'), tsConfig, { spaces: 2 });

  // Generate app files
  await generateStandaloneAppFiles(name, appDir);
  await createMetroConfig(appDir, true);

}

async function createMicroappPackage(name, rootDir) {
  const packageDir = path.join(rootDir, 'packages', `${name}-microapp`);
  
  console.log(chalk.blue(`📦 Creating microapp package at: packages/${name}-microapp`));
  
  // Create directory structure
  await fs.ensureDir(path.join(packageDir, 'src', 'components'));
  await fs.ensureDir(path.join(packageDir, 'src', 'screens'));
  await fs.ensureDir(path.join(packageDir, 'src', 'types'));

  // Create lightweight package.json (minimal dependencies)
  const packageJson = {
    name: `@packages/${name}-microapp`,
    version: '1.0.0',
    main: 'src/index.tsx',
    types: 'src/index.tsx',
    private: true,
    scripts: {
      build: 'tsc',
      dev: 'tsc --watch',
      lint: 'eslint src --ext .ts,.tsx'
    },
    dependencies: {
      // Only include workspace packages, everything else comes from main-app
      '@packages/shared-types': 'workspace:*'
    },
    peerDependencies: {
      // These will be provided by the consuming app
      react: '^19.0.0',
      'react-native': '^0.79.2'
    },
    devDependencies: {
      '@types/react': '~19.0.10',
      typescript: '^5.8.3'
    }
  };
  
  await fs.writeJson(path.join(packageDir, 'package.json'), packageJson, { spaces: 2 });

  // Create TypeScript config
  const tsConfig = {
    extends: '../../tsconfig.json',
    compilerOptions: {
      outDir: './dist',
      rootDir: './src'
    },
    include: ['src/**/*'],
    exclude: ['dist', 'node_modules']
  };
  
  await fs.writeJson(path.join(packageDir, 'tsconfig.json'), tsConfig, { spaces: 2 });

  // Generate package files with shared-types imports
  await generateMicroappPackageFiles(name, packageDir);
}

async function createMetroConfig(appDir, isStandaloneApp = false) {
  const appName = isStandaloneApp ? path.basename(appDir) : 'main-app';
  
  const metroConfigContent = `// ${appName}/metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Configure alias resolving for @packages
config.resolver.alias = {
  '@packages': path.resolve(workspaceRoot, 'packages'),
};

${isStandaloneApp ? '// 4. Force Metro to resolve the symlinked packages\nconfig.resolver.disableHierarchicalLookup = false;\n' : ''}
module.exports = config;
`;

  await fs.writeFile(path.join(appDir, 'metro.config.js'), metroConfigContent);
}

async function createSharedTypesPackage(rootDir) {
  const packageDir = path.join(rootDir, 'packages', 'shared-types');
  
  console.log(chalk.blue('📦 Creating shared-types package...'));
  
  await fs.ensureDir(path.join(packageDir, 'src'));

  // Create package.json
  const packageJson = {
    name: '@packages/shared-types',
    version: '1.0.0',
    main: 'src/index.ts',
    types: 'src/index.ts',
    private: true,
    scripts: {
      build: 'tsc',
      dev: 'tsc --watch'
    },
    devDependencies: {
      typescript: '^5.8.3'
    }
  };
  
  await fs.writeJson(path.join(packageDir, 'package.json'), packageJson, { spaces: 2 });

  // Create TypeScript config
  const tsConfig = {
    extends: '../../tsconfig.json',
    compilerOptions: {
      outDir: './dist',
      rootDir: './src'
    },
    include: ['src/**/*'],
    exclude: ['dist', 'node_modules']
  };
  
  await fs.writeJson(path.join(packageDir, 'tsconfig.json'), tsConfig, { spaces: 2 });

  // Create types file
  const typesContent = `export interface MicroappConfig {
  name: string;
  displayName: string;
  version: string;
  route: string;
}

export interface NavigationProps {
  onNavigate?: (route: string) => void;
  currentRoute?: string;
}

export interface MicroappProps extends NavigationProps {
  microappName: string;
}

export interface BaseScreenProps {
  title?: string;
  subtitle?: string;
}

export interface TabConfig {
  name: string;
  title: string;
  icon: string;
}
`;

  await fs.writeFile(path.join(packageDir, 'src', 'index.ts'), typesContent);
  
  console.log(chalk.green('✅ Created shared-types package'));
}

async function generateStandaloneAppFiles(name, appDir) {
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
  
  // Root layout
  const rootLayoutContent = `import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
`;

  // Tab layout using the microapp component
  const tabLayoutContent = `import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="features"
        options={{
          title: 'Features',
          tabBarIcon: ({ color }) => <TabBarIcon name="star" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
        }}
      />
    </Tabs>
  );
}
`;

  // Index screen that uses the microapp component
  const indexScreenContent = `import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ${capitalizedName}App from '@packages/${name}-microapp';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Standalone ${capitalizedName} App</Text>
      <Text style={styles.subtitle}>This is the home of your ${name} microapp</Text>
      
      <View style={styles.microappContainer}>
        <${capitalizedName}App microappName="${name}" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  microappContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    overflow: 'hidden',
  },
});
`;

  // Write files
  await fs.writeFile(path.join(appDir, 'app', '_layout.tsx'), rootLayoutContent);
  await fs.writeFile(path.join(appDir, 'app', '(tabs)', '_layout.tsx'), tabLayoutContent);
  await fs.writeFile(path.join(appDir, 'app', '(tabs)', 'index.tsx'), indexScreenContent);
  
  // Create placeholder screens
  const placeholderScreen = (screenName) => `import { StyleSheet, Text, View } from 'react-native';

export default function ${screenName.charAt(0).toUpperCase() + screenName.slice(1)}Screen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>${screenName.charAt(0).toUpperCase() + screenName.slice(1)}</Text>
      <Text style={styles.description}>
        This is the ${screenName} screen for the ${name} microapp.
        You can add specific ${screenName} functionality here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    lineHeight: 24,
  },
});
`;
  
  await fs.writeFile(path.join(appDir, 'app', '(tabs)', 'features.tsx'), placeholderScreen('features'));
  await fs.writeFile(path.join(appDir, 'app', '(tabs)', 'settings.tsx'), placeholderScreen('settings'));
}

async function generateMicroappPackageFiles(name, packageDir) {
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

  // Main index file
  const indexContent = `export { ${capitalizedName}MicroappProvider } from './components/${capitalizedName}MicroappProvider';
export { ${capitalizedName}App } from './screens/${capitalizedName}App';
export * from './types';

// Default export for easy importing
export { ${capitalizedName}App as default } from './screens/${capitalizedName}App';
`;

  // Main app component with shared-types
  const appContent = `import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import type { MicroappProps } from '@packages/shared-types';
import { ${capitalizedName}MicroappProvider } from '../components/${capitalizedName}MicroappProvider';

interface ${capitalizedName}AppProps extends Partial<MicroappProps> {}

export function ${capitalizedName}App(props: ${capitalizedName}AppProps = {}) {
  return (
    <${capitalizedName}MicroappProvider>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>${capitalizedName} Microapp</Text>
        <Text style={styles.subtitle}>This is the ${name} microapp package</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🎯 Microapp Info</Text>
          <Text style={styles.infoText}>Name: {props.microappName || '${name}'}</Text>
          <Text style={styles.infoText}>Type: Embeddable Component</Text>
          <Text style={styles.infoText}>Status: Ready for development</Text>
        </View>
        
        <View style={styles.featuresCard}>
          <Text style={styles.infoTitle}>✨ Features</Text>
          <Text style={styles.featureText}>• Standalone and embeddable</Text>
          <Text style={styles.featureText}>• TypeScript support</Text>
          <Text style={styles.featureText}>• Shared state management</Text>
          <Text style={styles.featureText}>• Cross-platform compatible</Text>
        </View>
        
        <Text style={styles.description}>
          This component can be embedded in the main app as a tab,
          or used independently in the standalone ${name} app.
          Start building your ${name} features here!
        </Text>
      </ScrollView>
    </${capitalizedName}MicroappProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },
  featuresCard: {
    backgroundColor: '#f3e5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: '#666',
    marginTop: 20,
  },
});
`;

  // Provider component
  const providerContent = `import React, { createContext, useContext, ReactNode, useState } from 'react';

interface ${capitalizedName}ContextType {
  microappName: string;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  // Add your ${name} specific state and functions here
}

const ${capitalizedName}Context = createContext<${capitalizedName}ContextType | undefined>(undefined);

interface ${capitalizedName}MicroappProviderProps {
  children: ReactNode;
}

export function ${capitalizedName}MicroappProvider({ children }: ${capitalizedName}MicroappProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const contextValue: ${capitalizedName}ContextType = {
    microappName: '${name}',
    isLoading,
    setIsLoading,
    // Add your state and functions here
  };

  return (
    <${capitalizedName}Context.Provider value={contextValue}>
      {children}
    </${capitalizedName}Context.Provider>
  );
}

export function use${capitalizedName}Context() {
  const context = useContext(${capitalizedName}Context);
  if (context === undefined) {
    throw new Error('use${capitalizedName}Context must be used within a ${capitalizedName}MicroappProvider');
  }
  return context;
}
`;

  // Types file
  const typesContent = `export interface ${capitalizedName}Config {
  name: string;
  version: string;
  features: string[];
  theme?: {
    primaryColor: string;
    secondaryColor: string;
  };
}

export interface ${capitalizedName}State {
  isLoading: boolean;
  error: string | null;
  data: any;
  lastUpdated?: Date;
}

export interface ${capitalizedName}Actions {
  loadData: () => Promise<void>;
  clearError: () => void;
  refreshData: () => Promise<void>;
}

export interface ${capitalizedName}User {
  id: string;
  name: string;
  email: string;
  preferences?: Record<string, any>;
}
`;

  // Write files
  await fs.writeFile(path.join(packageDir, 'src', 'index.tsx'), indexContent);
  await fs.writeFile(path.join(packageDir, 'src', 'screens', `${capitalizedName}App.tsx`), appContent);
  await fs.writeFile(path.join(packageDir, 'src', 'components', `${capitalizedName}MicroappProvider.tsx`), providerContent);
  await fs.writeFile(path.join(packageDir, 'src', 'types', 'index.ts'), typesContent);
}

async function addTabToMainApp(name) {
  const mainAppDir = path.join(process.cwd(), 'apps', 'main-app');
  const newTabPath = path.join(mainAppDir, 'app', '(tabs)', `${name}.tsx`);
  
  console.log(chalk.blue(`🎯 Adding ${name} tab to main app`));
  
  // Create the new tab file with ready-to-use import
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
  const tabContent = `import React from 'react';
import ${capitalizedName}App from '@packages/${name}-microapp';

export default function ${capitalizedName}Tab() {
  return <${capitalizedName}App microappName="${name}" />;
}
`;
  
  await fs.writeFile(newTabPath, tabContent);
  
  // Add icon mapping for common microapp names
  const iconMap = {
    ecommerce: 'shopping-cart',
    banking: 'credit-card',
    social: 'users',
    news: 'newspaper-o',
    chat: 'comments',
    music: 'music',
    video: 'video-camera',
    photos: 'camera',
    maps: 'map',
    weather: 'cloud',
    calendar: 'calendar',
    notes: 'sticky-note',
    tasks: 'check-square',
    fitness: 'heartbeat',
    food: 'cutlery',
    travel: 'plane',
    education: 'graduation-cap',
    health: 'medkit',
    finance: 'line-chart',
    games: 'gamepad'
  };
  
  const icon = iconMap[name] || 'star';
  
  console.log(chalk.green(`✅ Created ${name} tab`));
  console.log(chalk.yellow(`📝 Add this to your main app's _layout.tsx:`));
  console.log(chalk.cyan(`   <Tabs.Screen 
     name="${name}" 
     options={{ 
       title: "${capitalizedName}", 
       tabBarIcon: ({ color }) => <TabBarIcon name="${icon}" color={color} /> 
     }} 
   />`));
}

function listMicroapps() {
  const appsDir = path.join(process.cwd(), 'apps');
  const packagesDir = path.join(process.cwd(), 'packages');
  
  console.log(chalk.blue('\n📱 Standalone Apps:'));
  try {
    const apps = fs.readdirSync(appsDir).filter(dir => 
      fs.statSync(path.join(appsDir, dir)).isDirectory() && dir !== 'main-app'
    );
    
    if (apps.length === 0) {
      console.log(chalk.gray('   No microapps found'));
    } else {
      apps.forEach(app => {
        console.log(chalk.green(`   • ${app}`));
        console.log(chalk.gray(`     Run: yarn workspace ${app} start`));
      });
    }
  } catch (error) {
    console.log(chalk.gray('   No apps directory found'));
  }
  
  console.log(chalk.blue('\n📦 Microapp Packages:'));
  try {
    const packages = fs.readdirSync(packagesDir).filter(dir => 
      fs.statSync(path.join(packagesDir, dir)).isDirectory() && dir.endsWith('-microapp')
    );
    
    if (packages.length === 0) {
      console.log(chalk.gray('   No microapp packages found'));
    } else {
      packages.forEach(pkg => {
        console.log(chalk.green(`   • ${pkg}`));
      });
    }
  } catch (error) {
    console.log(chalk.gray('   No packages directory found'));
  }
  
  console.log('');
}

program.parse();