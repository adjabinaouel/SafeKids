import React, { useEffect, useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function AuthLoading({ navigation }) {
  const { isLoading, isSignout, userToken, userRole } = useContext(AuthContext);

  useEffect(() => {
    // Attendre que le chargement soit terminé
    if (!isLoading) {
      if (userToken && !isSignout) {
        // Session existante - naviguer selon le rôle
        switch (userRole) {
          case 'admin':
            navigation.replace('Dashboard');
            break;
          case 'medecin':
            navigation.replace('DashboardMedecin');
            break;
          case 'parent':
            navigation.replace('Home');
            break;
          default:
            navigation.replace('Login');
        }
      } else {
        // Pas de session - aller à Login
        navigation.replace('Login');
      }
    }
  }, [isLoading, isSignout, userToken, userRole, navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#7C3AED" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F7FF',
  },
});