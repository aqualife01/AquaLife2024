import React from 'react';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';

const CustomDrawerContent = (props: any) => {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Text style={styles.title}>AquaLife</Text>
      </View>
      <DrawerItem
        label="Dashboard"
        onPress={() => props.navigation.navigate('Dashboard')}
      />
      <DrawerItem
        label="Usuario"
        onPress={() => props.navigation.navigate('User')}
      />
      <DrawerItem
        label="Ventas"
        onPress={() => props.navigation.navigate('Sales')}
      />
      <DrawerItem
        label="Estadísticas"
        onPress={() => props.navigation.navigate('Stats')}
      />
      
      <DrawerItem
        label="Inventario"
        onPress={() => props.navigation.navigate('Inventory')}
      />
      <DrawerItem
        label="Mantenimiento"
        onPress={() => props.navigation.navigate('Maintenance')}
      />
      <DrawerItem
        label="Facturas"
        onPress={() => props.navigation.navigate('Invoices')}
      />
      <DrawerItem
        label="Pedidos"
        onPress={() => props.navigation.navigate('Orders')}
      />
      <DrawerItem
        label="Proveedores"
        onPress={() => props.navigation.navigate('Providers')}
      />
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: '#0D9488',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default CustomDrawerContent;
