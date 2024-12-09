import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

// Importar pantallas
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';

// Importar nuevas pantallas relacionadas con el Drawer
import SalesScreen from './src/screens/SalesScreen';
import StatsScreen from './src/screens/StatsScreen';
import UserScreen from './src/screens/UserScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import MaintenanceScreen from './src/screens/MaintenanceScreen';
import InvoicesScreen from './src/screens/InvoicesScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ProvidersScreen from './src/screens/ProvidersScreen';

// Importar Custom Drawer
import CustomDrawerContent from './src/components/CustomDrawerContent';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Configuración del Drawer Navigator para el Dashboard y las pantallas relacionadas
const DashboardDrawer = ({ route }: { route: any }) => {
  const { userType } = route.params;

  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: true, // Mostrar el encabezado
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} userType={userType} />}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />

      {/* Opciones visibles solo para administradores */}
      {userType === 'admin' && (
        <>
          <Drawer.Screen name="Sales" component={SalesScreen} />
          <Drawer.Screen name="Stats" component={StatsScreen} />
          <Drawer.Screen name="Inventory" component={InventoryScreen} />
          <Drawer.Screen name="Maintenance" component={MaintenanceScreen} />
          <Drawer.Screen name="Invoices" component={InvoicesScreen} />
          <Drawer.Screen name="Providers" component={ProvidersScreen} />
        </>
      )}

      {/* Opciones comunes para clientes y administradores */}
      <Drawer.Screen name="User" component={UserScreen} />
      <Drawer.Screen name="Orders" component={OrdersScreen} />
    </Drawer.Navigator>
  );
};

// Configuración del Stack Navigator para las pantallas públicas y el Dashboard
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false, // No mostrar encabezado en el Stack principal
        }}
      >
        {/* Pantallas públicas */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Navegación interna del Dashboard */}
        <Stack.Screen
          name="DashboardDrawer"
          component={DashboardDrawer}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
