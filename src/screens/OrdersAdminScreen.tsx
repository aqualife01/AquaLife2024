// OrdersAdminScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform,
  Alert, // Import estático (usado en mobile)
} from 'react-native';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../firebaseConfig'; // Ajusta la ruta según tu proyecto
import { globalStyles, colors } from '../styles/globalStyles';

// ===== Interfaces / tipos =====
interface Pedido {
  id: string;
  numeroPedido?: number;
  clienteId: string;
  fecha: string;         
  hora: string;
  cantidadConAsa: number;
  cantidadSinAsa: number;
  costoUnitario: number;
  total: number;
  estado: string;         
  empleadoAsignadoId: string;
  observaciones: string;
}

interface Cliente {
  nombre: string;
  direccion?: string;
  email?: string;
  telefono?: string;
}

// Para items en la FlatList
type ListItem =
  | { type: 'header'; fecha: string }
  | { type: 'pedido'; data: Pedido };

// ===== Helper para mostrar alert en Web/Nativo =====
function showMessage(title: string, message: string) {
  if (Platform.OS === 'web') {
    // En entorno web => window.alert
    window.alert(`${title}\n\n${message}`);
  } else {
    // En Android/iOS => Alert.alert
    Alert.alert(title, message);
  }
}

// ===== Funciones de formato =====
function formatOrderNumber(num: number): string {
  return num.toString().padStart(4, '0');
}

function formatFecha(fechaISO: string): string {
  const [year, month, day] = fechaISO.split('-');
  return `${day}/${month}/${year}`;
}

function getEstadoPriority(estado: string): number {
  switch (estado) {
    case 'pendiente': return 1;
    case 'listo':     return 2;
    case 'entregado': return 3;
    default:          return 99;
  }
}

