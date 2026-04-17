import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Modal, Alert, KeyboardAvoidingView,
  Platform, ActivityIndicator, Animated, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdminLayout from '../../../components/Navigation/AdminNavigation';
import { COLORS } from '../../../theme';
import S from './ActivitesStyles';

const BASE_URL = 'https://unfailed-branden-healable.ngrok-free.dev';

// ── Toast/Confirm via state — 100% React Native, marche sur web et mobile ────
// On n'utilise plus Alert.alert ni window.confirm
// La confirmation se fait via un Modal custom géré par état dans l'écran principal

// ── Modal de confirmation custom (marche sur web + mobile) ───────────────────
const ConfirmModal = ({ visible, title, message, onConfirm, onCancel, danger = true }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={{
      flex: 1, backgroundColor: 'rgba(15,23,42,0.60)',
      alignItems: 'center', justifyContent: 'center', padding: 30,
    }}>
      <View style={{
        backgroundColor: '#fff', borderRadius: 24, padding: 24,
        width: '100%', maxWidth: 360,
        shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.20, shadowRadius: 30, elevation: 20,
      }}>
        {/* Icon */}
        <View style={{
          width: 56, height: 56, borderRadius: 18,
          backgroundColor: danger ? '#FEE2E2' : '#EDE9FE',
          alignItems: 'center', justifyContent: 'center',
          alignSelf: 'center', marginBottom: 16,
        }}>
          <Feather name={danger ? 'trash-2' : 'alert-circle'} size={24} color={danger ? '#DC2626' : '#7C3AED'} />
        </View>
        <Text style={{ fontSize: 17, fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: 8 }}>
          {title}
        </Text>
        <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
          {message}
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity onPress={onCancel} style={{
            flex: 1, paddingVertical: 13, borderRadius: 14,
            backgroundColor: '#F1F5F9', alignItems: 'center',
          }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#64748B' }}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onConfirm} style={{
            flex: 1, paddingVertical: 13, borderRadius: 14,
            backgroundColor: danger ? '#DC2626' : '#7C3AED', alignItems: 'center',
          }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>
              {danger ? 'Supprimer' : 'Confirmer'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

// ── Toast de succès/erreur custom ─────────────────────────────────────────────
const Toast = ({ visible, message, type = 'success' }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      Animated.spring(anim, { toValue: 1, tension: 60, friction: 9, useNativeDriver: true }).start();
    } else {
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [visible]);
  if (!visible) return null;
  return (
    <Animated.View style={{
      position: 'absolute', bottom: 100, left: 20, right: 20, zIndex: 9999,
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0,1], outputRange: [20,0] }) }],
      backgroundColor: type === 'success' ? '#065F46' : '#991B1B',
      borderRadius: 16, padding: 16,
      flexDirection: 'row', alignItems: 'center', gap: 12,
      shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12,
    }}>
      <Feather name={type === 'success' ? 'check-circle' : 'alert-circle'} size={20} color="#fff" />
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14, flex: 1 }}>{message}</Text>
    </Animated.View>
  );
};

// ── Domaines + couleurs ───────────────────────────────────────────────────────
const DOMAINE_CONFIG = {
  'Communication': { color: '#7C3AED', bg: '#EDE9FE', icon: 'message-circle' },
  'Motricité':     { color: '#059669', bg: '#D1FAE5', icon: 'activity'       },
  'Cognitif':      { color: '#D97706', bg: '#FEF3C7', icon: 'cpu'            },
  'Imitation':     { color: '#DB2777', bg: '#FCE7F3', icon: 'copy'           },
  'Autonomie':     { color: '#0284C7', bg: '#E0F2FE', icon: 'user-check'     },
  'Socialisation': { color: '#16A34A', bg: '#DCFCE7', icon: 'users'          },
};
const DOMAINES_DEFAUT = Object.keys(DOMAINE_CONFIG);
const getDC = (d) => DOMAINE_CONFIG[d] || { color: '#6B7280', bg: '#F3F4F6', icon: 'grid' };

