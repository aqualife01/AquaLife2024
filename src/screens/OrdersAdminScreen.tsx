import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Ajusta la ruta si corresponde
import { globalStyles, colors } from '../styles/globalStyles';

// Definimos la interfaz de un Pedido
interface Pedido {
  id: string;
  clienteId: string;
  fecha: string;           // Asumimos formato "2025-01-15", etc.
  hora: string;
  cantidadConAsa: number;
  cantidadSinAsa: number;
  costoUnitario: number;
  total: number;
  estado: string;          // "pendiente", "listo", "entregado"
  empleadoAsignadoId: string;
  observaciones: string;
}

// Definimos la interfaz de un Cliente
interface Cliente {
  nombre: string;
  direccion?: string;
  email?: string;
  telefono?: string;
  // ... cualquier campo adicional que tengas en tu colección Clientes
}

const OrdersAdminScreen = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientesMap, setClientesMap] = useState<Record<string, Cliente>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Suscripción a PEDIDOS
  useEffect(() => {
    // Aquí ordenamos por 'fecha' desc según Firestore,
    // pero luego haremos un sort manual para poner "pendiente" primero.
    const q = query(collection(db, 'Pedidos'), orderBy('fecha', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let pedidosData: Pedido[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Pedido, 'id'>),
        }));

        // 1. Primero filtramos los "pendientes" para llevarlos arriba.
        // 2. Mantenemos un orden por fecha (por ejemplo, más reciente arriba).
        pedidosData.sort((a, b) => {
          // Primero comparamos estado
          if (a.estado === 'pendiente' && b.estado !== 'pendiente') return -1;
          if (a.estado !== 'pendiente' && b.estado === 'pendiente') return 1;

          // Si ambos son pendientes o ninguno es pendiente, ordenamos por fecha desc
          const dateA = new Date(a.fecha).getTime();
          const dateB = new Date(b.fecha).getTime();
          return dateB - dateA; // desc
        });

        setPedidos(pedidosData);
        setLoading(false);
      },
      (error) => {
        console.error('Error al obtener pedidos:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Suscripción a CLIENTES (guardamos en un diccionario/objeto { clienteId -> Cliente })
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'Clientes'), (snapshot) => {
      const map: Record<string, Cliente> = {};
      snapshot.forEach((doc) => {
        map[doc.id] = doc.data() as Cliente;
      });
      setClientesMap(map);
    });

    return () => unsubscribe();
  }, []);

  // Función para cambiar el estado de un pedido
  const handleChangeEstado = async (pedidoId: string, nuevoEstado: string) => {
    try {
      const pedidoRef = doc(db, 'Pedidos', pedidoId);
      await updateDoc(pedidoRef, { estado: nuevoEstado });
      console.log(`Estado del pedido ${pedidoId} actualizado a: ${nuevoEstado}`);
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  // Renderiza cada pedido
  const renderItem = ({ item }: { item: Pedido }) => {
    // Tomamos la info del cliente desde clientesMap
    const clienteInfo = clientesMap[item.clienteId];
    const clienteNombre = clienteInfo?.nombre || 'Cliente sin nombre';
    const clienteDireccion = clienteInfo?.direccion || 'Sin dirección';

    const esEntregado = item.estado === 'entregado';

    return (
      <View style={styles.card}>
        <Text style={styles.headerText}>Pedido ID: {item.id}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Cliente:</Text>
          <Text style={styles.value}>{clienteNombre}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Dirección:</Text>
          <Text style={styles.value}>{clienteDireccion}</Text>
        </View>

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
          <Text style={styles.label}>Estado:</Text>
          <Text style={[styles.value, styles.estado]}>
            {item.estado.toUpperCase()}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Total:</Text>
          <Text style={styles.value}>${item.total.toFixed(2)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Observaciones:</Text>
          <Text style={styles.value}>{item.observaciones || '—'}</Text>
        </View>

        {/* Botones para cambiar estado */}
        <View style={styles.buttonsContainer}>
          {/* Si el pedido ya está ENTREGADO, no mostramos el botón "Listo" */}
          {!esEntregado && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primaryShades[200] }]}
              onPress={() => handleChangeEstado(item.id, 'listo')}
            >
              <Text style={styles.buttonText}>Listo</Text>
            </TouchableOpacity>
          )}

          {/* Botón ENTREGADO */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.secondary }]}
            onPress={() => handleChangeEstado(item.id, 'entregado')}
          >
            <Text style={styles.buttonText}>Entregado</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Mostrar indicador de carga
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Cargando pedidos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={globalStyles.headerText}>Historial de Pedidos</Text>
      {pedidos.length === 0 ? (
        <Text style={styles.text}>No hay pedidos registrados</Text>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          // 2 COLUMNAS:
          numColumns={2}
        />
      )}
    </View>
  );
};

export default OrdersAdminScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    color: colors.textPrimary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 20,
  },
  // Estilos de cada "card" en 2 columnas
  card: {
    flex: 1, // Ocupa mitad del ancho (en 2 columnas)
    margin: 8,
    backgroundColor: colors.primaryShades[50],
    padding: 16,
    borderRadius: 8,
    // Sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
    width: 120,
    color: colors.textPrimary,
  },
  value: {
    flex: 1,
    color: colors.textPrimary,
  },
  estado: {
    fontWeight: '600',
    color: colors.primaryDark,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 12,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
