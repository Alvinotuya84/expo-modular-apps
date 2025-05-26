# Expo Modular Apps

> A production-ready microapps architecture using Expo Router and Yarn workspaces for scalable React Native development.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-1C1E24?style=flat&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Yarn Workspaces](https://img.shields.io/badge/Yarn_Workspaces-2C8EBB?style=flat&logo=yarn&logoColor=white)](https://yarnpkg.com/features/workspaces)

## 🌟 Overview

Expo Modular Apps is a comprehensive monorepo solution that demonstrates how to build scalable mobile applications using a microapps architecture. Each microapp can function both as a standalone application and as an embedded component within a main super-app.

### ✨ Key Features

- 🎯 **Dual-Purpose Architecture**: Each microapp works standalone AND embedded
- 📱 **Expo Router Integration**: File-based routing with universal deep linking
- 🛠️ **CLI-Driven Development**: Generate new microapps with a single command
- 🔄 **Zero Dependency Duplication**: Shared workspace dependencies
- 🎨 **Type-Safe Development**: Full TypeScript support with path mapping
- 🚀 **Hot Reload Everywhere**: Development experience across all apps
- 📦 **Modular Package System**: Reusable components and shared state

## 🏗️ Architecture

```
expo-modular-apps/
├── apps/
│   ├── main-app/                    # Super app (tab-based)
│   ├── ecommerce-app/              # Standalone e-commerce app
│   ├── banking-app/                # Standalone banking app
│   └── social-app/                 # Standalone social app
├── packages/
│   ├── shared-types/               # Common TypeScript definitions
│   ├── ecommerce-microapp/         # Embeddable e-commerce component
│   ├── banking-microapp/           # Embeddable banking component
│   └── social-microapp/            # Embeddable social component
├── tools/
│   └── microapp-cli/               # CLI for generating microapps
└── package.json                    # Yarn workspace configuration
```

### 🎭 How It Works

1. **Main App**: A super-app with tab navigation where each tab hosts a microapp
2. **Standalone Apps**: Independent Expo Router apps for each microapp
3. **Microapp Packages**: Embeddable React components that power both modes
4. **Shared Dependencies**: All apps share the same React Native/Expo dependencies
5. **Type Safety**: Shared TypeScript definitions across the entire monorepo

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and Yarn 1.x
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator or Android Emulator (for testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/Alvinotuya84/expo-modular-apps.git
cd expo-modular-apps

# Install dependencies
yarn install

# Start the main super-app
yarn dev
```

### Create Your First Microapp

```bash
# Generate a new microapp
yarn microapp create loyalty

# This creates:
# - apps/loyalty-app (standalone app)
# - packages/loyalty-microapp (embeddable component)
# - Tab integration in main app
```

## 📋 Available Commands

### Development Commands

```bash
# Main super-app
yarn dev                             # Start main app
yarn dev:main                       # Alternative main app command

# Standalone microapps
yarn workspace ecommerce-app start   # Start e-commerce app
yarn workspace banking-app start     # Start banking app
yarn workspace social-app start      # Start social app
```

### Microapp CLI Commands

```bash
# Create a new microapp
yarn microapp create <name>          # Interactive creation
yarn microapp create <name> --type standalone   # Standalone only
yarn microapp create <name> --type package      # Package only
yarn microapp create <name> --skip-install      # Skip dependency install

# List all microapps
yarn microapp list                   # Show all apps and packages

# Add tab to main app
yarn microapp add-tab <name>         # Add existing microapp as tab
```

### Build & Deployment

```bash
# Build all workspaces
yarn build

# Lint all code
yarn lint

# Type checking
yarn type-check
```

## 🎨 Development Workflow

### 1. Creating a New Microapp

```bash
# Create a new microapp called "music"
yarn microapp create music
```

This generates:
- `apps/music-app/` - Standalone Expo Router app
- `packages/music-microapp/` - Embeddable React component
- `apps/main-app/app/(tabs)/music.tsx` - Tab integration

### 2. Adding the Tab to Main App

Update `apps/main-app/app/(tabs)/_layout.tsx`:

```tsx
<Tabs.Screen
  name="music"
  options={{
    title: "Music",
    tabBarIcon: ({ color }) => <TabBarIcon name="music" color={color} />
  }}
/>
```

### 3. Development Modes

**Standalone Development:**
```bash
yarn workspace music-app start
```

**Embedded Development:**
```bash
yarn dev  # Main app with all microapps as tabs
```

### 4. Cross-Microapp Navigation

```tsx
// Navigate between microapps in main app
import { useRouter } from 'expo-router';

function NavigateToOtherApp() {
  const router = useRouter();
  
  return (
    <Button 
      title="Go to Banking" 
      onPress={() => router.push('/(tabs)/banking')} 
    />
  );
}
```

## 🔧 Configuration

### TypeScript Path Mapping

All apps support `@packages/*` imports:

```tsx
// Import any microapp component
import EcommerceApp from '@packages/ecommerce-microapp';
import { MicroappConfig } from '@packages/shared-types';
```

### Metro Configuration

Each app includes proper Metro workspace support:

```javascript
// Automatic workspace resolution
config.watchFolders = [workspaceRoot];
config.resolver.alias = {
  '@packages': path.resolve(workspaceRoot, 'packages'),
};
```

### Shared Dependencies

Core dependencies are shared across all apps:
- React 19.0.0
- React Native 0.79.2
- Expo SDK 53
- Expo Router 5.x
- TypeScript 5.x

## 📦 Package Structure

### Microapp Package Example

```typescript
// packages/ecommerce-microapp/src/index.tsx
export { EcommerceMicroappProvider } from './components/EcommerceMicroappProvider';
export { EcommerceApp } from './screens/EcommerceApp';
export * from './types';

// Default export for easy importing
export { EcommerceApp as default } from './screens/EcommerceApp';
```

### Using in Main App

```tsx
// apps/main-app/app/(tabs)/ecommerce.tsx
import React from 'react';
import EcommerceApp from '@packages/ecommerce-microapp';

export default function EcommerceTab() {
  return <EcommerceApp microappName="ecommerce" />;
}
```

### Using in Standalone App

```tsx
// apps/ecommerce-app/app/(tabs)/index.tsx
import React from 'react';
import EcommerceApp from '@packages/ecommerce-microapp';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Standalone E-commerce App</Text>
      <View style={styles.microappContainer}>
        <EcommerceApp microappName="ecommerce" />
      </View>
    </View>
  );
}
```

## 🎯 Use Cases

### 1. Enterprise Super-App
- Multiple business units as separate microapps
- Shared authentication and theming
- Independent development teams

### 2. Multi-Tenant SaaS
- Each tenant gets their own microapp
- Shared core functionality
- Customizable per-tenant features

### 3. Modular Consumer App
- Features like Shopping, Banking, Social as separate apps
- Progressive feature rollout
- A/B testing at microapp level

### 4. White-Label Solutions
- Core app with pluggable microapps
- Client-specific customizations
- Rapid deployment of new features

## 🛠️ Advanced Features

### State Management

Each microapp has its own context provider:

```tsx
// packages/ecommerce-microapp/src/components/EcommerceMicroappProvider.tsx
export function EcommerceMicroappProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  
  return (
    <EcommerceContext.Provider value={{ cartItems, setCartItems }}>
      {children}
    </EcommerceContext.Provider>
  );
}
```

### Cross-Microapp Communication

Use shared state or URL parameters:

```tsx
// Navigate with data
router.push({
  pathname: '/(tabs)/banking',
  params: { fromApp: 'ecommerce', amount: '100' }
});
```

### Deep Linking

All microapps support universal deep linking:

```
myapp://ecommerce/products/123
myapp://banking/transfer?amount=100
myapp://social/profile/user456
```

## 🚀 Deployment

### Building for Production

```bash
# Build all apps
yarn workspace main-app build
yarn workspace ecommerce-app build
yarn workspace banking-app build
```

### EAS Build Configuration

Each app can be built independently:

```bash
# Main super-app
cd apps/main-app
eas build --platform ios

# Standalone microapp
cd apps/ecommerce-app
eas build --platform android
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Development Guidelines

- Use TypeScript for all new code
- Follow the existing file structure conventions
- Add proper error handling and loading states
- Include tests for new microapps
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Expo Team](https://expo.dev/) for the amazing React Native toolchain
- [React Navigation](https://reactnavigation.org/) for powering Expo Router
- [Yarn Team](https://yarnpkg.com/) for workspace support
- The React Native community for inspiration and feedback

## 📞 Support

- 🐛 [Report a Bug](https://github.com/Alvinotuya84/expo-modular-apps/issues)
- 💡 [Request a Feature](https://github.com/Alvinotuya84/expo-modular-apps/issues)
- 💬 [Start a Discussion](https://github.com/Alvinotuya84/expo-modular-apps/discussions)

---

<div align="center">

**[⭐ Star this repo](https://github.com/Alvinotuya84/expo-modular-apps) if you found it helpful!**

Made with ❤️ by [Alvin Otuya](https://github.com/Alvinotuya84)

</div>