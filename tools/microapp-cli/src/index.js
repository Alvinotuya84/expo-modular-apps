// tools/microapp-cli/src/index.js
const { Command } = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const fs = require('fs-extra');
const path = require('path');
const Mustache = require('mustache');

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
  
  if (options.type === 'both' || options.type === 'standalone') {
    await createStandaloneApp(name, rootDir);
  }
  
  if (options.type === 'both' || options.type === 'package') {
    await createMicroappPackage(name, rootDir);
  }
  
  await addTabToMainApp(name);
  
  if (!options.skipInstall) {
    console.log(chalk.blue('📦 Installing dependencies...'));
    const { execSync } = require('child_process');
    execSync('yarn install', { stdio: 'inherit', cwd: rootDir });
  }
  
  console.log(chalk.green(`\n✅ Microapp '${name}' created successfully!\n`));
  
  if (options.type === 'both' || options.type === 'standalone') {
    console.log(chalk.cyan(`📱 Standalone app: apps/${name}-app`));
  }
  if (options.type === 'both' || options.type === 'package') {
    console.log(chalk.cyan(`📦 Microapp package: packages/${name}-microapp`));
  }
  
  console.log(chalk.yellow(`\n🎯 Next steps:`));
  console.log(`   1. Run: yarn dev:${name} (for standalone app)`);
  console.log(`   2. Run: yarn dev (to see it in the main app)`);
  console.log(`   3. Edit the generated files to add your functionality\n`);
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

  // Read main app package.json as template
  const mainAppPackageJson = await fs.readJson(path.join(rootDir, 'apps', 'main-app', 'package.json'));
  
  // Create package.json
  const packageJson = {
    name: `${name}-app`,
    main: 'expo-router/entry',
    version: '1.0.0',
    scripts: {
      start: 'expo start',
      'reset-project': 'node ./scripts/reset-project.js',
      android: 'expo run:android',
      ios: 'expo run:ios',
      web: 'expo start --web',
      lint: 'expo lint'
    },
    dependencies: {
      ...mainAppPackageJson.dependencies,
      [`@packages/${name}-microapp`]: 'workspace:*'
    },
    devDependencies: mainAppPackageJson.devDependencies,
    private: true
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
}

async function createMicroappPackage(name, rootDir) {
  const packageDir = path.join(rootDir, 'packages', `${name}-microapp`);
  
  console.log(chalk.blue(`📦 Creating microapp package at: packages/${name}-microapp`));
  
  // Create directory structure
  await fs.ensureDir(path.join(packageDir, 'src', 'components'));
  await fs.ensureDir(path.join(packageDir, 'src', 'screens'));
  await fs.ensureDir(path.join(packageDir, 'src', 'types'));

  // Create package.json
  const packageJson = {
    name: `@packages/${name}-microapp`,
    version: '1.0.0',
    main: 'src/index.tsx',
    types: 'src/index.tsx',
    scripts: {
      build: 'tsc',
      dev: 'tsc --watch',
      lint: 'eslint src --ext .ts,.tsx'
    },
    dependencies: {
      react: '^19.0.0',
      'react-native': '^0.79.2',
      '@react-navigation/native': '^7.1.6',
      '@react-navigation/native-stack': '^7.1.18',
      '@packages/shared-types': 'workspace:*'
    },
    devDependencies: {
      '@types/react': '~19.0.10',
      typescript: '^5.8.3'
    },
    peerDependencies: {
      react: '^19.0.0',
      'react-native': '^0.79.2'
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

  // Generate package files
  await generateMicroappPackageFiles(name, packageDir);
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

  // Tab layout
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

  // Index screen
  const indexScreenContent = `import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>${capitalizedName} App</Text>
      <Text style={styles.subtitle}>Welcome to your ${name} microapp!</Text>
      <Text style={styles.description}>
        This is a standalone ${name} application. You can develop and test this 
        independently, and it will also be embedded as a tab in the main app.
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: '#333',
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
      <Text>This is the ${screenName} screen for ${name} microapp.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
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

  // Main app component
  const appContent = `import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ${capitalizedName}MicroappProvider } from '../components/${capitalizedName}MicroappProvider';

export function ${capitalizedName}App() {
  return (
    <${capitalizedName}MicroappProvider>
      <View style={styles.container}>
        <Text style={styles.title}>${capitalizedName} Microapp</Text>
        <Text style={styles.subtitle}>This is the ${name} microapp package</Text>
        <Text style={styles.description}>
          This component can be embedded in the main app as a tab,
          or used independently in the standalone ${name} app.
        </Text>
      </View>
    </${capitalizedName}MicroappProvider>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: '#333',
  },
});
`;

  // Provider component
  const providerContent = `import React, { createContext, useContext, ReactNode } from 'react';

interface ${capitalizedName}ContextType {
  // Add your ${name} specific state and functions here
  microappName: string;
}

const ${capitalizedName}Context = createContext<${capitalizedName}ContextType | undefined>(undefined);

interface ${capitalizedName}MicroappProviderProps {
  children: ReactNode;
}

export function ${capitalizedName}MicroappProvider({ children }: ${capitalizedName}MicroappProviderProps) {
  const contextValue: ${capitalizedName}ContextType = {
    microappName: '${name}',
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
}

export interface ${capitalizedName}State {
  isLoading: boolean;
  error: string | null;
  data: any;
}

export interface ${capitalizedName}Actions {
  loadData: () => Promise<void>;
  clearError: () => void;
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
  const tabLayoutPath = path.join(mainAppDir, 'app', '(tabs)', '_layout.tsx');
  const newTabPath = path.join(mainAppDir, 'app', '(tabs)', `${name}.tsx`);
  
  console.log(chalk.blue(`🎯 Adding ${name} tab to main app`));
  
  // Create the new tab file
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
  const tabContent = `import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
// import ${capitalizedName}App from '@packages/${name}-microapp';

export default function ${capitalizedName}Tab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>${capitalizedName} Microapp</Text>
      <Text style={styles.subtitle}>
        Uncomment the import above and replace this View with:
      </Text>
      <Text style={styles.code}>{'<'}${capitalizedName}App {'/>'}</Text>
      <Text style={styles.note}>
        After running yarn install to install the new package dependencies.
      </Text>
    </View>
  );
  
  // Once the package is installed, replace above with:
  // return <${capitalizedName}App />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  code: {
    fontSize: 16,
    fontFamily: 'monospace',
    backgroundColor: '#f0f0f0',
    padding: 8,
    marginVertical: 10,
  },
  note: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
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
  console.log(chalk.yellow(`📝 Don't forget to add the tab to your _layout.tsx manually:`));
  console.log(chalk.cyan(`   <Tabs.Screen name="${name}" options={{ title: "${capitalizedName}", tabBarIcon: ({ color }) => <TabBarIcon name="${icon}" color={color} /> }} />`));
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