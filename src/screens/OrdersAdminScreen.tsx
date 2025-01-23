import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Ajusta la ruta
import { globalStyles, colors } from '../styles/globalStyles';

interface Pedido {
  id: string;
  numeroPedido?: number;  
  clienteId: string;
  fecha: string;          // "2025-01-15"
  hora: string;
  cantidadConAsa: number;
  cantidadSinAsa: number;
  costoUnitario: number;
  total: number;
  estado: string;         // "pendiente", "listo", "entregado"
  empleadoAsignadoId: string;
  observaciones: string;
}

interface Cliente {
  nombre: string;
  direccion?: string;
  email?: string;
  telefono?: string;
}

// Formatea Nº de pedido (ej. 7 → "0007")
function formatOrderNumber(num: number): string {
  return num.toString().padStart(4, '0');
}

// Formatea fecha "AAAA-MM-DD" → "DD/MM/AAAA"
function formatFecha(fechaISO: string): string {
  const [year, month, day] = fechaISO.split('-');
  return `${day}/${month}/${year}`;
}

// Asigna prioridad a cada estado
function getEstadoPriority(estado: string): number {
  switch (estado) {
    case 'pendiente':
      return 1;
    case 'listo':
      return 2;
    case 'entregado':
      return 3;
    default:
      return 99;
  }
}

// Para agrupar por fecha, tenemos dos tipos de items en la lista
type ListItem =
  | { type: 'header'; fecha: string }
  | { type: 'pedido'; data: Pedido };

