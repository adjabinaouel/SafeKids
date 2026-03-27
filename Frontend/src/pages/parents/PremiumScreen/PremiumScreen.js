// src/pages/parents/PremiumScreen/PremiumScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, TextInput,
  Modal, Animated, StatusBar, Platform, StyleSheet,
  Dimensions, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// ─── COULEURS (identiques à ActivitiesStyles) ─────────────────
const C = {
  primary:      '#7C3AED',
  primaryDark:  '#5B21B6',
  primaryLight: '#F5F3FF',
  surface:      '#F8FAFC',
  white:        '#FFFFFF',
  text:         '#1E293B',
  textLight:    '#64748B',
  textMuted:    '#94A3B8',
  border:       '#E2E8F0',
  success:      '#10B981',
  gold:         '#F59E0B',
  dahabia:      '#F59E0B',
  visa:         '#1A1F71',
};

const PLANS = [
  { id:'monthly', label:'Mensuel',  price:'1 000', period:'/mois',  total:'1 000 DA/mois',  badge:null,      color: C.primary },
  { id:'yearly',  label:'Annuel',   price:'833',   period:'/mois',  total:'10 000 DA/an',   badge:'🔥 -17%', color: C.gold, recommended:true },
];

const FEATURES = [
  { icon:'🎯', title:'Toutes les activités',  desc:'10 activités thérapeutiques complètes',       free:false },
  { icon:'🤖', title:'Recommandations IA',    desc:'Suggestions personnalisées pour Amine',        free:false },
  { icon:'📊', title:'Rapports de progrès',   desc:'Analyses et tendances détaillées',             free:false },
  { icon:'💬', title:'SafeBot illimité',       desc:'Chatbot IA sans limite',                       free:false },
  { icon:'📅', title:'Activité du jour',       desc:'1 activité par domaine chaque jour',           free:true  },
  { icon:'📝', title:'Feedback séances',       desc:'Évaluation après chaque activité',             free:true  },
];

