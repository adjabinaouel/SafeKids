// src/hooks/useProfileBase.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

/**
 * Hook partagé entre ParentProfile, DoctorProfile et AdminProfile.
 * Gère : chargement/sauvegarde AsyncStorage, avatar picker, animations de base.
 *
 * @param {string} storageKey   – clé AsyncStorage propre à chaque rôle
 * @param {object} defaultData  – valeurs par défaut du formulaire
 */
export function useProfileBase(storageKey, defaultData) {
  const [userData, setUserData]       = useState(defaultData);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [isEditing, setIsEditing]     = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal]   = useState(false);

  // Ref pour éviter les stale closures dans les callbacks picker
  const userDataRef = useRef(userData);
  useEffect(() => { userDataRef.current = userData; }, [userData]);

  // ── Chargement initial ────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) setUserData(JSON.parse(stored));
    } catch (err) {
      console.warn(`[useProfileBase] Erreur chargement (${storageKey}):`, err);
    } finally {
      setLoading(false);
    }
  }, [storageKey]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Mise à jour d'un champ ────────────────────────────────────────────────
  const updateField = useCallback((field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  }, []);

  // ── Annuler l'édition (recharge depuis le storage) ────────────────────────
  const handleCancelEdit = useCallback(async () => {
    await loadData();
    setIsEditing(false);
  }, [loadData]);

  // ── Sauvegarde générique ──────────────────────────────────────────────────
  const handleSave = useCallback(async (overrideData) => {
    setSaving(true);
    try {
      const toSave = overrideData || userData;
      await AsyncStorage.setItem(storageKey, JSON.stringify(toSave));
      Alert.alert('Profil mis à jour', 'Vos informations ont été sauvegardées.', [{ text: 'OK' }]);
      setIsEditing(false);
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder le profil.');
    } finally {
      setSaving(false);
    }
  }, [storageKey, userData]);

  // ── Sauvegarde interne de l'avatar ────────────────────────────────────────
  const _saveAvatar = useCallback(async (uri) => {
    const updated = { ...userDataRef.current, avatar: uri };
    setUserData(updated);
    await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
  }, [storageKey]);

  // ── Caméra ────────────────────────────────────────────────────────────────
  const openCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission refusée',
        "Autorisez l'accès à la caméra dans Réglages > SafeKids > Caméra."
      );
      return;
    }
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length > 0) {
        await _saveAvatar(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Erreur', "Impossible d'ouvrir la caméra.");
    }
  }, [_saveAvatar]);

  // ── Galerie ───────────────────────────────────────────────────────────────
  const openGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission refusée',
        "Autorisez l'accès à la galerie dans Réglages > SafeKids > Photos."
      );
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.length > 0) {
        await _saveAvatar(result.assets[0].uri);
      }
    } catch {
      Alert.alert('Erreur', "Impossible d'ouvrir la galerie.");
    }
  }, [_saveAvatar]);

  // ── Handlers Modal avatar ─────────────────────────────────────────────────
  const handlePickAvatar = useCallback(() => {
    setShowAvatarModal(true);
  }, []);

  const handleModalCamera = useCallback(async () => {
    setShowAvatarModal(false);
    // Délai pour laisser le Modal se fermer avant d'ouvrir le picker natif
    await new Promise(r => setTimeout(r, 350));
    await openCamera();
  }, [openCamera]);

  const handleModalGallery = useCallback(async () => {
    setShowAvatarModal(false);
    await new Promise(r => setTimeout(r, 350));
    await openGallery();
  }, [openGallery]);

  return {
    // État
    userData,
    setUserData,
    loading,
    saving,
    isEditing,
    setIsEditing,
    showAvatarModal,
    setShowAvatarModal,
    showPhotoModal,
    setShowPhotoModal,

    // Actions
    updateField,
    loadData,
    handleCancelEdit,
    handleSave,
    handlePickAvatar,
    handleModalCamera,
    handleModalGallery,
  };
}