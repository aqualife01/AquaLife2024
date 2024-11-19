import { StyleSheet } from "react-native";

// Definir paleta de colores basada en el color base "#0D9488"
const colors = {
  // primary: "#0D9488", // Color base
  primary: "#07665C", // Color base
  primaryLight: "#34D0C3", // Tono más claro del color base
  primaryDark: "#07665C", // Tono más oscuro del color base
  secondary: "#FF9800", // Complementario (naranja)
  secondaryLight: "#FFB74D", // Naranja claro
  secondaryDark: "#F57C00", // Naranja oscuro
  background: "#FFFFFF", // Fondo principal
  textPrimary: "#212121", // Texto principal
  textSecondary: "#757575", // Texto secundario
  disabled: '#999999', // Estado deshabilitado
  success: '#06D001', // Verde neón para estados exitosos
  error: '#D32F2F', // Rojo para mensajes de error o alertas
  warning: '#FFB300', // Amarillo para advertencias
  info: '#0288D1', // Azul para información adicional

  // Definir colores adicionales para "shades" de primary
  primaryShades: {
    50: '#E0F2F1',
    100: '#B2DFDB',
    200: '#80CBC4',
    300: '#4DB6AC',
    400: '#26A69A',
    500: '#0D9488', // Color base
    600: '#0D8278',
    700: '#0C7168',
    800: '#0A6058',
    900: '#084C44',
  },
};

// Definir una escala más amplia de tamaños de fuente
const fontSizes = {
  xSmall: 10,
  small: 14,
  medium: 16,
  large: 18,
  xLarge: 24,
  xxLarge: 30,
  xxxLarge: 36,
};

// Márgenes y paddings globales
const spacings = {
  xSmall: 4,
  small: 8,
  medium: 16,
  large: 24,
  xLarge: 32,
};

// Estilos reutilizables para componentes
const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacings.medium,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: fontSizes.xLarge,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: spacings.medium,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: spacings.small,
  },
  primaryButtonText: {
    fontSize: fontSizes.medium,
    color: colors.background,
    fontWeight: "500",
  },
  headerText: {
    fontSize: fontSizes.xxLarge,
    color: colors.textPrimary,
    fontWeight: "bold",
  },
  smallText: {
    fontSize: fontSizes.small,
    color: colors.textPrimary,
  },
  wrapperButtonBack: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: spacings.small,
  },

  input: {
    marginBottom: 15,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
    width: '100%',
  },
});

// Exportar los estilos
export { colors, fontSizes, spacings, globalStyles };