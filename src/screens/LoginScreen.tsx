import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { globalStyles } from '../styles/globalStyles';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';

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
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('error', 'Por favor ingresa correo y contraseña.');
      return;
    }
  
    const auth = getAuth();
    setLoading(true);
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Obtener el tipo de usuario desde Firestore
      const userDoc = await getDoc(doc(db, 'Clientes', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userType = userData?.tipo;
  
        setLoading(false);
        showToast('success', 'Inicio de sesión exitoso. Accediendo...');
  
        // Redirigir según el tipo de usuario
        navigation.navigate('DashboardDrawer', { userType });
      } else {
        setLoading(false);
        showToast('error', 'No se pudo obtener la información del usuario.');
      }
    } catch (error: any) {
      setLoading(false);
      // Manejo de errores con mensajes específicos
      switch (error.code) {
        case 'auth/user-not-found':
          showToastWithAction(
            'error',
            'El correo no está registrado.',
            '¿Registrarse?',
            () => navigation.navigate('Register')
          );
          break;
        case 'auth/wrong-password':
          showToast('error', 'Correo o contraseña incorrectos.');
          break;
        case 'auth/invalid-email':
          showToast('error', 'El formato del correo no es válido.');
          break;
        default:
          showToast('error', 'Ha ocurrido un error. Inténtalo de nuevo.');
      }
    }
  };
  

  const showToast = (type: 'success' | 'error', message: string) => {
    Toast.show({
      type,
      text1: type === 'success' ? '¡Éxito!' : 'Error',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  };

  const showToastWithAction = (
    type: 'success' | 'error',
    message: string,
    actionText: string,
    actionCallback: () => void
  ) => {
    Toast.show({
      type,
      text1: type === 'success' ? '¡Éxito!' : 'Error',
      text2: message,
      position: 'top',
      visibilityTime: 4000,
      onPress: actionCallback,
      props: { actionText },
    });
  };

  return (
    <>
      <View style={[globalStyles.container, styles.outerContainer]}>
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

          {/* Mensaje de comprobando */}
          {loading && <ActivityIndicator size="large" color="#00B5E2" />}

          {/* Botón de Ingresar */}
          <TouchableOpacity
            style={globalStyles.primaryButton}
            onPress={handleLogin}
            disabled={loading}
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
      <Toast />
    </>
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
