// RegisterScreen.tsx
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
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import Toast from 'react-native-toast-message';

const colors = {
  primary: '#00B5E2',
};

const globalStyles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
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
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Expresiones regulares para validaciones básicas
  const nameRegex = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/;    // Solo letras y espacios
  const phoneRegex = /^[0-9]+$/;                   // Solo dígitos
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  // Patrón sencillo de email

  const handleRegister = async () => {
    // 1) Verificar que todos los campos tengan valores
    if (!name || !cedula || !telefono || !direccion || !email || !password) {
      showToast('error', 'Por favor, completa todos los campos.');
      return;
    }

    // 2) Validar Nombre (sin dígitos)
    if (!nameRegex.test(name)) {
      showToast('error', 'El nombre solo puede contener letras y espacios.');
      return;
    }

    // 3) Validar Cédula (numérica y no repetida)
    const cedulaNum = parseInt(cedula.trim(), 10);
    if (isNaN(cedulaNum)) {
      showToast('error', 'La cédula debe ser un valor numérico.');
      return;
    }

    // 4) Validar Teléfono (numérico)
    if (!phoneRegex.test(telefono)) {
      showToast('error', 'El teléfono solo puede contener dígitos.');
      return;
    }

    // 5) Validar Email (regex simple)
    if (!emailRegex.test(email.trim())) {
      showToast('error', 'El formato del correo no es válido.');
      return;
    }

    // 6) Validar Password (al menos 6 caracteres, u otras condiciones)
    if (password.length < 6) {
      showToast('error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      // A) Revisar si ya existe alguien con esa cédula
      const clientesRef = collection(db, 'Clientes');
      const qClientes = query(clientesRef, where('cedula', '==', cedulaNum));
      const existing = await getDocs(qClientes);
      if (!existing.empty) {
        setLoading(false);
        showToast('error', 'La cédula ya está registrada con otro usuario.');
        return;
      }

      // B) Crear usuario en Firebase Auth
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      // C) Crear el documento en la colección "Clientes"
      //    Agregamos campo "activo: true"
      await setDoc(doc(db, 'Clientes', user.uid), {
        nombre: name.trim(),
        cedula: cedulaNum,
        telefono: telefono.trim(),
        direccion: direccion.trim(),
        email: email.trim(),
        tipo: 'cliente',
        activo: true,             // <-- Campo activo en true
      });

      showToast('success', 'Registro exitoso.');
      setLoading(false);

      // Redirigir a Login
      navigation.replace('Login');
    } catch (error: any) {
      setLoading(false);

      if (error && 'code' in error) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            showToast('error', 'El correo ya está registrado.');
            break;
          case 'auth/invalid-email':
            // Nota: normalm. no llegamos aquí por la verificación manual
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

          {/* NOMBRE */}
          <TextInput
            style={[globalStyles.input, styles.input]}
            placeholder="Nombre completo"
            placeholderTextColor="#888888"
            value={name}
            onChangeText={setName}
          />

          {/* CÉDULA */}
          <TextInput
            style={[globalStyles.input, styles.input]}
            placeholder="Cédula"
            placeholderTextColor="#888888"
            value={cedula}
            onChangeText={setCedula}
            keyboardType="numeric"
          />

          {/* TELÉFONO */}
          <TextInput
            style={[globalStyles.input, styles.input]}
            placeholder="Teléfono"
            placeholderTextColor="#888888"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />

          {/* DIRECCIÓN */}
          <TextInput
            style={[globalStyles.input, styles.input]}
            placeholder="Dirección"
            placeholderTextColor="#888888"
            value={direccion}
            onChangeText={setDireccion}
          />

          {/* EMAIL */}
          <TextInput
            style={[globalStyles.input, styles.input]}
            placeholder="Correo electrónico"
            placeholderTextColor="#888888"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          {/* CONTRASEÑA */}
          <TextInput
            style={[globalStyles.input, styles.input]}
            placeholder="Contraseña"
            placeholderTextColor="#888888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {loading && <ActivityIndicator size="large" color={colors.primary} />}

          {/* BOTÓN REGISTRARSE */}
          <TouchableOpacity
            style={globalStyles.primaryButton}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={globalStyles.primaryButtonText}>Registrarse</Text>
          </TouchableOpacity>

          {/* YA TIENES CUENTA? LOGIN */}
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

// Estilos locales
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
    color: colors.primary,
    marginLeft: 5,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
