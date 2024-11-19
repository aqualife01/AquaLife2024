import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { globalStyles } from '../styles/globalStyles';

// Especifica el tipo de navegación para LoginScreen
type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Login'
>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Simulación de inicio de sesión
    alert('Inicio de sesión exitoso');
    navigation.navigate('Dashboard'); // Navega al Dashboard
  };

  return (
    <View style={[globalStyles.container, styles.outerContainer]}>
      {/* Contenedor centralizado */}
      <View style={styles.innerContainer}>
        <Text style={[globalStyles.title, styles.titleText]}>
          Iniciar Sesión
        </Text>

        {/* Campo de Email */}
        <TextInput
          style={[globalStyles.input, styles.input]}
          placeholder="Email"
          placeholderTextColor="#888888"
          value={email}
          onChangeText={setEmail}
        />

        {/* Campo de Contraseña */}
        <TextInput
          style={[globalStyles.input, styles.input]}
          placeholder="Contraseña"
          placeholderTextColor="#888888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Botón de Ingresar */}
        <TouchableOpacity
          style={globalStyles.primaryButton}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={globalStyles.primaryButtonText}>Ingresar</Text>
        </TouchableOpacity>

        {/* Botón de Registro */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>¿No tienes cuenta?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    justifyContent: 'center', // Centra el contenido verticalmente
    alignItems: 'center', // Centra el contenido horizontalmente
    backgroundColor: '#F5F5F5', // Fondo más claro para el contenedor externo
  },
  innerContainer: {
    width: '90%', // Ajusta el ancho del cuadro
    maxWidth: 400, // Máximo tamaño para pantallas grandes
    padding: 20, // Espaciado interno
    backgroundColor: '#FFFFFF', // Fondo blanco para el cuadro
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
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 16,
    color: '#757575',
  },
  registerLink: {
    fontSize: 16,
    color: '#00B5E2',
    marginLeft: 5,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
