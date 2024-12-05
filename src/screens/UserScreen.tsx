import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { globalStyles, colors } from '../styles/globalStyles';
import { getAuth, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type PerfilUsuarioScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DashboardDrawer'>;

interface Props {
  navigation: PerfilUsuarioScreenNavigationProp;
}

const PerfilUsuario: React.FC<Props> = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [password, setPassword] = useState('');

  // Obtener datos del usuario desde Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'Clientes', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setNombre(userData.nombre || '');
            setDireccion(userData.direccion || '');
            setTelefono(userData.telefono || '');
            setEmail(userData.email || '');
          }
        } catch (error) {
          Alert.alert('Error', 'No se pudo cargar la información del usuario.');
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleGuardar = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        await updateDoc(doc(db, 'Clientes', user.uid), {
          nombre,
          direccion,
          telefono,
        });
        Alert.alert('Éxito', 'Datos guardados con éxito');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar los cambios.');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarCuenta = async () => {
    setModalVisible(true);
  };

  const confirmDeleteAccount = async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user && password) {
        // Reautenticar al usuario antes de eliminar
        const credential = EmailAuthProvider.credential(email, password);
        await reauthenticateWithCredential(user, credential);

        // Eliminar documento del usuario en Firestore
        await deleteDoc(doc(db, 'Clientes', user.uid));
        // Eliminar cuenta de usuario en Firebase Authentication
        await deleteUser(user);

        Alert.alert('Éxito', 'Cuenta eliminada con éxito');
        setModalVisible(false);
        // Redirigir al usuario a la pantalla de inicio de sesión
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', 'Se requiere la contraseña para eliminar la cuenta.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar la cuenta. La reautenticación falló.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.outerContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primaryDark} />
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <View style={styles.profilePictureContainer}>
            <View style={styles.profilePicture} />
            <Text style={styles.profileName}>{nombre.toUpperCase()}</Text>
          </View>

          <Text style={globalStyles.headerText}>Información personal</Text>

          <View style={styles.row}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre:</Text>
              <TextInput
                style={globalStyles.input}
                value={nombre}
                onChangeText={(text) => setNombre(text)}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Dirección:</Text>
              <TextInput
                style={globalStyles.input}
                value={direccion}
                onChangeText={(text) => setDireccion(text)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Teléfono:</Text>
              <TextInput
                style={globalStyles.input}
                value={telefono}
                onChangeText={(text) => setTelefono(text)}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email:</Text>
              <TextInput
                style={globalStyles.input}
                value={email}
                editable={false} // No editable para evitar cambios en el email
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={globalStyles.primaryButton}
              onPress={handleGuardar}
            >
              <Text style={globalStyles.primaryButtonText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleEliminarCuenta}
            >
              <Text style={globalStyles.primaryButtonText}>Eliminar Cuenta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal para solicitar la contraseña antes de eliminar la cuenta */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Eliminar cuenta</Text>
            <Text style={styles.modalText}>Introduce tu contraseña para eliminar la cuenta:</Text>
            <TextInput
              style={globalStyles.input}
              secureTextEntry
              value={password}
              onChangeText={(text) => setPassword(text)}
              placeholder="Contraseña"
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.deleteButton, { marginRight: 10 }]}
                onPress={confirmDeleteAccount}
              >
                <Text style={globalStyles.primaryButtonText}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.primaryButton, { backgroundColor: colors.secondary }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={globalStyles.primaryButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  card: {
    width: '95%',
    maxWidth: 600,
    backgroundColor: colors.primaryShades[50],
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    backgroundColor: colors.primaryDark,
    borderRadius: 50,
    width: 100,
    height: 100,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: colors.textPrimary,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deleteButton: {
    backgroundColor: colors.error,
    padding: 10,
    borderRadius: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
});

export default PerfilUsuario;
