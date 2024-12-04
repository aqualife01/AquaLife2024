import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { globalStyles } from '../styles/globalStyles';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import app from '../../firebaseConfig';

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

  const handleLogin = async () => {
    const auth = getAuth(app); // Inicializa Firebase Auth
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Inicio de sesión exitoso', 'Accediendo...');
      navigation.navigate('DashboardDrawer'); // Asegúrate de que coincide con el nombre de la ruta
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error de inicio de sesión', error.message);
    }
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
          autoCapitalize="none"
          keyboardType="email-address"
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
          onPress={handleLogin}
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  innerContainer: {
    width: '90%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
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
