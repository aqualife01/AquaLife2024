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
import { collection, query, where, getDocs } from 'firebase/firestore';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

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
      // Autenticar al usuario usando Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Buscar el usuario en 'Clientes' por email
      let userData;
      let userType;
      const clientesQuery = query(collection(db, 'Clientes'), where('email', '==', email));
      const clientesSnapshot = await getDocs(clientesQuery);
  
      if (!clientesSnapshot.empty) {
        userData = clientesSnapshot.docs[0].data();
        userType = userData?.tipo; // Tipo de usuario de 'Clientes'
      } else {
        // Si no existe en 'Clientes', buscar en 'usuarios'
        const usuariosQuery = query(collection(db, 'usuarios'), where('email', '==', email));
        const usuariosSnapshot = await getDocs(usuariosQuery);
  
        if (!usuariosSnapshot.empty) {
          userData = usuariosSnapshot.docs[0].data();
          userType = userData?.tipo; // Tipo de usuario de 'usuarios'
        } else {
          throw new Error('No se pudo encontrar la información del usuario.');
        }
      }
  
      setLoading(false);
      showToast('success', 'Inicio de sesión exitoso. Accediendo...');
  
      if (userType === 'cliente' || userType === 'admin') {
        navigation.navigate('MainDrawer', { userType });
      } else {
        throw new Error('Tipo de usuario desconocido.');
      }
      
    } catch (error: any) {
      setLoading(false);
      console.error(error.message);
  
      switch (error.code) {
        case 'auth/user-not-found':
          showToast('error', 'El correo no está registrado.');
          break;
        case 'auth/wrong-password':
          showToast('error', 'Correo o contraseña incorrectos.');
          break;
        case 'auth/invalid-email':
          showToast('error', 'El formato del correo no es válido.');
          break;
        default:
          showToast('error', error.message || 'Ha ocurrido un error.');
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
          <Text style={[globalStyles.title, styles.titleText]}>Iniciar Sesión</Text>
          <TextInput
            style={[globalStyles.input, styles.input]}
            placeholder="Email"
            placeholderTextColor="#888888"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={[globalStyles.input, styles.input]}
            placeholder="Contraseña"
            placeholderTextColor="#888888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {loading && <ActivityIndicator size="large" color="#00B5E2" />}
          <TouchableOpacity style={globalStyles.primaryButton} onPress={handleLogin} disabled={loading}>
            <Text style={globalStyles.primaryButtonText}>Ingresar</Text>
          </TouchableOpacity>
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
