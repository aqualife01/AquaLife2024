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
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
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

// Para manejar el item seleccionado y saber si es "usuario" o "cliente"
interface SelectedItem {
  id: string;
  type: 'usuario' | 'cliente';
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

  // Control del formulario principal (crear usuario/cliente)
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [password, setPassword] = useState('');
  // Determina si se crea en "usuarios" (tipo=admin) o "Clientes" (tipo=cliente)
  const [tipo, setTipo] = useState<'usuario' | 'cliente'>('cliente');
  const [loading, setLoading] = useState(false);

  // Estado para item seleccionado (para mostrar botones de acción)
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

  // Estado para mostrar/hide formulario de modificación
  const [showEditForm, setShowEditForm] = useState(false);

  // Estados locales para la edición
  const [editNombre, setEditNombre] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editDireccion, setEditDireccion] = useState('');

  // Suscribirse a "usuarios" y "Clientes"
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
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user; // user.uid

      // 2. Crear en Firestore
      let collectionName = 'Clientes'; // por defecto
      let valorTipo = 'cliente';

      if (tipo === 'usuario') {
        collectionName = 'usuarios';
        valorTipo = 'admin';
      }

      // setDoc para que el doc ID en Firestore coincida con el UID de Auth
      await setDoc(doc(db, collectionName, user.uid), {
        nombre,
        email,
        telefono,
        direccion,
        password, // en texto plano, no recomendable
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

  // ======== Selección de item (mostrar botones de acción) ==========

  // al pulsar un item en la lista de usuarios
  const handleSelectUsuario = (id: string) => {
    // Si ya estaba seleccionado, al pulsar de nuevo lo deseleccionamos
    if (selectedItem?.id === id && selectedItem.type === 'usuario') {
      setSelectedItem(null);
    } else {
      setSelectedItem({ id, type: 'usuario' });
    }
    // Cerrar formulario de edición
    setShowEditForm(false);
  };

  // al pulsar un item en la lista de clientes
  const handleSelectCliente = (id: string) => {
    if (selectedItem?.id === id && selectedItem.type === 'cliente') {
      setSelectedItem(null);
    } else {
      setSelectedItem({ id, type: 'cliente' });
    }
    // Cerrar formulario de edición
    setShowEditForm(false);
  };

  // ======== Acciones en la sección de botones ==========
  
  // Botón "Cancelar": cierra la selección
  const handleCancelSelection = () => {
    setSelectedItem(null);
    setShowEditForm(false);
  };

  // "Modificar"
  // Abre un formulario para modificar nombre, telefono, direccion
  const handleModify = async () => {
    if (!selectedItem) return;
    // 1) Buscar el doc en la lista correspondiente
    let itemToEdit: UsuarioDoc | ClienteDoc | undefined;

    if (selectedItem.type === 'usuario') {
      itemToEdit = listaUsuarios.find((u) => u.id === selectedItem.id);
    } else {
      itemToEdit = listaClientes.find((c) => c.id === selectedItem.id);
    }

    if (!itemToEdit) {
      showToast('error', 'No se encontró el documento a editar.');
      return;
    }

    // 2) Rellenar estados de edición
    setEditNombre(itemToEdit.nombre);
    setEditTelefono(itemToEdit.telefono || '');
    setEditDireccion(itemToEdit.direccion || '');

    // 3) Mostrar formulario de edición
    setShowEditForm(true);
  };

  // Botón "Guardar" en el formulario de edición
  const handleSaveEdit = async () => {
    if (!selectedItem) return;
    const colName = selectedItem.type === 'usuario' ? 'usuarios' : 'Clientes';

    try {
      await updateDoc(doc(db, colName, selectedItem.id), {
        nombre: editNombre,
        telefono: editTelefono,
        direccion: editDireccion,
      });
      showToast('success', 'Datos modificados correctamente.');
      // Cerrar selección y formulario
      setSelectedItem(null);
      setShowEditForm(false);
    } catch (err) {
      console.error(err);
      showToast('error', 'No se pudo modificar.');
    }
  };

  // "Eliminar" (Firestore) 
  const handleDelete = async () => {
    if (!selectedItem) return;
    const colName = selectedItem.type === 'usuario' ? 'usuarios' : 'Clientes';

    try {
      await deleteDoc(doc(db, colName, selectedItem.id));
      showToast('success', 'Eliminado correctamente.');
      setSelectedItem(null);
      setShowEditForm(false);
    } catch (err) {
      console.error(err);
      showToast('error', 'No se pudo eliminar.');
    }
  };

  // "Desactivar" (podrías setear un campo "activo: false")
  const handleDeactivate = async () => {
    if (!selectedItem) return;
    const colName = selectedItem.type === 'usuario' ? 'usuarios' : 'Clientes';

    try {
      await updateDoc(doc(db, colName, selectedItem.id), {
        activo: false,
      });
      showToast('success', 'Desactivado correctamente.');
      setSelectedItem(null);
      setShowEditForm(false);
    } catch (err) {
      console.error(err);
      showToast('error', 'No se pudo desactivar.');
    }
  };

  // ======= Render item en lista de usuarios =======
  const renderItemUsuario = ({ item }: { item: UsuarioDoc }) => {
    const isSelected =
      selectedItem?.id === item.id && selectedItem?.type === 'usuario';

    return (
      <View style={styles.listItem}>
        <TouchableOpacity onPress={() => handleSelectUsuario(item.id)}>
          <Text style={styles.listItemText}>{item.nombre}</Text>
          <Text style={styles.listItemSub}>{item.email}</Text>
          {item.tipo && <Text style={styles.listItemSub}>{item.tipo}</Text>}
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleModify}>
              <Text style={styles.actionButtonText}>Modificar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
              <Text style={styles.actionButtonText}>Eliminar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleDeactivate}>
              <Text style={styles.actionButtonText}>Desactivar</Text>
            </TouchableOpacity>
            {/* Botón Cancelar */}
            <TouchableOpacity style={styles.actionButton} onPress={handleCancelSelection}>
              <Text style={styles.actionButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // ======= Render item en lista de clientes =======
  const renderItemCliente = ({ item }: { item: ClienteDoc }) => {
    const isSelected =
      selectedItem?.id === item.id && selectedItem?.type === 'cliente';

    return (
      <View style={styles.listItem}>
        <TouchableOpacity onPress={() => handleSelectCliente(item.id)}>
          <Text style={styles.listItemText}>{item.nombre}</Text>
          <Text style={styles.listItemSub}>{item.email}</Text>
          {item.tipo && <Text style={styles.listItemSub}>{item.tipo}</Text>}
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleModify}>
              <Text style={styles.actionButtonText}>Modificar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
              <Text style={styles.actionButtonText}>Eliminar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleDeactivate}>
              <Text style={styles.actionButtonText}>Desactivar</Text>
            </TouchableOpacity>
            {/* Botón Cancelar */}
            <TouchableOpacity style={styles.actionButton} onPress={handleCancelSelection}>
              <Text style={styles.actionButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Formulario de edición (mostrado si showEditForm = true)
  const renderEditForm = () => {
    if (!showEditForm) return null;
    return (
      <View style={styles.editFormContainer}>
        <Text style={styles.editFormTitle}>Editar Datos</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={editNombre}
          onChangeText={setEditNombre}
        />
        <TextInput
          style={styles.input}
          placeholder="Teléfono"
          value={editTelefono}
          onChangeText={setEditTelefono}
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Dirección"
          value={editDireccion}
          onChangeText={setEditDireccion}
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
          <Text style={styles.saveButtonText}>Guardar Cambios</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Administrar Usuarios/Clientes</Text>

      {/* Botón para mostrar/ocultar formulario de creación */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setShowForm(!showForm);
          // Cerrar la selección si está abierta
          setSelectedItem(null);
          setShowEditForm(false);
        }}
      >
        <Text style={styles.addButtonText}>
          {showForm ? 'Cancelar' : '+ Añadir'}
        </Text>
      </TouchableOpacity>

      {/* Formulario expandible de creación */}
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

      {/* Formulario de edición (si showEditForm = true) */}
      {renderEditForm()}

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
    marginBottom: 6,
  },
  listItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listItemSub: {
    fontSize: 12,
    color: '#555',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // se agrupan a la derecha
    marginTop: 6,
  },
  actionButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Formulario de edición
  editFormContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  editFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
});
