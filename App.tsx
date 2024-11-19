import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Importar pantallas
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';

// Importar nuevas pantallas relacionadas con el Drawer
import SalesScreen from './src/screens/SalesScreen'; // Crear este archivo
import StatsScreen from './src/screens/StatsScreen'; // Crear este archivo
import UserScreen from './src/screens/UserScreen'; // Crear este archivo
import InventoryScreen from './src/screens/InventoryScreen'; // Crear este archivo
import MaintenanceScreen from './src/screens/MaintenanceScreen'; // Crear este archivo
import InvoicesScreen from './src/screens/InvoicesScreen'; // Crear este archivo
import OrdersScreen from './src/screens/OrdersScreen'; // Crear este archivo
import ProvidersScreen from './src/screens/ProvidersScreen'; // Crear este archivo

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Configuración del Drawer Navigator para el Dashboard y las pantallas relacionadas
const DashboardDrawer = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: true, // Mostrar el encabezado
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} />
      <Drawer.Screen name="Sales" component={SalesScreen} />
      <Drawer.Screen name="Stats" component={StatsScreen} />
      <Drawer.Screen name="User" component={UserScreen} />
      <Drawer.Screen name="Inventory" component={InventoryScreen} />
      <Drawer.Screen name="Maintenance" component={MaintenanceScreen} />
      <Drawer.Screen name="Invoices" component={InvoicesScreen} />
      <Drawer.Screen name="Orders" component={OrdersScreen} />
      <Drawer.Screen name="Providers" component={ProvidersScreen} />
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
