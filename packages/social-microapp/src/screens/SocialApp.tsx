import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import type { MicroappProps } from '@packages/shared-types';
import { SocialMicroappProvider } from '../components/SocialMicroappProvider';

interface SocialAppProps extends Partial<MicroappProps> {}

export function SocialApp(props: SocialAppProps = {}) {
  return (
    <SocialMicroappProvider>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Social Microapp</Text>
        <Text style={styles.subtitle}>This is the social microapp package</Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🎯 Microapp Info</Text>
          <Text style={styles.infoText}>Name: {props.microappName || 'social'}</Text>
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
          or used independently in the standalone social app.
          Start building your social features here!
        </Text>
      </ScrollView>
    </SocialMicroappProvider>
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
