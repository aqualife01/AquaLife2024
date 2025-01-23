import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebaseConfig';
import { globalStyles, colors } from '../styles/globalStyles';

interface Pedido {
  id: string;
  clienteId: string;
  fecha: string; // Formato "2025-01-15"
  hora: string;
  cantidadConAsa: number;
  cantidadSinAsa: number;
  costoUnitario: number;
  total: number;
  estado: string;         
  empleadoAsignadoId: string;
  observaciones: string;
}

const UserDashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      // No hay usuario => maneja el caso (redirigir o mostrar algo)
      setLoading(false);
      return;
    }

    // Query a Firestore: Pedidos donde clienteId === user.uid
    const pedidosRef = collection(db, 'Pedidos');
    const q = query(pedidosRef, where('clienteId', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const pedidosData: Pedido[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Pedido, 'id'>),
        }));
        setPedidos(pedidosData);
        setLoading(false);
      },
      (error) => {
        console.error('Error al obtener pedidos del usuario:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filtramos: pendientes y historial
  let pedidosPendientes = pedidos.filter((p) => p.estado === 'pendiente');
  let pedidosHistorial = pedidos.filter(
    (p) => p.estado === 'listo' || p.estado === 'entregado'
  );

  // 1. Ordenar cada lista por fecha DESC
  //    - parseamos fecha "YYYY-MM-DD" para compararla
  const parseFecha = (fechaStr: string) => {
    // fechaStr es "2025-01-15". Convertimos a Date:
    const [year, month, day] = fechaStr.split('-');
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  pedidosPendientes.sort((a, b) => {
    const dateA = parseFecha(a.fecha).getTime();
    const dateB = parseFecha(b.fecha).getTime();
    return dateB - dateA; 
  });

  pedidosHistorial.sort((a, b) => {
    const dateA = parseFecha(a.fecha).getTime();
    const dateB = parseFecha(b.fecha).getTime();
    return dateB - dateA;
  });

  // 2. Render de cada pedido en PENDIENTES (más reciente = index 0 => "Pedido #1")
  const renderPedidoItemPendiente = ({ item, index }: { item: Pedido; index: number }) => {
    return (
      <View style={styles.pedidoCard}>
        <Text style={styles.pedidoTitle}>
          Pedido #{index + 1} 
        </Text>
        <View style={styles.row}>
          <Text style={styles.label}>Fecha:</Text>
          <Text style={styles.value}>{item.fecha}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Hora:</Text>
          <Text style={styles.value}>{item.hora}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Con Asa:</Text>
          <Text style={styles.value}>{item.cantidadConAsa}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Sin Asa:</Text>
          <Text style={styles.value}>{item.cantidadSinAsa}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total:</Text>
          <Text style={styles.value}>${item.total.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Estado:</Text>
          <Text style={[styles.value, styles.estadoValue]}>
            {item.estado.toUpperCase()}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Obs.:</Text>
          <Text style={styles.value}>{item.observaciones || '—'}</Text>
        </View>
      </View>
    );
  };

  // 3. Render en HISTORIAL
  const renderPedidoItemHistorial = ({ item, index }: { item: Pedido; index: number }) => {
    return (
      <View style={styles.pedidoCard}>
        <Text style={styles.pedidoTitle}>
          Pedido #{index + 1}
        </Text>
        <View style={styles.row}>
          <Text style={styles.label}>Fecha:</Text>
          <Text style={styles.value}>{item.fecha}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Hora:</Text>
          <Text style={styles.value}>{item.hora}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Con Asa:</Text>
          <Text style={styles.value}>{item.cantidadConAsa}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Sin Asa:</Text>
          <Text style={styles.value}>{item.cantidadSinAsa}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Total:</Text>
          <Text style={styles.value}>${item.total.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Estado:</Text>
          <Text style={[styles.value, styles.estadoValue]}>
            {item.estado.toUpperCase()}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Obs.:</Text>
          <Text style={styles.value}>{item.observaciones || '—'}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.infoText}>Cargando tus pedidos...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={globalStyles.headerText}>Bienvenido/a</Text>
      <Text style={styles.subtitle}>
        Aquí puedes gestionar tus pedidos y datos personales.
      </Text>

      <Text style={styles.sectionTitle}>Pedidos Pendientes</Text>
      {pedidosPendientes.length === 0 ? (
        <Text style={styles.infoText}>No tienes pedidos pendientes</Text>
      ) : (
        <FlatList
          data={pedidosPendientes}
          keyExtractor={(item) => item.id}
          renderItem={renderPedidoItemPendiente}
          scrollEnabled={false}  
          style={styles.autoList}
        />
      )}

      <Text style={styles.sectionTitle}>Historial de Pedidos</Text>
      {pedidosHistorial.length === 0 ? (
        <Text style={styles.infoText}>No tienes pedidos en historial</Text>
      ) : (
        <FlatList
          data={pedidosHistorial}
          keyExtractor={(item) => item.id}
          renderItem={renderPedidoItemHistorial}
          scrollEnabled={false} 
          style={styles.autoList}
        />
      )}
    </ScrollView>
  );
};

export default UserDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginVertical: 12,
  },
  autoList: {
    flexGrow: 0,
    marginBottom: 20,
  },
  pedidoCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,

    // Sombra suave
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  pedidoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  label: {
    fontWeight: '600',
    width: 80,
    color: '#333',
  },
  value: {
    flex: 1,
    color: '#555',
  },
  estadoValue: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
