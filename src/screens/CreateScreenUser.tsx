import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../../firebaseConfig';
import Toast from 'react-native-toast-message';

// Interfaz para documentos en la colección "usuarios"
interface UsuarioDoc {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  password?: string;
  tipo?: string; // "admin"
}

// Interfaz para documentos en la colección "clientes"
interface ClienteDoc {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  password?: string;
  tipo?: string; // "cliente"
}

// Colores de ejemplo
const colors = {
  primary: '#00B5E2',
  secondary: '#FF6565',
};

const CreateUserScreen = () => {
  // Estados para las listas
  const [listaUsuarios, setListaUsuarios] = useState<UsuarioDoc[]>([]);
  const [listaClientes, setListaClientes] = useState<ClienteDoc[]>([]);

  // Formulario
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [password, setPassword] = useState('');
  // Determina si se crea en "usuarios" (tipo=admin) o "Clientes" (tipo=cliente)
  const [tipo, setTipo] = useState<'usuario' | 'cliente'>('cliente');
  const [loading, setLoading] = useState(false);

  // Suscribirse a "usuarios"
  useEffect(() => {
    const unsubscribeUsers = onSnapshot(collection(db, 'usuarios'), (snapshot) => {
      const data: UsuarioDoc[] = snapshot.docs.map((documento) => {
        const docData = documento.data() as Omit<UsuarioDoc, 'id'>;
        return {
          id: documento.id,
          ...docData,
        };
      });
      setListaUsuarios(data);
    });

    // Suscribirse a "Clientes"
    const unsubscribeClients = onSnapshot(collection(db, 'Clientes'), (snapshot) => {
      const data: ClienteDoc[] = snapshot.docs.map((documento) => {
        const docData = documento.data() as Omit<ClienteDoc, 'id'>;
        return {
          id: documento.id,
          ...docData,
        };
      });
      setListaClientes(data);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeClients();
    };
  }, []);

  // Crear nuevo user/cliente TANTO en Auth como en Firestore
  const handleCreate = async () => {
    if (!nombre || !email || !telefono || !direccion) {
      showToast('error', 'Completa todos los campos requeridos.');
      return;
    }
    if (!password) {
      showToast('error', 'Debes especificar una contraseña para el Auth.');
      return;
    }

    setLoading(true);

    try {
      // 1. Crear en Firebase Auth
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;  // user.uid

      // 2. Crear en Firestore
      let collectionName = 'Clientes'; // por defecto
      let valorTipo = 'cliente';

      if (tipo === 'usuario') {
        collectionName = 'usuarios';
        valorTipo = 'admin';
      }

      // Usamos setDoc para que el doc ID en Firestore coincida con el UID de Auth
      await setDoc(doc(db, collectionName, user.uid), {
        nombre,
        email,
        telefono,
        direccion,
        // OJO: No es buena práctica guardar password en texto plano,
        // pero si lo deseas, aquí lo guardamos:
        password,
        tipo: valorTipo,
      });

      showToast('success', `Se creó un ${valorTipo} correctamente en Auth y Firestore.`);

      // Limpiar campos
      setNombre('');
      setEmail('');
      setTelefono('');
      setDireccion('');
      setPassword('');
      setTipo('cliente');
      setShowForm(false);

    } catch (error) {
      console.error('Error al crear registro:', error);
      showToast('error', 'No se pudo crear. Intenta de nuevo.');
    }
    setLoading(false);
  };

  // Mostrar toast
  const showToast = (type: 'success' | 'error', message: string) => {
    Toast.show({
      type,
      text1: type === 'success' ? '¡Éxito!' : 'Error',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  };

  // Render item en lista de usuarios
  const renderItemUsuario = ({ item }: { item: UsuarioDoc }) => (
    <View style={styles.listItem}>
      <Text style={styles.listItemText}>{item.nombre}</Text>
      <Text style={styles.listItemSub}>{item.email}</Text>
      {item.tipo && <Text style={styles.listItemSub}>{item.tipo}</Text>}
    </View>
  );

  // Render item en lista de clientes
  const renderItemCliente = ({ item }: { item: ClienteDoc }) => (
    <View style={styles.listItem}>
      <Text style={styles.listItemText}>{item.nombre}</Text>
      <Text style={styles.listItemSub}>{item.email}</Text>
      {item.tipo && <Text style={styles.listItemSub}>{item.tipo}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Administrar Usuarios/Clientes</Text>

      {/* Botón para mostrar/ocultar formulario */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowForm(!showForm)}
      >
        <Text style={styles.addButtonText}>
          {showForm ? 'Cancelar' : '+ Añadir'}
        </Text>
      </TouchableOpacity>

      {/* Formulario expandible */}
      {showForm && (
        <ScrollView style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {tipo === 'cliente' ? 'Registrar Cliente' : 'Registrar Usuario'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre completo"
            value={nombre}
            onChangeText={setNombre}
          />
          <TextInput
            style={styles.input}
            placeholder="Correo"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Dirección"
            value={direccion}
            onChangeText={setDireccion}
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Botones para tipo: usuario (admin) o cliente */}
          <View style={styles.tipoContainer}>
            <TouchableOpacity
              style={[
                styles.tipoButton,
                tipo === 'usuario' && styles.tipoButtonSelected,
              ]}
              onPress={() => setTipo('usuario')}
            >
              <Text
                style={[
                  styles.tipoButtonText,
                  tipo === 'usuario' && styles.tipoButtonTextSelected,
                ]}
              >
                Usuario
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tipoButton,
                tipo === 'cliente' && styles.tipoButtonSelected,
              ]}
              onPress={() => setTipo('cliente')}
            >
              <Text
                style={[
                  styles.tipoButtonText,
                  tipo === 'cliente' && styles.tipoButtonTextSelected,
                ]}
              >
                Cliente
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <TouchableOpacity style={styles.saveButton} onPress={handleCreate}>
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {/* Dos columnas: usuarios (izq) y clientes (der) */}
      <View style={styles.rowContainer}>
        {/* Usuarios */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Lista de Usuarios</Text>
          {listaUsuarios.length === 0 ? (
            <Text style={styles.emptyText}>No hay usuarios</Text>
          ) : (
            <FlatList
              data={listaUsuarios}
              renderItem={renderItemUsuario}
              keyExtractor={(item) => item.id}
            />
          )}
        </View>

        {/* Clientes */}
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Lista de Clientes</Text>
          {listaClientes.length === 0 ? (
            <Text style={styles.emptyText}>No hay clientes</Text>
          ) : (
            <FlatList
              data={listaClientes}
              renderItem={renderItemCliente}
              keyExtractor={(item) => item.id}
            />
          )}
        </View>
      </View>

      <Toast />
    </View>
  );
};

export default CreateUserScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    alignSelf: 'center',
    width: '30%',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fafafa',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  tipoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 10,
  },
  tipoButton: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  tipoButtonSelected: {
    backgroundColor: colors.primary,
  },
  tipoButtonText: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  tipoButtonTextSelected: {
    color: '#fff',
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
    width: '40%',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 10,
  },
  column: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    color: colors.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
  },
  listItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 6,
  },
  listItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listItemSub: {
    fontSize: 12,
    color: '#555',
  },
});
