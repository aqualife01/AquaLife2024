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
import { db } from '../../firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from 'firebase/firestore';
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

  // Contraseña + Confirmar
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Mostrar/ocultar contraseña
  const [showPass, setShowPass] = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  // ==================== Reglas de validación ====================
  // Requerimos (por ejemplo):
  // - Mínimo 8 caracteres
  // - Al menos 1 mayúscula, 1 minúscula, 1 dígito
  // - Al menos 1 caracter especial de un set "seguro" (!@#$%^&*()_-+=)
  // - No tener espacios
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=])[A-Za-z\d!@#$%^&*()_\-+=]{8,}$/;

  // Requerimos solo letras y espacios en nombre
  const nameRegex = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/;
  // Teléfono solo dígitos
  const phoneRegex = /^[0-9]+$/;
  // Email sencillo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ==================== Función para medir seguridad de la pass ====================
  function getPasswordStrength(pw: string): string {
    if (pw.length === 0) return ''; // sin texto

    let score = 0;

    if (pw.length >= 8) score++; // +1 longitud >= 8
    if (/[A-Z]/.test(pw)) score++; // mayúscula
    if (/[a-z]/.test(pw)) score++; // minúscula
    if (/\d/.test(pw)) score++;    // dígito
    if (/[!@#$%^&*()_\-+=]/.test(pw)) score++; // caracter especial

    if (score <= 2) return 'Débil';
    if (score <= 4) return 'Media';
    return 'Fuerte';
  }

  // ==================== Manejar el Registro ====================
  const handleRegister = async () => {
    // Validar campos vacíos
    if (!name || !cedula || !telefono || !direccion || !email || !password) {
      showToast('error', 'Por favor, completa todos los campos.');
      return;
    }

    // Validar Nombre
    if (!nameRegex.test(name)) {
      showToast('error', 'El nombre solo puede contener letras y espacios.');
      return;
    }

    // Validar Cédula (numérico)
    const cedulaNum = parseInt(cedula.trim(), 10);
    if (isNaN(cedulaNum)) {
      showToast('error', 'La cédula debe ser un valor numérico.');
      return;
    }

    // Validar Teléfono (numérico)
    if (!phoneRegex.test(telefono)) {
      showToast('error', 'El teléfono solo puede contener dígitos.');
      return;
    }

    // Validar Email
    if (!emailRegex.test(email.trim())) {
      showToast('error', 'El formato del correo no es válido.');
      return;
    }

    // Validar Contraseña con confirmación
    if (password !== confirmPassword) {
      showToast('error', 'Las contraseñas no coinciden.');
      return;
    }

    // Validar Password con regex (según tus requisitos)
    if (!passwordRegex.test(password)) {
      showToast(
        'error',
        'La contraseña debe tener al menos 8 caracteres, ' +
          '1 mayúscula, 1 minúscula, 1 dígito y 1 caracter especial (!@#$%^&*()_-+=).'
      );
      return;
    }

    setLoading(true);

    try {
      // A) Revisar si ya existe un cliente con esa cédula
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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const user = userCredential.user;

      // C) Crear el doc en "Clientes" (activo: true)
      await setDoc(doc(db, 'Clientes', user.uid), {
        nombre: name.trim(),
        cedula: cedulaNum,
        telefono: telefono.trim(),
        direccion: direccion.trim(),
        email: email.trim(),
        tipo: 'cliente',
        activo: true,
      });

      showToast('success', 'Registro exitoso.');
      setLoading(false);

      navigation.replace('Login');
    } catch (error: any) {
      setLoading(false);

      if (error && 'code' in error) {
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

  // ==================== Helper: mostrar Toast ====================
  const showToast = (type: 'success' | 'error', message: string) => {
    Toast.show({
      type,
      text1: type === 'success' ? '¡Éxito!' : 'Error',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  };

  // ==================== Render ====================
  const passwordLevel = getPasswordStrength(password);

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
          <View style={styles.passRow}>
            <TextInput
              style={[globalStyles.input, styles.inputPass]}
              placeholder="Contraseña"
              placeholderTextColor="#888888"
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPass(!showPass)}
            >
              <Text style={styles.eyeButtonText}>
                {showPass ? '🙈' : '👁'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* CONFIRMAR CONTRASEÑA */}
          <View style={styles.passRow}>
            <TextInput
              style={[globalStyles.input, styles.inputPass]}
              placeholder="Confirmar Contraseña"
              placeholderTextColor="#888888"
              secureTextEntry={!showPassConfirm}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassConfirm(!showPassConfirm)}
            >
              <Text style={styles.eyeButtonText}>
                {showPassConfirm ? '🙈' : '👁'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Mensaje de requisitos */}
          {password.length > 0 && (
            <Text style={styles.passRules}>
              La contraseña debe tener mínimo 8 caracteres, al menos 1 mayúscula,
              1 minúscula, 1 dígito y 1 caracter especial (!@#$%^&*()_-+=).
            </Text>
          )}

          {/* Nivel de seguridad */}
          {password.length > 0 && (
            <Text
              style={[
                styles.passLevelText,
                passwordLevel === 'Débil'
                  ? { color: 'red' }
                  : passwordLevel === 'Media'
                  ? { color: 'orange' }
                  : { color: 'green' },
              ]}
            >
              Seguridad: {passwordLevel}
            </Text>
          )}

          {loading && <ActivityIndicator size="large" color={colors.primary} />}

          {/* BOTÓN REGISTRARSE */}
          <TouchableOpacity
            style={globalStyles.primaryButton}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={globalStyles.primaryButtonText}>Registrarse</Text>
          </TouchableOpacity>

          {/* ¿YA TIENES CUENTA? LOGIN */}
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
  passRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputPass: {
    flex: 1,
    marginRight: 8,
  },
  eyeButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#eee',
  },
  eyeButtonText: {
    fontSize: 18,
  },
  passRules: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  passLevelText: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: 'bold',
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
