import { StyleSheet, Text, View } from 'react-native';

export default function FeaturesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Features</Text>
      <Text style={styles.description}>
        This is the features screen for the banking microapp.
        You can add specific features functionality here.
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