const OrdersAdminScreen = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientesMap, setClientesMap] = useState<Record<string, Cliente>>({});
  const [loading, setLoading] = useState<boolean>(true);

  const [searchText, setSearchText] = useState<string>('');

  useEffect(() => {
    // Query a "Pedidos" ordenados por fecha desc (nivel Firestore),
    // pero refinamos la ordenación manualmente con prioridad + numeroPedido.
    const q = query(collection(db, 'Pedidos'), orderBy('fecha', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const pedidosData: Pedido[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Pedido, 'id'>),
        }));

        // Ordenar:
        // 1) prioridad por estado (pendiente→1, listo→2, entregado→3)
        // 2) si ambos son 'entregado', ordenar por numeroPedido desc
        // 3) si mismo estado, se ordena por fecha desc
        pedidosData.sort((a, b) => {
          const priorityA = getEstadoPriority(a.estado);
          const priorityB = getEstadoPriority(b.estado);

          if (priorityA !== priorityB) {
            // Diferente estado => orden por prioridad
            return priorityA - priorityB;
          }

          // Mismo estado
          if (priorityA === 3) {
            // Si ambos están en "entregado", ordenamos por numeroPedido desc
            const numA = a.numeroPedido || 0;
            const numB = b.numeroPedido || 0;
            return numB - numA; // desc
          } else {
            // Si mismo estado pero no es 'entregado' (pendiente o listo),
            // ordenamos por fecha desc
            const dateA = new Date(a.fecha).getTime();
            const dateB = new Date(b.fecha).getTime();
            return dateB - dateA;
          }
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

  useEffect(() => {
    // Suscripción a "Clientes" para luego mapear clienteId
    const unsubscribe = onSnapshot(collection(db, 'Clientes'), (snapshot) => {
      const map: Record<string, Cliente> = {};
      snapshot.forEach((doc) => {
        map[doc.id] = doc.data() as Cliente;
      });
      setClientesMap(map);
    });
    return () => unsubscribe();
  }, []);

  // Actualizar estado del pedido
  const handleChangeEstado = async (pedidoId: string, nuevoEstado: string) => {
    try {
      const pedidoRef = doc(db, 'Pedidos', pedidoId);
      await updateDoc(pedidoRef, { estado: nuevoEstado });
      console.log(`Estado del pedido ${pedidoId} → ${nuevoEstado}`);
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  // Filtrado local (por número de pedido o nombre de cliente)
  const filteredPedidos = pedidos.filter((item) => {
    const clienteInfo = clientesMap[item.clienteId];
    const nombreCliente = clienteInfo?.nombre?.toLowerCase() || '';
    const numeroString = item.numeroPedido
      ? formatOrderNumber(item.numeroPedido)
      : item.id; // fallback al doc.id
    const texto = searchText.toLowerCase();
    return (
      numeroString.toLowerCase().includes(texto) ||
      nombreCliente.includes(texto)
    );
  });

  // Convertimos a estructura con "header" cada vez que cambia la fecha
  const listData: ListItem[] = [];
  let currentFecha = '';
  for (let i = 0; i < filteredPedidos.length; i++) {
    const ped = filteredPedidos[i];
    // Si la fecha cambió, insertamos un header
    if (ped.fecha !== currentFecha) {
      currentFecha = ped.fecha;
      listData.push({ type: 'header', fecha: currentFecha });
    }
    listData.push({ type: 'pedido', data: ped });
  }

  // Render de cada item
  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'header') {
      // Encabezado por fecha
      const fechaStr = formatFecha(item.fecha);
      return (
        <View style={styles.headerContainer}>
          <Text style={styles.headerTextFecha}>Pedidos del {fechaStr}</Text>
        </View>
      );
    } else {
      // Pedido real
      const pedido = item.data;
      const clienteInfo = clientesMap[pedido.clienteId];

      // Convertimos a mayúsculas
      const clienteNombre = (clienteInfo?.nombre || 'Cliente sin nombre').toUpperCase();
      const clienteDireccion = (clienteInfo?.direccion || 'Sin dirección').toUpperCase();

      // Estado → mostramos botones
      const mostrarBotonListo = pedido.estado === 'pendiente';
      const mostrarBotonEntregado =
        pedido.estado === 'pendiente' || pedido.estado === 'listo';

      // Ej: "Pedido Nº: 0007"
      const tituloPedido = pedido.numeroPedido
        ? `Pedido Nº: ${formatOrderNumber(pedido.numeroPedido)}`
        : `Pedido ID: ${pedido.id}`;

      const totalBotellones = pedido.cantidadConAsa + pedido.cantidadSinAsa;

      return (
        <View style={styles.card}>
          <Text style={styles.headerText}>{tituloPedido}</Text>

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
            <Text style={styles.value}>{pedido.fecha}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Hora:</Text>
            <Text style={styles.value}>{pedido.hora}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Con Asa:</Text>
            <Text style={styles.value}>{pedido.cantidadConAsa}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Sin Asa:</Text>
            <Text style={styles.value}>{pedido.cantidadSinAsa}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Total Botellones:</Text>
            <Text style={styles.value}>{totalBotellones}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Estado:</Text>
            <Text style={[styles.value, styles.estado]}>
              {pedido.estado.toUpperCase()}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Total:</Text>
            <Text style={styles.value}>${pedido.total.toFixed(2)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Observaciones:</Text>
            <Text style={styles.value}>{pedido.observaciones || '—'}</Text>
          </View>

          <View style={styles.buttonsContainer}>
            {mostrarBotonListo && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primaryShades[200] }]}
                onPress={() => handleChangeEstado(pedido.id, 'listo')}
              >
                <Text style={styles.buttonText}>Listo</Text>
              </TouchableOpacity>
            )}
            {mostrarBotonEntregado && (
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.secondary }]}
                onPress={() => handleChangeEstado(pedido.id, 'entregado')}
              >
                <Text style={styles.buttonText}>Entregado</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }
  };

  // Loading
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

      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por Nº de pedido o nombre de cliente..."
        value={searchText}
        onChangeText={setSearchText}
      />

      {listData.length === 0 ? (
        <Text style={styles.text}>No se encontraron pedidos</Text>
      ) : (
        <FlatList
          data={listData}
          keyExtractor={(item, index) => {
            if (item.type === 'header') {
              return `header-${item.fecha}-${index}`;
            }
            return (item.data as Pedido).id;
          }}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          numColumns={1}
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
    // Ajusta padding si quieres más/menos espacio lateral
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
    alignItems: 'center',
  },
  headerContainer: {
    backgroundColor: colors.primaryLight,
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
    marginTop: 8,
    width: '90%',
    alignSelf: 'center',
  },
  headerTextFecha: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  card: {
    width: '250%',
    alignSelf: 'center',
    backgroundColor: colors.primaryShades[50],
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
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
    textAlign: 'center',
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
  searchInput: {
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.disabled,
    alignSelf: 'center',
    width: '90%',
  },
});