// ─── FORMULAIRE DAHABIA ───────────────────────────────────────
const DahabiaForm = ({ onPay, plan }) => {
  const [ccp,    setCcp]    = useState('');
  const [cle,    setCle]    = useState('');
  const [nom,    setNom]    = useState('');
  const valid = ccp.length >= 10 && cle.length >= 2 && nom.length >= 3;

  return (
    <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'}>
      <View style={[s.methodBadge, { backgroundColor:'#FEF3C7' }]}>
        <Text style={{ fontSize:24 }}>💛</Text>
        <View style={{ flex:1 }}>
          <Text style={[s.methodBadgeTitle, { color: C.gold }]}>Dahabia — CCP / Algérie Poste</Text>
          <Text style={s.methodBadgeSub}>Paiement via votre compte CCP</Text>
        </View>
      </View>

      <Text style={s.fieldLabel}>Numéro de compte CCP</Text>
      <View style={s.inputWrap}>
        <Feather name="hash" size={16} color={C.textMuted} />
        <TextInput
          value={ccp} onChangeText={setCcp}
          placeholder="Ex: 0012345678901"
          placeholderTextColor={C.textMuted}
          style={s.input} keyboardType="numeric" maxLength={14}
        />
      </View>

      <Text style={s.fieldLabel}>Clé du compte</Text>
      <View style={s.inputWrap}>
        <Feather name="key" size={16} color={C.textMuted} />
        <TextInput
          value={cle} onChangeText={setCle}
          placeholder="Ex: 24"
          placeholderTextColor={C.textMuted}
          style={s.input} keyboardType="numeric" maxLength={2}
        />
      </View>

      <Text style={s.fieldLabel}>Nom du titulaire</Text>
      <View style={s.inputWrap}>
        <Feather name="user" size={16} color={C.textMuted} />
        <TextInput
          value={nom} onChangeText={setNom}
          placeholder="Ex: Mohamed Benali"
          placeholderTextColor={C.textMuted}
          style={s.input}
        />
      </View>

      <TouchableOpacity
        style={[s.payBtn, !valid && { opacity:0.5 }]}
        onPress={valid ? onPay : null}
        disabled={!valid}
      >
        <LinearGradient colors={['#F59E0B','#D97706']} style={s.payBtnGradient}>
          <Feather name="lock" size={16} color="#fff" />
          <Text style={s.payBtnText}>Payer {plan?.total}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

// ─── FORMULAIRE VISA / MASTERCARD ────────────────────────────
const VisaForm = ({ onPay, plan }) => {
  const [num,    setNum]    = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv,    setCvv]    = useState('');
  const [nom,    setNom]    = useState('');
  const valid = num.replace(/\s/g,'').length === 16 && expiry.length === 5 && cvv.length === 3 && nom.length >= 3;

  const formatCard = (v) => {
    const digits = v.replace(/\D/g,'').slice(0,16);
    return digits.replace(/(.{4})/g,'$1 ').trim();
  };
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g,'').slice(0,4);
    return d.length >= 3 ? d.slice(0,2)+'/'+d.slice(2) : d;
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'}>
      <View style={[s.methodBadge, { backgroundColor:'#EFF6FF' }]}>
        <Text style={{ fontSize:24 }}>💳</Text>
        <View style={{ flex:1 }}>
          <Text style={[s.methodBadgeTitle, { color: C.visa }]}>Visa / Mastercard</Text>
          <Text style={s.methodBadgeSub}>Carte bancaire internationale</Text>
        </View>
      </View>

      <Text style={s.fieldLabel}>Numéro de carte</Text>
      <View style={s.inputWrap}>
        <Feather name="credit-card" size={16} color={C.textMuted} />
        <TextInput
          value={num} onChangeText={v => setNum(formatCard(v))}
          placeholder="1234 5678 9012 3456"
          placeholderTextColor={C.textMuted}
          style={s.input} keyboardType="numeric"
        />
      </View>

      <View style={{ flexDirection:'row', columnGap:10 }}>
        <View style={{ flex:1 }}>
          <Text style={s.fieldLabel}>Date d'expiration</Text>
          <View style={s.inputWrap}>
            <Feather name="calendar" size={16} color={C.textMuted} />
            <TextInput
              value={expiry} onChangeText={v => setExpiry(formatExpiry(v))}
              placeholder="MM/AA"
              placeholderTextColor={C.textMuted}
              style={s.input} keyboardType="numeric" maxLength={5}
            />
          </View>
        </View>
        <View style={{ flex:1 }}>
          <Text style={s.fieldLabel}>CVV</Text>
          <View style={s.inputWrap}>
            <Feather name="shield" size={16} color={C.textMuted} />
            <TextInput
              value={cvv} onChangeText={setCvv}
              placeholder="123"
              placeholderTextColor={C.textMuted}
              style={s.input} keyboardType="numeric" maxLength={3}
              secureTextEntry
            />
          </View>
        </View>
      </View>

      <Text style={s.fieldLabel}>Nom sur la carte</Text>
      <View style={s.inputWrap}>
        <Feather name="user" size={16} color={C.textMuted} />
        <TextInput
          value={nom} onChangeText={setNom}
          placeholder="Ex: SARA BENSALEM"
          placeholderTextColor={C.textMuted}
          style={[s.input, { textTransform:'uppercase' }]}
        />
      </View>

      <TouchableOpacity
        style={[s.payBtn, !valid && { opacity:0.5 }]}
        onPress={valid ? onPay : null}
        disabled={!valid}
      >
        <LinearGradient colors={[C.primary, C.primaryDark]} style={s.payBtnGradient}>
          <Feather name="lock" size={16} color="#fff" />
          <Text style={s.payBtnText}>Payer {plan?.total}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

// ─── MODAL PAIEMENT ───────────────────────────────────────────
const PaymentModal = ({ visible, plan, onClose, onSuccess }) => {
  const [method, setMethod] = useState(null); // null | 'dahabia' | 'visa'
  const [step,   setStep]   = useState(1);    // 1=choix 2=form 3=loading 4=success
  const slideY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      setMethod(null); setStep(1);
      Animated.spring(slideY, { toValue:0, damping:22, stiffness:180, useNativeDriver:false }).start();
    } else {
      Animated.timing(slideY, { toValue:height, duration:220, useNativeDriver:false }).start();
    }
  }, [visible]);

  const handlePay = () => {
    setStep(3);
    setTimeout(() => setStep(4), 2000);
    setTimeout(() => onSuccess(), 3500);
  };

  const selectMethod = (m) => { setMethod(m); setStep(2); };

  return (
    <Modal visible={visible} transparent animationType="none"
      statusBarTranslucent onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <TouchableOpacity style={{ flex:1 }} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[s.modalSheet, { transform:[{translateY:slideY}] }]}>

          {/* Handle */}
          <View style={s.modalHandle} />

          {/* Header */}
          <View style={s.modalHeader}>
            {step === 2 ? (
              <TouchableOpacity onPress={() => setStep(1)} style={s.modalBackBtn}>
                <Feather name="arrow-left" size={18} color={C.text} />
              </TouchableOpacity>
            ) : (
              <View style={{ width:36 }} />
            )}
            <Text style={s.modalTitle}>
              {step===1 ? 'Choisir le paiement' : step===2 ? 'Informations' : 'Traitement…'}
            </Text>
            <TouchableOpacity onPress={onClose} style={s.modalCloseBtn}>
              <Feather name="x" size={18} color={C.textLight} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding:20, paddingBottom:40 }}
            keyboardShouldPersistTaps="handled">

            {/* Récap plan */}
            <LinearGradient colors={[C.primary, C.primaryDark]} style={s.planRecap}>
              <Text style={{ fontSize:22 }}>⭐</Text>
              <View style={{ flex:1 }}>
                <Text style={{ color:'#fff', fontWeight:'800', fontSize:14 }}>SafeKids Premium · Plan {plan?.label}</Text>
                <Text style={{ color:'rgba(255,255,255,0.75)', fontSize:12, marginTop:1 }}>{plan?.total}</Text>
              </View>
              <View style={{ backgroundColor:'rgba(255,255,255,0.2)', paddingHorizontal:10, paddingVertical:4, borderRadius:20 }}>
                <Text style={{ color:'#FCD34D', fontWeight:'800', fontSize:13 }}>{plan?.price} DA</Text>
              </View>
            </LinearGradient>

            {/* ÉTAPE 1 — Choix méthode */}
            {step === 1 && (
              <>
                <Text style={[s.fieldLabel, { marginBottom:12 }]}>Mode de paiement</Text>

                <TouchableOpacity onPress={() => selectMethod('dahabia')} style={s.methodCard}>
                  <LinearGradient colors={['#FEF3C7','#FDE68A']} style={s.methodCardGradient}>
                    <View style={s.methodCardLeft}>
                      <Text style={{ fontSize:32 }}>💛</Text>
                      <View>
                        <Text style={[s.methodCardTitle, { color:'#92400E' }]}>Dahabia</Text>
                        <Text style={s.methodCardSub}>CCP · Algérie Poste</Text>
                        <Text style={[s.methodCardSub, { color:'#D97706', fontWeight:'600' }]}>Populaire en Algérie</Text>
                      </View>
                    </View>
                    <Feather name="chevron-right" size={22} color="#D97706" />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => selectMethod('visa')} style={s.methodCard}>
                  <LinearGradient colors={['#EFF6FF','#DBEAFE']} style={s.methodCardGradient}>
                    <View style={s.methodCardLeft}>
                      <Text style={{ fontSize:32 }}>💳</Text>
                      <View>
                        <Text style={[s.methodCardTitle, { color: C.visa }]}>Visa / Mastercard</Text>
                        <Text style={s.methodCardSub}>Carte bancaire internationale</Text>
                        <Text style={[s.methodCardSub, { color: C.visa, fontWeight:'600' }]}>Acceptée partout</Text>
                      </View>
                    </View>
                    <Feather name="chevron-right" size={22} color={C.visa} />
                  </LinearGradient>
                </TouchableOpacity>

                <View style={s.secureRow}>
                  <Feather name="lock" size={12} color={C.success} />
                  <Text style={s.secureText}>Paiement 100% sécurisé · Simulation uniquement</Text>
                </View>
              </>
            )}

            {/* ÉTAPE 2 — Formulaire */}
            {step === 2 && method === 'dahabia' && (
              <DahabiaForm onPay={handlePay} plan={plan} />
            )}
            {step === 2 && method === 'visa' && (
              <VisaForm onPay={handlePay} plan={plan} />
            )}

            {/* ÉTAPE 3 — Loading */}
            {step === 3 && (
              <View style={s.loadingWrap}>
                <Text style={{ fontSize:52, marginBottom:16 }}>⏳</Text>
                <Text style={s.loadingTitle}>Traitement en cours…</Text>
                <Text style={s.loadingText}>Validation de votre paiement</Text>
              </View>
            )}

            {/* ÉTAPE 4 — Succès */}
            {step === 4 && (
              <View style={s.loadingWrap}>
                <Text style={{ fontSize:60, marginBottom:16 }}>🎉</Text>
                <Text style={s.loadingTitle}>Paiement réussi !</Text>
                <Text style={s.loadingText}>Bienvenue dans SafeKids Premium ⭐</Text>
                <Text style={{ fontSize:12, color:C.textMuted, marginTop:8, textAlign:'center' }}>
                  Toutes les activités sont maintenant débloquées
                </Text>
              </View>
            )}

          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ─── ÉCRAN PRINCIPAL ─────────────────────────────────────────
