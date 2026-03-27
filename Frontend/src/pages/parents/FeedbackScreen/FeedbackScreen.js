// src/pages/parents/FeedbackScreen/FeedbackScreen.js
/**
 * FeedbackScreen — Évaluation post-activité
 *
 * 3 étapes :
 *  Étape 1 — Notation (⭐) + Humeur de l'enfant
 *  Étape 2 — Durée réelle + Comportements observés + Commentaire libre
 *  Étape 3 — Récapitulatif + Envoi vers l'API (future intégration ML)
 *
 * Les données collectées correspondent aux colonnes du dataset :
 *   engagement_score, duree_activite_minutes, pecs_phase, teacch_niveau, ...
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, Animated, StatusBar,
  Platform, Dimensions} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import S, { COLORS } from './FeedbackStyles';

const { width } = Dimensions.get('window');

// ─── CONSTANTES ──────────────────────────────────────────────
const MOODS = [
  { id:'enthousiaste', emoji:'🤩', label:'Enthousiaste' },
  { id:'calme',        emoji:'😊', label:'Calme'        },
  { id:'neutre',       emoji:'😐', label:'Neutre'       },
  { id:'fatigue',      emoji:'😴', label:'Fatigué'      },
  { id:'agite',        emoji:'😤', label:'Agité'        },
  { id:'pleure',       emoji:'😢', label:'En pleurs'    },
];

const BEHAVIORS = [
  '✅ A suivi les instructions',
  '👁️ Bon contact visuel',
  '🤝 A demandé de l\'aide',
  '🔁 A répété l\'activité',
  '⏹️ A refusé à mi-parcours',
  '🎯 Très concentré',
  '📣 Vocalises',
  '🌀 Comportement répétitif',
  '💪 Autonomie partielle',
  '🏆 Autonomie complète',
];

const DURATIONS = [5, 10, 15, 20, 25, 30];

// ─── STEPPER ─────────────────────────────────────────────────
const Stepper = ({ step }) => (
  <View style={S.stepperRow}>
    {[1,2,3].map((n, i) => {
      const done   = step > n;
      const active = step === n;
      return (
        <React.Fragment key={n}>
          {i > 0 && <View style={[S.stepLine, (done || active) && S.stepLineActive]} />}
          <View style={[S.stepDot, active && S.stepDotActive, done && S.stepDotCompleted]}>
            <Text style={[S.stepDotText, active && S.stepDotTextActive, done && S.stepDotTextActive]}>
              {done ? '✓' : n}
            </Text>
          </View>
        </React.Fragment>
      );
    })}
  </View>
);

// ─── STARS ───────────────────────────────────────────────────
const Stars = ({ value, onChange }) => (
  <View style={S.starsRow}>
    {[1,2,3,4,5].map(n => (
      <TouchableOpacity key={n} onPress={() => onChange(n)} style={S.starBtn}>
        <Text style={S.starText}>{n <= value ? '⭐' : '☆'}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

// ─── DURATION SLIDER (visuel) ────────────────────────────────
const DurationPicker = ({ value, onChange, maxDuration }) => {
  const options = DURATIONS.filter(d => d <= maxDuration + 10);
  return (
    <>
      <View style={S.sliderRow}>
        <Text style={S.sliderLabel}>Durée réelle</Text>
        <Text style={[S.sliderLabel, { color: COLORS.primary, fontWeight:'700' }]}>{value} min</Text>
      </View>
      <View style={S.sliderTrack}>
        <View style={[S.sliderFill, {
          width: `${Math.min((value / (maxDuration + 10)) * 100, 100)}%`,
          backgroundColor: COLORS.primary}]} />
      </View>
      <View style={S.durationBtns}>
        {options.map(d => (
          <TouchableOpacity key={d} onPress={() => onChange(d)}
            style={[S.durationBtn, value===d && S.durationBtnActive]}>
            <Text style={[S.durationBtnText, value===d && S.durationBtnTextActive]}>{d}′</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
};

// ─── ÉTAPE 1 : Note + Humeur ─────────────────────────────────
const Step1 = ({ data, onChange }) => (
  <View>
    <Text style={S.sectionTitle}>Note de la séance</Text>
    <Stars value={data.note} onChange={v => onChange({ note:v })} />

    <Text style={[S.sectionTitle, { marginTop:8 }]}>Humeur de l'enfant</Text>
    <View style={S.moodGrid}>
      {MOODS.map(m => (
        <TouchableOpacity key={m.id} onPress={() => onChange({ humeur:m.id })}
          style={[S.moodCard, data.humeur===m.id && S.moodCardActive]}>
          <Text style={S.moodEmoji}>{m.emoji}</Text>
          <Text style={[S.moodLabel, data.humeur===m.id && S.moodLabelActive]}>{m.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// ─── ÉTAPE 2 : Durée + Comportements + Commentaire ───────────
const Step2 = ({ data, onChange, maxDuration }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View>
      <Text style={S.sectionTitle}>Durée réelle de la séance</Text>
      <DurationPicker value={data.duree} onChange={v => onChange({ duree:v })} maxDuration={maxDuration} />

      <Text style={S.sectionTitle}>Comportements observés</Text>
      <View style={S.tagsRow}>
        {BEHAVIORS.map(b => {
          const active = (data.behaviors || []).includes(b);
          return (
            <TouchableOpacity key={b} onPress={() => {
              const prev = data.behaviors || [];
              const next = active ? prev.filter(x => x!==b) : [...prev, b];
              onChange({ behaviors:next });
            }} style={[S.tag, active && S.tagActive]}>
              <Text style={[S.tagText, active && S.tagTextActive]}>{b}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={S.inputGroup}>
        <Text style={S.inputLabel}>Commentaire libre</Text>
        <View style={[S.inputWrapper, focused && S.inputWrapperActive]}>
          <TextInput
            value={data.commentaire}
            onChangeText={v => onChange({ commentaire:v })}
            placeholder="Observations, points positifs, difficultés rencontrées…"
            placeholderTextColor={COLORS.textMuted}
            style={S.inputText}
            multiline
            numberOfLines={4}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </View>
      </View>
    </View>
  );
};

// ─── ÉTAPE 3 : Récapitulatif ─────────────────────────────────
const Step3 = ({ data, activity }) => {
  const moodObj  = MOODS.find(m => m.id === data.humeur);
  const noteLabel = ['', 'Très difficile', 'Difficile', 'Correct', 'Bien', 'Excellent'][data.note] || '-';
  return (
    <View>
      <View style={S.recapCard}>
        {[
          { label:'Activité',    value: activity?.nom || '-'                          },
          { label:'Note',        value: `${'⭐'.repeat(data.note)}  ${noteLabel}`     },
          { label:'Humeur',      value: moodObj ? `${moodObj.emoji}  ${moodObj.label}` : '-' },
          { label:'Durée réelle',value: `${data.duree} minutes`                       },
          { label:'Comportements', value: (data.behaviors?.length || 0) + ' sélectionnés' },
        ].map((r, i, arr) => (
          <View key={i} style={[S.recapRow, i===arr.length-1 && { borderBottomWidth:0 }]}>
            <Text style={S.recapLabel}>{r.label}</Text>
            <Text style={S.recapValue}>{r.value}</Text>
          </View>
        ))}
        {data.commentaire?.trim() ? (
          <View style={S.recapNote}>
            <Text style={S.recapNoteText}>"{data.commentaire.trim()}"</Text>
          </View>
        ) : null}
      </View>

      {/* Comportements détail */}
      {(data.behaviors?.length > 0) && (
        <>
          <Text style={[S.sectionTitle, { marginBottom:10 }]}>Comportements notés</Text>
          <View style={S.tagsRow}>
            {data.behaviors.map(b => (
              <View key={b} style={[S.tag, S.tagActive]}>
                <Text style={[S.tagText, S.tagTextActive]}>{b}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <View style={{ backgroundColor:COLORS.successLight, borderRadius:14, padding:14, marginBottom:8 }}>
        <Text style={{ fontSize:13, color:COLORS.success, fontWeight:'700', marginBottom:4 }}>
          ✅ Ces données seront utilisées par le modèle de recommandation
        </Text>
        <Text style={{ fontSize:12, color:COLORS.success, lineHeight:18 }}>
          L'engagement ({data.note}/5), la durée ({data.duree}min) et les comportements observés
          alimenteront le modèle ML pour personnaliser les recommandations futures d'Amine.
        </Text>
      </View>
    </View>
  );
};

// ─── ÉCRAN SUCCÈS ─────────────────────────────────────────────
const SuccessScreen = ({ data, activity, onDone, scale, opacity }) => {
  const moodObj = MOODS.find(m => m.id === data.humeur);
  return (
    <Animated.View style={[S.successContainer, { transform:[{ scale }], opacity }]}>
      <Text style={S.successEmoji}>🎊</Text>
      <Text style={S.successTitle}>Évaluation enregistrée !</Text>
      <Text style={S.successSub}>
        Merci Sara ! Les données de cette séance ont été sauvegardées et seront
        intégrées au modèle de recommandation d'Amine.
      </Text>
      <View style={S.successCard}>
        {[
          { label:'Activité',     value: activity?.nom?.slice(0,28) + (activity?.nom?.length > 28 ? '…' : '') },
          { label:'Note',         value: '⭐'.repeat(data.note)           },
          { label:'Humeur',       value: moodObj ? `${moodObj.emoji} ${moodObj.label}` : '-' },
          { label:'Durée réelle', value: `${data.duree} min`              },
          { label:'Comportements',value: `${data.behaviors?.length || 0} noté(s)` },
        ].map((r, i, arr) => (
          <View key={i} style={[S.successCardRow, i===arr.length-1 && { borderBottomWidth:0 }]}>
            <Text style={S.successCardLabel}>{r.label}</Text>
            <Text style={S.successCardValue}>{r.value}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={S.btnFull} onPress={onDone}>
        <Text style={{ fontSize:18 }}>🎯</Text>
        <Text style={S.btnFullText}>Retour aux activités</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── ÉCRAN PRINCIPAL ─────────────────────────────────────────
export default function FeedbackScreen({ route, navigation }) {
  const activity = route?.params?.activity || {
    id:'4', nom:'Activités de motricité fine à la maison',
    domaine:'Motricité Fine', type:'Développement',
    icon:'✋', color:'#FFB547', gradient:['#FFB547','#FF6B35'],
    engagement_moyen:3.50, succes_pct:82, duree:26};

  const [step,    setStep]    = useState(1);
  const [done,    setDone]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [data,    setData]    = useState({
    note:       0,
    humeur:     '',
    duree:      activity.duree || 20,
    behaviors:  [],
    commentaire:''});

  const update = (patch) => setData(d => ({ ...d, ...patch }));

  // Animations
  const contentAnim = useRef(new Animated.Value(0)).current;
  const contentTY   = useRef(new Animated.Value(24)).current;
  const successScale = useRef(new Animated.Value(0.8)).current;
  const successOp    = useRef(new Animated.Value(0)).current;

  // Animation changement d'étape
  const animateStep = (newStep) => {
    Animated.parallel([
      Animated.timing(contentAnim, { toValue:0, duration:150, useNativeDriver:true }),
      Animated.timing(contentTY,   { toValue:16, duration:150, useNativeDriver:true }),
    ]).start(() => {
      setStep(newStep);
      contentTY.setValue(24);
      Animated.parallel([
        Animated.timing(contentAnim, { toValue:1, duration:300, useNativeDriver:true }),
        Animated.timing(contentTY,   { toValue:0, duration:300, useNativeDriver:true }),
      ]).start();
    });
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentAnim, { toValue:1, duration:400, useNativeDriver:true }),
      Animated.timing(contentTY,   { toValue:0, duration:400, useNativeDriver:true }),
    ]).start();
  }, []);

  const canNext = () => {
    if (step === 1) return data.note > 0 && data.humeur !== '';
    if (step === 2) return data.duree > 0;
    return true;
  };

  const handleNext = () => {
    if (step < 3) { animateStep(step + 1); return; }
    // Étape 3 : envoi
    setLoading(true);
    // Payload pour l'API — colonnes du dataset
    const payload = {
      enfant_id:           1,  // TODO: depuis le contexte auth
      nom_activite:        activity.nom,
      engagement_score:    data.note,
      duree_activite_minutes: data.duree,
      humeur:              data.humeur,
      behaviors:           data.behaviors,
      commentaire:         data.commentaire,
      timestamp:           new Date().toISOString()};
    console.log('[Feedback] Payload ML:', payload);
    // Simulation appel API
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      Animated.parallel([
        Animated.spring(successScale, { toValue:1, damping:18, stiffness:180, useNativeDriver:true }),
        Animated.timing(successOp,    { toValue:1, duration:350, useNativeDriver:true }),
      ]).start();
    }, 900);
  };

  const STEP_LABELS = ['Note & Humeur', 'Durée & Comportements', 'Récapitulatif'];

  return (
    <SafeAreaView style={S.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {done ? (
        <SuccessScreen
          data={data} activity={activity}
          scale={successScale} opacity={successOp}
          onDone={() => navigation?.navigate('Activities')}
        />
      ) : (
        <ScrollView contentContainerStyle={S.container} showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Header — identique structure Login */}
          <View style={S.header}>
            <View style={S.iconBg}>
              <Text style={{ fontSize:34 }}>📝</Text>
            </View>
            <Text style={S.title}>Évaluer la séance</Text>
            <Text style={S.subtitle}>
              Étape {step}/3 — {STEP_LABELS[step-1]}
            </Text>
          </View>

          {/* Stepper */}
          <Stepper step={step} />

          {/* Récap activité */}
          <View style={S.activityRecap}>
            <LinearGradient colors={activity.gradient || ['#7C3AED','#9F67FA']}
              start={{x:0,y:0}} end={{x:1,y:1}} style={S.activityIconWrap}>
              <Text style={{ fontSize:22 }}>{activity.icon || '🎯'}</Text>
            </LinearGradient>
            <View style={{ flex:1 }}>
              <Text style={S.activityName} numberOfLines={1}>{activity.nom}</Text>
              <Text style={S.activityMeta}>{activity.domaine} · {activity.type}</Text>
            </View>
          </View>

          {/* Contenu animé */}
          <Animated.View style={{ opacity:contentAnim, transform:[{ translateY:contentTY }] }}>
            {step===1 && <Step1 data={data} onChange={update} />}
            {step===2 && <Step2 data={data} onChange={update} maxDuration={activity.duree || 30} />}
            {step===3 && <Step3 data={data} activity={activity} />}
          </Animated.View>

          {/* Boutons nav — identiques Login */}
          <View style={S.btnRow}>
            {step > 1 && (
              <TouchableOpacity style={S.btnBack} onPress={() => animateStep(step-1)}>
                <Text style={S.btnBackText}>← Retour</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[S.btnNext, !canNext() && { opacity:0.45 }, step===1 && { flex:1 }]}
              onPress={handleNext}
              disabled={!canNext() || loading}>
              <Text style={S.btnNextText}>
                {loading ? '⏳ Envoi…' : step===3 ? '✅ Envoyer' : 'Suivant →'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height:20 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}