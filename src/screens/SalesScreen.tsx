// SalesScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import Toast from 'react-native-toast-message';

// Interfaz para pedidos
interface PedidoDoc {
  id: string;
  clienteId: string;      // ID del cliente
  fecha: string;          // "YYYY-MM-DD"
  total: number;          // Monto en USD
  cantidadConAsa: number;
  cantidadSinAsa: number;
  // ... otros campos opcionales
}

// Interfaz para clientes
interface ClienteDoc {
  id: string;             // UID del cliente
  cedula: number;         // Campo cédula
  nombre: string;         // Nombre del cliente
  // ... otros campos (telefono, etc.)
}

// Paleta de colores
const colors = {
  primary: '#00B5E2',
  secondary: '#FF6565',
};

// Tipos de búsqueda de fecha
type SearchMode = 'dia' | 'semana' | 'mes' | 'ano' | 'rango';

const SalesScreen = () => {
  // --- Estados principales ---
  const [pedidos, setPedidos] = useState<PedidoDoc[]>([]);
  const [clientesMap, setClientesMap] = useState<Record<string, { cedula: number; nombre: string }>>({});
  
  // Filtros de cliente
  const [cedulaFilter, setCedulaFilter] = useState('');   // para buscar por cédula
  const [nombreFilter, setNombreFilter] = useState('');   // para buscar por nombre
  // Modo de búsqueda de fechas
  const [searchMode, setSearchMode] = useState<SearchMode>('dia');

  // Fechas a ingresar, según el modo
  const [searchDay, setSearchDay] = useState('');     // YYYY-MM-DD
  const [searchWeek, setSearchWeek] = useState('');   // YYYY-MM-DD (lunes)
  const [searchMonth, setSearchMonth] = useState(''); // YYYY-MM
  const [searchYear, setSearchYear] = useState('');   // YYYY
  const [rangeFrom, setRangeFrom] = useState('');     // YYYY-MM-DD
  const [rangeTo, setRangeTo] = useState('');         // YYYY-MM-DD

  // Resultados filtrados
  const [filteredPedidos, setFilteredPedidos] = useState<PedidoDoc[]>([]);
  // Totales
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [botellonesCount, setBotellonesCount] = useState<number>(0);

  // --- Suscripciones a Firestore ---
  useEffect(() => {
    // Pedidos
    const unsubPedidos = onSnapshot(collection(db, 'Pedidos'), (snapshot) => {
      const data: PedidoDoc[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<PedidoDoc, 'id'>),
      }));
      setPedidos(data);
    });

    // Clientes
    const unsubClientes = onSnapshot(collection(db, 'Clientes'), (snapshot) => {
      const map: Record<string, { cedula: number; nombre: string }> = {};
      snapshot.forEach((doc) => {
        // Ej: { cedula: 12345678, nombre: "José" }
        const d = doc.data() as { cedula: number; nombre: string };
        map[doc.id] = { ...d };
      });
      setClientesMap(map);
    });

    return () => {
      unsubPedidos();
      unsubClientes();
    };
  }, []);

  // --- Filtrado + Cálculo de totales ---
  useEffect(() => {
    // 1) Filtrar por cédula y nombre
    let temp = [...pedidos];
    // a) cédula
    if (cedulaFilter.trim() !== '') {
      const cedulaNum = parseInt(cedulaFilter.trim(), 10);
      if (!isNaN(cedulaNum)) {
        temp = temp.filter((p) => {
          const cData = clientesMap[p.clienteId];
          if (!cData) return false;
          return cData.cedula === cedulaNum;
        });
      } else {
        // si no es numérico => sin resultados
        temp = [];
      }
    }

    // b) nombre
    if (nombreFilter.trim() !== '') {
      const nameLow = nombreFilter.trim().toLowerCase();
      temp = temp.filter((p) => {
        const cData = clientesMap[p.clienteId];
        if (!cData) return false;
        return cData.nombre.toLowerCase().includes(nameLow);
      });
    }

    // 2) Filtrar por fecha (día, semana, mes, año o rango)
    const filteredByDates = filterByDateMode(temp, searchMode, {
      day: searchDay,
      week: searchWeek,
      month: searchMonth,
      year: searchYear,
      from: rangeFrom,
      to: rangeTo,
    });
    setFilteredPedidos(filteredByDates);

    // 3) Calcular totales
    let sumTotal = 0;
    let sumBot = 0;
    filteredByDates.forEach((p) => {
      sumTotal += p.total;
      sumBot += (p.cantidadConAsa + p.cantidadSinAsa);
    });
    setTotalAmount(sumTotal);
    setBotellonesCount(sumBot);

  }, [
    pedidos,
    clientesMap,
    cedulaFilter,
    nombreFilter,
    searchMode,
    searchDay,
    searchWeek,
    searchMonth,
    searchYear,
    rangeFrom,
    rangeTo,
  ]);

  // --- Render de cada pedido ---
  const renderPedidoItem = ({ item }: { item: PedidoDoc }) => {
    // Obtenemos cédula y nombre
    const cData = clientesMap[item.clienteId];
    const cedula = cData?.cedula ?? 0;
    const nombre = cData?.nombre ?? 'Desconocido';

    return (
      <View style={styles.pedidoItem}>
        <Text style={styles.pedidoText}>
          Fecha: {item.fecha} | Total: ${item.total.toFixed(2)}
        </Text>
        <Text style={styles.pedidoText}>
          Botellones: ConAsa={item.cantidadConAsa}, SinAsa={item.cantidadSinAsa}
        </Text>
        <Text style={styles.pedidoText}>
          Cliente: {nombre} (Cédula: {cedula})
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Ventas / Búsquedas Avanzadas</Text>

      {/* Campos de filtro de cliente */}
      <TextInput
        style={styles.input}
        placeholder="Cédula (num)"
        value={cedulaFilter}
        onChangeText={setCedulaFilter}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Nombre del cliente"
        value={nombreFilter}
        onChangeText={setNombreFilter}
      />

      {/* Selector de modo de búsqueda */}
      <View style={styles.modesRow}>
        <ModeButton
          label="Día"
          selected={searchMode === 'dia'}
          onPress={() => setSearchMode('dia')}
        />
        <ModeButton
          label="Semana"
          selected={searchMode === 'semana'}
          onPress={() => setSearchMode('semana')}
        />
        <ModeButton
          label="Mes"
          selected={searchMode === 'mes'}
          onPress={() => setSearchMode('mes')}
        />
        <ModeButton
          label="Año"
          selected={searchMode === 'ano'}
          onPress={() => setSearchMode('ano')}
        />
        <ModeButton
          label="Rango"
          selected={searchMode === 'rango'}
          onPress={() => setSearchMode('rango')}
        />
      </View>

      {/* Inputs según el modo de fecha */}
      {searchMode === 'dia' && (
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD"
          value={searchDay}
          onChangeText={setSearchDay}
        />
      )}
      {searchMode === 'semana' && (
        <TextInput
          style={styles.input}
          placeholder="Fecha del lunes (YYYY-MM-DD)"
          value={searchWeek}
          onChangeText={setSearchWeek}
        />
      )}
      {searchMode === 'mes' && (
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM (ej. 2025-03)"
          value={searchMonth}
          onChangeText={setSearchMonth}
        />
      )}
      {searchMode === 'ano' && (
        <TextInput
          style={styles.input}
          placeholder="YYYY (ej. 2025)"
          value={searchYear}
          onChangeText={setSearchYear}
        />
      )}
      {searchMode === 'rango' && (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Desde (YYYY-MM-DD)"
            value={rangeFrom}
            onChangeText={setRangeFrom}
          />
          <TextInput
            style={styles.input}
            placeholder="Hasta (YYYY-MM-DD)"
            value={rangeTo}
            onChangeText={setRangeTo}
          />
        </View>
      )}

      {/* Resumen de totales */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryText}>
          Total Ventas: ${totalAmount.toFixed(2)}
        </Text>
        <Text style={styles.summaryText}>
          Botellones: {botellonesCount}
        </Text>
      </View>

      {/* Lista de pedidos filtrados */}
      {filteredPedidos.length === 0 ? (
        <Text style={styles.noData}>No hay resultados</Text>
      ) : (
        <FlatList
          data={filteredPedidos}
          keyExtractor={(item) => item.id}
          renderItem={renderPedidoItem}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      <Toast />
    </View>
  );
};

export default SalesScreen;

// ========== Helpers de filtro de fecha ===============
function filterByDateMode(
  pedidos: PedidoDoc[],
  mode: SearchMode,
  fields: {
    day: string;
    week: string;
    month: string;
    year: string;
    from: string;
    to: string;
  }
): PedidoDoc[] {
  const { day, week, month, year, from, to } = fields;
  
  // Parse "YYYY-MM-DD" -> Date
  const parseDate = (str: string): Date | null => {
    if (!str || str.length < 10) return null;
    const [yyyy, mm, dd] = str.split('-');
    const Y = parseInt(yyyy, 10);
    const M = parseInt(mm, 10) - 1;
    const D = parseInt(dd, 10);
    if (isNaN(Y) || isNaN(M) || isNaN(D)) return null;
    return new Date(Y, M, D);
  };

  return pedidos.filter((pedido) => {
    const dateObj = parseDate(pedido.fecha);
    if (!dateObj) return false;

    switch (mode) {
      case 'dia': {
        const dayObj = parseDate(day);
        if (!dayObj) return true; // si no especifica => no filtra
        return sameDay(dateObj, dayObj);
      }
      case 'semana': {
        const mondayObj = parseDate(week);
        if (!mondayObj) return true; 
        const lastDay = new Date(mondayObj);
        lastDay.setDate(mondayObj.getDate() + 6);
        return dateObj >= mondayObj && dateObj <= lastDay;
      }
      case 'mes': {
        if (!month || month.length < 7) return true;
        const [yyyy, mm] = month.split('-');
        const Y = parseInt(yyyy, 10);
        const M = parseInt(mm, 10) - 1;
        if (isNaN(Y) || isNaN(M)) return true;
        return dateObj.getFullYear() === Y && dateObj.getMonth() === M;
      }
      case 'ano': {
        if (!year || year.length < 4) return true;
        const Y = parseInt(year, 10);
        if (isNaN(Y)) return true;
        return dateObj.getFullYear() === Y;
      }
      case 'rango': {
        const fromDate = parseDate(from);
        const toDate = parseDate(to);
        if (!fromDate || !toDate) return true;
        return dateObj >= fromDate && dateObj <= toDate;
      }
      default:
        return true; // si no se reconoce => no se filtra
    }
  });
}

function sameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
}

// ========== Botón de Modo de Búsqueda ===============
const ModeButton = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      style={[styles.modeButton, selected && styles.modeButtonSelected]}
      onPress={onPress}
    >
      <Text style={[styles.modeButtonText, selected && styles.modeButtonTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// ========== Estilos ===============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 8,
  },
  modesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  modeButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modeButtonSelected: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  modeButtonTextSelected: {
    color: '#fff',
  },
  summaryBox: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    marginVertical: 8,
    alignItems: 'center',
    // Sombra leve
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    marginVertical: 2,
  },
  noData: {
    textAlign: 'center',
    marginTop: 20,
    color: '#555',
  },
  pedidoItem: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    // Sombra leve
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  pedidoText: {
    fontSize: 12,
    color: '#333',
  },
});
