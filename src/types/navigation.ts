export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  DashboardDrawer: { userType: 'admin' | 'cliente' }; 
  Orders: undefined; // Añadido para clientes
  User: undefined; // Añadido para clientes y admins
  Sales: undefined;
  Stats: undefined;
  Inventory: undefined;
  Maintenance: undefined;
  Invoices: undefined;
  Providers: undefined;
};
