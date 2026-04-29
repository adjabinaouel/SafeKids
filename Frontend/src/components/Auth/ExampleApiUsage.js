/**
 * Exemple d'utilisation d'ApiClient avec gestion d'erreurs 401
 * 
 * Ce fichier montre comment utiliser ApiClient pour les appels API
 * et gérer les erreurs d'authentification
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ApiClient from '../../utils/ApiClient';
import { useAuth } from '../../hooks/useAuth';

export function ExampleApiUsage({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Exemple 1: GET avec ApiClient
   */
  const fetchChildren = async () => {
    setLoading(true);
    setError(null);

    try {
      // ApiClient injecte automatiquement le token Bearer
      const result = await ApiClient.get('/api/enfants');
      setData(result);
    } catch (err) {
      // Gestion des erreurs spécifiques
      if (err.message.includes('UNAUTHORIZED')) {
        // Session expirée - rediriger vers login
        Alert.alert(
          'Session expirée',
          'Votre session a expiré. Veuillez vous reconnecter.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              },
            },
          ]
        );
      } else if (err.message.includes('FORBIDDEN')) {
        Alert.alert(
          'Accès refusé',
          'Vous n\'avez pas les permissions pour accéder à cette ressource.'
        );
      } else {
        setError(err.message);
        Alert.alert('Erreur', err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Exemple 2: POST avec ApiClient
   */
  const createChild = async (childData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await ApiClient.post('/api/enfants', childData);
      setData(result);
      Alert.alert('Succès', 'Enfant créé avec succès');
    } catch (err) {
      if (err.message.includes('UNAUTHORIZED')) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else {
        setError(err.message);
        Alert.alert('Erreur', err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Exemple 3: PUT avec ApiClient
   */
  const updateChild = async (childId, childData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await ApiClient.put(
        `/api/enfants/${childId}`,
        childData
      );
      setData(result);
      Alert.alert('Succès', 'Enfant mis à jour avec succès');
    } catch (err) {
      if (err.message.includes('UNAUTHORIZED')) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Exemple 4: DELETE avec ApiClient
   */
  const deleteChild = async (childId) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer cet enfant?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            setError(null);

            try {
              await ApiClient.delete(`/api/enfants/${childId}`);
              Alert.alert('Succès', 'Enfant supprimé avec succès');
              // Recharger la liste
              await fetchChildren();
            } catch (err) {
              if (err.message.includes('UNAUTHORIZED')) {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              } else {
                setError(err.message);
                Alert.alert('Erreur', err.message);
              }
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  /**
   * Exemple 5: Upload avec FormData
   */
  const uploadAvatar = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      // PostForm gère le FormData automatiquement
      const result = await ApiClient.postForm('/upload/avatar', formData);
      Alert.alert('Succès', 'Avatar téléchargé avec succès');
    } catch (err) {
      if (err.message.includes('UNAUTHORIZED')) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else {
        setError(err.message);
        Alert.alert('Erreur', err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Charger les enfants au montage
  useEffect(() => {
    fetchChildren();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Exemples d'utilisation ApiClient</Text>
        <Text style={styles.subtitle}>
          Connecté en tant que: {user?.prenom} {user?.nom}
        </Text>
      </View>

      {/* Affichage des erreurs */}
      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={20} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Affichage du contenu */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loaderText}>Chargement...</Text>
        </View>
      ) : data ? (
        <View style={styles.dataContainer}>
          <Text style={styles.dataTitle}>Données reçues:</Text>
          <Text style={styles.dataText}>{JSON.stringify(data, null, 2)}</Text>
        </View>
      ) : null}

      {/* Boutons de test */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={fetchChildren}
          disabled={loading}
        >
          <Ionicons name="download" size={16} color="#FFFFFF" />
          <Text style={styles.buttonText}>GET /api/enfants</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => {
            const testData = {
              prenom: 'Test',
              nom: 'Child',
              age: 5,
              genre: 'Masculin',
            };
            createChild(testData);
          }}
          disabled={loading}
        >
          <Ionicons name="add-circle" size={16} color="#7C3AED" />
          <Text style={[styles.buttonText, styles.buttonSecondaryText]}>
            POST /api/enfants
          </Text>
        </TouchableOpacity>
      </View>

      {/* Documentation */}
      <View style={styles.docContainer}>
        <Text style={styles.docTitle}>📚 Documentation</Text>
        <Text style={styles.docText}>
{`
• ApiClient injecte automatiquement le token Bearer
• Les erreurs 401 déclenchent une redirection vers login
• Les erreurs 403 indiquent un manque de permission
• Le FormData est géré automatiquement par postForm()

Méthodes disponibles:
- ApiClient.get(endpoint)
- ApiClient.post(endpoint, body)
- ApiClient.put(endpoint, body)
- ApiClient.delete(endpoint)
- ApiClient.postForm(endpoint, formData)
        `.trim()}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
  },
  header: {
    padding: 20,
    backgroundColor: '#7C3AED',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#EDE9FE',
  },
  errorBox: {
    margin: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  errorText: {
    flex: 1,
    color: '#991B1B',
    fontSize: 13,
    fontWeight: '600',
  },
  loaderContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  dataContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dataTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1035',
    marginBottom: 8,
  },
  dataText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  buttonsContainer: {
    padding: 16,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
  },
  buttonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonSecondaryText: {
    color: '#7C3AED',
  },
  docContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED',
    marginBottom: 40,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5B21B6',
    marginBottom: 8,
  },
  docText: {
    fontSize: 12,
    color: '#6B4226',
    lineHeight: 18,
    fontFamily: 'monospace',
  },
});

export default ExampleApiUsage;
