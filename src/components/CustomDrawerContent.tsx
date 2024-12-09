import React from 'react';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';

interface Props {
  userType: 'admin' | 'cliente'; // Tipo de usuario
  navigation: any;
}

const CustomDrawerContent: React.FC<Props> = (props) => {
  const { userType, navigation } = props;

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigation.navigate('Login'); // Redirigir a la pantalla de inicio de sesión
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <Image
          source={require('../assets/logo.png')} // Ruta al logo
          style={styles.logo}
        />
        <Text style={styles.title}>AquaLife</Text>
      </View>

      {/* Mostrar siempre el Dashboard */}
      <DrawerItem
        label="Dashboard"
        onPress={() => navigation.navigate('Dashboard')}
      />

      {/* Opciones visibles solo para administradores */}
      {userType === 'admin' && (
        <>
          <DrawerItem
            label="Ventas"
            onPress={() => navigation.navigate('Sales')}
          />
          <DrawerItem
            label="Estadísticas"
            onPress={() => navigation.navigate('Stats')}
          />
          <DrawerItem
            label="Inventario"
            onPress={() => navigation.navigate('Inventory')}
          />
          <DrawerItem
            label="Mantenimiento"
            onPress={() => navigation.navigate('Maintenance')}
          />
          <DrawerItem
            label="Facturas"
            onPress={() => navigation.navigate('Invoices')}
          />
          <DrawerItem
            label="Proveedores"
            onPress={() => navigation.navigate('Providers')}
          />
        </>
      )}

      {/* Opciones disponibles tanto para administradores como para clientes */}
      <DrawerItem
        label="Usuario"
        onPress={() => navigation.navigate('User')}
      />
      <DrawerItem
        label="Pedidos"
        onPress={() => navigation.navigate('Orders')}
      />

      {/* Botón de cerrar sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', // Cambiar la dirección a fila
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0D9488',
    borderBottomLeftRadius: 15, // Redondear la esquina inferior izquierda
    borderBottomRightRadius: 15, // Redondear la esquina inferior derecha
  },
  logo: {
    width: 50, // Tamaño más pequeño para el logo
    height: 50,
    borderRadius: 25, // Hacer el logo circular
    marginRight: 10, // Espacio entre el logo y el texto
  },
  title: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#FF5252', // Rojo para destacar el botón de cerrar sesión
    borderRadius: 8,
    marginHorizontal: 10,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CustomDrawerContent;
