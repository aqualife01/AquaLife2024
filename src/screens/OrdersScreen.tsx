import React, { useRef, useState } from "react";
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
import { db, auth } from "../../firebaseConfig"; // Ajusta la ruta según tu proyecto
import { collection, addDoc } from "firebase/firestore";

interface Order {
  withHandle: number;      // Botellones con asa
  withoutHandle: number;   // Botellones sin asa
  type: "intercambio" | "llenado";
  comments: string;
  priority: "alta" | "media" | "baja";
}

const OrderScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  // Costo unitario de cada botellón
  const COST_PER_BOTTLE = 0.5;

  // Referencia al ScrollView para hacer scroll al final
  const scrollViewRef = useRef<ScrollView>(null);

  // Estado local que guardará la información del pedido
  const [order, setOrder] = useState<Order>({
    withHandle: 0,
    withoutHandle: 0,
    type: "intercambio",
    comments: "",
    priority: "media",
  });

  const [isConfirmed, setIsConfirmed] = useState(false);

  // Maneja cambios en los campos del pedido
  const handleChange = <T extends keyof Order>(field: T, value: Order[T]) => {
    setOrder((prev) => ({ ...prev, [field]: value }));
  };

  // Cuando se confirma, mostramos resumen
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
    // Desplazarse al final del resumen
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Calcula el costo total en base a la suma de botellones con y sin asa
  const totalBottles = order.withHandle + order.withoutHandle;
  const totalPrice = totalBottles * COST_PER_BOTTLE;

  const getTypeDescription = (type: Order["type"]) => {
    return type === "intercambio"
      ? "Sus botellones serán cambiados por unos llenos."
      : "Sus botellones serán tratados, desinfectados y estarán óptimos para su entrega.";
  };

  // Crea el pedido en la colección "Pedidos" de Firestore
  const handleCreateOrderInFirestore = async () => {
    try {
      // Verifica si hay un usuario logueado
      const user = auth.currentUser;
      if (!user) {
        Alert.alert(
          "Usuario no autenticado",
          "Por favor, inicie sesión antes de realizar un pedido."
        );
        return;
      }

      // Prepara los datos para la colección
      // (puedes ajustar formato de fecha/hora)
      const now = new Date();
      const fecha = now.toISOString().split("T")[0]; // yyyy-mm-dd
      const hora = now.toTimeString().split(" ")[0]; // HH:MM:SS

      const nuevoPedido = {
        clienteId: user.uid,               // UID del usuario autenticado
        fecha,
        hora,
        cantidadConAsa: order.withHandle,
        cantidadSinAsa: order.withoutHandle,
        costoUnitario: COST_PER_BOTTLE,
        total: totalPrice,
        estado: "pendiente",
        empleadoAsignadoId: "abc123",      // Ejemplo; ajústalo según tu flujo
        observaciones: order.comments,     // Comentarios que ingresó el cliente
      };

      // Inserta en la colección "Pedidos"
      await addDoc(collection(db, "Pedidos"), nuevoPedido);

      Alert.alert("Éxito", "Tu pedido ha sido generado correctamente.");
      // Después de crear el documento, puedes navegar a donde necesites
      navigation.goBack(); // o navigation.navigate("Home") según tu flujo
    } catch (error) {
      console.error("Error al crear pedido:", error);
      Alert.alert("Error", "No se pudo crear el pedido. Intenta de nuevo.");
    }
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer} ref={scrollViewRef}>
        <View style={styles.card}>
          <Text style={globalStyles.headerText}>Generar Pedido</Text>

          {/* BOTELLONES CON ASA */}
          <Text style={globalStyles.title}>Botellones con Asa:</Text>
          <TextInput
            style={globalStyles.input}
            keyboardType="numeric"
            value={order.withHandle.toString()}
            onChangeText={(text) =>
              handleChange("withHandle", parseInt(text) || 0)
            }
          />

          {/* BOTELLONES SIN ASA */}
          <Text style={globalStyles.title}>Botellones sin Asa:</Text>
          <TextInput
            style={globalStyles.input}
            keyboardType="numeric"
            value={order.withoutHandle.toString()}
            onChangeText={(text) =>
              handleChange("withoutHandle", parseInt(text) || 0)
            }
          />

          {/* TIPO DE PEDIDO */}
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

          {/* COMENTARIOS */}
          <Text style={globalStyles.title}>Comentarios:</Text>
          <TextInput
            style={globalStyles.input}
            multiline
            numberOfLines={4}
            value={order.comments}
            onChangeText={(text) => handleChange("comments", text)}
          />

          {/* PRIORIDAD */}
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

          {/* COSTO TOTAL */}
          <Text style={globalStyles.title}>
            Costo Total:{" "}
            <Text style={{ fontWeight: "bold", color: colors.primary }}>
              ${totalPrice.toFixed(2)}
            </Text>
          </Text>

          {/* BOTÓN DE CONFIRMAR (muestra el resumen) */}
          <TouchableOpacity style={globalStyles.primaryButton} onPress={handleConfirm}>
            <Text style={globalStyles.primaryButtonText}>Confirmar</Text>
          </TouchableOpacity>
        </View>

        {/* RESUMEN DEL PEDIDO (sólo se ve si está confirmado) */}
        {isConfirmed && (
          <View style={styles.summaryContainer}>
            <Text style={globalStyles.headerText}>Resumen del Pedido:</Text>
            <Text>Botellones con Asa: {order.withHandle}</Text>
            <Text>Botellones sin Asa: {order.withoutHandle}</Text>
            <Text>Tipo: {order.type}</Text>
            <Text>Descripción: {getTypeDescription(order.type)}</Text>
            <Text>Comentarios: {order.comments}</Text>
            <Text>Prioridad: {order.priority}</Text>
            <Text>
              Total: <Text style={{ fontWeight: "bold" }}>${totalPrice.toFixed(2)}</Text>
            </Text>

            {/* BOTÓN DE FACTURACIÓN (crea el pedido en Firestore) */}
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
    backgroundColor: colors.primaryShades[200], // Fondo gris tenue
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    width: "90%",
    alignSelf: "center",
    alignItems: "center",
  },
});

export default OrderScreen;
