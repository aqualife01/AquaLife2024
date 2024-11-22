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

interface Order {
  quantity: number;
  emptyBottles: number;
  type: "intercambio" | "llenado";
  comments: string;
  priority: "alta" | "media" | "baja";
}

const OrderScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const BCV_RATE = 0.55; // Precio por botellón basado en la tasa BCV
  const scrollViewRef = useRef<ScrollView>(null); // Referencia al ScrollView
  const [order, setOrder] = useState<Order>({
    quantity: 0,
    emptyBottles: 0,
    type: "intercambio",
    comments: "",
    priority: "media",
  });

  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleChange = <T extends keyof Order>(field: T, value: Order[T]) => {
    setOrder((prev) => ({ ...prev, [field]: value }));
  };

  const handleConfirm = () => {
    if (order.quantity === 0) {
      Alert.alert("Error", "La cantidad de botellones debe ser mayor a 0.");
      return;
    }
    setIsConfirmed(true);
    // Desplazarse al final del resumen
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleGenerateOrder = () => {
    navigation.navigate("GenerateOrderScreen", { order });
  };

  const totalPrice = order.quantity * BCV_RATE;

  const getTypeDescription = (type: Order["type"]) => {
    return type === "intercambio"
      ? "Sus botellones serán cambiados por unos llenos."
      : "Sus botellones serán tratados, desinfectados y estarán óptimos para su entrega.";
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        ref={scrollViewRef} // Asignar referencia al ScrollView
      >
        <View style={styles.card}>
          <Text style={globalStyles.headerText}>Generar Pedido</Text>

          <Text style={globalStyles.title}>Cantidad de Botellones:</Text>
          <TextInput
            style={globalStyles.input}
            keyboardType="numeric"
            value={order.quantity.toString()}
            onChangeText={(text) => handleChange("quantity", parseInt(text) || 0)}
          />

          <Text style={globalStyles.title}>Botellones Vacíos a Entregar:</Text>
          <TextInput
            style={globalStyles.input}
            keyboardType="numeric"
            value={order.emptyBottles.toString()}
            onChangeText={(text) =>
              handleChange("emptyBottles", parseInt(text) || 0)
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

          <Text style={globalStyles.title}>
            Costo Total:{" "}
            <Text style={{ fontWeight: "bold", color: colors.primary }}>
              ${totalPrice.toFixed(2)}
            </Text>
          </Text>

          <TouchableOpacity
            style={globalStyles.primaryButton}
            onPress={handleConfirm}
          >
            <Text style={globalStyles.primaryButtonText}>Confirmar</Text>
          </TouchableOpacity>
        </View>

        {isConfirmed && (
          <View style={styles.summaryContainer}>
            <Text style={globalStyles.headerText}>Resumen del Pedido:</Text>
            <Text>Cantidad: {order.quantity}</Text>
            <Text>Botellones Vacíos: {order.emptyBottles}</Text>
            <Text>Tipo: {order.type}</Text>
            <Text>Descripción: {getTypeDescription(order.type)}</Text>
            <Text>Comentarios: {order.comments}</Text>
            <Text>Prioridad: {order.priority}</Text>
            <Text>
              Total:{" "}
              <Text style={{ fontWeight: "bold" }}>
                ${totalPrice.toFixed(2)}
              </Text>
            </Text>

            <TouchableOpacity
              style={globalStyles.primaryButton}
              onPress={handleGenerateOrder}
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
