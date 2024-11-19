import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Image,
  StyleSheet,
} from 'react-native';
import { globalStyles } from '../styles/globalStyles';

const HomeScreen = ({ navigation }: any) => {
  return (
    <ImageBackground
      source={require('../assets/background.png')} // Imagen de fondo
      style={[globalStyles.container, styles.backgroundImage]} // Mezcla estilos globales y específicos
    >
      {/* Barra superior */}
      <View style={styles.topBar}>
        <Image
          source={require('../assets/logo.png')} // Logo
          style={styles.logo}
        />
        <View style={styles.navMenu}>
          <Text style={styles.navItem}>About</Text>
          <Text style={styles.navItem}>How it works?</Text>
          <Text style={styles.navItem}>Contact Us</Text>
        </View>
      </View>

      {/* Contenido principal */}
      <View style={styles.contentContainer}>
        <Text style={styles.titleText}>We are Creative Agency.</Text>
        <Text style={styles.subTitleText}>
          Providing pure water solutions for your family and business.
        </Text>

        {/* Cuadro de búsqueda */}
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search something here..."
            placeholderTextColor="#888888"
          />
        </View>

        {/* Botones */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={globalStyles.primaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={globalStyles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[globalStyles.primaryButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.secondaryButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  // Imagen de fondo ajustada a la pantalla
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  // Barra superior
  topBar: {
    width: '100%',
    height: 80,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  navMenu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
  },
  navItem: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 5,
  },
  // Contenido principal
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  titleText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subTitleText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  // Cuadro de búsqueda
  searchBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    width: '90%',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  searchInput: {
    fontSize: 16,
    color: '#333333',
  },
  // Botones
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 20,
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
