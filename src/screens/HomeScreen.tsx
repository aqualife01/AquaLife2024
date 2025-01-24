import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { globalStyles } from '../styles/globalStyles';
import Carousel from '../components/Carousel';

const HomeScreen = ({ navigation }: any) => {
  const [hoveredBox, setHoveredBox] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      {/* Barra verde delgada con logo a la izquierda y botones a la derecha */}
      <LinearGradient
        colors={['#0D9488', '#0F766E', '#0D9488']}
        style={styles.topBarContainer}
      >
        <View style={styles.leftSection}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
          />
          <Text style={styles.companyName}>AquaLife</Text>
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity
            style={[globalStyles.primaryButton, styles.smallButton]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={globalStyles.primaryButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              globalStyles.primaryButton,
              styles.smallButton,
              styles.secondaryButton,
            ]}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.secondaryButtonText}>Registrarse</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Contenido principal scrolleable */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Título de bienvenida */}
        <View style={styles.welcomeContainer}>
          <Text style={styles.heroTitle}>¡Bienvenido a AquaLife!</Text>
          <Text style={styles.heroSubtitle}>
            Soluciones de agua purificada para tu hogar y negocio
          </Text>
        </View>

        {/* Sección Misión y Visión */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>¿Quiénes Somos?</Text>
          <Text style={styles.sectionSubtitle}>
            Conoce nuestra misión y visión
          </Text>

          <View style={styles.missionVisionContainer}>
            <TouchableOpacity
              style={[
                styles.missionVisionBox,
                hoveredBox === 'mission' && styles.hoveredBox,
              ]}
              activeOpacity={0.8}
              onPressIn={() => setHoveredBox('mission')}
              onPressOut={() => setHoveredBox(null)}
            >
              <Text style={styles.boxTitle}>Nuestra Misión</Text>
              <Text style={styles.boxText}>
                Ofrecer soluciones de agua de alta calidad que enriquezcan vidas
                y apoyen a las comunidades.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.missionVisionBox,
                hoveredBox === 'vision' && styles.hoveredBox,
              ]}
              activeOpacity={0.8}
              onPressIn={() => setHoveredBox('vision')}
              onPressOut={() => setHoveredBox(null)}
            >
              <Text style={styles.boxTitle}>Nuestra Visión</Text>
              <Text style={styles.boxText}>
                Ser el proveedor líder de soluciones sostenibles de agua
                a nivel mundial.
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Carrusel con imágenes en tamaño original y fondo difuminado */}
        <View style={{ marginVertical: 20 }}>
          <Carousel />
        </View>

        {/* Sección Ubicación */}
        <View style={styles.locationContainer}>
          <Text style={styles.locationTitle}>¿Dónde encontrarnos?</Text>
          <Text style={styles.locationText}>
            Calle Mama Tere, CC Esquina de Tipuro, Nivel PB Local 1,
            Sector Tipuro, Maturín, Monagas, Venezuela.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

/* ----------------------- ESTILOS ------------------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },

  /* Barra superior (verde) */
  topBarContainer: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  companyName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  smallButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#0D9488',
    borderWidth: 2,
  },
  secondaryButtonText: {
    color: '#0D9488',
    fontSize: 14,
    fontWeight: 'bold',
  },

  /* Contenido principal */
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeContainer: {
    marginVertical: 15,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 26,
    color: '#0D9488',
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },

  /* Sección Misión y Visión */
  sectionContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0D9488',
    marginBottom: 5,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  missionVisionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  missionVisionBox: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  hoveredBox: {
    backgroundColor: '#E6FAF9',
  },
  boxTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D9488',
    marginBottom: 8,
    textAlign: 'center',
  },
  boxText: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
  },

  /* Sección Ubicación */
  locationContainer: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0D9488',
    marginBottom: 10,
    textAlign: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HomeScreen;
