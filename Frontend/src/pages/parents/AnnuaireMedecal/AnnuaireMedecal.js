// src/pages/parents/AnnuaireMedecal/AnnuaireMedecal.js
// Annuaire médical — espace parent
// Spécialités → Médecins → Profil → RDV avec sélection d'enfant
// + Notifications (Parent, Médecin, Admin)
// + Discussion directe avec demande/acceptation

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StatusBar, ActivityIndicator, Animated,
  Dimensions, Platform, Modal, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ParentLayout from '../../../components/Navigation/ParentNavigation';

const { height: SCREEN_H } = Dimensions.get('window');

// ── Backend ──────────────────────────────────────────────────────────────────
const BASE_URL = 'https://unfailed-branden-healable.ngrok-free.dev';

async function apiFetch(path, options = {}) {
  const token = await AsyncStorage.getItem('userToken');
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Authorization':              token ? `Bearer ${token}` : '',
      'Content-Type':               'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Erreur ${res.status}`);
  return data;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const SPECIALITES_CONFIG = {
  'Psychologue':     { color: '#7C3AED', light: '#EDE9FE', emoji: '🧠' },
  'Pédopsychiatrie': { color: '#DB2777', light: '#FCE7F3', emoji: '💜' },
  'Orthophonie':     { color: '#2563EB', light: '#DBEAFE', emoji: '🗣️' },
  'Psychomotricien': { color: '#059669', light: '#D1FAE5', emoji: '🏃' },
  'Psychiatre':      { color: '#7C3AED', light: '#EDE9FE', emoji: '🏥' },
  'Neuropédiatrie':  { color: '#D97706', light: '#FEF3C7', emoji: '⚡' },
  'Ergothérapie':    { color: '#0891B2', light: '#CFFAFE', emoji: '🔧' },
  'ABA Thérapeute':  { color: '#16A34A', light: '#DCFCE7', emoji: '⭐' },
};
const DEFAULT_CFG = { color: '#6B7280', light: '#F3F4F6', emoji: '👨‍⚕️' };
function getCfg(s) { return SPECIALITES_CONFIG[s] || DEFAULT_CFG; }
function getInitials(p, n) { return ((p?.[0] || '') + (n?.[0] || '')).toUpperCase() || '?'; }
const AVATAR_COLORS = ['#7C3AED','#2563EB','#059669','#D97706','#DB2777','#0891B2','#16A34A'];
function avatarColor(id) { return AVATAR_COLORS[(id?.charCodeAt(0) || 0) % AVATAR_COLORS.length]; }
function xAlert(title, msg) {
  if (Platform.OS === 'web') window.alert(msg ? `${title}\n\n${msg}` : title);
  else Alert.alert(title, msg);
}
const sh = (color = '#000', y = 4, op = 0.10, r = 12) =>
  Platform.select({
    ios:     { shadowColor: color, shadowOffset: { width: 0, height: y }, shadowOpacity: op, shadowRadius: r },
    android: { elevation: Math.round(op * 40) },
  });

const JOURS_ORDRE    = ['Samedi','Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi'];
const CRENEAUX_MATIN = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30'];
const CRENEAUX_APM   = ['14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'];

// ══════════════════════════════════════════════════════════════════════════════
// BADGE NOTIFICATION
// ══════════════════════════════════════════════════════════════════════════════
const NotifBadge = ({ count }) => {
  if (!count) return null;
  return (
    <View style={{
      position: 'absolute', top: -4, right: -4,
      minWidth: 18, height: 18, borderRadius: 9,
      backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center',
      paddingHorizontal: 4, borderWidth: 2, borderColor: '#fff',
    }}>
      <Text style={{ fontSize: 9, fontWeight: '900', color: '#fff' }}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MODAL NOTIFICATIONS — Parent / Médecin / Admin
// ══════════════════════════════════════════════════════════════════════════════
const NotificationsModal = ({ visible, onClose, onUpdateCount, userRole }) => {
  const [notifs,     setNotifs]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [responding, setResponding] = useState(null);
  const slideY = useRef(new Animated.Value(SCREEN_H)).current;

  useEffect(() => {
    Animated.spring(slideY, { toValue: visible ? 0 : SCREEN_H, tension: 70, friction: 14, useNativeDriver: true }).start();
    if (visible) load();
  }, [visible]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/notifications');
      setNotifs(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  };

  const markAll = async () => {
    try {
      await apiFetch('/api/notifications/tout-lire', { method: 'PATCH' });
      setNotifs(prev => prev.map(n => ({ ...n, lu: true })));
      onUpdateCount(0);
    } catch {}
  };

  const markOne = async (id) => {
    try {
      await apiFetch(`/api/notifications/${id}/lire`, { method: 'PATCH' });
      setNotifs(prev => prev.map(n => n._id === id ? { ...n, lu: true } : n));
      onUpdateCount(prev => Math.max(0, (typeof prev === 'number' ? prev : 0) - 1));
    } catch {}
  };

  const repondreRdv = async (notif, statut) => {
    if (responding) return;
    setResponding(notif.idRdv);
    try {
      await apiFetch(`/api/rendezvous/${notif.idRdv}/repondre`, {
        method: 'PATCH',
        body: JSON.stringify({ statut }),
      });
      setNotifs(prev => prev.map(n =>
        n._id === notif._id ? { ...n, lu: true, _repondu: statut } : n
      ));
      onUpdateCount(prev => Math.max(0, (typeof prev === 'number' ? prev : 0) - 1));
      xAlert(
        statut === 'accepte' ? '✅ RDV confirmé' : '❌ RDV refusé',
        statut === 'accepte'
          ? 'Le parent a été notifié de la confirmation.'
          : 'Le parent a été notifié de l\'annulation.'
      );
    } catch (e) {
      xAlert('Erreur', e.message);
    } finally {
      setResponding(null);
    }
  };

  const TYPE_CFG = {
    rdv_demande:      { color: '#D97706', bg: '#FEF3C7', icon: 'calendar',    label: 'Demande RDV' },
    rdv_info:         { color: '#6B7280', bg: '#F3F4F6', icon: 'info',         label: 'Info' },
    rdv_accepte:      { color: '#059669', bg: '#D1FAE5', icon: 'check-circle', label: 'Confirmé' },
    rdv_annule:       { color: '#DC2626', bg: '#FEE2E2', icon: 'x-circle',     label: 'Annulé' },
    rdv_accepte_info: { color: '#059669', bg: '#D1FAE5', icon: 'check-circle', label: 'Confirmé' },
    rdv_annule_info:  { color: '#DC2626', bg: '#FEE2E2', icon: 'x-circle',     label: 'Annulé' },
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        <Animated.View style={{
          transform: [{ translateY: slideY }],
          backgroundColor: '#F8FAFC',
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          maxHeight: SCREEN_H * 0.80,
          ...sh('#000', 8, 0.15, 20),
        }}>
          <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' }} />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 }}>
            <View>
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#111827' }}>Notifications</Text>
              <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                {notifs.filter(n => !n.lu).length} non lue{notifs.filter(n => !n.lu).length !== 1 ? 's' : ''}
              </Text>
            </View>
            {notifs.some(n => !n.lu) && (
              <TouchableOpacity onPress={markAll} style={{ backgroundColor: '#EDE9FE', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#7C3AED' }}>Tout lire</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <ActivityIndicator color="#7C3AED" />
            </View>
          ) : notifs.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 50 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🔔</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#374151' }}>Aucune notification</Text>
              <Text style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Vous êtes à jour !</Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ paddingHorizontal: 16 }}
              contentContainerStyle={{ paddingBottom: 30 }}
            >
              {notifs.map(n => {
                const tc = TYPE_CFG[n.type] || TYPE_CFG.rdv_info;
                const dejaRepondu = !!n._repondu;
                const isMedecinDemande = (userRole === 'Medecin') && n.type === 'rdv_demande' && !n.lu;
                const isAdminInfo = (userRole === 'Admin') && !n.actionRequise;

                return (
                  <TouchableOpacity
                    key={n._id}
                    onPress={() => !n.lu && markOne(n._id)}
                    activeOpacity={isMedecinDemande ? 1 : 0.85}
                    style={{
                      backgroundColor: n.lu ? '#fff' : '#FDF4FF',
                      borderRadius: 18, padding: 14, marginBottom: 10,
                      borderWidth: 1, borderColor: n.lu ? '#F3F4F6' : '#E9D5FF',
                      ...sh(tc.color, 2, 0.06, 8),
                    }}
                  >
                    <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                      <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: tc.bg, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Feather name={tc.icon} size={19} color={tc.color} />
                      </View>

                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Text style={{ fontSize: 14, fontWeight: n.lu ? '600' : '800', color: '#111827', flex: 1, marginRight: 8 }}>
                            {n.titre}
                          </Text>
                          {!n.lu && !dejaRepondu && (
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#7C3AED', marginTop: 4 }} />
                          )}
                        </View>

                        <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4, lineHeight: 18 }}>
                          {n.message}
                        </Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                          <View style={{ backgroundColor: tc.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: tc.color }}>{tc.label}</Text>
                          </View>
                          {isAdminInfo && (
                            <View style={{ backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                              <Text style={{ fontSize: 10, fontWeight: '600', color: '#6B7280' }}>Lecture seule</Text>
                            </View>
                          )}
                          <Text style={{ fontSize: 11, color: '#9CA3AF' }}>
                            {n.dateCreation ? new Date(n.dateCreation).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                          </Text>
                        </View>

                        {isMedecinDemande && !dejaRepondu && (
                          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                            <TouchableOpacity
                              onPress={() => repondreRdv(n, 'accepte')}
                              disabled={responding === n.idRdv}
                              style={{
                                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                                gap: 6, paddingVertical: 10, borderRadius: 12,
                                backgroundColor: '#059669',
                                opacity: responding === n.idRdv ? 0.6 : 1,
                              }}
                            >
                              {responding === n.idRdv ? (
                                <ActivityIndicator size="small" color="#fff" />
                              ) : (
                                <>
                                  <Feather name="check" size={14} color="#fff" />
                                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>Accepter</Text>
                                </>
                              )}
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => repondreRdv(n, 'annule')}
                              disabled={responding === n.idRdv}
                              style={{
                                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                                gap: 6, paddingVertical: 10, borderRadius: 12,
                                backgroundColor: '#FEE2E2', borderWidth: 1.5, borderColor: '#FECACA',
                                opacity: responding === n.idRdv ? 0.6 : 1,
                              }}
                            >
                              <Feather name="x" size={14} color="#DC2626" />
                              <Text style={{ fontSize: 13, fontWeight: '800', color: '#DC2626' }}>Refuser</Text>
                            </TouchableOpacity>
                          </View>
                        )}

                        {dejaRepondu && (
                          <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Feather
                              name={n._repondu === 'accepte' ? 'check-circle' : 'x-circle'}
                              size={14}
                              color={n._repondu === 'accepte' ? '#059669' : '#DC2626'}
                            />
                            <Text style={{ fontSize: 12, fontWeight: '700', color: n._repondu === 'accepte' ? '#059669' : '#DC2626' }}>
                              {n._repondu === 'accepte' ? 'RDV confirmé' : 'RDV refusé'}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MODAL PRISE DE RDV — avec sélection de l'enfant
// ══════════════════════════════════════════════════════════════════════════════
const RdvModal = ({ medecin, visible, onClose }) => {
  const [step,          setStep]    = useState(0);
  const [enfants,       setEnfants] = useState([]);
  const [loadingEnf,    setLoadEnf] = useState(true);
  const [selectedEnf,   setEnf]     = useState(null);
  const [selectedJour,  setJour]    = useState(null);
  const [selectedHeure, setHeure]   = useState(null);
  const [typeConsult,   setType]    = useState('Presentiel');
  const [message,       setMessage] = useState('');
  const [loading,       setLoading] = useState(false);
  const [success,       setSuccess] = useState(false);

  const slideY       = useRef(new Animated.Value(SCREEN_H)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const cfg  = getCfg(medecin?.specialite || '');
  const dispo = Array.isArray(medecin?.disponibilite) ? medecin.disponibilite : [];
  const dispoOrdered = JOURS_ORDRE.filter(j => dispo.includes(j));

  useEffect(() => {
    if (visible) {
      setStep(0); setEnf(null); setJour(null); setHeure(null);
      setMessage(''); setSuccess(false);
      loadEnfants();
    }
    Animated.spring(slideY, { toValue: visible ? 0 : SCREEN_H, tension: 65, friction: 13, useNativeDriver: true }).start();
  }, [visible]);

  useEffect(() => {
    Animated.timing(progressAnim, { toValue: step / 3, duration: 300, useNativeDriver: false }).start();
  }, [step]);

  const loadEnfants = async () => {
    setLoadEnf(true);
    try {
      const data = await apiFetch('/api/mes-enfants');
      setEnfants(Array.isArray(data) ? data : []);
    } catch {}
    setLoadEnf(false);
  };

  const selectEnfant = (e) => { setEnf(e); setTimeout(() => setStep(1), 180); };
  const selectJour   = (j) => { setJour(j); setHeure(null); setTimeout(() => setStep(2), 180); };
  const selectHeure  = (h) => { setHeure(h); setTimeout(() => setStep(3), 180); };

  const submitRdv = async () => {
    if (!selectedEnf || !selectedJour || !selectedHeure) return;
    setLoading(true);
    try {
      await apiFetch('/api/rendezvous', {
        method: 'POST',
        body: JSON.stringify({
          idMedecin: medecin._id,
          idEnfant:  selectedEnf._id,
          jour:      selectedJour,
          heure:     selectedHeure,
          type:      typeConsult,
          message:   message.trim(),
        }),
      });
      setSuccess(true);
    } catch (e) {
      xAlert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const STEP_LABELS   = ['Enfant', 'Jour', 'Heure', 'Confirmer'];
  if (!medecin) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' }}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        <Animated.View style={{
          transform: [{ translateY: slideY }],
          backgroundColor: '#F8FAFC',
          borderTopLeftRadius: 32, borderTopRightRadius: 32,
          maxHeight: SCREEN_H * 0.92,
          ...sh('#000', 10, 0.20, 24),
        }}>
          <View style={{ alignItems: 'center', paddingTop: 12 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' }} />
          </View>

          <LinearGradient
            colors={[cfg.color, cfg.color + 'BB']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ margin: 16, borderRadius: 24, padding: 18, overflow: 'hidden' }}
          >
            <View style={{ position: 'absolute', right: -40, top: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.12)' }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.45)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 22, fontWeight: '900', color: '#fff' }}>
                  {getInitials(medecin.prenom, medecin.nom)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: '900', color: '#fff' }}>Dr. {medecin.prenom} {medecin.nom}</Text>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.20)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3, marginTop: 4, alignSelf: 'flex-start' }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>{medecin.specialite}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.20)', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="x" size={16} color="#fff" />
              </TouchableOpacity>
            </View>

            {!success && (
              <View style={{ marginTop: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  {STEP_LABELS.map((label, i) => (
                    <Text key={i} style={{ fontSize: 10, color: step >= i ? '#fff' : 'rgba(255,255,255,0.45)', fontWeight: step >= i ? '700' : '400' }}>
                      {label}
                    </Text>
                  ))}
                </View>
                <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 2, overflow: 'hidden' }}>
                  <Animated.View style={{ height: '100%', width: progressWidth, backgroundColor: '#fff', borderRadius: 2 }} />
                </View>
              </View>
            )}
          </LinearGradient>

          {success ? (
            <View style={{ alignItems: 'center', padding: 36 }}>
              <View style={{ width: 80, height: 80, borderRadius: 28, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center', marginBottom: 20, ...sh('#10B981', 4, 0.2, 16) }}>
                <Feather name="check-circle" size={38} color="#059669" />
              </View>
              <Text style={{ fontSize: 22, fontWeight: '900', color: '#111827', textAlign: 'center', marginBottom: 8 }}>
                Demande envoyée !
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, paddingHorizontal: 16, marginBottom: 4 }}>
                Votre demande pour{' '}
                <Text style={{ fontWeight: '800', color: '#111827' }}>{selectedEnf?.prenom}</Text>
                {' '}le{' '}
                <Text style={{ fontWeight: '800', color: cfg.color }}>{selectedJour} à {selectedHeure}</Text>
                {' '}a été transmise à Dr. {medecin.nom}.
              </Text>
              <View style={{ backgroundColor: '#FEF3C7', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#FDE68A', marginVertical: 20, width: '100%', flexDirection: 'row', gap: 10 }}>
                <Feather name="bell" size={16} color="#D97706" style={{ marginTop: 2 }} />
                <Text style={{ fontSize: 12, color: '#92400E', lineHeight: 19, flex: 1 }}>
                  Vous recevrez une notification quand le médecin répondra à votre demande.
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={{ backgroundColor: cfg.color, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 44, ...sh(cfg.color, 6, 0.3, 14) }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#fff' }}>Fermer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 36 }}>

              {/* ── ÉTAPE 0 : Sélectionner l'enfant ── */}
              <StepCard
                index={0} currentStep={step} color={cfg.color} light={cfg.light}
                title="Pour quel enfant ?"
                doneValue={selectedEnf ? `${selectedEnf.prenom} ${selectedEnf.nom}` : null}
                onEdit={() => setStep(0)}
              >
                {loadingEnf ? (
                  <ActivityIndicator color={cfg.color} style={{ paddingVertical: 20 }} />
                ) : enfants.length === 0 ? (
                  <View style={{ alignItems: 'center', padding: 20, gap: 8 }}>
                    <Text style={{ fontSize: 32 }}>👶</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#374151', textAlign: 'center' }}>
                      Aucun enfant enregistré
                    </Text>
                    <Text style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center' }}>
                      Vous devez d'abord ajouter un enfant depuis votre profil.
                    </Text>
                  </View>
                ) : (
                  <View style={{ gap: 8 }}>
                    {enfants.map(e => (
                      <TouchableOpacity key={e._id} onPress={() => selectEnfant(e)}
                        style={{
                          flexDirection: 'row', alignItems: 'center', gap: 12,
                          backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14,
                          borderWidth: 1.5, borderColor: '#E5E7EB',
                        }}>
                        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: avatarColor(e._id), alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff' }}>
                            {getInitials(e.prenom, e.nom)}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 14, fontWeight: '800', color: '#111827' }}>
                            {e.prenom} {e.nom}
                          </Text>
                          {(e.age || e.niveauTSA) ? (
                            <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                              {[e.age && `${e.age} ans`, e.niveauTSA].filter(Boolean).join(' · ')}
                            </Text>
                          ) : null}
                        </View>
                        <Feather name="chevron-right" size={16} color="#9CA3AF" />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </StepCard>

              {/* ── ÉTAPE 1 : Choisir un jour ── */}
              {step >= 1 && (
                <StepCard
                  index={1} currentStep={step} color={cfg.color} light={cfg.light}
                  title="Jour de consultation"
                  doneValue={selectedJour}
                  onEdit={() => setStep(1)}
                >
                  {dispoOrdered.length === 0 ? (
                    <Text style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingVertical: 16 }}>
                      Aucun jour de disponibilité renseigné.
                    </Text>
                  ) : (
                    <View style={{ gap: 8 }}>
                      {dispoOrdered.map(j => (
                        <TouchableOpacity key={j} onPress={() => selectJour(j)}
                          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: '#E5E7EB' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981' }} />
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827' }}>{j}</Text>
                          </View>
                          <Feather name="chevron-right" size={16} color="#9CA3AF" />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </StepCard>
              )}

              {/* ── ÉTAPE 2 : Choisir l'heure ── */}
              {step >= 2 && (
                <StepCard
                  index={2} currentStep={step} color={cfg.color} light={cfg.light}
                  title="Créneau horaire"
                  doneValue={selectedHeure ? `${selectedHeure} · ${typeConsult === 'Presentiel' ? 'Présentiel' : 'Vidéo'}` : null}
                  onEdit={() => setStep(2)}
                >
                  <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
                    {[{ k: 'Presentiel', label: 'Présentiel', icon: 'home' }, { k: 'Teleconsultation', label: 'Vidéo', icon: 'video' }].map(t => (
                      <TouchableOpacity key={t.k} onPress={() => setType(t.k)}
                        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: typeConsult === t.k ? cfg.color : '#E5E7EB', backgroundColor: typeConsult === t.k ? cfg.light : '#F9FAFB' }}>
                        <Feather name={t.icon} size={14} color={typeConsult === t.k ? cfg.color : '#6B7280'} />
                        <Text style={{ fontSize: 13, fontWeight: '700', color: typeConsult === t.k ? cfg.color : '#374151' }}>{t.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <SectionTitle label="☀️ Matin" />
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                    {CRENEAUX_MATIN.map(h => (
                      <TouchableOpacity key={h} onPress={() => selectHeure(h)}
                        style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB' }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#374151' }}>{h}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <SectionTitle label="🌙 Après-midi" />
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {CRENEAUX_APM.map(h => (
                      <TouchableOpacity key={h} onPress={() => selectHeure(h)}
                        style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB' }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#374151' }}>{h}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </StepCard>
              )}

              {/* ── ÉTAPE 3 : Récap + confirmation ── */}
              {step === 3 && (
                <StepCard
                  index={3} currentStep={step} color={cfg.color} light={cfg.light}
                  title="Récapitulatif"
                  doneValue={null}
                  onEdit={null}
                >
                  <View style={{ backgroundColor: cfg.light, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1.5, borderColor: cfg.color + '35' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: cfg.color + '20' }}>
                      <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: avatarColor(selectedEnf?._id), alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>{getInitials(selectedEnf?.prenom, selectedEnf?.nom)}</Text>
                      </View>
                      <View>
                        <Text style={{ fontSize: 11, color: cfg.color, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>Enfant</Text>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: '#111827' }}>{selectedEnf?.prenom} {selectedEnf?.nom}</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <View style={{ gap: 2 }}>
                        <Text style={{ fontSize: 11, color: cfg.color, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>Médecin</Text>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: '#111827' }}>Dr. {medecin.prenom} {medecin.nom}</Text>
                        <Text style={{ fontSize: 12, color: '#6B7280' }}>{medecin.specialite}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 2 }}>
                        <Text style={{ fontSize: 11, color: cfg.color, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>Créneau</Text>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: '#111827' }}>{selectedJour}</Text>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: cfg.color }}>{selectedHeure}</Text>
                      </View>
                    </View>

                    <View style={{ height: 1, backgroundColor: cfg.color + '25', marginVertical: 12 }} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Feather name={typeConsult === 'Teleconsultation' ? 'video' : 'home'} size={14} color={cfg.color} />
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151' }}>
                        {typeConsult === 'Presentiel' ? 'Présentiel' : 'Téléconsultation'}
                      </Text>
                      {medecin.telephone ? (
                        <>
                          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' }} />
                          <Feather name="phone" size={12} color="#6B7280" />
                          <Text style={{ fontSize: 12, color: '#6B7280' }}>{medecin.telephone}</Text>
                        </>
                      ) : null}
                    </View>
                  </View>

                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#6B7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    Message (optionnel)
                  </Text>
                  <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Motif de consultation, informations utiles…"
                    placeholderTextColor="#9CA3AF"
                    multiline numberOfLines={3}
                    style={{ backgroundColor: '#F9FAFB', borderRadius: 14, padding: 12, borderWidth: 1.5, borderColor: '#E5E7EB', fontSize: 13, color: '#111827', textAlignVertical: 'top', minHeight: 80, marginBottom: 20 }}
                  />

                  <TouchableOpacity onPress={submitRdv} disabled={loading} style={{ borderRadius: 16, overflow: 'hidden' }}>
                    <LinearGradient
                      colors={[cfg.color, cfg.color + 'CC']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={{ paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      {loading ? <ActivityIndicator size="small" color="#fff" /> : (
                        <>
                          <Feather name="send" size={18} color="#fff" />
                          <Text style={{ fontSize: 15, fontWeight: '900', color: '#fff' }}>Envoyer la demande</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 12 }}>
                    <Feather name="bell" size={12} color="#9CA3AF" />
                    <Text style={{ fontSize: 11, color: '#9CA3AF' }}>Notifié dès que le médecin répond</Text>
                  </View>
                </StepCard>
              )}
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

// ── Composants utilitaires ────────────────────────────────────────────────────
const SectionTitle = ({ label }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
    <Text style={{ fontSize: 13, fontWeight: '800', color: '#374151' }}>{label}</Text>
    <View style={{ flex: 1, height: 1, backgroundColor: '#F3F4F6' }} />
  </View>
);

const StepCard = ({ index, currentStep, color, light, title, doneValue, onEdit, children }) => {
  const isDone   = currentStep > index;
  const isActive = currentStep === index;
  return (
    <View style={{
      backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 12,
      borderWidth: 1, borderColor: isActive ? color + '40' : '#F3F4F6',
      ...sh(isActive ? color : '#000', 3, isActive ? 0.12 : 0.04, 10),
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: isActive ? 16 : 0 }}>
        <View style={{ width: 28, height: 28, borderRadius: 9, backgroundColor: isDone ? '#D1FAE5' : light, alignItems: 'center', justifyContent: 'center' }}>
          {isDone
            ? <Feather name="check" size={14} color="#059669" />
            : <Text style={{ fontSize: 12, fontWeight: '900', color }}>{index + 1}</Text>}
        </View>
        <Text style={{ fontSize: 15, fontWeight: '800', color: '#111827', flex: 1 }}>{title}</Text>
        {isDone && doneValue && (
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151', maxWidth: 120 }} numberOfLines={1}>{doneValue}</Text>
        )}
        {isDone && onEdit && (
          <TouchableOpacity onPress={onEdit}>
            <Text style={{ fontSize: 12, color, fontWeight: '700' }}>Modifier</Text>
          </TouchableOpacity>
        )}
      </View>
      {isActive && children}
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// VUE 1 — SPÉCIALITÉS
// ══════════════════════════════════════════════════════════════════════════════
const SpecialitesView = ({ onSelect, search }) => {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { setData(await apiFetch('/api/specialites')); }
      catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = data.filter(s => !search || s.nom.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <View style={{ flex:1, justifyContent:'center', alignItems:'center', paddingTop:60 }}><ActivityIndicator size="large" color="#7C3AED" /></View>;
  if (error)   return <View style={{ flex:1, justifyContent:'center', alignItems:'center', padding:32 }}><Feather name="wifi-off" size={40} color="#D1D5DB" /><Text style={{ marginTop:12, color:'#6B7280', fontSize:14, textAlign:'center' }}>{error}</Text></View>;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding:16, paddingBottom:40 }}>
      <Text style={{ fontSize:12, fontWeight:'700', color:'#9CA3AF', letterSpacing:1.2, marginBottom:14, textTransform:'uppercase' }}>
        {filtered.length} spécialité{filtered.length !== 1 ? 's' : ''}
      </Text>
      <View style={{ gap:12 }}>
        {filtered.map((item) => {
          const c = getCfg(item.nom);
          return (
            <TouchableOpacity key={item._id || item.nom} activeOpacity={0.92} onPress={() => onSelect(item)}
              style={{ backgroundColor:'#fff', borderRadius:20, padding:18, flexDirection:'row', alignItems:'center', gap:16, ...sh(c.color,4,0.12,12), borderWidth:1, borderColor:'#F3F4F6' }}>
              <View style={{ width:58, height:58, borderRadius:18, backgroundColor:c.light, alignItems:'center', justifyContent:'center' }}>
                <Text style={{ fontSize:26 }}>{c.emoji}</Text>
              </View>
              <View style={{ flex:1 }}>
                <Text style={{ fontSize:16, fontWeight:'700', color:'#111827', marginBottom:4 }}>{item.nom}</Text>
                <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}>
                  <View style={{ width:6, height:6, borderRadius:3, backgroundColor:item.medecins > 0 ? '#10B981' : '#D1D5DB' }} />
                  <Text style={{ fontSize:13, color:'#6B7280' }}>
                    {item.medecins > 0 ? `${item.medecins} médecin${item.medecins > 1 ? 's' : ''} disponible${item.medecins > 1 ? 's' : ''}` : 'Aucun médecin pour le moment'}
                  </Text>
                </View>
              </View>
              <View style={{ width:36, height:36, borderRadius:12, backgroundColor:c.light, alignItems:'center', justifyContent:'center' }}>
                <Feather name="chevron-right" size={18} color={c.color} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// VUE 2 — MÉDECINS
// ══════════════════════════════════════════════════════════════════════════════
const MedecinsView = ({ specialite, onSelect, onContact, search }) => {
  const [medecins, setMedecins] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const cfg = getCfg(specialite.nom);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);
      try {
        const all = await apiFetch(`/api/medecins/annuaire?specialite=${encodeURIComponent(specialite.nom)}`);
        setMedecins(Array.isArray(all) ? all : []);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [specialite]);

  const filtered = medecins.filter(m => !search || `${m.prenom} ${m.nom}`.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <View style={{ flex:1, justifyContent:'center', alignItems:'center', paddingTop:60 }}><ActivityIndicator size="large" color={cfg.color} /></View>;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding:16, paddingBottom:40 }}>
      <View style={{ backgroundColor:cfg.light, borderRadius:16, padding:16, flexDirection:'row', alignItems:'center', gap:12, marginBottom:20, borderWidth:1.5, borderColor:cfg.color+'30' }}>
        <Text style={{ fontSize:32 }}>{cfg.emoji}</Text>
        <View style={{ flex:1 }}>
          <Text style={{ fontSize:18, fontWeight:'800', color:cfg.color }}>{specialite.nom}</Text>
          <Text style={{ fontSize:13, color:'#6B7280', marginTop:2 }}>{filtered.length} médecin{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      {error ? (
        <View style={{ alignItems:'center', paddingTop:20 }}><Feather name="alert-circle" size={32} color="#EF4444" /><Text style={{ marginTop:8, color:'#6B7280', textAlign:'center' }}>{error}</Text></View>
      ) : filtered.length === 0 ? (
        <View style={{ alignItems:'center', paddingTop:40 }}>
          <Text style={{ fontSize:48 }}>👨‍⚕️</Text>
          <Text style={{ marginTop:12, fontSize:16, fontWeight:'700', color:'#374151' }}>Aucun médecin disponible</Text>
        </View>
      ) : (
        <View style={{ gap:14 }}>
          {filtered.map((m) => {
            const dispo = Array.isArray(m.disponibilite) ? m.disponibilite : [];
            return (
              <View key={m._id}
                style={{ backgroundColor:'#fff', borderRadius:20, padding:16, ...sh('#000',4,0.08,12), borderWidth:1, borderColor:'#F3F4F6' }}>
                {/* Zone cliquable → profil */}
                <TouchableOpacity activeOpacity={0.92} onPress={() => onSelect(m)}>
                  <View style={{ flexDirection:'row', gap:14, alignItems:'flex-start' }}>
                    <View style={{ width:64, height:64, borderRadius:20, backgroundColor:avatarColor(m._id), alignItems:'center', justifyContent:'center' }}>
                      <Text style={{ fontSize:22, fontWeight:'800', color:'#fff' }}>{getInitials(m.prenom, m.nom)}</Text>
                    </View>
                    <View style={{ flex:1 }}>
                      <Text style={{ fontSize:16, fontWeight:'800', color:'#111827' }}>Dr. {m.prenom} {m.nom}</Text>
                      <View style={{ flexDirection:'row', gap:6, marginTop:4 }}>
                        <View style={{ backgroundColor:cfg.light, paddingHorizontal:10, paddingVertical:3, borderRadius:20 }}>
                          <Text style={{ fontSize:11, fontWeight:'700', color:cfg.color }}>{m.specialite}</Text>
                        </View>
                      </View>
                      {!!m.telephone && (
                        <View style={{ flexDirection:'row', alignItems:'center', gap:6, marginTop:8 }}>
                          <Feather name="phone" size={12} color="#6B7280" />
                          <Text style={{ fontSize:12, color:'#6B7280' }}>{m.telephone}</Text>
                        </View>
                      )}
                      {dispo.length > 0 && (
                        <View style={{ flexDirection:'row', flexWrap:'wrap', gap:4, marginTop:8 }}>
                          {dispo.slice(0,4).map(j => (
                            <View key={j} style={{ backgroundColor:'#F0FDF4', paddingHorizontal:8, paddingVertical:3, borderRadius:8, borderWidth:1, borderColor:'#BBF7D0' }}>
                              <Text style={{ fontSize:10, fontWeight:'600', color:'#16A34A' }}>{j}</Text>
                            </View>
                          ))}
                          {dispo.length > 4 && <View style={{ backgroundColor:'#F3F4F6', paddingHorizontal:8, paddingVertical:3, borderRadius:8 }}><Text style={{ fontSize:10, color:'#6B7280' }}>+{dispo.length-4}</Text></View>}
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Barre d'actions */}
                <View style={{ marginTop:14, paddingTop:12, borderTopWidth:1, borderTopColor:'#F9FAFB', flexDirection:'row', alignItems:'center', gap:8 }}>
                  {/* Indicateur disponibilité */}
                  <View style={{ flexDirection:'row', alignItems:'center', gap:5, flex:1 }}>
                    <View style={{ width:8, height:8, borderRadius:4, backgroundColor:'#10B981' }} />
                    <Text style={{ fontSize:12, color:'#10B981', fontWeight:'600' }}>Disponible</Text>
                  </View>

                  {/* Bouton Contacter */}
                  <TouchableOpacity
                    onPress={() => onContact && onContact(m)}
                    style={{ flexDirection:'row', alignItems:'center', gap:5, paddingHorizontal:12, paddingVertical:8, borderRadius:12, borderWidth:1.5, borderColor:cfg.color, backgroundColor:cfg.light }}>
                    <Feather name="message-circle" size={13} color={cfg.color} />
                    <Text style={{ fontSize:12, fontWeight:'700', color:cfg.color }}>Contacter</Text>
                  </TouchableOpacity>

                  {/* Bouton Prendre RDV */}
                  <TouchableOpacity
                    onPress={() => onSelect(m)}
                    style={{ flexDirection:'row', alignItems:'center', gap:5, paddingHorizontal:12, paddingVertical:8, borderRadius:12, backgroundColor:cfg.color }}>
                    <Feather name="calendar" size={13} color="#fff" />
                    <Text style={{ fontSize:12, fontWeight:'700', color:'#fff' }}>Prendre RDV</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// VUE 3 — PROFIL MÉDECIN (avec système de discussion intégré)
// ══════════════════════════════════════════════════════════════════════════════
const MedecinProfileView = ({ medecin, onRdvPress, autoOpenContact = false, onAutoOpenDone }) => {
  const cfg  = getCfg(medecin.specialite);
  const dispo = Array.isArray(medecin.disponibilite) ? medecin.disponibilite : [];

  // ── État discussion ───────────────────────────────────────────────────────
  const [convStatut,  setConvStatut]  = useState(null);
  const [convId,      setConvId]      = useState(null);
  const [loadingConv, setLoadingConv] = useState(true);
  const [sendingConv, setSendingConv] = useState(false);
  const [msgModal,    setMsgModal]    = useState(false);
  const [msgInitial,  setMsgInitial]  = useState('');

  // Ouvrir automatiquement le modal si demandé depuis la liste
  useEffect(() => {
    if (autoOpenContact && !loadingConv) {
      setMsgModal(true);
      onAutoOpenDone && onAutoOpenDone();
    }
  }, [autoOpenContact, loadingConv]);

  // Vérifier si une conversation existe déjà
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingConv(true);
      try {
        const data = await apiFetch(`/api/messages/statut/${medecin._id}`);
        if (!cancelled) {
          if (data.exists) { setConvStatut(data.statut); setConvId(data._id); }
          else             { setConvStatut(null); setConvId(null); }
        }
      } catch {}
      if (!cancelled) setLoadingConv(false);
    })();
    return () => { cancelled = true; };
  }, [medecin._id]);

  const envoyerDemande = async () => {
    setSendingConv(true);
    try {
      const res = await apiFetch('/api/messages/demande', {
        method: 'POST',
        body: JSON.stringify({ idMedecin: medecin._id, messageInitial: msgInitial.trim() }),
      });
      setConvStatut(res.statut);
      setConvId(res._id);
      setMsgModal(false);
      setMsgInitial('');
      xAlert('✅ Demande envoyée', 'Le médecin a été notifié. Vous serez informé dès qu\'il accepte votre demande de discussion.');
    } catch (e) {
      if (e.message.includes('existe déjà')) {
        xAlert('Déjà envoyée', 'Une demande de discussion existe déjà avec ce médecin.');
      } else {
        xAlert('Erreur', e.message);
      }
    } finally {
      setSendingConv(false);
    }
  };

  // ── Rendu bouton discussion selon statut ─────────────────────────────────
  const renderDiscussionBtn = () => {
    if (loadingConv) return (
      <View style={{ backgroundColor: '#F3F4F6', borderRadius: 20, padding: 18, alignItems: 'center' }}>
        <ActivityIndicator color={cfg.color} />
      </View>
    );

    if (convStatut === 'en_attente') return (
      <View style={{ backgroundColor: '#FEF3C7', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1.5, borderColor: '#FDE68A' }}>
        <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#FDE68A' }}>
          <Feather name="clock" size={22} color="#D97706" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: '#92400E' }}>Demande en attente</Text>
          <Text style={{ fontSize: 12, color: '#B45309', marginTop: 3 }}>En attente de la réponse du médecin…</Text>
        </View>
      </View>
    );

    if (convStatut === 'acceptee') return (
      <View>
        <View style={{ backgroundColor: '#D1FAE5', borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1.5, borderColor: '#A7F3D0', marginBottom: 10 }}>
          <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="check-circle" size={22} color="#059669" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#065F46' }}>Discussion active</Text>
            <Text style={{ fontSize: 12, color: '#047857', marginTop: 3 }}>Vous pouvez discuter avec ce médecin</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            xAlert('Discussion', 'Rendez-vous dans l\'onglet Messages pour continuer la discussion.');
          }}
          style={{ borderRadius: 18, overflow: 'hidden', ...sh('#059669', 6, 0.25, 14, 4) }}>
          <LinearGradient colors={['#059669', '#10B981']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Feather name="message-circle" size={20} color="#fff" />
            <Text style={{ fontSize: 15, fontWeight: '900', color: '#fff' }}>Ouvrir la discussion</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );

    if (convStatut === 'refusee') return (
      <View>
        <View style={{ backgroundColor: '#FEE2E2', borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, borderWidth: 1, borderColor: '#FECACA' }}>
          <Feather name="x-circle" size={18} color="#DC2626" />
          <Text style={{ fontSize: 13, color: '#991B1B', fontWeight: '600', flex: 1 }}>
            Votre précédente demande a été refusée. Vous pouvez renvoyer une demande.
          </Text>
        </View>
        <TouchableOpacity onPress={() => setMsgModal(true)}
          style={{ borderRadius: 18, overflow: 'hidden', ...sh(cfg.color, 6, 0.25, 14, 4) }}>
          <LinearGradient colors={[cfg.color, cfg.color + 'CC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Feather name="message-circle" size={20} color="#fff" />
            <Text style={{ fontSize: 15, fontWeight: '900', color: '#fff' }}>Renvoyer une demande</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );

    // Pas de conversation → bouton demande
    return (
      <TouchableOpacity onPress={() => setMsgModal(true)}
        style={{ borderRadius: 18, overflow: 'hidden', ...sh(cfg.color, 6, 0.25, 14, 4) }}>
        <LinearGradient colors={[cfg.color, cfg.color + 'CC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <Feather name="message-circle" size={20} color="#fff" />
          <Text style={{ fontSize: 15, fontWeight: '900', color: '#fff' }}>Contacter le médecin</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {/* ── Modal message initial ── */}
      <Modal visible={msgModal} transparent animationType="fade" onRequestClose={() => setMsgModal(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 28, padding: 24, ...sh('#000', 20, 0.2, 30, 10) }}>
            {/* En-tête */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: cfg.light, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: cfg.color }}>
                  {getInitials(medecin.prenom, medecin.nom)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#111827' }}>Dr. {medecin.prenom} {medecin.nom}</Text>
                <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{medecin.specialite}</Text>
              </View>
              <TouchableOpacity onPress={() => setMsgModal(false)}
                style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="x" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 6 }}>
              Demande de discussion
            </Text>
            <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 16, lineHeight: 20 }}>
              Envoyez un message d'introduction au médecin. Il devra accepter avant de pouvoir discuter.
            </Text>

            <TextInput
              value={msgInitial}
              onChangeText={setMsgInitial}
              placeholder="Bonjour Docteur, je souhaite discuter de…"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: '#F9FAFB', borderRadius: 16, padding: 14,
                borderWidth: 1.5, borderColor: '#E5E7EB', fontSize: 14,
                color: '#111827', textAlignVertical: 'top', minHeight: 100,
                marginBottom: 20,
              }}
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setMsgModal(false)}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 16, backgroundColor: '#F3F4F6', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#6B7280' }}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={envoyerDemande} disabled={sendingConv}
                style={{ flex: 2, borderRadius: 16, overflow: 'hidden' }}>
                <LinearGradient colors={[cfg.color, cfg.color + 'CC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {sendingConv
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <>
                        <Feather name="send" size={16} color="#fff" />
                        <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>Envoyer la demande</Text>
                      </>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Profil ── */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <LinearGradient colors={[cfg.color, cfg.color + 'CC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ padding: 28, paddingTop: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: 90, height: 90, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>
              <Text style={{ fontSize: 32, fontWeight: '900', color: '#fff' }}>
                {getInitials(medecin.prenom, medecin.nom)}
              </Text>
            </View>
            <Text style={{ fontSize: 22, fontWeight: '900', color: '#fff', textAlign: 'center' }}>
              Dr. {medecin.prenom} {medecin.nom}
            </Text>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginTop: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>{medecin.specialite}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 10 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80' }} />
              <Text style={{ fontSize: 12, color: '#fff', fontWeight: '600' }}>Disponible pour consultation</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={{ padding: 20, gap: 14 }}>
          {/* Coordonnées */}
          {!!medecin.telephone && (
            <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 18, ...sh('#000', 2, 0.06, 8), borderWidth: 1, borderColor: '#F3F4F6' }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#374151', marginBottom: 14 }}>📞 Coordonnées</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: cfg.light, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name="phone" size={18} color={cfg.color} />
                </View>
                <View>
                  <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '600' }}>TÉLÉPHONE</Text>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827', marginTop: 2 }}>{medecin.telephone}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Jours de consultation */}
          {dispo.length > 0 && (
            <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 18, ...sh('#000', 2, 0.06, 8), borderWidth: 1, borderColor: '#F3F4F6' }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#374151', marginBottom: 14 }}>📅 Jours de consultation</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {JOURS_ORDRE.map(j => {
                  const actif = dispo.includes(j);
                  return (
                    <View key={j} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: actif ? cfg.light : '#F9FAFB', borderWidth: 1.5, borderColor: actif ? cfg.color + '60' : '#E5E7EB' }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: actif ? cfg.color : '#D1D5DB' }}>{j}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Bouton RDV */}
          <TouchableOpacity onPress={onRdvPress} style={{ borderRadius: 20, overflow: 'hidden', ...sh(cfg.color, 6, 0.3, 14) }}>
            <LinearGradient colors={[cfg.color, cfg.color + 'CC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ paddingVertical: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <Feather name="calendar" size={22} color="#fff" />
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#fff' }}>Prendre un rendez-vous</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Séparateur OU */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#F3F4F6' }} />
            <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '600' }}>OU</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#F3F4F6' }} />
          </View>

          {/* Bloc discussion directe */}
          <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 16, ...sh('#000', 2, 0.06, 8), borderWidth: 1, borderColor: '#F3F4F6' }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#374151', marginBottom: 14 }}>
              💬 Discussion directe
            </Text>
            {renderDiscussionBtn()}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 10 }}>
              <Feather name="shield" size={12} color="#9CA3AF" />
              <Text style={{ fontSize: 11, color: '#9CA3AF' }}>
                Le médecin doit accepter avant de pouvoir discuter
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function AnnuaireScreen({ userRole = 'Parent' }) {
  const insets = useSafeAreaInsets();
  const [view,       setView]       = useState('specialites');
  const [specialite, setSpecialite] = useState(null);
  const [medecin,    setMedecin]    = useState(null);
  const [search,     setSearch]     = useState('');
  const [rdvModal,      setRdvModal]      = useState(false);
  const [contactModal,  setContactModal]  = useState(false); // ouvert depuis liste médecins
  const [notifModal,    setNotifModal]    = useState(false);
  const [notifCount,    setNotifCount]    = useState(0);

  // Clic "Contacter" depuis la liste → aller au profil + ouvrir modal discussion
  const handleContact = (m) => {
    setMedecin(m);
    setSearch('');
    setView('profil');
    // Petit délai pour laisser le profil se monter avant d'ouvrir le modal
    setTimeout(() => setContactModal(true), 350);
  };

  // Polling notifications
  useEffect(() => {
    const load = async () => {
      try { const d = await apiFetch('/api/notifications/count'); setNotifCount(d.count || 0); } catch {}
    };
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const handleBack = () => {
    if (view === 'profil')        { setView('medecins'); setMedecin(null); }
    else if (view === 'medecins') { setView('specialites'); setSpecialite(null); }
    setSearch('');
  };

  const cfg = view !== 'specialites' && specialite ? getCfg(specialite.nom) : { color: '#7C3AED', light: '#EDE9FE' };
  const showSearch = view !== 'profil';
  const headerTitle = view === 'specialites' ? 'Annuaire médical'
    : view === 'medecins' ? (specialite?.nom || 'Médecins')
    : `Dr. ${medecin?.nom || ''}`;
  const headerSubtitle = view === 'specialites' ? 'Trouvez le spécialiste qu\'il vous faut'
    : view === 'medecins' ? 'Sélectionnez un praticien'
    : (medecin?.specialite || '');

  return (
    <ParentLayout>
      <View style={{ flex: 1, backgroundColor: '#F8FAFC', paddingTop: insets.top }}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={{ backgroundColor: '#fff', paddingHorizontal: 20, paddingTop: 16, paddingBottom: showSearch ? 12 : 18, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', ...sh('#000', 2, 0.05, 8) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            {view !== 'specialites' && (
              <TouchableOpacity onPress={handleBack} style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: cfg.light, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="arrow-left" size={18} color={cfg.color} />
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontWeight: '900', color: '#111827' }} numberOfLines={1}>{headerTitle}</Text>
              {!!headerSubtitle && <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{headerSubtitle}</Text>}
            </View>
            <TouchableOpacity onPress={() => setNotifModal(true)} style={{ position: 'relative', width: 40, height: 40, borderRadius: 13, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="bell" size={18} color="#374151" />
              <NotifBadge count={notifCount} />
            </TouchableOpacity>
          </View>

          {showSearch && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8FAFC', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1.5, borderColor: search ? cfg.color : '#E5E7EB', marginTop: 10 }}>
              <Feather name="search" size={16} color={search ? cfg.color : '#9CA3AF'} />
              <TextInput
                value={search} onChangeText={setSearch}
                placeholder={view === 'specialites' ? 'Rechercher une spécialité…' : 'Rechercher un médecin…'}
                placeholderTextColor="#9CA3AF"
                style={{ flex: 1, fontSize: 14, color: '#111827' }}
              />
              {!!search && <TouchableOpacity onPress={() => setSearch('')}><Feather name="x" size={16} color="#9CA3AF" /></TouchableOpacity>}
            </View>
          )}
        </View>

        {/* Contenu */}
        <View style={{ flex: 1 }}>
          {view === 'specialites' && (
            <SpecialitesView
              onSelect={(s) => { setSpecialite(s); setSearch(''); setView('medecins'); }}
              search={search}
            />
          )}
          {view === 'medecins' && specialite && (
            <MedecinsView
              specialite={specialite}
              onSelect={(m) => { setMedecin(m); setSearch(''); setView('profil'); }}
              onContact={handleContact}
              search={search}
            />
          )}
          {view === 'profil' && medecin && (
            <MedecinProfileView
              medecin={medecin}
              onRdvPress={() => setRdvModal(true)}
              autoOpenContact={contactModal}
              onAutoOpenDone={() => setContactModal(false)}
            />
          )}
        </View>

        {/* Modals */}
        {medecin && <RdvModal medecin={medecin} visible={rdvModal} onClose={() => setRdvModal(false)} />}
        <NotificationsModal
          visible={notifModal}
          onClose={() => setNotifModal(false)}
          onUpdateCount={setNotifCount}
          userRole={userRole}
        />
      </View>
    </ParentLayout>
  );
}