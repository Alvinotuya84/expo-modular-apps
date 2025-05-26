import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BankingApp from '@packages/banking-microapp';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Standalone Banking App</Text>
      <Text style={styles.subtitle}>This is the home of your banking microapp</Text>
      
      <View style={styles.microappContainer}>
        <BankingApp microappName="banking" />
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
