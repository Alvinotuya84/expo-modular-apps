import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Super App Dashboard</Text>
      <Text style={styles.subtitle}>Welcome to your unified platform</Text>
      
      <View style={styles.servicesGrid}>
        <View style={styles.serviceCard}>
          <Text style={styles.serviceTitle}>E-Commerce</Text>
          <Text>Shop products and manage orders</Text>
        </View>
        
        <View style={styles.serviceCard}>
          <Text style={styles.serviceTitle}>Banking</Text>
          <Text>Manage accounts and transfers</Text>
        </View>
        
        <View style={styles.serviceCard}>
          <Text style={styles.serviceTitle}>Social</Text>
          <Text>Connect with friends</Text>
        </View>
      </View>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  serviceCard: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 10,
    width: 150,
    alignItems: 'center',
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
});