import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { globalStyles, colors } from "../styles/globalStyles";

const PerfilUsuario = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [edad, setEdad] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [editar, setEditar] = useState(false);

  const handleGuardar = () => {
    Alert.alert("Datos guardados con éxito");
    setEditar(false);
  };

  const handleEditar = () => {
    setEditar(true);
  };

  return (
    <View style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <View style={styles.profilePictureContainer}>
            <View style={styles.profilePicture} />
            <Text style={styles.profileName}>
              {nombre} {apellido}
            </Text>
          </View>

          <Text style={globalStyles.headerText}>Información personal</Text>

          <View style={styles.row}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre:</Text>
              <TextInput
                style={globalStyles.input}
                value={nombre}
                onChangeText={(text) => setNombre(text)}
                editable={editar}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Apellido:</Text>
              <TextInput
                style={globalStyles.input}
                value={apellido}
                onChangeText={(text) => setApellido(text)}
                editable={editar}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Edad:</Text>
              <TextInput
                style={globalStyles.input}
                value={edad}
                onChangeText={(text) => setEdad(text)}
                editable={editar}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Dirección:</Text>
              <TextInput
                style={globalStyles.input}
                value={direccion}
                onChangeText={(text) => setDireccion(text)}
                editable={editar}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Teléfono:</Text>
              <TextInput
                style={globalStyles.input}
                value={telefono}
                onChangeText={(text) => setTelefono(text)}
                editable={editar}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email:</Text>
              <TextInput
                style={globalStyles.input}
                value={email}
                onChangeText={(text) => setEmail(text)}
                editable={editar}
              />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={globalStyles.primaryButton}
              onPress={handleGuardar}
            >
              <Text style={globalStyles.primaryButtonText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditar}
            >
              <Text style={globalStyles.primaryButtonText}>
                {editar ? "Cancelar" : "Editar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  card: {
    width: "95%", // Ocupar más espacio horizontalmente
    maxWidth: 600, // Aumentar el ancho máximo para pantallas grandes
    backgroundColor: colors.primaryShades[50],
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  profilePictureContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profilePicture: {
    backgroundColor: colors.primaryDark,
    borderRadius: 50,
    width: 100,
    height: 100,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: colors.textPrimary,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 10, // Más separación entre las columnas
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  editButton: {
    backgroundColor: colors.secondary,
    padding: 10,
    borderRadius: 5,
  },
});


export default PerfilUsuario;
