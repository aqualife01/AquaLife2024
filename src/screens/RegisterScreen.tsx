import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../../firebaseConfig'; // Tu configuración de Firestore
import { setDoc, doc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';

// EJEMPLO LOCAL de 'colors'. Si tienes un archivo de tema, impórtalo desde allí.
const colors = {
  primary: '#00B5E2',
  // Puedes añadir más colores según tu paleta.
};

// EJEMPLO LOCAL de 'globalStyles'. Si ya tienes uno, impórtalo en vez de definirlo aquí.
const globalStyles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    // Defínelo según tus necesidades
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);

  // Manejar el Registro
  const handleRegister = async () => {
    if (!email || !password || !name || !telefono || !direccion) {
      showToast('error', 'Por favor, completa todos los campos.');
      return;
    }

    const auth = getAuth();
    setLoading(true);

    try {
      // Registrar al usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Crear un documento en la colección "Clientes" usando el UID del usuario
      await setDoc(doc(db, 'Clientes', user.uid), {
        nombre: name,
        telefono,
        direccion,
        email,
        tipo: "cliente", // <-- Campo agregado automáticamente
      });

      // Mostrar mensaje de éxito
      showToast('success', 'Registro exitoso.');

      // Ir a la pantalla de inicio de sesión
      setLoading(false);
      navigation.replace('Login'); // O navigation.navigate('Login')
    } catch (error: any) {
      setLoading(false);

      if (typeof error === 'object' && error !== null && 'code' in error) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            showToast('error', 'El correo ya está registrado.');
            break;
          case 'auth/invalid-email':
            showToast('error', 'El formato del correo no es válido.');
            break;
          case 'auth/weak-password':
            showToast('error', 'La contraseña debe tener al menos 6 caracteres.');
            break;
          default:
            showToast('error', 'Ha ocurrido un error. Inténtalo de nuevo.');
        }
      } else {
        showToast('error', 'Ha ocurrido un error inesperado.');
      }
    }
  };

  // Mostrar Toast
  const showToast = (type: 'success' | 'error', message: string) => {
    Toast.show({
      type,
      text1: type === 'success' ? '¡Éxito!' : 'Error',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  };

  return (
    <>
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

          {/* Campo de Teléfono */}
          <TextInput
            style={[globalStyles.input, styles.input]}
            placeholder="Teléfono"
            placeholderTextColor="#888888"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />

          {/* Campo de Dirección */}
          <TextInput
            style={[globalStyles.input, styles.input]}
            placeholder="Dirección"
            placeholderTextColor="#888888"
            value={direccion}
            onChangeText={setDireccion}
          />

          {/* Campo de Email */}
          <TextInput
            style={[globalStyles.input, styles.input]}
            placeholder="Correo electrónico"
            placeholderTextColor="#888888"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
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

          {/* Indicador de carga */}
          {loading && <ActivityIndicator size="large" color={colors.primary} />}

          {/* Botón de Registro */}
          <TouchableOpacity
            style={globalStyles.primaryButton}
            onPress={handleRegister}
            disabled={loading}
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
      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    width: '100%',
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
    color: colors.primary, // Usamos el 'colors' definido localmente
    marginLeft: 5,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
