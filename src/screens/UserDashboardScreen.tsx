import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const UserDashboardScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido al Dashboard del Usuario</Text>
      <Text style={styles.subtitle}>Aquí puedes gestionar tus pedidos y datos.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
  },
});

export default UserDashboardScreen;