// ── apiFetch ──────────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = await AsyncStorage.getItem('userToken');
  if (!token) throw new Error('Session expirée. Reconnectez-vous.');
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type':               'application/json',
      'Authorization':              `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Erreur ${res.status}`);
  return data;
}

const Api = {
  getActivites: (dom) => apiFetch(`/api/activites${dom ? `?domaine=${encodeURIComponent(dom)}` : ''}`),
  getDomaines:  ()        => apiFetch('/api/domaines'),
  create:       (d)       => apiFetch('/api/activites', { method: 'POST', body: JSON.stringify(d) }),
  update:       (id, d)   => apiFetch(`/api/activites/${id}`, { method: 'PUT', body: JSON.stringify(d) }),
  remove:       (id)      => apiFetch(`/api/activites/${id}`, { method: 'DELETE' }),
  migrate:      ()        => apiFetch('/api/activites/migrate', { method: 'POST' }),
};

// ══════════════════════════════════════════════════════════════════════════════
// CHIP
// ══════════════════════════════════════════════════════════════════════════════
const Chip = ({ label, onRemove, color = '#7C3AED', bg = '#EDE9FE' }) => (
  <View style={{
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: bg, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
    marginRight: 6, marginBottom: 6,
  }}>
    <Text style={{ fontSize: 12, color, fontWeight: '600' }}>{label}</Text>
    {onRemove && (
      <TouchableOpacity onPress={onRemove} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
        <Feather name="x" size={11} color={color} />
      </TouchableOpacity>
    )}
  </View>
);

