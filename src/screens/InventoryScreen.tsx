import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

const InventoryScreen = () => {
  const [inventory, setInventory] = useState([
    { id: '1', name: 'Botellones Llenos', quantity: 50, status: 'Disponible' },
    { id: '2', name: 'Botellones Vacíos', quantity: 20, status: 'Disponible' },
    { id: '3', name: 'Tapas', quantity: 100, status: 'Disponible' },
    { id: '4', name: 'Precintos', quantity: 80, status: 'Disponible' },
  ]);

  const handleUpdateQuantity = (id: string, operation: 'add' | 'remove') => {
    setInventory((prevInventory) =>
      prevInventory.map((item) =>
        item.id === id
          ? { ...item, quantity: operation === 'add' ? item.quantity + 1 : item.quantity - 1 }
          : item
      )
    );
  };

  const handleAssignMaintenance = (id: string) => {
    setInventory((prevInventory) =>
      prevInventory.map((item) =>
        item.id === id ? { ...item, status: 'En Mantenimiento' } : item
      )
    );
    Alert.alert('Asignado a mantenimiento', 'El botellón fue asignado al estado de mantenimiento.');
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.name}</Text>
      <Text style={styles.itemText}>Cantidad: {item.quantity}</Text>
      <Text style={styles.itemText}>Estado: {item.status}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleUpdateQuantity(item.id, 'add')}
        >
          <Text style={styles.actionText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleUpdateQuantity(item.id, 'remove')}
        >
          <Text style={styles.actionText}>-</Text>
        </TouchableOpacity>
        {item.name.includes('Botellones') && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleAssignMaintenance(item.id)}
          >
            <Text style={styles.actionText}>Mantenimiento</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Inventario General</Text>
      <FlatList
        data={inventory}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
      <TouchableOpacity style={globalStyles.primaryButton}>
        <Text style={globalStyles.primaryButtonText}>Agregar Producto</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  actionButton: {
    backgroundColor: '#0D9488',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
  },
  actionText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default InventoryScreen;
