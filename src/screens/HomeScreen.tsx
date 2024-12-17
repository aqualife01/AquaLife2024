import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { globalStyles } from '../styles/globalStyles';

const HomeScreen = ({ navigation }: any) => {
  const [hoveredBox, setHoveredBox] = useState<string | null>(null);

  return (
    <ImageBackground
      source={require('../assets/background.png')} // Imagen de fondo
      style={styles.backgroundImage}
    >
      {/* Barra superior */}
      <View style={styles.topBar}>
        <Image
          source={require('../assets/logo.png')} // Logo
          style={styles.logo}
        />
        <Text style={styles.companyName}>AquaLife</Text>
      </View>

      {/* Contenido principal */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.sectionContainer}>
          <Text style={styles.titleText}>Bienvenidos a AquaLife</Text>
          <Text style={styles.subTitleText}>
            Proporcionando soluciones de agua pura para tu familia y negocio.
          </Text>
        </View>

        <View style={styles.missionVisionContainer}>
          <TouchableOpacity
            style={[
              styles.missionVisionBox,
              hoveredBox === 'mission' && styles.hoveredBox,
            ]}
            activeOpacity={0.8}
            onPress={() => {}}
            onPressIn={() => setHoveredBox('mission')}
            onPressOut={() => setHoveredBox(null)}
          >
            <Text style={styles.boxTitle}>Nuestra Misión</Text>
            <Text style={styles.boxText}>
              Ofrecer soluciones de agua de alta calidad que enriquezcan vidas y
              apoyen a las comunidades.
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.missionVisionBox,
              hoveredBox === 'vision' && styles.hoveredBox,
            ]}
            activeOpacity={0.8}
            onPress={() => {}}
            onPressIn={() => setHoveredBox('vision')}
            onPressOut={() => setHoveredBox(null)}
          >
            <Text style={styles.boxTitle}>Nuestra Visión</Text>
            <Text style={styles.boxText}>
              Ser el proveedor líder de soluciones sostenibles de agua a nivel
              mundial.
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.callToActionContainer}>
          <Text style={styles.callToActionText}>¡Únete a AquaLife Hoy!</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={globalStyles.primaryButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={globalStyles.primaryButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[globalStyles.primaryButton, styles.secondaryButton]}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.secondaryButtonText}>Registrarse</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.locationContainer}>
          <Text style={styles.boxTitle}>¿Dónde encontrarnos?</Text>
          <Text style={styles.boxText}>
            Calle Mama Tere, CC Esquina de Tipuro, Nivel PB Local 1, Sector
            Tipuro, Maturín, Monagas, Venezuela.
          </Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  topBar: {
    width: '100%',
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  companyName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  sectionContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subTitleText: {
    fontSize: 18,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 20,
  },
  missionVisionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  missionVisionBox: {
    width: '45%',
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    elevation: 5, // Sustituto de sombras en Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  hoveredBox: {
    backgroundColor: '#e0f7fa',
  },
  boxTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#0D9488',
  },
  boxText: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
  },
  locationContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    marginTop: 30,
  },
  callToActionContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  callToActionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#0D9488',
    borderWidth: 2,
  },
  secondaryButtonText: {
    color: '#0D9488',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
