import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { globalStyles, colors } from "../styles/globalStyles";

// Firebase
import { db, auth } from "../../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

// Importa tu función para obtener número correlativo
import { getNextOrderNumber } from "../components/getNextOrderNumber";

// Definimos la interfaz del pedido
interface Order {
  withHandle: number;
  withoutHandle: number;
  type: "intercambio" | "llenado";
  comments: string;
  priority: "alta" | "normal" ;
}

const OrderScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const scrollViewRef = useRef<ScrollView>(null);

  // Estado para los datos del pedido
  const [order, setOrder] = useState<Order>({
    withHandle: 0,
    withoutHandle: 0,
    type: "intercambio",
    comments: "",
    priority: "normal",
  });
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Estado para la tasa del dólar
  const [dolarRate, setDolarRate] = useState<number | null>(null);

  // Estado para la fecha de hoy en formato YYYY-MM-DD
  const [todayDate, setTodayDate] = useState<string>("");

  // **Estado para el costo unitario** por botellón
  // Por defecto es 0.5, pero subirá a 0.7 si la prioridad es alta
  const [costPerBottle, setCostPerBottle] = useState(0.5);

  // Al montar, definimos la fecha de hoy
  useEffect(() => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    setTodayDate(dateStr);
  }, []);

  // useEffect para traer la tasa cada hora (ajusta la URL a tu entorno)
  useEffect(() => {
    const fetchDolarRate = async () => {
      try {
        // Ajusta la URL según tu entorno
        // - Emulador Android: "http://10.0.2.2:5000/api/tasa"
        // - iOS Simulator: "http://localhost:5000/api/tasa"
        // - Web: "http://127.0.0.1:5000/api/tasa"
        const response = await fetch("http://127.0.0.1:5000/api/tasa");
        if (!response.ok) {
          throw new Error("Error en la respuesta de la API");
        }
        const data = await response.json();
        console.log("API Response:", data); 
        setDolarRate(data.tasa);
      } catch (error) {
        console.error("Error fetching dolar rate:", error);
      }
    };

    fetchDolarRate();
    const interval = setInterval(fetchDolarRate, 3600000); // Actualizar cada hora
    return () => clearInterval(interval);
  }, []);

  // Maneja cambios en los campos del pedido
  const handleChange = <T extends keyof Order>(field: T, value: Order[T]) => {
    setOrder((prev) => ({ ...prev, [field]: value }));

    // Si el campo que cambia es "priority" y el valor es "alta", subimos el costo a 0.7
    // En caso contrario, vuelve a 0.5
    if (field === "priority") {
      if (value === "alta") {
        setCostPerBottle(0.7);
      } else {
        setCostPerBottle(0.5);
      }
    }
  };

  // Confirmar pedido (mostrar resumen)
  const handleConfirm = () => {
    const totalBottles = order.withHandle + order.withoutHandle;
    if (totalBottles === 0) {
      Alert.alert(
        "Error",
        "La cantidad total de botellones (con y sin asa) debe ser mayor a 0."
      );
      return;
    }
    setIsConfirmed(true);
    // Desplazamos el scroll al final para mostrar el resumen
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Calculamos el total de botellones y el costo total
  const totalBottles = order.withHandle + order.withoutHandle;
  const totalPrice = totalBottles * costPerBottle;

  // Descripción del tipo de pedido
  const getTypeDescription = (type: Order["type"]) => {
    return type === "intercambio"
      ? "Sus botellones serán cambiados por unos llenos."
      : "Sus botellones serán tratados, desinfectados y estarán óptimos para su entrega.";
  };

  // Guardar el pedido en Firestore
  const handleCreateOrderInFirestore = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert(
          "Usuario no autenticado",
          "Por favor, inicie sesión antes de realizar un pedido."
        );
        return;
      }
      const now = new Date();
      const fecha = now.toISOString().split("T")[0];
      const hora = now.toTimeString().split(" ")[0];
      const numeroPedido = await getNextOrderNumber(db);

      const nuevoPedido = {
        clienteId: user.uid,
        fecha,
        hora,
        cantidadConAsa: order.withHandle,
        cantidadSinAsa: order.withoutHandle,
        // Guardamos el costo unitario según la prioridad elegida
        costoUnitario: costPerBottle,
        total: totalPrice,
        estado: "pendiente",
        empleadoAsignadoId: "abc123", // Ajusta según tu lógica
        observaciones: order.comments,
        numeroPedido: numeroPedido,
      };

      await addDoc(collection(db, "Pedidos"), nuevoPedido);

      Alert.alert("Éxito", "Tu pedido ha sido generado correctamente.");
      navigation.goBack();
    } catch (error) {
      console.error("Error al crear pedido:", error);
      Alert.alert("Error", "No se pudo crear el pedido. Intenta de nuevo.");
    }
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer} ref={scrollViewRef}>
        
        {/* Tasa del día con fecha */}
        <Text style={globalStyles.headerText}>
          Tasa del día ({todayDate}):{" "}
          <Text style={{ fontWeight: "bold", color: colors.primary }}>
            {dolarRate ? `$${dolarRate.toFixed(2)}` : "Cargando..."}
          </Text>
        </Text>

        <View style={styles.card}>
          <Text style={globalStyles.headerText}>Generar Pedido</Text>

          <Text style={globalStyles.title}>Botellones con Asa:</Text>
          <TextInput
            style={globalStyles.input}
            keyboardType="numeric"
            value={order.withHandle.toString()}
            onChangeText={(text) =>
              handleChange("withHandle", parseInt(text) || 0)
            }
          />

          <Text style={globalStyles.title}>Botellones sin Asa:</Text>
          <TextInput
            style={globalStyles.input}
            keyboardType="numeric"
            value={order.withoutHandle.toString()}
            onChangeText={(text) =>
              handleChange("withoutHandle", parseInt(text) || 0)
            }
          />

          <Text style={globalStyles.title}>Tipo de Pedido:</Text>
          <Picker
            selectedValue={order.type}
            onValueChange={(itemValue) =>
              handleChange("type", itemValue as Order["type"])
            }
            style={styles.picker}
          >
            <Picker.Item label="Intercambio" value="intercambio" />
            <Picker.Item label="Llenado" value="llenado" />
          </Picker>
          <Text style={globalStyles.smallText}>
            {getTypeDescription(order.type)}
          </Text>

          <Text style={globalStyles.title}>Comentarios:</Text>
          <TextInput
            style={globalStyles.input}
            multiline
            numberOfLines={4}
            value={order.comments}
            onChangeText={(text) => handleChange("comments", text)}
          />

          <Text style={globalStyles.title}>Nivel de Prioridad:</Text>
          <Picker
            selectedValue={order.priority}
            onValueChange={(itemValue) =>
              handleChange("priority", itemValue as Order["priority"])
            }
            style={styles.picker}
          >
            <Picker.Item label="Alta" value="alta" />
            <Picker.Item label="Media" value="media" />
            <Picker.Item label="Baja" value="baja" />
          </Picker>

          {/* Si la prioridad es alta, mostramos un mensaje explicando el costo extra */}
          {order.priority === "alta" && (
            <Text style={styles.alertText}>
              Con prioridad alta, el costo por botellón es de $0.70
            </Text>
          )}

          <Text style={globalStyles.title}>
            Costo Total:{" "}
            <Text style={{ fontWeight: "bold", color: colors.primary }}>
              ${totalPrice.toFixed(2)}
            </Text>
          </Text>

          <TouchableOpacity style={globalStyles.primaryButton} onPress={handleConfirm}>
            <Text style={globalStyles.primaryButtonText}>Confirmar</Text>
          </TouchableOpacity>
        </View>

        {isConfirmed && (
          <View style={styles.summaryContainer}>
            <Text style={globalStyles.headerText}>Resumen del Pedido:</Text>
            <Text>Botellones con Asa: {order.withHandle}</Text>
            <Text>Botellones sin Asa: {order.withoutHandle}</Text>
            <Text>Tipo: {order.type}</Text>
            <Text>Descripción: {getTypeDescription(order.type)}</Text>
            <Text>Comentarios: {order.comments}</Text>
            <Text>Prioridad: {order.priority}</Text>
            {/* Se refleja el total con la tarifa ajustada si es alta */}
            <Text>
              Total:{" "}
              <Text style={{ fontWeight: "bold" }}>${totalPrice.toFixed(2)}</Text>
            </Text>
            <TouchableOpacity
              style={globalStyles.primaryButton}
              onPress={handleCreateOrderInFirestore}
            >
              <Text style={globalStyles.primaryButtonText}>Facturación</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: colors.primaryShades[50],
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    alignSelf: "center",
    marginBottom: 20,
  },
  scrollContainer: {
    paddingVertical: 20,
  },
  picker: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.disabled,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: colors.primaryShades[50],
    width: "100%",
  },
  summaryContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: colors.primaryShades[200],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    width: "90%",
    alignSelf: "center",
    alignItems: "center",
  },
  // Mensaje si la prioridad es alta
  alertText: {
    color: colors.error,
    fontStyle: "italic",
    marginBottom: 10,
  },
});

export default OrderScreen;