// ══════════════════════════════════════════════════════════════════════════════
// INPUT MATÉRIELS
// ══════════════════════════════════════════════════════════════════════════════
const MaterielInput = ({ value = [], onChange }) => {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim();
    if (!v || value.includes(v)) { setInput(''); return; }
    onChange([...value, v]); setInput('');
  };
  return (
    <View>
      {value.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {value.map((m, i) => (
            <Chip key={i} label={m} onRemove={() => onChange(value.filter((_, j) => j !== i))} />
          ))}
        </View>
      )}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
            paddingHorizontal: 14, paddingVertical: 11, fontSize: 14,
            backgroundColor: '#F9FAFB', color: '#1F2937' }}
          value={input} onChangeText={setInput}
          placeholder="Ex: Cartes images, ballons…" placeholderTextColor="#9CA3AF"
          onSubmitEditing={add} returnKeyType="done" blurOnSubmit={false}
        />
        <TouchableOpacity onPress={add} style={{
          backgroundColor: '#7C3AED', borderRadius: 12, width: 46,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Feather name="plus" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
      {value.length === 0 && (
        <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
          Tapez un élément et appuyez sur + pour l'ajouter
        </Text>
      )}
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// DROPDOWN DOMAINE
// ══════════════════════════════════════════════════════════════════════════════
const DomaineDropdown = ({ value, onChange, allDomaines }) => {
  const [open, setOpen] = useState(false);
  const dc = getDC(value);
  return (
    <View>
      <TouchableOpacity onPress={() => setOpen(v => !v)} activeOpacity={0.8} style={{
        borderWidth: 1.5, borderColor: open ? '#7C3AED' : '#E5E7EB',
        borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
        backgroundColor: '#F9FAFB', flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: open ? 0 : 12,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {value && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: dc.color }} />}
          <Text style={{ fontSize: 14, color: value ? '#1F2937' : '#9CA3AF' }}>
            {value || 'Sélectionner un domaine *'}
          </Text>
        </View>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#6B7280" />
      </TouchableOpacity>
      {open && (
        <View style={{
          borderWidth: 1.5, borderColor: '#7C3AED', borderRadius: 12,
          backgroundColor: '#fff', marginBottom: 12, overflow: 'hidden',
          elevation: 5, shadowColor: '#7C3AED',
          shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10,
        }}>
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} style={{ maxHeight: 210 }}>
            {allDomaines.map((d, i) => {
              const c = getDC(d); const sel = value === d;
              return (
                <TouchableOpacity key={i} onPress={() => { onChange(d); setOpen(false); }} style={{
                  paddingHorizontal: 14, paddingVertical: 13,
                  backgroundColor: sel ? '#EDE9FE' : '#fff',
                  borderBottomWidth: i < allDomaines.length - 1 ? 0.5 : 0,
                  borderBottomColor: '#F3F4F6',
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                }}>
                  <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name={c.icon} size={15} color={c.color} />
                  </View>
                  <Text style={{ flex: 1, fontSize: 14, color: sel ? '#7C3AED' : '#1F2937', fontWeight: sel ? '600' : '400' }}>{d}</Text>
                  {sel && <Feather name="check" size={14} color="#7C3AED" />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// CARTE ACTIVITÉ
// ══════════════════════════════════════════════════════════════════════════════
const ActiviteCard = ({ item, onEdit, onDelete, index }) => {
  const [expanded, setExpanded] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, { toValue: 1, tension: 60, friction: 9, delay: Math.min(index * 50, 300), useNativeDriver: true }).start();
  }, []);
  const dc = getDC(item.domaine);
  const materiel = Array.isArray(item.materiel_requis) ? item.materiel_requis : (item.materiel_requis ? [item.materiel_requis] : []);

  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0,1], outputRange: [20,0] }) }] }}>
      <View style={{
        backgroundColor: '#fff', borderRadius: 20, marginBottom: 12,
        borderWidth: 1, borderColor: '#F1F5F9',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
        elevation: 3, overflow: 'hidden',
      }}>
        <View style={{ height: 4, backgroundColor: dc.color }} />
        <TouchableOpacity onPress={() => setExpanded(v => !v)} activeOpacity={0.85}
          style={{ padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: dc.bg, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name={dc.icon} size={22} color={dc.color} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
              <View style={{ backgroundColor: dc.bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: dc.color, letterSpacing: 0.5 }}>
                  {(item.domaine || '').toUpperCase()}
                </Text>
              </View>
              {!!item.type && (
                <View style={{ backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: '#E2E8F0' }}>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: '#64748B' }}>{item.type}</Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A', lineHeight: 20 }}>
              {item.nom || item.type || item.domaine}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 5 }}>
              {!!item.duree && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Feather name="clock" size={12} color="#94A3B8" />
                  <Text style={{ fontSize: 12, color: '#64748B' }}>{item.duree}</Text>
                </View>
              )}
              {materiel.length > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Feather name="package" size={12} color="#94A3B8" />
                  <Text style={{ fontSize: 12, color: '#64748B' }}>{materiel.length} matériel{materiel.length > 1 ? 'x' : ''}</Text>
                </View>
              )}
              {!!item.url && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Feather name="link" size={12} color="#7C3AED" />
                  <Text style={{ fontSize: 12, color: '#7C3AED' }}>Lien</Text>
                </View>
              )}
            </View>
          </View>
          <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' }}>
            <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color="#94A3B8" />
          </View>
        </TouchableOpacity>

        {!!item.objectif && !expanded && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
            <Text style={{ fontSize: 13, color: '#64748B', lineHeight: 18 }} numberOfLines={2}>{item.objectif}</Text>
          </View>
        )}

        {expanded && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <View style={{ height: 1, backgroundColor: '#F1F5F9', marginBottom: 14 }} />
            {!!item.objectif && (
              <View style={{ marginBottom: 14 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 5 }}>Objectif</Text>
                <Text style={{ fontSize: 14, color: '#334155', lineHeight: 21 }}>{item.objectif}</Text>
              </View>
            )}
            {materiel.length > 0 && (
              <View style={{ marginBottom: 14 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>Matériel requis</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {materiel.map((m, i) => <Chip key={i} label={m} color={dc.color} bg={dc.bg} />)}
                </View>
              </View>
            )}
            {!!item.conseils && (
              <View style={{ backgroundColor: '#F0FDF4', borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: 'row', gap: 10, borderLeftWidth: 3, borderLeftColor: '#22C55E' }}>
                <Feather name="check-circle" size={15} color="#16A34A" style={{ marginTop: 1 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#15803D', marginBottom: 3, letterSpacing: 0.5 }}>CONSEILS</Text>
                  <Text style={{ fontSize: 13, color: '#166534', lineHeight: 19 }}>{item.conseils}</Text>
                </View>
              </View>
            )}
            {!!item.attention && (
              <View style={{ backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, marginBottom: 10, flexDirection: 'row', gap: 10, borderLeftWidth: 3, borderLeftColor: '#F59E0B' }}>
                <Feather name="alert-triangle" size={15} color="#D97706" style={{ marginTop: 1 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#B45309', marginBottom: 3, letterSpacing: 0.5 }}>ATTENTION</Text>
                  <Text style={{ fontSize: 13, color: '#92400E', lineHeight: 19 }}>{item.attention}</Text>
                </View>
              </View>
            )}
            {!!item.url && (
              <View style={{ backgroundColor: '#F5F3FF', borderRadius: 12, padding: 12, marginBottom: 14, flexDirection: 'row', gap: 10, alignItems: 'center', borderLeftWidth: 3, borderLeftColor: '#7C3AED' }}>
                <Feather name="link-2" size={15} color="#7C3AED" />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#6D28D9', marginBottom: 2, letterSpacing: 0.5 }}>RESSOURCE</Text>
                  <Text style={{ fontSize: 13, color: '#7C3AED' }} numberOfLines={2}>{item.url}</Text>
                </View>
              </View>
            )}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => onEdit(item)} style={{
                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                gap: 7, backgroundColor: '#EDE9FE', borderRadius: 12, paddingVertical: 11,
              }}>
                <Feather name="edit-2" size={14} color="#7C3AED" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#7C3AED' }}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(item._id)} style={{
                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                gap: 7, backgroundColor: '#FEE2E2', borderRadius: 12, paddingVertical: 11,
              }}>
                <Feather name="trash-2" size={14} color="#DC2626" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#DC2626' }}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MODAL
// ══════════════════════════════════════════════════════════════════════════════
const FORM_EMPTY = { domaine: '', type: '', materiel_requis: [], objectif: '', conseils: '', attention: '', duree: '', url: '' };

const ActiviteModal = ({ visible, onClose, onSave, editItem, loading, allDomaines }) => {
  const isEdit = !!editItem;
  const [form, setForm] = useState(FORM_EMPTY);
  const [validationError, setValidationError] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!visible) return;
    setValidationError('');
    if (editItem) {
      const mat = Array.isArray(editItem.materiel_requis) ? editItem.materiel_requis : (editItem.materiel_requis ? [editItem.materiel_requis] : []);
      setForm({ domaine: editItem.domaine || '', type: editItem.type || '', materiel_requis: mat, objectif: editItem.objectif || '', conseils: editItem.conseils || '', attention: editItem.attention || '', duree: editItem.duree || '', url: editItem.url || '' });
    } else { setForm(FORM_EMPTY); }
  }, [visible, editItem]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = () => {
    if (!form.domaine)     { setValidationError('Sélectionnez un domaine.'); return; }
    if (!form.type.trim()) { setValidationError("Le type d'activité est obligatoire."); return; }
    setValidationError('');
    const payload = {
      domaine: form.domaine, type: form.type.trim(),
      materiel_requis: form.materiel_requis,
      objectif: form.objectif.trim(), conseils: form.conseils.trim(),
      attention: form.attention.trim(), duree: form.duree.trim(), url: form.url.trim(),
    };
    if (isEdit && editItem._id) payload._id = editItem._id;
    onSave(payload);
  };

  const inputStyle = { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, backgroundColor: '#F9FAFB', color: '#1F2937', marginBottom: 14 };
  const label = (txt, req) => (<Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 7 }}>{txt}{req ? <Text style={{ color: '#EF4444' }}> *</Text> : ''}</Text>);
  const sectionTitle = (txt, icon) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, marginTop: 6 }}>
      <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center' }}>
        <Feather name={icon} size={13} color="#7C3AED" />
      </View>
      <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151', letterSpacing: 0.3 }}>{txt}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: '#F1F5F9' }} />
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 30 : 0}
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15,23,42,0.55)' }}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 6, maxHeight: '95%' }}>
          <View style={{ width: 44, height: 5, backgroundColor: '#E2E8F0', borderRadius: 3, alignSelf: 'center', marginBottom: 18 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name={isEdit ? 'edit-3' : 'plus'} size={18} color="#7C3AED" />
              </View>
              <View>
                <Text style={{ fontSize: 17, fontWeight: '800', color: '#0F172A' }}>{isEdit ? "Modifier l'activité" : 'Nouvelle activité'}</Text>
                <Text style={{ fontSize: 12, color: '#94A3B8' }}>{isEdit ? 'Mettez à jour les détails' : 'Remplissez tous les champs'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="x" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="none" contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}>
            {/* Validation error banner */}
            {!!validationError && (
              <View style={{ backgroundColor: '#FEE2E2', borderRadius: 12, padding: 12, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Feather name="alert-circle" size={16} color="#DC2626" />
                <Text style={{ fontSize: 13, color: '#DC2626', fontWeight: '600', flex: 1 }}>{validationError}</Text>
                <TouchableOpacity onPress={() => setValidationError('')}>
                  <Feather name="x" size={14} color="#DC2626" />
                </TouchableOpacity>
              </View>
            )}
            {sectionTitle('Informations de base', 'info')}
            {label('Domaine thérapeutique', true)}
            <DomaineDropdown value={form.domaine} onChange={v => set('domaine', v)} allDomaines={allDomaines} />
            {label("Type d'activité", true)}
            <TextInput style={inputStyle} value={form.type} onChangeText={v => set('type', v)} placeholder="Ex: PECS, ABA, Jeu de rôle…" placeholderTextColor="#9CA3AF" />
            {label('Durée estimée')}
            <TextInput style={inputStyle} value={form.duree} onChangeText={v => set('duree', v)} placeholder="Ex: 20 min, 30-45 min…" placeholderTextColor="#9CA3AF" />

            {sectionTitle('Matériel requis', 'package')}
            <MaterielInput value={form.materiel_requis} onChange={v => set('materiel_requis', v)} />
            <View style={{ height: 14 }} />

            {sectionTitle('Contenu pédagogique', 'book-open')}
            {label('Objectif thérapeutique')}
            <TextInput style={[inputStyle, { minHeight: 85, textAlignVertical: 'top', paddingTop: 12 }]} value={form.objectif} onChangeText={v => set('objectif', v)} multiline placeholder="Décrivez l'objectif de cette activité…" placeholderTextColor="#9CA3AF" />
            {label('Conseils pratiques')}
            <View style={{ backgroundColor: '#F0FDF4', borderRadius: 12, marginBottom: 14, borderLeftWidth: 3, borderLeftColor: '#22C55E', overflow: 'hidden' }}>
              <TextInput style={{ padding: 14, fontSize: 14, color: '#1F2937', minHeight: 75, textAlignVertical: 'top' }} value={form.conseils} onChangeText={v => set('conseils', v)} multiline placeholder="Astuces pour bien animer la séance…" placeholderTextColor="#86EFAC" />
            </View>
            {label("Points d'attention")}
            <View style={{ backgroundColor: '#FFFBEB', borderRadius: 12, marginBottom: 14, borderLeftWidth: 3, borderLeftColor: '#F59E0B', overflow: 'hidden' }}>
              <TextInput style={{ padding: 14, fontSize: 14, color: '#1F2937', minHeight: 75, textAlignVertical: 'top' }} value={form.attention} onChangeText={v => set('attention', v)} multiline placeholder="Précautions, contre-indications…" placeholderTextColor="#FCD34D" />
            </View>

            {sectionTitle('Ressource en ligne', 'link')}
            {label('URL / Lien de référence')}
            <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#F9FAFB', marginBottom: 14, overflow: 'hidden' }}>
              <View style={{ padding: 12, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="link-2" size={16} color="#7C3AED" />
              </View>
              <TextInput style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 12, fontSize: 14, color: '#1F2937' }} value={form.url} onChangeText={v => set('url', v)} placeholder="https://exemple.com/ressource" placeholderTextColor="#9CA3AF" keyboardType="url" autoCapitalize="none" />
            </View>

            <TouchableOpacity onPress={submit} disabled={loading} style={{ marginTop: 4 }}>
              <LinearGradient colors={['#4C1D95', '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: loading ? 0.7 : 1 }}>
                {loading ? <ActivityIndicator size="small" color="#fff" /> : <Feather name={isEdit ? 'save' : 'check-circle'} size={18} color="#fff" />}
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
                  {loading ? 'Enregistrement…' : isEdit ? 'Enregistrer les modifications' : "Créer l'activité"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={{ paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ color: '#94A3B8', fontSize: 14 }}>Annuler</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ÉCRAN PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════
export default function ActivitesScreen({ route }) {
  const [activites,   setActivites]   = useState([]);
  const [domaines,    setDomaines]    = useState([]);
  const [filterDom,   setFilterDom]   = useState(null);
  const [search,      setSearch]      = useState('');
  const [loading,     setLoading]     = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);
  const [modal,       setModal]       = useState(false);
  const [editItem,    setEditItem]    = useState(null);
  const [error,       setError]       = useState(null);
  const [migrating,   setMigrating]   = useState(false);

  // ── Confirm modal state ────────────────────────────────────────────────────
  const [confirm, setConfirm] = useState({ visible: false, title: '', message: '', onConfirm: null, danger: true });
  const showConfirm = (title, message, onConfirm, danger = true) =>
    setConfirm({ visible: true, title, message, onConfirm, danger });
  const hideConfirm = () => setConfirm(c => ({ ...c, visible: false, onConfirm: null }));

  // ── Toast state ────────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800);
  };

  const allDomaines = [...new Set([...DOMAINES_DEFAUT, ...domaines])];

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [acts, doms] = await Promise.all([Api.getActivites(), Api.getDomaines()]);
      setActivites(Array.isArray(acts) ? acts : []);
      setDomaines(Array.isArray(doms) ? doms : []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (route?.params?.openCreate) { setEditItem(null); setModal(true); }
  }, [route?.params?.openCreate]);

  // ── handleSave ─────────────────────────────────────────────────────────────
  const handleSave = useCallback(async (item) => {
    setLoadingSave(true);
    try {
      if (item._id) {
        const { _id, ...data } = item;
        const updated = await Api.update(_id, data);
        setActivites(prev => prev.map(a => a._id === updated._id ? updated : a));
        setModal(false);
        setEditItem(null);
        showToast("Activité mise à jour avec succès ✓", 'success');
      } else {
        const created = await Api.create(item);
        setActivites(prev => [created, ...prev]);
        setModal(false);
        setEditItem(null);
        showToast(`Activité "${created.type}" créée ✓`, 'success');
      }
    } catch (e) {
      showToast(e.message || 'Impossible de sauvegarder.', 'error');
    } finally { setLoadingSave(false); }
  }, []);

  // ── handleDelete ───────────────────────────────────────────────────────────
  const handleDelete = useCallback((id) => {
    showConfirm(
      'Supprimer cette activité ?',
      'Cette action est irréversible. L\'activité sera définitivement supprimée.',
      async () => {
        hideConfirm();
        try {
          await Api.remove(id);
          setActivites(prev => prev.filter(a => a._id !== id));
          showToast('Activité supprimée', 'success');
        } catch (e) {
          showToast(e.message || 'Erreur lors de la suppression', 'error');
        }
      },
      true
    );
  }, []);

  // ── handleMigrate ──────────────────────────────────────────────────────────
  const handleMigrate = useCallback(() => {
    showConfirm(
      'Migrer les données ?',
      'Cette opération migre les anciennes activités vers la nouvelle structure.',
      async () => {
        hideConfirm();
        setMigrating(true);
        try {
          const r = await Api.migrate();
          showToast(`${r.migrated} activité(s) migrée(s) ✓`, 'success');
          loadData();
        } catch (e) {
          showToast(e.message || 'Erreur migration', 'error');
        } finally { setMigrating(false); }
      },
      false
    );
  }, [loadData]);

  // Filtrage
  const q = search.toLowerCase().trim();
  const filtered = activites.filter(a => {
    if (filterDom && a.domaine !== filterDom) return false;
    if (!q) return true;
    return (a.type || '').toLowerCase().includes(q)
        || (a.nom  || '').toLowerCase().includes(q)
        || (a.domaine  || '').toLowerCase().includes(q)
        || (a.objectif || '').toLowerCase().includes(q);
  });

  const countByDom = {};
  activites.forEach(a => { countByDom[a.domaine] = (countByDom[a.domaine] || 0) + 1; });

  return (
    <AdminLayout activeTab="activites">
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>

        {/* ── HEADER ── */}
        <LinearGradient colors={['#4C1D95', '#1E1B4B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingTop: Platform.OS === 'ios' ? 58 : 36, paddingBottom: 22, paddingHorizontal: 20, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', left: -60, top: -20, width: 200, height: 200, borderRadius: 100, backgroundColor: '#6D28D9', opacity: 0.35 }} />
          <View style={{ position: 'absolute', right: -40, bottom: -30, width: 160, height: 160, borderRadius: 80, backgroundColor: '#3B82F6', opacity: 0.18 }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '500', letterSpacing: 1 }}>GESTION</Text>
              <Text style={{ fontSize: 26, fontWeight: '800', color: '#fff', lineHeight: 32 }}>
                Acti<Text style={{ color: '#A78BFA' }}>vités</Text>
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={loadData} style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}>
                <Feather name="refresh-cw" size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setEditItem(null); setModal(true); }} style={{ backgroundColor: '#7C3AED', borderRadius: 14, padding: 10 }}>
                <Feather name="plus" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {[
              { val: activites.length, label: 'Total',    color: '#A78BFA' },
              { val: allDomaines.length, label: 'Domaines', color: '#6EE7B7' },
              { val: filtered.length,  label: 'Filtrées', color: '#FCD34D' },
            ].map((s, i) => (
              <View key={i} style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                <Text style={{ fontSize: 22, fontWeight: '800', color: s.color }}>{s.val}</Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}>
            <Feather name="search" size={16} color="rgba(255,255,255,0.5)" />
            <TextInput value={search} onChangeText={setSearch} placeholder="Rechercher une activité…" placeholderTextColor="rgba(255,255,255,0.4)" style={{ flex: 1, color: '#fff', fontSize: 14 }} />
            {!!search && <TouchableOpacity onPress={() => setSearch('')}><Feather name="x" size={16} color="rgba(255,255,255,0.5)" /></TouchableOpacity>}
          </View>
        </LinearGradient>

        {/* ── FILTRES ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
          style={{ flexShrink: 0, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }}>
          <TouchableOpacity onPress={() => setFilterDom(null)} style={{
            paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
            backgroundColor: !filterDom ? '#4C1D95' : '#F8FAFC',
            borderWidth: 1.5, borderColor: !filterDom ? '#4C1D95' : '#E2E8F0',
          }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: !filterDom ? '#fff' : '#64748B' }}>Tous ({activites.length})</Text>
          </TouchableOpacity>
          {allDomaines.map(d => {
            const dc = getDC(d); const active = filterDom === d;
            return (
              <TouchableOpacity key={d} onPress={() => setFilterDom(active ? null : d)} style={{
                paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
                backgroundColor: active ? dc.color : '#F8FAFC',
                borderWidth: 1.5, borderColor: active ? dc.color : '#E2E8F0',
                flexDirection: 'row', alignItems: 'center', gap: 6,
              }}>
                <Feather name={dc.icon} size={12} color={active ? '#fff' : dc.color} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#fff' : '#64748B' }}>
                  {d} ({countByDom[d] || 0})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── BOUTON CRÉER ── */}
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <TouchableOpacity onPress={() => { setEditItem(null); setModal(true); }} activeOpacity={0.85}>
            <LinearGradient colors={['#4C1D95', '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ borderRadius: 16, paddingVertical: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Feather name="plus-circle" size={20} color="#fff" />
              <Text style={{ flex: 1, color: '#fff', fontWeight: '700', fontSize: 14 }}>Créer une nouvelle activité</Text>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: 5 }}>
                <Feather name="arrow-right" size={14} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── BANNIÈRE MIGRATION ── */}
        {!loading && activites.some(a => !Array.isArray(a.materiel_requis)) && (
          <TouchableOpacity onPress={handleMigrate} disabled={migrating}
            style={{ marginHorizontal: 16, marginTop: 10, backgroundColor: '#FFFBEB', borderRadius: 14, padding: 12, flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, borderColor: '#FDE68A' }}>
            {migrating ? <ActivityIndicator size="small" color="#D97706" /> : <Feather name="alert-triangle" size={16} color="#D97706" />}
            <Text style={{ flex: 1, fontSize: 12, color: '#92400E', fontWeight: '600' }}>
              Anciennes données détectées. Appuyez pour migrer.
            </Text>
            <Feather name="chevron-right" size={14} color="#D97706" />
          </TouchableOpacity>
        )}

        {/* ── CONTENU ── */}
        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={{ marginTop: 12, color: '#94A3B8', fontSize: 13 }}>Chargement des activités…</Text>
          </View>
        ) : error ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
            <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <Feather name="wifi-off" size={28} color="#DC2626" />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A' }}>Erreur de connexion</Text>
            <Text style={{ fontSize: 13, color: '#94A3B8', marginTop: 6, textAlign: 'center', lineHeight: 20 }}>{error}</Text>
            <TouchableOpacity onPress={loadData} style={{ marginTop: 18, backgroundColor: '#4C1D95', borderRadius: 14, paddingHorizontal: 28, paddingVertical: 12 }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 }}>
            {filtered.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 50 }}>
                <View style={{ width: 72, height: 72, borderRadius: 22, backgroundColor: '#EDE9FE', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Feather name="grid" size={32} color="#7C3AED" />
                </View>
                <Text style={{ fontSize: 17, fontWeight: '800', color: '#0F172A' }}>Aucune activité</Text>
                <Text style={{ fontSize: 13, color: '#94A3B8', marginTop: 6, textAlign: 'center' }}>
                  {search ? 'Aucun résultat pour cette recherche' : filterDom ? `Aucune activité pour "${filterDom}"` : 'Créez votre première activité thérapeutique'}
                </Text>
                {!search && !filterDom && (
                  <TouchableOpacity onPress={() => { setEditItem(null); setModal(true); }}
                    style={{ marginTop: 18, backgroundColor: '#4C1D95', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Feather name="plus" size={16} color="#fff" />
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Créer une activité</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : filtered.map((item, i) => (
              <ActiviteCard key={item._id} item={item} index={i}
                onEdit={item => { setEditItem(item); setModal(true); }}
                onDelete={handleDelete}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <ActiviteModal
        visible={modal}
        onClose={() => { setModal(false); setEditItem(null); }}
        onSave={handleSave}
        editItem={editItem}
        loading={loadingSave}
        allDomaines={allDomaines}
      />

      {/* ── Modal de confirmation custom ── */}
      <ConfirmModal
        visible={confirm.visible}
        title={confirm.title}
        message={confirm.message}
        danger={confirm.danger}
        onConfirm={() => { if (confirm.onConfirm) confirm.onConfirm(); }}
        onCancel={hideConfirm}
      />

      {/* ── Toast notifications ── */}
      <Toast visible={toast.visible} message={toast.message} type={toast.type} />
    </AdminLayout>
  );
}