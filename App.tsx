import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Importar componentes
import HeaderComponent from './src/components/HeaderComponent';
import CustomDrawerContent from './src/components/CustomDrawerContent';

// Importar pantallas
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import UserDashboardScreen from './src/screens/UserDashboardScreen';
import SalesScreen from './src/screens/SalesScreen';
import StatsScreen from './src/screens/StatsScreen';
import UserScreen from './src/screens/UserScreen';
import OrdersScreen from './src/screens/OrdersScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Configurar Drawer Navigator
const MainDrawerNavigator = ({ route }: { route: any }) => {
  const { userType } = route.params;

  return (
    <Drawer.Navigator
      initialRouteName={userType === 'admin' ? 'Dashboard' : 'UserDashboard'}
      drawerContent={(props) => <CustomDrawerContent {...props} userType={userType} />}
      screenOptions={{
        header: () => <HeaderComponent />, // Usar HeaderComponent como header
      }}
    >
      {userType === 'admin' ? (
        <>
          <Drawer.Screen name="Dashboard" component={DashboardScreen} />
          <Drawer.Screen name="Sales" component={SalesScreen} />
          <Drawer.Screen name="Stats" component={StatsScreen} />
          <Drawer.Screen name="User" component={UserScreen} />
          <Drawer.Screen name="Orders" component={OrdersScreen} />
        </>
      ) : (
        <>
          <Drawer.Screen name="UserDashboard" component={UserDashboardScreen} />
          <Drawer.Screen name="User" component={UserScreen} />
          <Drawer.Screen name="Orders" component={OrdersScreen} />
        </>
      )}
    </Drawer.Navigator>
  );
};

// Configurar Stack Navigator
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainDrawer" component={MainDrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
