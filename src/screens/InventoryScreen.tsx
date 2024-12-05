import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { globalStyles } from '../styles/globalStyles';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Asegúrate de importar `db` correctamente desde tu configuración de Firestore.
import Toast from 'react-native-toast-message';

const InventoryScreen = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editedItems, setEditedItems] = useState<any>({});

  // Cargar los datos de Firestore cuando el componente se monta
  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'Botellones'));
        if (querySnapshot.empty) {
          showToast('error', 'No se encontraron elementos en el inventario.');
        } else {
          const items: any[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            items.push({
              id: doc.id,
              name: data.name || '',
              quantity: data.quantity || 0,
              price: data.price || 0,
              filledQuantity: data.filledQuantity || 0,
              emptyQuantity: data.emptyQuantity || 0,
              status: data.status || 'desconocido',
              type: data.type || '',
            });
          });
          setInventory(items);
        }
      } catch (error) {
        console.error('Error al cargar el inventario:', error);
        showToast('error', 'No se pudo cargar el inventario.');
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // Función para manejar cambios en los campos de cantidad, precio y estado llenado
  const handleEditItem = (id: string, field: string, value: string) => {
    setEditedItems((prev: any) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  // Función para manejar el cambio en la cantidad total de botellones
  const handleTotalQuantityChange = (id: string, text: string) => {
    const newTotalQuantity = parseFloat(text.replace(/[^0-9.]/g, ''));
    const currentItem = inventory.find((item) => item.id === id);

    if (!isNaN(newTotalQuantity) && currentItem) {
      const difference = newTotalQuantity - currentItem.quantity;

      if (difference > 0) {
        // Si hay una cantidad mayor (nuevos botellones), preguntamos si son llenos o vacíos
        Alert.alert(
          'Agregar nuevos botellones',
          `Has agregado ${difference} botellones nuevos. ¿Quieres añadirlos como llenos o vacíos?`,
          [
            {
              text: 'Llenos',
              onPress: () => {
                handleEditItem(id, 'filledQuantity', String(currentItem.filledQuantity + difference));
              },
            },
            {
              text: 'Vacíos',
              onPress: () => {
                handleEditItem(id, 'emptyQuantity', String(currentItem.emptyQuantity + difference));
              },
            },
            { text: 'Cancelar', style: 'cancel' },
          ],
          { cancelable: true }
        );
      }

      handleEditItem(id, 'quantity', text);
    }
  };

  // Función para actualizar la cantidad, precio y estado llenado en Firestore
  const handleUpdateItem = async (id: string) => {
    const updatedItem = {
      ...inventory.find((item) => item.id === id),
      ...editedItems[id],
    };

    const newQuantity = parseFloat(updatedItem.quantity);
    const newPrice = parseFloat(updatedItem.price);
    const newFilledQuantity = parseFloat(updatedItem.filledQuantity);
    const newEmptyQuantity = parseFloat(updatedItem.emptyQuantity);

    // Validar los valores antes de proceder
    if (
      [newQuantity, newPrice, newFilledQuantity, newEmptyQuantity].some((val) => isNaN(val)) ||
      newQuantity < 0 ||
      newPrice < 0 ||
      newFilledQuantity < 0 ||
      newEmptyQuantity < 0 ||
      newFilledQuantity + newEmptyQuantity > newQuantity
    ) {
      showToast('error', 'Cantidad o precio inválido. Por favor, ingresa un número válido.');
      return;
    }

    try {
      const itemRef = doc(db, 'Botellones', id);
      await updateDoc(itemRef, {
        quantity: newQuantity,
        price: newPrice,
        filledQuantity: newFilledQuantity,
        emptyQuantity: newEmptyQuantity,
      });

      setInventory((prevInventory) =>
        prevInventory.map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: newQuantity,
                price: newPrice,
                filledQuantity: newFilledQuantity,
                emptyQuantity: newEmptyQuantity,
              }
            : item
        )
      );

      showToast('success', `Producto actualizado correctamente.`);

      setEditedItems((prev: any) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } catch (error) {
      console.error('Error al actualizar el producto:', error);
      showToast('error', 'No se pudo actualizar el producto.');
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
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Inventario General</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#00B5E2" />
      ) : (
        <ScrollView contentContainerStyle={styles.gridContainer}>
          {inventory.map((item) => (
            <View key={item.id} style={styles.itemContainerGrid}>
              <Text style={styles.itemText}>{item.name}</Text>
              <View style={styles.inputContainerGrid}>
                <Text style={styles.label}>Cantidad Total:</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={editedItems[item.id]?.quantity ?? String(item.quantity)}
                  onChangeText={(text) => handleTotalQuantityChange(item.id, text)}
                />
              </View>
              {item.name.toLowerCase().includes('botellón') && (
                <>
                  <View style={styles.inputContainerGrid}>
                    <Text style={styles.label}>Cantidad Llenos:</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={editedItems[item.id]?.filledQuantity ?? String(item.filledQuantity || 0)}
                      onChangeText={(text) => {
                        const newFilledQuantity = parseFloat(text.replace(/[^0-9.]/g, ''));
                        const totalQuantity = parseFloat(
                          editedItems[item.id]?.quantity ?? String(item.quantity)
                        );
                        if (!isNaN(newFilledQuantity) && newFilledQuantity <= totalQuantity) {
                          handleEditItem(item.id, 'filledQuantity', text);
                          handleEditItem(
                            item.id,
                            'emptyQuantity',
                            String(totalQuantity - newFilledQuantity)
                          );
                        }
                      }}
                    />
                  </View>
                  <View style={styles.inputContainerGrid}>
                    <Text style={styles.label}>Cantidad Vacíos:</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={editedItems[item.id]?.emptyQuantity ?? String(item.emptyQuantity || 0)}
                      editable={false}
                    />
                  </View>
                </>
              )}
              <View style={styles.inputContainerGrid}>
                <Text style={styles.label}>Precio Unitario:</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={editedItems[item.id]?.price ?? String(item.price || 0)}
                  onChangeText={(text) =>
                    handleEditItem(item.id, 'price', text.replace(/[^0-9.]/g, ''))
                  }
                />
              </View>
              <TouchableOpacity
                style={globalStyles.primaryButton}
                onPress={() => handleUpdateItem(item.id)}
              >
                <Text style={globalStyles.primaryButtonText}>Actualizar</Text>
              </TouchableOpacity>
              <Text style={styles.itemText}>Estado: {item.status}</Text>
            </View>
          ))}
        </ScrollView>
      )}
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  itemContainerGrid: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    margin: 10,
    borderRadius: 10,
    width: '22%', // Ajuste para mostrar 4 columnas
  },
  itemText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  inputContainerGrid: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  noItemsText: {
    textAlign: 'center',
    color: '#757575',
    fontSize: 16,
    marginVertical: 20,
  },
});

export default InventoryScreen;
