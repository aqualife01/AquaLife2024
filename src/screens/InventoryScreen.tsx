// InventoryScreen.tsx (Versión con timestamp automático en Movimientos)
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  FlatList,
} from 'react-native';
import {
  collection,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import Toast from 'react-native-toast-message';

interface ArticuloDoc {
  id: string;
  nombre: string;
  categoria: string;
  cantidad: number;
  unidad: string;
}

interface MovimientoDoc {
  id: string;
  // Usamos "timestamp" en vez de "fecha". 
  timestamp: any;         // serverTimestamp() => FieldValue
  tipoMovimiento: string; // "entrada" / "salida"
  cantidad: number;
  observaciones?: string;
}

interface SelectedItem {
  id: string;
}

const colors = {
  primary: '#00B5E2',
  secondary: '#FF6565',
};

const InventoryScreen = () => {
  // Lista de artículos en Firestore
  const [articulos, setArticulos] = useState<ArticuloDoc[]>([]);
  
  // Formulario (crear/editar artículo)
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [cantidad, setCantidad] = useState<number>(0);
  const [unidad, setUnidad] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Seleccionar un artículo para ver sus movimientos
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [movimientos, setMovimientos] = useState<MovimientoDoc[]>([]);
  
  // Form para nuevo movimiento
  const [tipoMovimiento, setTipoMovimiento] = useState<'entrada' | 'salida'>('entrada');
  const [cantidadMovimiento, setCantidadMovimiento] = useState<number>(0);
  const [obsMovimiento, setObsMovimiento] = useState('');

  // Suscribirse a "Inventario"
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'Inventario'), (snapshot) => {
      const data: ArticuloDoc[] = snapshot.docs.map((docu) => ({
        id: docu.id,
        ...(docu.data() as Omit<ArticuloDoc, 'id'>),
      }));
      setArticulos(data);
    });
    return () => unsubscribe();
  }, []);

  // Crear/Editar un artículo
  const handleSave = async () => {
    if (!nombre || !categoria || !unidad) {
      showToast('error', 'Completa nombre, categoría y unidad.');
      return;
    }
    setLoading(true);

    try {
      if (editingId) {
        // Editar
        await updateDoc(doc(db, 'Inventario', editingId), {
          nombre,
          categoria,
          cantidad,
          unidad,
        });
        showToast('success', 'Artículo actualizado.');
        setEditingId(null);
      } else {
        // Crear
        await addDoc(collection(db, 'Inventario'), {
          nombre,
          categoria,
          cantidad,
          unidad,
        });
        showToast('success', 'Artículo creado.');
      }
      // Reset form
      setNombre('');
      setCategoria('');
      setCantidad(0);
      setUnidad('');
      setShowForm(false);
    } catch (error) {
      console.error(error);
      showToast('error', 'No se pudo guardar.');
    }
    setLoading(false);
  };

  // Seleccionar artículo para edición
  const handleSelectEdit = (item: ArticuloDoc) => {
    setEditingId(item.id);
    setNombre(item.nombre);
    setCategoria(item.categoria);
    setCantidad(item.cantidad);
    setUnidad(item.unidad);
    setShowForm(true);
  };

  // Eliminar artículo
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'Inventario', id));
      showToast('success', 'Artículo eliminado.');
    } catch (err) {
      console.error(err);
      showToast('error', 'No se pudo eliminar.');
    }
  };

  // Seleccionar un artículo para ver subcolección "Movimientos"
  const handleSelectItem = async (id: string) => {
    if (selectedItem?.id === id) {
      // Si es el mismo, deselecciona
      setSelectedItem(null);
      setMovimientos([]);
      return;
    }
    setSelectedItem({ id });

    // Cargar subcolección Movimientos
    const subColRef = collection(db, 'Inventario', id, 'Movimientos');
    const docsSnap = await getDocs(subColRef);
    const data: MovimientoDoc[] = docsSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<MovimientoDoc, 'id'>),
    }));
    setMovimientos(data);
  };

  // Agregar nuevo movimiento con timestamp
  const handleAddMovimiento = async () => {
    if (!selectedItem) return;
    if (!cantidadMovimiento) {
      showToast('error', 'Ingresa la cantidad del movimiento.');
      return;
    }
    try {
      await addDoc(collection(db, 'Inventario', selectedItem.id, 'Movimientos'), {
        // El "timestamp" se guarda con serverTimestamp()
        timestamp: serverTimestamp(),
        tipoMovimiento,
        cantidad: cantidadMovimiento,
        observaciones: obsMovimiento,
      });
      showToast('success', 'Movimiento registrado.');
      // limpiar form
      setTipoMovimiento('entrada');
      setCantidadMovimiento(0);
      setObsMovimiento('');
      // recargar
      handleSelectItem(selectedItem.id);
    } catch (error) {
      console.error(error);
      showToast('error', 'No se pudo registrar el movimiento.');
    }
  };

  // Renderiza cada artículo en la lista
  const renderItemArticulo = ({ item }: { item: ArticuloDoc }) => {
    const isSelected = selectedItem?.id === item.id;

    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity onPress={() => handleSelectItem(item.id)}>
          <Text style={styles.itemTitle}>{item.nombre}</Text>
          <Text style={styles.itemSubtitle}>
            Categoría: {item.categoria} | Cantidad: {item.cantidad} {item.unidad}
          </Text>
        </TouchableOpacity>
        
        {/* Botones de edición/eliminación */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleSelectEdit(item)}>
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.id)}>
            <Text style={styles.actionButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>

        {/* Si el artículo está seleccionado, mostramos la sección de movimientos */}
        {isSelected && (
          <View style={styles.movimientosContainer}>
            <Text style={styles.movTitle}>Movimientos del Artículo</Text>
            
            {movimientos.length === 0 ? (
              <Text>No hay movimientos.</Text>
            ) : (
              movimientos.map((mov) => (
                <View key={mov.id} style={styles.movItem}>
                  {/* Convertimos serverTimestamp() en algo legible si deseas */}
                  <Text>
                    Fecha/Hora:{" "}
                    {mov.timestamp
                      ? new Date(mov.timestamp.toDate()).toLocaleString()
                      : "—"}
                  </Text>
                  <Text>Tipo: {mov.tipoMovimiento}</Text>
                  <Text>Cant: {mov.cantidad}</Text>
                  {mov.observaciones && <Text>Obs: {mov.observaciones}</Text>}
                </View>
              ))
            )}

            {/* Form para nuevo movimiento */}
            <View style={styles.tipoRow}>
              <TouchableOpacity
                style={[
                  styles.tipoButton,
                  tipoMovimiento === 'entrada' && styles.tipoButtonSelected,
                ]}
                onPress={() => setTipoMovimiento('entrada')}
              >
                <Text
                  style={[
                    styles.tipoButtonText,
                    tipoMovimiento === 'entrada' && styles.tipoButtonTextSelected,
                  ]}
                >
                  Entrada
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tipoButton,
                  tipoMovimiento === 'salida' && styles.tipoButtonSelected,
                ]}
                onPress={() => setTipoMovimiento('salida')}
              >
                <Text
                  style={[
                    styles.tipoButtonText,
                    tipoMovimiento === 'salida' && styles.tipoButtonTextSelected,
                  ]}
                >
                  Salida
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Cantidad"
              keyboardType="numeric"
              value={cantidadMovimiento ? String(cantidadMovimiento) : ''}
              onChangeText={(text) => setCantidadMovimiento(Number(text) || 0)}
            />
            <TextInput
              style={styles.input}
              placeholder="Observaciones (opcional)"
              value={obsMovimiento}
              onChangeText={setObsMovimiento}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleAddMovimiento}>
              <Text style={styles.saveButtonText}>Registrar Movimiento</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Toast genérico
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
    <View style={styles.container}>
      <Text style={styles.header}>Gestión de Inventario</Text>
      <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(!showForm)}>
        <Text style={styles.addButtonText}>{showForm ? 'Cerrar' : '+ Añadir'}</Text>
      </TouchableOpacity>

      {/* Form para crear/editar artículo */}
      {showForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {editingId ? 'Editar Artículo' : 'Nuevo Artículo'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={nombre}
            onChangeText={setNombre}
          />
          <TextInput
            style={styles.input}
            placeholder="Categoría"
            value={categoria}
            onChangeText={setCategoria}
          />
          <TextInput
            style={styles.input}
            placeholder="Cantidad"
            keyboardType="numeric"
            value={cantidad ? String(cantidad) : ''}
            onChangeText={(text) => setCantidad(Number(text) || 0)}
          />
          <TextInput
            style={styles.input}
            placeholder="Unidad (unidades, litros, etc.)"
            value={unidad}
            onChangeText={setUnidad}
          />
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editingId ? 'Guardar Cambios' : 'Crear'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Lista principal de artículos */}
      <FlatList
        data={articulos}
        renderItem={renderItemArticulo}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <Toast />
    </View>
  );
};

export default InventoryScreen;

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fafafa',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  itemContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    padding: 12,
    // Sombra leve
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#555',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  actionButton: {
    backgroundColor: colors.secondary,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  movimientosContainer: {
    marginTop: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 8,
  },
  movTitle: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  movItem: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 6,
    marginBottom: 6,
  },
  tipoRow: {
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'space-around',
  },
  tipoButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  tipoButtonSelected: {
    backgroundColor: colors.primary,
  },
  tipoButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  tipoButtonTextSelected: {
    color: '#fff',
  },
});