// ===== Componente principal =====
const OrdersAdminScreen = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientesMap, setClientesMap] = useState<Record<string, Cliente>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // Filtro local (nº pedido / nombre cliente)
  const [searchText, setSearchText] = useState<string>('');

  // Inventario de Sellos/Tapas
  const [sellosCantidad, setSellosCantidad] = useState<number>(9999);
  const [tapasCantidad, setTapasCantidad] = useState<number>(9999);
  // Opcional: IDs de cada doc en Inventario para actualizarlos si lo deseas
  const [sellosDocId, setSellosDocId] = useState<string>('');
  const [tapasDocId, setTapasDocId] = useState<string>('');

  // ===== 1) Suscribirse a la colección "Pedidos" =====
  useEffect(() => {
    const qPedidos = query(collection(db, 'Pedidos'), orderBy('fecha', 'desc'));
    const unsubscribe = onSnapshot(qPedidos, (snapshot) => {
      const pedidosData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Pedido, 'id'>),
      }));

      // Orden adicional (estado + numPedido/fecha)
      pedidosData.sort((a, b) => {
        const priorityA = getEstadoPriority(a.estado);
        const priorityB = getEstadoPriority(b.estado);

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        // mismo estado
        if (priorityA === 3) {
          // "entregado" => desc por numeroPedido
          const numA = a.numeroPedido || 0;
          const numB = b.numeroPedido || 0;
          return numB - numA;
        } else {
          // "pendiente" o "listo" => desc por fecha
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
    });

    return () => unsubscribe();
  }, []);

  // ===== 2) Suscribirse a "Clientes" para mapear clienteId =====
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'Clientes'), (snapshot) => {
      const map: Record<string, Cliente> = {};
      snapshot.forEach((doc) => {
        map[doc.id] = doc.data() as Cliente;
      });
      setClientesMap(map);
    });
    return () => unsub();
  }, []);

  // ===== 3) Cargar Inventario =====
  useEffect(() => {
    async function cargarInventario() {
      try {
        const snap = await getDocs(collection(db, 'Inventario'));
        let sellos = 9999;
        let tapas = 9999;
        let sellosId = '';
        let tapasId = '';

        snap.forEach((docu) => {
          const data = docu.data() as { nombre?: string; cantidad?: number };
          if (data.nombre === 'Sellos de seguridad') {
            sellos = data.cantidad ?? 0;
            sellosId = docu.id;
          } else if (data.nombre === 'Tapas plásticas') {
            tapas = data.cantidad ?? 0;
            tapasId = docu.id;
          }
        });

        setSellosCantidad(sellos);
        setTapasCantidad(tapas);
        setSellosDocId(sellosId);
        setTapasDocId(tapasId);
      } catch (err) {
        console.error('Error al cargar inventario:', err);
      }
    }
    cargarInventario();
  }, []);

  // ===== 4) Al montar, si detectamos <200 => notificar =====
  useEffect(() => {
    if (sellosCantidad < 200) {
      showMessage(
        'Inventario bajo',
        `¡Atención! "Sellos de seguridad" por debajo de 200 (${sellosCantidad}).`
      );
    }
    if (tapasCantidad < 200) {
      showMessage(
        'Inventario bajo',
        `¡Atención! "Tapas plásticas" por debajo de 200 (${tapasCantidad}).`
      );
    }
  }, [sellosCantidad, tapasCantidad]);

  // ===== Manejar cambio de estado de un pedido =====
  const handleChangeEstado = async (pedidoId: string, nuevoEstado: string) => {
    try {
      const pedido = pedidos.find((p) => p.id === pedidoId);
      if (!pedido) return;

      const totalBotellones = pedido.cantidadConAsa + pedido.cantidadSinAsa;

      // Si marcamos como "listo", chequeamos inventario
      if (nuevoEstado === 'listo') {
        if (sellosCantidad < totalBotellones || tapasCantidad < totalBotellones) {
          showMessage(
            'Inventario insuficiente',
            'No hay suficientes sellos o tapas para completar este pedido.'
          );
          return; // no cambia estado
        } else {
          // Descontar
          const nuevosSellos = sellosCantidad - totalBotellones;
          const nuevasTapas = tapasCantidad - totalBotellones;

          // Actualizar en Firestore (opcional)
          if (sellosDocId) {
            const sellosRef = doc(db, 'Inventario', sellosDocId);
            await updateDoc(sellosRef, { cantidad: nuevosSellos });
          }
          if (tapasDocId) {
            const tapasRef = doc(db, 'Inventario', tapasDocId);
            await updateDoc(tapasRef, { cantidad: nuevasTapas });
          }

          // Actualizar estado local
          setSellosCantidad(nuevosSellos);
          setTapasCantidad(nuevasTapas);

          showMessage(
            'Inventario actualizado',
            `Se han descontado ${totalBotellones} sellos y tapas.`
          );
        }
      }

      // Ahora sí, actualizar el estado del pedido
      const pedidoRef = doc(db, 'Pedidos', pedidoId);
      await updateDoc(pedidoRef, { estado: nuevoEstado });

      console.log(`Estado del pedido ${pedidoId} → ${nuevoEstado}`);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  // ===== Filtrado local (pedidoID o nombreCliente) =====
  const filteredPedidos = pedidos.filter((item) => {
    const clienteInfo = clientesMap[item.clienteId];
    const nombreCliente = clienteInfo?.nombre?.toLowerCase() || '';
    const numeroString = item.numeroPedido
      ? formatOrderNumber(item.numeroPedido)
      : item.id;
    const texto = searchText.toLowerCase();

    return (
      numeroString.toLowerCase().includes(texto) ||
      nombreCliente.includes(texto)
    );
  });

  // Agrupar por fecha => construimos listData
  const listData: ListItem[] = [];
  let currentFecha = '';
  for (const ped of filteredPedidos) {
    if (ped.fecha !== currentFecha) {
      currentFecha = ped.fecha;
      listData.push({ type: 'header', fecha: currentFecha });
    }
    listData.push({ type: 'pedido', data: ped });
  }

  // Render de cada item
  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'header') {
      const fechaStr = formatFecha(item.fecha);
      return (
        <View style={styles.headerContainer}>
          <Text style={styles.headerTextFecha}>Pedidos del {fechaStr}</Text>
        </View>
      );
    } else {
      const pedido = item.data;
      const clienteInfo = clientesMap[pedido.clienteId] || {};
      const clienteNombre = (clienteInfo.nombre || 'Cliente sin nombre').toUpperCase();
      const clienteDireccion = (clienteInfo.direccion || 'Sin dirección').toUpperCase();

      const mostrarBotonListo = pedido.estado === 'pendiente';
      const mostrarBotonEntregado =
        pedido.estado === 'pendiente' || pedido.estado === 'listo';

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

  // Mostrar loading
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text>Cargando pedidos...</Text>
      </View>
    );
  }

  // Render final
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
        />
      )}
    </View>
  );
};

export default OrdersAdminScreen;

// ===== Estilos =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