export default function PremiumScreen({ navigation, onPremiumActivated }) {
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [showPayment,  setShowPayment]  = useState(false);
  const [isPremium,    setIsPremium]    = useState(false);

  const plan = PLANS.find(p => p.id === selectedPlan);

  const handleSuccess = () => {
    setShowPayment(false);
    setIsPremium(true);
    onPremiumActivated?.();
  };

  // ── Écran succès Premium ──
  if (isPremium) {
    return (
      <SafeAreaView style={{ flex:1 }}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={[C.primary, C.primaryDark, '#1E293B']}
          style={{ flex:1, justifyContent:'center', alignItems:'center', padding:32 }}>
          <Text style={{ fontSize:80, marginBottom:20 }}>⭐</Text>
          <Text style={{ fontSize:26, fontWeight:'800', color:'#fff', textAlign:'center', marginBottom:10 }}>
            Vous êtes Premium !
          </Text>
          <Text style={{ fontSize:14, color:'rgba(255,255,255,0.75)', textAlign:'center', lineHeight:22, marginBottom:40 }}>
            Toutes les activités sont débloquées.{'\n'}Profitez de l'expérience complète SafeKids.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor:'#fff', height:54, borderRadius:16, paddingHorizontal:32, justifyContent:'center', alignItems:'center' }}
            onPress={() => navigation?.goBack()}
          >
            <Text style={{ color: C.primary, fontSize:16, fontWeight:'800' }}>🎯 Découvrir les activités</Text>
          </TouchableOpacity>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* ── HEADER ── */}
      <LinearGradient colors={[C.primary, C.primaryDark]} style={s.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={s.backBtn}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>SafeKids Premium</Text>
        <View style={{ width:36 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:140 }}>

        {/* ── HERO ── */}
        <LinearGradient colors={[C.primary, C.primaryDark, '#1E293B']}
          start={{x:0,y:0}} end={{x:1,y:1}} style={s.hero}>
          <Text style={s.heroEmoji}>⭐</Text>
          <Text style={s.heroTitle}>Débloquez tout le potentiel{'\n'}d'Amine</Text>
          <Text style={s.heroSub}>Accédez à toutes les activités thérapeutiques,{'\n'}recommandations IA et rapports de progrès</Text>
          <View style={s.heroBadges}>
            {['10 activités', 'IA incluse', 'Sans pub'].map((b,i) => (
              <View key={i} style={s.heroBadge}>
                <Text style={s.heroBadgeText}>✓ {b}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>

        {/* ── PLANS ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Choisissez votre plan</Text>
          <View style={s.plansRow}>
            {PLANS.map(p => (
              <TouchableOpacity key={p.id} onPress={() => setSelectedPlan(p.id)}
                style={[s.planCard, selectedPlan===p.id && s.planCardActive]}>
                {p.badge && (
                  <View style={s.planBadge}>
                    <Text style={s.planBadgeText}>{p.badge}</Text>
                  </View>
                )}
                {p.recommended && selectedPlan===p.id && (
                  <View style={s.recommendedBadge}>
                    <Text style={s.recommendedBadgeText}>Recommandé</Text>
                  </View>
                )}
                <Text style={s.planLabel}>{p.label}</Text>
                <View style={{ flexDirection:'row', alignItems:'flex-end' }}>
                  <Text style={[s.planPrice, selectedPlan===p.id && { color: C.primary }]}>{p.price}</Text>
                  <Text style={s.planCurrency}> DA</Text>
                </View>
                <Text style={s.planPeriod}>{p.period}</Text>
                <Text style={s.planTotal}>{p.total}</Text>
                <View style={[s.planRadio, selectedPlan===p.id && s.planRadioActive]}>
                  {selectedPlan===p.id && <View style={s.planRadioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── FONCTIONNALITÉS ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Ce qui est inclus</Text>
          <View style={s.featureTable}>
            <View style={s.featureTableHeader}>
              <Text style={[s.featureTableCol, { flex:2, textAlign:'left' }]}>Fonctionnalité</Text>
              <Text style={s.featureTableCol}>Gratuit</Text>
              <Text style={[s.featureTableCol, { color: C.primary }]}>Premium</Text>
            </View>
            {FEATURES.map((f,i) => (
              <View key={i} style={[s.featureRow, i%2===0 && { backgroundColor: C.surface }]}>
                <View style={{ flex:2, flexDirection:'row', alignItems:'center', columnGap:10 }}>
                  <Text style={{ fontSize:18 }}>{f.icon}</Text>
                  <View style={{ flex:1 }}>
                    <Text style={s.featureTitle}>{f.title}</Text>
                    <Text style={s.featureDesc} numberOfLines={1}>{f.desc}</Text>
                  </View>
                </View>
                <View style={s.featureCheck}>
                  {f.free
                    ? <Feather name="check" size={16} color={C.success} />
                    : <Feather name="minus" size={16} color={C.textMuted} />
                  }
                </View>
                <View style={s.featureCheck}>
                  <Feather name="check" size={16} color={C.primary} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── PAIEMENTS ACCEPTÉS ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Paiements acceptés</Text>
          <View style={s.payMethodsRow}>
            <View style={[s.payMethodChip, { backgroundColor:'#FEF3C7' }]}>
              <Text style={{ fontSize:20 }}>💛</Text>
              <Text style={[s.payMethodChipText, { color:'#92400E' }]}>Dahabia</Text>
            </View>
            <View style={[s.payMethodChip, { backgroundColor:'#EFF6FF' }]}>
              <Text style={{ fontSize:20 }}>💳</Text>
              <Text style={[s.payMethodChipText, { color: C.visa }]}>Visa / Mastercard</Text>
            </View>
          </View>
        </View>

        {/* ── TÉMOIGNAGES ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Ce que disent les parents</Text>
          {[
            { name:'Fatima B.', text:'SafeKids Premium a transformé nos séances. Amine progresse tellement mieux !', stars:5, avatar:'👩' },
            { name:'Karim M.',  text:'Les recommandations IA sont vraiment pertinentes. Je recommande à tous les parents.', stars:5, avatar:'👨' },
          ].map((t,i) => (
            <View key={i} style={s.testimonial}>
              <View style={s.testimonialHeader}>
                <View style={s.testimonialAvatar}><Text style={{ fontSize:16 }}>{t.avatar}</Text></View>
                <View>
                  <Text style={s.testimonialName}>{t.name}</Text>
                  <Text style={{ fontSize:12 }}>{'⭐'.repeat(t.stars)}</Text>
                </View>
              </View>
              <Text style={s.testimonialText}>"{t.text}"</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* ── CTA FIXÉ EN BAS ── */}
      <View style={s.ctaWrap}>
        <TouchableOpacity style={s.ctaBtn} onPress={() => setShowPayment(true)}>
          <LinearGradient colors={[C.primary, C.primaryDark]} style={s.ctaBtnGradient}>
            <Text style={{ fontSize:18 }}>⭐</Text>
            <View style={{ flex:1 }}>
              <Text style={s.ctaBtnText}>Passer à Premium</Text>
              <Text style={s.ctaBtnSub}>{plan?.total} · Sans engagement</Text>
            </View>
            <Feather name="arrow-right" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={s.ctaNote}>🔒 Sécurisé · Remboursement 7 jours · Simulation</Text>
      </View>

      <PaymentModal
        visible={showPayment}
        plan={plan}
        onClose={() => setShowPayment(false)}
        onSuccess={handleSuccess}
      />
    </SafeAreaView>
  );
}

// ─── STYLES ──────────────────────────────────────────────────
const s = StyleSheet.create({
  safeArea: { flex:1, backgroundColor:'#F8FAFC' },

  // Header
  header:      { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:14 },
  backBtn:     { width:36, height:36, borderRadius:18, backgroundColor:'rgba(255,255,255,0.2)', justifyContent:'center', alignItems:'center' },
  headerTitle: { fontSize:16, fontWeight:'800', color:'#fff' },

  // Hero
  hero:         { padding:28, paddingTop:32, alignItems:'center' },
  heroEmoji:    { fontSize:56, marginBottom:14 },
  heroTitle:    { fontSize:22, fontWeight:'800', color:'#fff', textAlign:'center', lineHeight:30, marginBottom:10 },
  heroSub:      { fontSize:13, color:'rgba(255,255,255,0.75)', textAlign:'center', lineHeight:20, marginBottom:18 },
  heroBadges:   { flexDirection:'row', columnGap:8, flexWrap:'wrap', justifyContent:'center' },
  heroBadge:    { backgroundColor:'rgba(255,255,255,0.18)', paddingHorizontal:12, paddingVertical:5, borderRadius:20 },
  heroBadgeText:{ color:'#fff', fontSize:12, fontWeight:'700' },

  // Sections
  section:      { padding:16, marginBottom:4 },
  sectionTitle: { fontSize:16, fontWeight:'800', color:'#1E293B', marginBottom:14, letterSpacing:-0.3 },

  // Plans
  plansRow:         { flexDirection:'row', columnGap:12 },
  planCard: {
    flex:1, backgroundColor:'#fff', borderRadius:18, padding:16,
    borderWidth:2, borderColor:'#E2E8F0', alignItems:'center', position:'relative', overflow:'hidden',
    ...Platform.select({ ios:{shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:8}, android:{elevation:3} }),
  },
  planCardActive:      { borderColor:'#7C3AED', backgroundColor:'#F5F3FF' },
  planBadge:           { position:'absolute', top:10, right:10, backgroundColor:'#FEF3C7', paddingHorizontal:8, paddingVertical:3, borderRadius:10 },
  planBadgeText:       { fontSize:10, fontWeight:'800', color:'#F59E0B' },
  recommendedBadge:    { backgroundColor:'#7C3AED', paddingHorizontal:10, paddingVertical:3, borderRadius:10, marginBottom:6 },
  recommendedBadgeText:{ fontSize:10, fontWeight:'800', color:'#fff' },
  planLabel:    { fontSize:13, fontWeight:'700', color:'#64748B', marginBottom:8 },
  planPrice:    { fontSize:30, fontWeight:'900', color:'#1E293B' },
  planCurrency: { fontSize:13, fontWeight:'700', color:'#64748B', marginBottom:4 },
  planPeriod:   { fontSize:12, color:'#94A3B8', marginBottom:2 },
  planTotal:    { fontSize:11, color:'#94A3B8', marginBottom:12 },
  planRadio:    { width:22, height:22, borderRadius:11, borderWidth:2, borderColor:'#E2E8F0', justifyContent:'center', alignItems:'center' },
  planRadioActive:{ borderColor:'#7C3AED' },
  planRadioDot: { width:10, height:10, borderRadius:5, backgroundColor:'#7C3AED' },

  // Features
  featureTable:       { backgroundColor:'#fff', borderRadius:16, overflow:'hidden', borderWidth:1, borderColor:'#E2E8F0' },
  featureTableHeader: { flexDirection:'row', alignItems:'center', backgroundColor:'#F8FAFC', padding:12, borderBottomWidth:1, borderBottomColor:'#E2E8F0' },
  featureTableCol:    { flex:1, fontSize:11, fontWeight:'800', color:'#64748B', textAlign:'center', textTransform:'uppercase' },
  featureRow:         { flexDirection:'row', alignItems:'center', padding:12, borderBottomWidth:1, borderBottomColor:'#F1F5F9' },
  featureTitle:       { fontSize:13, fontWeight:'700', color:'#1E293B' },
  featureDesc:        { fontSize:11, color:'#94A3B8', marginTop:1 },
  featureCheck:       { flex:1, alignItems:'center' },

  // Payment methods chips
  payMethodsRow:     { flexDirection:'row', columnGap:10 },
  payMethodChip:     { flex:1, flexDirection:'row', alignItems:'center', columnGap:8, padding:14, borderRadius:14, borderWidth:1, borderColor:'#E2E8F0' },
  payMethodChipText: { fontSize:13, fontWeight:'700' },

  // Testimonials
  testimonial: { backgroundColor:'#fff', borderRadius:16, padding:16, marginBottom:10, borderWidth:1, borderColor:'#E2E8F0',
    ...Platform.select({ ios:{shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.05,shadowRadius:6}, android:{elevation:2} }) },
  testimonialHeader: { flexDirection:'row', alignItems:'center', columnGap:10, marginBottom:8 },
  testimonialAvatar: { width:36, height:36, borderRadius:18, backgroundColor:'#F5F3FF', justifyContent:'center', alignItems:'center' },
  testimonialName:   { fontSize:13, fontWeight:'700', color:'#1E293B' },
  testimonialText:   { fontSize:13, color:'#64748B', lineHeight:20, fontStyle:'italic' },

  // CTA
  ctaWrap: {
    position:'absolute', bottom:0, left:0, right:0,
    backgroundColor:'#fff', padding:16,
    paddingBottom: Platform.OS==='ios' ? 34 : 20,
    borderTopWidth:1, borderTopColor:'#E2E8F0',
    ...Platform.select({ ios:{shadowColor:'#000',shadowOffset:{width:0,height:-2},shadowOpacity:0.06,shadowRadius:8}, android:{elevation:8} }),
  },
  ctaBtn:         { borderRadius:16, overflow:'hidden', marginBottom:8 },
  ctaBtnGradient: { flexDirection:'row', alignItems:'center', paddingHorizontal:20, paddingVertical:16, columnGap:12 },
  ctaBtnText:     { color:'#fff', fontSize:16, fontWeight:'800' },
  ctaBtnSub:      { color:'rgba(255,255,255,0.75)', fontSize:11, marginTop:1 },
  ctaNote:        { textAlign:'center', fontSize:11, color:'#94A3B8' },

  // Modal bottom sheet
  modalOverlay: { flex:1, backgroundColor:'rgba(15,23,42,0.6)', justifyContent:'flex-end' },
  modalSheet: {
    backgroundColor:'#fff', borderTopLeftRadius:28, borderTopRightRadius:28,
    maxHeight: height * 0.92,
    ...Platform.select({ ios:{shadowColor:'#7C3AED',shadowOffset:{width:0,height:-4},shadowOpacity:0.15,shadowRadius:20}, android:{elevation:24} }),
  },
  modalHandle:    { width:40, height:4, backgroundColor:'#E2E8F0', borderRadius:4, alignSelf:'center', marginTop:12, marginBottom:4 },
  modalHeader:    { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingVertical:12, borderBottomWidth:1, borderBottomColor:'#E2E8F0' },
  modalBackBtn:   { width:36, height:36, borderRadius:18, backgroundColor:'#F8FAFC', justifyContent:'center', alignItems:'center' },
  modalTitle:     { fontSize:16, fontWeight:'800', color:'#1E293B' },
  modalCloseBtn:  { width:36, height:36, borderRadius:18, backgroundColor:'#F8FAFC', justifyContent:'center', alignItems:'center' },

  // Plan recap dans modal
  planRecap: { flexDirection:'row', alignItems:'center', columnGap:12, borderRadius:16, padding:14, marginBottom:20 },

  // Choix méthode
  methodCard: { borderRadius:16, overflow:'hidden', marginBottom:12,
    ...Platform.select({ ios:{shadowColor:'#000',shadowOffset:{width:0,height:2},shadowOpacity:0.06,shadowRadius:8}, android:{elevation:3} }) },
  methodCardGradient: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:18 },
  methodCardLeft:     { flexDirection:'row', alignItems:'center', columnGap:14, flex:1 },
  methodCardTitle:    { fontSize:16, fontWeight:'800', marginBottom:2 },
  methodCardSub:      { fontSize:12, color:'#64748B' },

  // Badge méthode dans formulaire
  methodBadge:      { flexDirection:'row', alignItems:'center', columnGap:12, padding:14, borderRadius:14, marginBottom:16 },
  methodBadgeTitle: { fontSize:14, fontWeight:'800' },
  methodBadgeSub:   { fontSize:11, color:'#64748B', marginTop:1 },

  // Inputs
  fieldLabel: { fontSize:12, fontWeight:'700', color:'#64748B', marginBottom:8, textTransform:'uppercase', letterSpacing:0.5 },
  inputWrap: {
    flexDirection:'row', alignItems:'center', columnGap:10,
    backgroundColor:'#F8FAFC', borderRadius:12, padding:14,
    borderWidth:1.5, borderColor:'#E2E8F0', marginBottom:12,
  },
  input: { flex:1, fontSize:14, color:'#1E293B' },

  // Bouton payer
  payBtn:        { borderRadius:14, overflow:'hidden', marginTop:4 },
  payBtnGradient:{ flexDirection:'row', alignItems:'center', justifyContent:'center', columnGap:8, paddingVertical:16 },
  payBtnText:    { color:'#fff', fontSize:15, fontWeight:'800' },

  // Sécurité
  secureRow: { flexDirection:'row', alignItems:'center', columnGap:6, marginTop:8, justifyContent:'center' },
  secureText:{ fontSize:11, color:'#10B981', fontWeight:'600' },

  // Loading/succès
  loadingWrap:   { alignItems:'center', paddingVertical:24 },
  loadingTitle:  { fontSize:20, fontWeight:'800', color:'#1E293B', marginBottom:8 },
  loadingText:   { fontSize:14, color:'#64748B', textAlign:'center' },
});