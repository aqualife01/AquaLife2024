import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const DashboardScreen = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Tarjetas Principales */}
      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <FontAwesome5 name="user-friends" size={24} color="#4CAF50" />
          <Text style={styles.cardTitle}>Clientes</Text>
          <Text style={styles.cardValue}>10</Text>
        </View>
        <View style={styles.card}>
          <FontAwesome5 name="users" size={24} color="#2196F3" />
          <Text style={styles.cardTitle}>Usuarios</Text>
          <Text style={styles.cardValue}>5</Text>
        </View>
        <View style={styles.card}>
          <FontAwesome5 name="box" size={24} color="#FF9800" />
          <Text style={styles.cardTitle}>Productos</Text>
          <Text style={styles.cardValue}>20</Text>
        </View>
        <View style={styles.card}>
          <FontAwesome5 name="shopping-cart" size={24} color="#F44336" />
          <Text style={styles.cardTitle}>Ventas</Text>
          <Text style={styles.cardValue}>0</Text>
        </View>
      </View>

      {/* Sección Configuración */}
      <Text style={styles.sectionTitle}>Configuración</Text>
      <View style={styles.settingsContainer}>
        {/* Información Personal */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Información Personal</Text>
          <Text style={styles.infoText}>Nombre: <Text style={styles.boldText}>Vida Informático</Text></Text>
          <Text style={styles.infoText}>Correo: <Text style={styles.boldText}>vida@gmail.com</Text></Text>
          <Text style={styles.infoText}>Rol: <Text style={styles.boldText}>Administrador</Text></Text>
          <Text style={styles.infoText}>Usuario: <Text style={styles.boldText}>admin</Text></Text>
        </View>

        {/* Datos de la Empresa */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Datos de la Empresa</Text>
          <Text style={styles.infoText}>RUC: <Text style={styles.boldText}>71347267</Text></Text>
          <Text style={styles.infoText}>Nombre: <Text style={styles.boldText}>Vida Informático</Text></Text>
          <Text style={styles.infoText}>Razón Social: <Text style={styles.boldText}>Vida Informático</Text></Text>
          <Text style={styles.infoText}>Teléfono: <Text style={styles.boldText}>925491523</Text></Text>
          <Text style={styles.infoText}>Correo: <Text style={styles.boldText}>naju@vidainformatico.com</Text></Text>
        </View>
      </View>

      {/* Cambio de Contraseña */}
      <View style={styles.passwordBox}>
        <Text style={styles.infoTitle}>Cambiar Contraseña</Text>
        <TextInput style={styles.input} placeholder="Contraseña Actual" secureTextEntry />
        <TextInput style={styles.input} placeholder="Nueva Contraseña" secureTextEntry />
        <TextInput style={styles.input} placeholder="Confirmar Contraseña" secureTextEntry />
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Guardar Cambios</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
    padding: 15,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '22%',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 14,
    color: '#555',
    marginVertical: 5,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2B7A78',
    marginBottom: 10,
  },
  settingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoBox: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#000',
  },
  passwordBox: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  button: {
    backgroundColor: '#2B7A78',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default DashboardScreen;
