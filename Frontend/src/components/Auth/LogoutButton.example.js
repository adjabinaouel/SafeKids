/**
 * Exemple d'intégration de la gestion des sessions dans SettingsScreen
 * 
 * Cette fonction montre comment utiliser useAuth pour la déconnexion
 * et comment gérer la redirection vers la page de connexion
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';

export function LogoutButton({ navigation }) {
  const { signOut, user, getSessionInfo } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter?',
      [
        { text: 'Annuler', onPress: () => {}, style: 'cancel' },
        {
          text: 'Déconnecter',
          onPress: async () => {
            setLoading(true);
            const result = await signOut();
            setLoading(false);

            if (result.success) {
              // Redirection vers la page de connexion
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } else {
              Alert.alert('Erreur', result.error || 'Erreur lors de la déconnexion');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleShowSessionInfo = async () => {
    const info = await getSessionInfo();
    setSessionInfo(info);

    Alert.alert(
      'Infos de Session',
      `
Actif: ${info.isActive ? 'Oui' : 'Non'}
Rôle: ${info.role}
Utilisateur: ${info.user?.prenom} ${info.user?.nom}
Email: ${info.user?.email}
Expiration: ${new Date(info.tokenExpiry).toLocaleString()}
Durée restante: ${info.durationRemaining}
      `.trim(),
      [{ text: 'OK', onPress: () => {} }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Bouton voir infos de session */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleShowSessionInfo}
        disabled={loading}
      >
        <Ionicons name="information-circle-outline" size={20} color="#7C3AED" />
        <Text style={styles.buttonText}>Infos de session</Text>
      </TouchableOpacity>

      {/* Affichage de la durée restante */}
      {sessionInfo && (
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Durée de session restante:</Text>
          <Text style={styles.infoValue}>{sessionInfo.durationRemaining}</Text>
        </View>
      )}

      {/* Bouton de déconnexion */}
      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
            <Text style={[styles.buttonText, styles.logoutButtonText]}>
              Se déconnecter
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
  },
  logoutButton: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
    marginTop: 12,
  },
  logoutButtonText: {
    color: '#FFFFFF',
  },
  infoBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C3AED',
  },
});

export default LogoutButton;
