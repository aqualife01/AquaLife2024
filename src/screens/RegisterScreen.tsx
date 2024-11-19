import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { globalStyles } from '../styles/globalStyles';

const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    // Simulación de registro
    alert('Registro exitoso');
    navigation.navigate('Dashboard'); // Navega al Dashboard después del registro
  };

  return (
    <ScrollView contentContainerStyle={styles.outerContainer}>
      <View style={styles.innerContainer}>
        <Text style={[globalStyles.title, styles.titleText]}>
          Crear una cuenta
        </Text>

        {/* Campo de Nombre */}
        <TextInput
          style={[globalStyles.input, styles.input]}
          placeholder="Nombre completo"
          placeholderTextColor="#888888"
          value={name}
          onChangeText={setName}
        />

        {/* Campo de Email */}
        <TextInput
          style={[globalStyles.input, styles.input]}
          placeholder="Correo electrónico"
          placeholderTextColor="#888888"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {/* Campo de Contraseña */}
        <TextInput
          style={[globalStyles.input, styles.input]}
          placeholder="Contraseña"
          placeholderTextColor="#888888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Botón de Registro */}
        <TouchableOpacity
          style={globalStyles.primaryButton}
          onPress={handleRegister}
        >
          <Text style={globalStyles.primaryButtonText}>Registrarse</Text>
        </TouchableOpacity>

        {/* Enlace para iniciar sesión */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>¿Ya tienes cuenta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5', // Fondo más claro
  },
  innerContainer: {
    width: '90%', // Cuadro más pequeño con ancho dinámico
    maxWidth: 400, // Máximo ancho para pantallas grandes
    padding: 20,
    backgroundColor: '#FFFFFF', // Fondo blanco
    borderRadius: 10, // Bordes redondeados
    elevation: 5, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  titleText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 15,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
    width: '100%', // Asegura que el input ocupe todo el ancho disponible
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 16,
    color: '#757575',
  },
  loginLink: {
    fontSize: 16,
    color: '#00B5E2',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
