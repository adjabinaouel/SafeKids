// src/pages/parents/Children/ChildrenScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Animated,
  StatusBar, Platform, Dimensions, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import ParentLayout from '../../../components/Navigation/ParentNavigation';

const { width, height } = Dimensions.get('window');

// ─── TOKENS ───────────────────────────────────────────────────────────────────
const THEME = {
  bg:        '#FFFFFF',
  bgSoft:    '#F5F5F8',
  card:      '#FFFFFF',
  cardBorder:'#E8E8F0',
  primary:   '#6C3AED',
  primaryV:  '#8B5CF6',
  accent:    '#4F46E5',
  cyan:      '#06B6D4',
  green:     '#10B981',
  amber:     '#F59E0B',
  rose:      '#F43F5E',
  text:      '#1A1245',
  textSub:   '#4A4580',
  textMuted: '#8884AA',
  white:     '#FFFFFF',
};

const sh = (color, y = 8, op = 0.12, r = 20, el = 4) =>
  Platform.select({
    ios:     { shadowColor: color, shadowOffset: { width: 0, height: y }, shadowOpacity: op, shadowRadius: r },
    android: { elevation: el },
  });

// ─── DONNÉES STATIQUES ────────────────────────────────────────────────────────
const DOCTOR = {
  name:   'Dr. Karim Meziane',
  role:   'Médecin référent · Gère les profils',
  emoji:  '👨‍⚕️',
  color:  '#6C3AED',
  status: 'Actif',
};

const PROFILES = [
  {
    id: 'c1',
    name: 'Amine Benali', firstName: 'Amine',
    age: 5, months: 8,
    emoji: '🧒',
    color: '#F59E0B', colorGrad: ['#F59E0B', '#FBBF24'],
    diagnosis: 'TSA niveau 2',
    programs: ['PECS Phase 2', 'TEACCH'],
    sessions: 46, progress: 74, since: 'Jan 2024',
    radar: {
      labels:   ['Cognitif','Social','Commun.','Émotionnel','Attention','Moteur'],
      current:  [68,45,71,55,60,74],
      previous: [55,30,58,42,48,65],
    },
    domains: [
      { name:'Communication', score:71, prev:58, delta:+13, color:'#6C3AED' },
      { name:'Socialisation',  score:45, prev:30, delta:+15, color:'#3B82F6' },
      { name:'Cognitif',       score:68, prev:55, delta:+13, color:'#06B6D4' },
      { name:'Motricité',      score:74, prev:65, delta:+9,  color:'#10B981' },
      { name:'Attention',      score:60, prev:48, delta:+12, color:'#F59E0B' },
      { name:'Émotionnel',     score:55, prev:42, delta:+13, color:'#F43F5E' },
    ],
    milestones: ['+15% Communication · Nouveau Jalon','PECS Phase 2 maîtrisée','80% succès motricité fine'],
    journal: [
      { date:'24 Mars 2026', mood:'😊', type:'seance',  tag:'Orthophonie', title:'Séance orthophonie',       note:'Bonne progression sur la communication verbale. A initié 3 échanges spontanés.' },
      { date:'20 Mars 2026', mood:'🌟', type:'note',    tag:'Comportement', title:'Observation à domicile',  note:'A joué 20 min avec sa sœur sans incident. Progrès notable sur le partage.' },
      { date:'15 Mars 2026', mood:'😐', type:'seance',  tag:'ABA',          title:'Séance ABA',              note:'Maîtrise 8/10 cibles comportementales. Difficulté sur les transitions.' },
      { date:'10 Mars 2026', mood:'📋', type:'medical', tag:'Médical',      title:'Consultation Dr. Meziane',note:'Réajustement du programme. Introduction de supports visuels renforcés.' },
    ],
    ai: {
      confidence:92, trend:'positive',
      observation:"Amine a utilisé 5 nouveaux mots au petit-déjeuner aujourd'hui ! Nous avons remarqué qu'il est plus engagé après le jeu sensoriel.",
      conseil:"Essayez d'augmenter les sessions sensorielles du matin de 5 minutes pour maximiser l'engagement cognitif.",
      strengths:['Mémoire visuelle exceptionnelle','Forte motivation par les activités structurées','Bonne régulation en milieu familier'],
      challenges:['Transitions entre activités','Interactions en groupe > 3 personnes'],
      goals:['Initier 5 échanges sociaux/jour','Gérer les transitions avec minuterie visuelle'],
    },
  },
  {
    id: 'c2',
    name: 'Lina Bensalem', firstName: 'Lina',
    age: 7, months: 14,
    emoji: '👧',
    color: '#06B6D4', colorGrad: ['#06B6D4','#38BDF8'],
    diagnosis: 'Dysphasie développementale',
    programs: ['Orthophonie intensive','MAKATON'],
    sessions: 32, progress: 88, since: 'Mars 2025',
    radar: {
      labels:   ['Cognitif','Social','Commun.','Émotionnel','Attention','Moteur'],
      current:  [75,70,68,72,80,85],
      previous: [62,55,25,58,68,78],
    },
    domains: [
      { name:'Communication', score:68, prev:25, delta:+43, color:'#06B6D4' },
      { name:'Socialisation',  score:70, prev:55, delta:+15, color:'#6C3AED' },
      { name:'Cognitif',       score:75, prev:62, delta:+13, color:'#3B82F6' },
      { name:'Motricité',      score:85, prev:78, delta:+7,  color:'#10B981' },
      { name:'Attention',      score:80, prev:68, delta:+12, color:'#F59E0B' },
      { name:'Émotionnel',     score:72, prev:58, delta:+14, color:'#F43F5E' },
    ],
    milestones:['Analyse IA mise à jour','Nouvelles recommandations pour Lina','+15% Communication'],
    journal: [
      { date:'23 Mars 2026', mood:'🎉', type:'seance', tag:'Orthophonie', title:'Séance orthophonie', note:'12 nouveaux mots acquis. Longueur des phrases en nette augmentation.' },
      { date:'18 Mars 2026', mood:'😊', type:'note',   tag:'École',       title:'Rapport école',      note:"L'institutrice note une meilleure participation aux activités collectives." },
    ],
    ai: {
      confidence:88, trend:'positive',
      observation:'Lina a produit sa première phrase de 4 mots spontanément lors du repas. Progression spectaculaire en langage expressif !',
      conseil:"Augmenter la durée des séances d'orthophonie de 30 à 45 minutes pour consolider les acquis récents.",
      strengths:['Excellente compréhension réceptive','Forte motivation sociale'],
      challenges:['Expression orale spontanée','Récits narratifs séquentiels'],
      goals:['Produire des phrases de 4-5 mots','Raconter une histoire en 3 étapes'],
    },
  },
];

// ─── RADAR CHART ─────────────────────────────────────────────────────────────
const RadarChart = ({ data, size = 200 }) => {
  const { labels, current, previous } = data;
  const n = labels.length;
  const cx = size / 2, cy = size / 2;
  const R = size * 0.38;
  const levels = [0.25, 0.5, 0.75, 1.0];
  const angle   = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt      = (i, val) => ({ x: cx + (val/100)*R*Math.cos(angle(i)), y: cy + (val/100)*R*Math.sin(angle(i)) });
  const labelPt = (i) => ({ x: cx + (R+18)*Math.cos(angle(i)), y: cy + (R+18)*Math.sin(angle(i)) });

  return (
    <View style={{ width:size, height:size+36, alignSelf:'center' }}>
      <View style={{ width:size, height:size, position:'relative' }}>
        {levels.map((lv, li) => {
          const pts = Array.from({ length:n }, (_,i) => pt(i, lv*100));
          return (
            <View key={li} style={{ position:'absolute', top:0, left:0, width:size, height:size }}>
              {pts.map((p, i) => {
                const next = pts[(i+1)%n];
                const dx = next.x-p.x, dy = next.y-p.y;
                const len = Math.sqrt(dx*dx+dy*dy);
                const ang = Math.atan2(dy,dx)*180/Math.PI;
                return <View key={i} style={{ position:'absolute', left:p.x, top:p.y, width:len, height:1, backgroundColor: lv===1.0?'rgba(108,58,237,0.25)':'rgba(108,58,237,0.10)', transformOrigin:'0 50%', transform:[{rotate:`${ang}deg`}] }} />;
              })}
            </View>
          );
        })}
        {Array.from({ length:n }, (_,i) => {
          const end = pt(i,100);
          const dx = end.x-cx, dy = end.y-cy;
          const len = Math.sqrt(dx*dx+dy*dy);
          const ang = Math.atan2(dy,dx)*180/Math.PI;
          return <View key={i} style={{ position:'absolute', left:cx, top:cy, width:len, height:1, backgroundColor:'rgba(108,58,237,0.20)', transformOrigin:'0 50%', transform:[{rotate:`${ang}deg`}] }} />;
        })}
        <View style={{ position:'absolute', top:0, left:0, width:size, height:size }}>
          {previous.map((v,i) => {
            const p = pt(i,v), next = pt((i+1)%n, previous[(i+1)%n]);
            const dx=next.x-p.x, dy=next.y-p.y, len=Math.sqrt(dx*dx+dy*dy), ang=Math.atan2(dy,dx)*180/Math.PI;
            return <View key={i} style={{ position:'absolute', left:p.x, top:p.y, width:len, height:1.5, backgroundColor:'rgba(168,156,200,0.40)', transformOrigin:'0 50%', transform:[{rotate:`${ang}deg`}] }} />;
          })}
        </View>
        <View style={{ position:'absolute', top:0, left:0, width:size, height:size }}>
          {current.map((v,i) => {
            const p = pt(i,v), next = pt((i+1)%n, current[(i+1)%n]);
            const dx=next.x-p.x, dy=next.y-p.y, len=Math.sqrt(dx*dx+dy*dy), ang=Math.atan2(dy,dx)*180/Math.PI;
            return <View key={i} style={{ position:'absolute', left:p.x, top:p.y, width:len, height:2, backgroundColor:'#6C3AED', transformOrigin:'0 50%', transform:[{rotate:`${ang}deg`}] }} />;
          })}
          {current.map((v,i) => {
            const p = pt(i,v);
            return <View key={`d${i}`} style={{ position:'absolute', left:p.x-5, top:p.y-5, width:10, height:10, borderRadius:5, backgroundColor:'#6C3AED', borderWidth:2, borderColor:'#fff' }} />;
          })}
        </View>
        {labels.map((label, i) => {
          const lp = labelPt(i);
          return <Text key={i} style={{ position:'absolute', left:lp.x-28, top:lp.y-8, width:56, textAlign:'center', fontSize:9, fontWeight:'700', color:THEME.textMuted, letterSpacing:0.3 }}>{label}</Text>;
        })}
      </View>
      <View style={{ flexDirection:'row', justifyContent:'center', gap:20, marginTop:8 }}>
        <View style={{ flexDirection:'row', alignItems:'center', gap:5 }}>
          <View style={{ width:16, height:2, backgroundColor:'#6C3AED', borderRadius:1 }} />
          <Text style={{ fontSize:10, color:THEME.textMuted }}>Actuel</Text>
        </View>
        <View style={{ flexDirection:'row', alignItems:'center', gap:5 }}>
          <View style={{ width:16, height:2, backgroundColor:'rgba(168,156,200,0.50)', borderRadius:1 }} />
          <Text style={{ fontSize:10, color:THEME.textMuted }}>Précédent</Text>
        </View>
      </View>
    </View>
  );
};

// ─── SCORE BAR ────────────────────────────────────────────────────────────────
const ScoreBar = ({ score, prev, color }) => (
  <View style={{ height:5, backgroundColor:'rgba(0,0,0,0.06)', borderRadius:99, overflow:'hidden', position:'relative' }}>
    <LinearGradient colors={[color+'AA', color]} start={{x:0,y:0}} end={{x:1,y:0}} style={{ width:`${score}%`, height:'100%', borderRadius:99 }} />
    <View style={{ position:'absolute', left:`${prev}%`, top:-1, width:2, height:7, backgroundColor:'rgba(0,0,0,0.20)', borderRadius:1 }} />
  </View>
);

// ─── MODAL DOSSIER ────────────────────────────────────────────────────────────
const DossierModal = ({ child, visible, onClose }) => {
  const [tab, setTab] = useState('courbe');
  const slideY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) setTab('courbe');
    Animated.spring(slideY, { toValue: visible ? 0 : height, tension:70, friction:14, useNativeDriver:true }).start();
  }, [visible]);

  if (!child) return null;

  const TABS = [
    { key:'courbe',  icon:'activity',  label:'Courbe'     },
    { key:'journal', icon:'book-open', label:'Journal'    },
    { key:'ai',      icon:'cpu',       label:'Analyse IA' },
  ];

  const CourbeTab = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:30 }}>
      <View style={{ backgroundColor:'#F0FDF4', borderRadius:14, padding:12, marginBottom:16, borderWidth:1, borderColor:'#BBF7D0', flexDirection:'row', alignItems:'center', gap:8 }}>
        <Text style={{ fontSize:20, fontWeight:'900', color:THEME.green }}>+15%</Text>
        <View style={{ backgroundColor:THEME.green, borderRadius:20, paddingHorizontal:8, paddingVertical:3, marginLeft:4 }}>
          <Text style={{ fontSize:10, fontWeight:'800', color:'#fff' }}>Nouveau Jalon</Text>
        </View>
        <Text style={{ fontSize:12, color:THEME.textSub, flex:1 }}>Communication & Habiletés Sociales</Text>
      </View>
      <View style={{ backgroundColor:THEME.bgSoft, borderRadius:20, padding:20, borderWidth:1, borderColor:THEME.cardBorder, marginBottom:16, alignItems:'center' }}>
        <View style={{ flexDirection:'row', justifyContent:'space-between', width:'100%', marginBottom:16 }}>
          <Text style={{ fontSize:14, fontWeight:'800', color:THEME.text }}>Progression Globale</Text>
          <Text style={{ fontSize:11, color:THEME.textMuted }}>30 derniers jours</Text>
        </View>
        <RadarChart data={child.radar} size={width - 120} />
      </View>
      <View style={{ flexDirection:'row', flexWrap:'wrap', gap:10 }}>
        {child.domains.map((d, i) => (
          <View key={i} style={{ width:(width-56)/2, backgroundColor:THEME.card, borderRadius:16, padding:14, borderWidth:1, borderColor:THEME.cardBorder, ...sh(d.color,4,0.08,12,3) }}>
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <Text style={{ fontSize:10, fontWeight:'700', color:THEME.textMuted, textTransform:'uppercase', letterSpacing:0.8 }}>{d.name}</Text>
              <View style={{ backgroundColor:d.color+'18', borderRadius:20, paddingHorizontal:7, paddingVertical:2, borderWidth:1, borderColor:d.color+'30' }}>
                <Text style={{ fontSize:10, fontWeight:'800', color:d.color }}>+{d.delta}</Text>
              </View>
            </View>
            <Text style={{ fontSize:28, fontWeight:'900', color:THEME.text, marginBottom:6 }}>{d.score}%</Text>
            <ScoreBar score={d.score} prev={d.prev} color={d.color} />
            <Text style={{ fontSize:10, color:THEME.textMuted, marginTop:5 }}>Départ : {d.prev}%</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const JournalTab = () => {
    const typeColors = { seance:THEME.primary, note:THEME.green, medical:THEME.rose };
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:30 }}>
        {child.journal.map((e, i) => {
          const tc = typeColors[e.type] || THEME.amber;
          return (
            <View key={i} style={{ backgroundColor:THEME.card, borderRadius:18, padding:16, marginBottom:10, borderWidth:1, borderColor:THEME.cardBorder, overflow:'hidden', ...sh('#000',3,0.06,10,2) }}>
              <View style={{ position:'absolute', left:0, top:0, bottom:0, width:3, backgroundColor:tc, borderTopLeftRadius:18, borderBottomLeftRadius:18 }} />
              <View style={{ paddingLeft:8 }}>
                <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <View style={{ flexDirection:'row', alignItems:'center', gap:8, flex:1 }}>
                    <Text style={{ fontSize:20 }}>{e.mood}</Text>
                    <Text style={{ fontSize:14, fontWeight:'800', color:THEME.text, flex:1 }}>{e.title}</Text>
                  </View>
                  <View style={{ backgroundColor:tc+'18', borderRadius:20, paddingHorizontal:10, paddingVertical:3, borderWidth:1, borderColor:tc+'30' }}>
                    <Text style={{ fontSize:10, fontWeight:'800', color:tc }}>{e.tag}</Text>
                  </View>
                </View>
                <Text style={{ fontSize:11, color:THEME.textMuted, marginBottom:6 }}>{e.date}</Text>
                <Text style={{ fontSize:13, color:THEME.textSub, lineHeight:19 }}>{e.note}</Text>
              </View>
            </View>
          );
        })}
        <TouchableOpacity style={{ height:50, borderRadius:15, backgroundColor:THEME.primary, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, ...sh(THEME.primary,6,0.30,14,5) }}>
          <Feather name="plus-circle" size={16} color="#fff" />
          <Text style={{ fontSize:14, fontWeight:'800', color:'#fff' }}>Nouvelle entrée</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const AITab = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:30 }}>
      <LinearGradient colors={[THEME.primary, THEME.primaryV]} start={{x:0,y:0}} end={{x:1,y:1}} style={{ borderRadius:18, padding:18, marginBottom:14, overflow:'hidden' }}>
        <View style={{ position:'absolute', right:-40, top:-40, width:130, height:130, borderRadius:65, backgroundColor:'rgba(255,255,255,0.10)' }} />
        <View style={{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:12 }}>
          <View style={{ width:40, height:40, borderRadius:13, backgroundColor:'rgba(255,255,255,0.20)', justifyContent:'center', alignItems:'center' }}>
            <Text style={{ fontSize:20 }}>✨</Text>
          </View>
          <View style={{ flex:1 }}>
            <Text style={{ fontSize:15, fontWeight:'800', color:'#fff' }}>Analyses IA</Text>
            <Text style={{ fontSize:12, color:'rgba(255,255,255,0.75)' }}>Confiance : {child.ai.confidence}%</Text>
          </View>
          <View style={{ backgroundColor:'rgba(255,255,255,0.20)', borderRadius:12, paddingHorizontal:10, paddingVertical:5 }}>
            <Text style={{ fontSize:14, fontWeight:'900', color:'#fff' }}>{child.ai.confidence}%</Text>
          </View>
        </View>
        <View style={{ backgroundColor:'rgba(255,255,255,0.15)', borderRadius:14, padding:14 }}>
          <Text style={{ fontSize:10, fontWeight:'700', color:'rgba(255,255,255,0.65)', letterSpacing:1, marginBottom:8, textTransform:'uppercase' }}>OBSERVATION QUOTIDIENNE</Text>
          <Text style={{ fontSize:13, color:'#fff', lineHeight:21 }}>{child.ai.observation}</Text>
        </View>
      </LinearGradient>
      <View style={{ backgroundColor:'#FFF7ED', borderRadius:16, padding:16, marginBottom:14, borderWidth:1, borderColor:'#FED7AA' }}>
        <Text style={{ fontSize:10, fontWeight:'700', color:THEME.amber, letterSpacing:1, marginBottom:10, textTransform:'uppercase' }}>💡 Conseil pratique</Text>
        <Text style={{ fontSize:13, color:THEME.textSub, lineHeight:20 }}>{child.ai.conseil}</Text>
      </View>
      {[
        { title:'Points forts',          icon:'zap',            color:THEME.green,   items:child.ai.strengths,  bullet:'check'       },
        { title:'Défis à travailler',    icon:'alert-triangle', color:THEME.amber,   items:child.ai.challenges, bullet:'arrow-right' },
        { title:'Objectifs recommandés', icon:'target',         color:THEME.primary, items:child.ai.goals,      numbered:true        },
      ].map((sec, si) => (
        <View key={si} style={{ backgroundColor:THEME.card, borderRadius:16, padding:16, marginBottom:12, borderWidth:1, borderColor:THEME.cardBorder, ...sh('#000',3,0.05,10,2) }}>
          <View style={{ flexDirection:'row', alignItems:'center', gap:8, marginBottom:12 }}>
            <View style={{ width:30, height:30, borderRadius:10, backgroundColor:sec.color+'18', justifyContent:'center', alignItems:'center' }}>
              <Feather name={sec.icon} size={14} color={sec.color} />
            </View>
            <Text style={{ fontSize:14, fontWeight:'800', color:THEME.text }}>{sec.title}</Text>
          </View>
          {sec.items.map((item, i) => (
            <View key={i} style={{ flexDirection:'row', alignItems:'flex-start', gap:10, marginBottom:8 }}>
              {sec.numbered ? (
                <View style={{ width:22, height:22, borderRadius:7, backgroundColor:sec.color, justifyContent:'center', alignItems:'center', flexShrink:0 }}>
                  <Text style={{ fontSize:10, fontWeight:'900', color:'#fff' }}>{i+1}</Text>
                </View>
              ) : (
                <View style={{ width:22, height:22, borderRadius:7, backgroundColor:sec.color+'18', justifyContent:'center', alignItems:'center', flexShrink:0, marginTop:1 }}>
                  <Feather name={sec.bullet || 'check'} size={11} color={sec.color} />
                </View>
              )}
              <Text style={{ fontSize:13, color:THEME.textSub, lineHeight:20, flex:1 }}>{item}</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.35)' }}>
        <Animated.View style={{ flex:1, transform:[{translateY:slideY}], backgroundColor:THEME.bg, borderTopLeftRadius:30, borderTopRightRadius:30, marginTop: Platform.OS==='ios' ? 48 : 28, overflow:'hidden' }}>
          <LinearGradient
            colors={[child.colorGrad[0]+'CC', child.colorGrad[1]+'66', THEME.bg]}
            start={{x:0,y:0}} end={{x:1,y:1.4}}
            style={{ paddingHorizontal:20, paddingTop:24, paddingBottom:0, overflow:'hidden' }}
          >
            <View style={{ position:'absolute', right:-50, top:-50, width:180, height:180, borderRadius:90, backgroundColor:'rgba(255,255,255,0.30)' }} />
            <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
              <TouchableOpacity onPress={onClose} style={{ width:40, height:40, borderRadius:13, backgroundColor:'rgba(255,255,255,0.60)', borderWidth:1, borderColor:'rgba(255,255,255,0.80)', justifyContent:'center', alignItems:'center' }}>
                <Feather name="arrow-left" size={18} color={THEME.text} />
              </TouchableOpacity>
              <Text style={{ fontSize:11, fontWeight:'700', color:THEME.text, letterSpacing:1.2 }}>DOSSIER MÉDICAL</Text>
              <View style={{ width:40 }} />
            </View>
            <View style={{ flexDirection:'row', alignItems:'center', gap:14, marginBottom:20 }}>
              <View style={{ width:60, height:60, borderRadius:20, backgroundColor:'rgba(255,255,255,0.65)', borderWidth:2, borderColor:'rgba(255,255,255,0.85)', justifyContent:'center', alignItems:'center' }}>
                <Text style={{ fontSize:30 }}>{child.emoji}</Text>
              </View>
              <View style={{ flex:1 }}>
                <Text style={{ fontSize:22, fontWeight:'800', color:THEME.text, letterSpacing:-0.5 }}>{child.name}</Text>
                <Text style={{ fontSize:12, color:THEME.textSub, marginTop:2 }}>{child.age} ans · {child.diagnosis}</Text>
                <View style={{ flexDirection:'row', gap:6, marginTop:6, flexWrap:'wrap' }}>
                  {child.programs.map((p, i) => (
                    <View key={i} style={{ backgroundColor:'rgba(255,255,255,0.65)', borderRadius:20, paddingHorizontal:10, paddingVertical:3, borderWidth:1, borderColor:'rgba(255,255,255,0.85)' }}>
                      <Text style={{ fontSize:10, fontWeight:'700', color:THEME.text }}>{p}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            <View style={{ flexDirection:'row', gap:5, backgroundColor:'rgba(255,255,255,0.55)', borderRadius:16, padding:4, borderWidth:1, borderColor:'rgba(255,255,255,0.75)' }}>
              {TABS.map(t => {
                const active = tab === t.key;
                return (
                  <TouchableOpacity key={t.key} onPress={() => setTab(t.key)} style={{ flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:5, paddingVertical:9, borderRadius:12, backgroundColor: active ? THEME.primary : 'transparent' }}>
                    <Feather name={t.icon} size={13} color={active ? '#fff' : THEME.textSub} />
                    <Text style={{ fontSize:12, fontWeight:'700', color: active ? '#fff' : THEME.textSub }}>{t.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </LinearGradient>
          <View style={{ flex:1, padding:18, backgroundColor:THEME.bgSoft }}>
            {tab==='courbe'  && <CourbeTab />}
            {tab==='journal' && <JournalTab />}
            {tab==='ai'      && <AITab />}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ─── MINI CARD ENFANT ─────────────────────────────────────────────────────────
const MiniChildCard = ({ child, selected, onPress }) => (
  <TouchableOpacity onPress={() => onPress(child)} activeOpacity={0.85} style={{
    width:110, alignItems:'center',
    backgroundColor: selected ? THEME.card : THEME.bgSoft,
    borderRadius:20, padding:14,
    borderWidth: selected ? 2 : 1,
    borderColor: selected ? child.color : THEME.cardBorder,
    overflow:'hidden',
    ...sh(selected ? child.color : '#000', selected ? 8 : 2, selected ? 0.18 : 0.04, selected ? 18 : 8, selected ? 5 : 2),
  }}>
    {selected && (
      <LinearGradient colors={[child.color+'15', 'transparent']} style={{ position:'absolute', top:0, left:0, right:0, bottom:0 }} />
    )}
    <View style={{ position:'relative', width:62, height:62, marginBottom:8 }}>
      <View style={{ width:62, height:62, borderRadius:31, backgroundColor:child.color+'22', borderWidth:2.5, borderColor:child.color+'40', justifyContent:'center', alignItems:'center' }}>
        <Text style={{ fontSize:26 }}>{child.emoji}</Text>
      </View>
      <View style={{ position:'absolute', bottom:-4, left:'50%', marginLeft:-22, backgroundColor:THEME.card, borderRadius:12, paddingHorizontal:6, paddingVertical:2, borderWidth:1, borderColor:child.color+'50', ...sh(child.color,2,0.15,6,2) }}>
        <Text style={{ fontSize:11, fontWeight:'900', color:child.color }}>{child.progress}%</Text>
      </View>
    </View>
    <Text style={{ fontSize:13, fontWeight:'800', color:THEME.text, marginBottom:2 }}>{child.firstName}</Text>
    <Text style={{ fontSize:10, color:THEME.textMuted }}>{child.age} ans · {child.months} mois</Text>
    <Text style={{ fontSize:9, color:THEME.textMuted, marginTop:2, textAlign:'center' }}>Progression</Text>
  </TouchableOpacity>
);

// ─── CARD PROFIL COMPLET ──────────────────────────────────────────────────────
const ProfileCard = ({ child, onOpen }) => {
  const totalDelta = child.domains.reduce((a, d) => a + d.delta, 0);
  return (
    <View style={{ backgroundColor:THEME.card, borderRadius:24, overflow:'hidden', borderWidth:1, borderColor:THEME.cardBorder, ...sh(child.color,10,0.15,24,6) }}>
      <LinearGradient
        colors={[child.colorGrad[0]+'CC', child.colorGrad[1]+'88', THEME.card]}
        start={{x:0,y:0}} end={{x:1,y:1.5}}
        style={{ padding:20, paddingBottom:24, overflow:'hidden' }}
      >
        <View style={{ position:'absolute', right:-50, top:-40, width:200, height:200, borderRadius:100, backgroundColor:'rgba(255,255,255,0.30)' }} />
        <View style={{ flexDirection:'row', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
          <View style={{ flexDirection:'row', alignItems:'center', gap:14 }}>
            <View style={{ width:64, height:64, borderRadius:22, backgroundColor:'rgba(255,255,255,0.60)', borderWidth:2, borderColor:'rgba(255,255,255,0.85)', justifyContent:'center', alignItems:'center', overflow:'hidden' }}>
              <Text style={{ fontSize:32 }}>{child.emoji}</Text>
            </View>
            <View>
              <Text style={{ fontSize:20, fontWeight:'800', color:THEME.text, letterSpacing:-0.4 }}>{child.name}</Text>
              <Text style={{ fontSize:12, color:THEME.textSub, marginTop:2 }}>{child.age} ans · {child.months} mois</Text>
              <View style={{ flexDirection:'row', gap:6, marginTop:6 }}>
                {child.programs.slice(0,1).map((p, i) => (
                  <View key={i} style={{ backgroundColor:'rgba(255,255,255,0.60)', borderRadius:20, paddingHorizontal:10, paddingVertical:3, borderWidth:1, borderColor:'rgba(255,255,255,0.85)' }}>
                    <Text style={{ fontSize:10, fontWeight:'700', color:THEME.text }}>{p}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          <View style={{ backgroundColor:'rgba(255,255,255,0.60)', borderRadius:14, paddingHorizontal:12, paddingVertical:8, borderWidth:1, borderColor:'rgba(255,255,255,0.85)', alignItems:'center' }}>
            <Text style={{ fontSize:22, fontWeight:'900', color:THEME.text }}>{child.progress}%</Text>
            <Text style={{ fontSize:9, color:THEME.textSub }}>score</Text>
          </View>
        </View>
        <View style={{ backgroundColor:'rgba(255,255,255,0.50)', borderRadius:12, padding:11, borderWidth:1, borderColor:'rgba(255,255,255,0.75)', marginBottom:14 }}>
          <Text style={{ fontSize:9, color:THEME.textSub, fontWeight:'700', letterSpacing:0.9, marginBottom:3, textTransform:'uppercase' }}>DIAGNOSTIC</Text>
          <Text style={{ fontSize:12.5, color:THEME.text, lineHeight:18 }}>{child.diagnosis}</Text>
        </View>
        <View style={{ flexDirection:'row', gap:8 }}>
          {[
            { icon:'calendar',    label:'Séances', value:child.sessions    },
            { icon:'trending-up', label:'Progrès', value:`+${totalDelta}` },
            { icon:'clock',       label:'Depuis',  value:child.since       },
          ].map((s, i) => (
            <View key={i} style={{ flex:1, backgroundColor:'rgba(255,255,255,0.55)', borderRadius:12, paddingVertical:10, alignItems:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.80)' }}>
              <Feather name={s.icon} size={12} color={THEME.textSub} style={{ marginBottom:4 }} />
              <Text style={{ fontSize:13, fontWeight:'800', color:THEME.text }}>{s.value}</Text>
              <Text style={{ fontSize:8, color:THEME.textMuted, marginTop:1, textTransform:'uppercase', letterSpacing:0.3 }}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={{ padding:20, paddingTop:16 }}>
        <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <Text style={{ fontSize:13, fontWeight:'700', color:THEME.text }}>Domaines clés</Text>
          <View style={{ backgroundColor:THEME.green+'18', borderRadius:20, paddingHorizontal:10, paddingVertical:3, borderWidth:1, borderColor:THEME.green+'30' }}>
            <Text style={{ fontSize:10, fontWeight:'800', color:THEME.green }}>+{totalDelta} pts total</Text>
          </View>
        </View>
        {child.domains.slice(0,3).map((d, i) => (
          <View key={i} style={{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:10 }}>
            <View style={{ width:28, height:28, borderRadius:9, backgroundColor:d.color+'18', borderWidth:1, borderColor:d.color+'30', justifyContent:'center', alignItems:'center', flexShrink:0 }}>
              <Text style={{ fontSize:10, fontWeight:'900', color:d.color }}>{d.score}</Text>
            </View>
            <View style={{ flex:1 }}>
              <View style={{ flexDirection:'row', justifyContent:'space-between', marginBottom:4 }}>
                <Text style={{ fontSize:12, fontWeight:'600', color:THEME.text }}>{d.name}</Text>
                <Text style={{ fontSize:10, color:THEME.green, fontWeight:'700' }}>+{d.delta}</Text>
              </View>
              <ScoreBar score={d.score} prev={d.prev} color={d.color} />
            </View>
          </View>
        ))}
        <TouchableOpacity onPress={onOpen} style={{ marginTop:14, height:50, borderRadius:15, backgroundColor:child.color, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8, ...sh(child.color,6,0.30,16,5) }}>
          <Feather name="folder-open" size={16} color="#fff" />
          <Text style={{ fontSize:14, fontWeight:'800', color:'#fff' }}>Ouvrir le dossier complet</Text>
          <Feather name="chevron-right" size={15} color="rgba(255,255,255,0.65)" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── ÉCRAN PRINCIPAL ──────────────────────────────────────────────────────────
export default function ChildrenScreen({ navigation }) {
  const [selectedChild, setSelected] = useState(PROFILES[0]);
  const [modal, setModal]            = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(headerAnim, { toValue:1, tension:55, friction:8, useNativeDriver:true }).start();
  }, []);

  return (
    <ParentLayout activeTab="children">
      <View style={{ flex:1, backgroundColor:THEME.bg }}>
        <StatusBar barStyle="dark-content" backgroundColor={THEME.bg} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom:110 }}>

          {/* ── HEADER ── */}
          <LinearGradient
            colors={['#EDE9FF', '#F3F0FF', THEME.bg]}
            start={{x:0,y:0}} end={{x:0,y:1}}
            style={{ paddingTop: Platform.OS==='ios' ? 58 : 34, paddingBottom:24, overflow:'hidden' }}
          >
            <View style={{ position:'absolute', right:-60, top:-60, width:250, height:250, borderRadius:125, backgroundColor:'#6C3AED', opacity:0.07 }} />
            <View style={{ position:'absolute', left:-40, bottom:0, width:200, height:200, borderRadius:100, backgroundColor:'#06B6D4', opacity:0.05 }} />

            <Animated.View style={{
              opacity: headerAnim,
              transform: [{ translateY: headerAnim.interpolate({ inputRange:[0,1], outputRange:[-12,0] }) }],
              paddingHorizontal:22,
            }}>
              <Text style={{ fontSize:12, color:THEME.textMuted, fontWeight:'500', marginBottom:4 }}>Bonjour, Sara</Text>
              <Text style={{ fontSize:30, fontWeight:'800', letterSpacing:-0.8, marginBottom:20 }}>
                <Text style={{ color:THEME.text }}>Mes </Text>
                <Text style={{ color:THEME.primary }}>Enfants</Text>
              </Text>

              {/* Médecin référent */}
              <View style={{ flexDirection:'row', alignItems:'center', gap:12, backgroundColor:THEME.card, borderRadius:18, padding:14, borderWidth:1, borderColor:THEME.cardBorder, ...sh(THEME.primary,4,0.08,14,4) }}>
                <View style={{ width:46, height:46, borderRadius:16, backgroundColor:THEME.primary+'15', borderWidth:1.5, borderColor:THEME.primary+'25', justifyContent:'center', alignItems:'center' }}>
                  <Text style={{ fontSize:24 }}>{DOCTOR.emoji}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={{ fontSize:15, fontWeight:'800', color:THEME.text }}>{DOCTOR.name}</Text>
                  <Text style={{ fontSize:11.5, color:THEME.textSub, marginTop:2 }}>{DOCTOR.role}</Text>
                </View>
                <View style={{ backgroundColor:THEME.green+'18', borderRadius:20, paddingHorizontal:12, paddingVertical:5, borderWidth:1, borderColor:THEME.green+'30' }}>
                  <Text style={{ fontSize:11, fontWeight:'800', color:THEME.green }}>{DOCTOR.status}</Text>
                </View>
              </View>
            </Animated.View>
          </LinearGradient>

          {/* ── SÉLECTEUR ENFANTS ── */}
          <View style={{ paddingHorizontal:22, marginBottom:20 }}>
            <Text style={{ fontSize:10, fontWeight:'700', color:THEME.textMuted, letterSpacing:1.3, marginBottom:14, textTransform:'uppercase' }}>
              ENFANTS SUIVIS
            </Text>
            <View style={{ flexDirection:'row', gap:12, flexWrap:'wrap' }}>
              {PROFILES.map((child) => (
                <MiniChildCard key={child.id} child={child} selected={selectedChild?.id===child.id} onPress={setSelected} />
              ))}
              <View style={{ width:110, alignItems:'center', backgroundColor:THEME.bgSoft, borderRadius:20, padding:14, borderWidth:1.5, borderColor:THEME.cardBorder, borderStyle:'dashed', justifyContent:'center', minHeight:130 }}>
                <View style={{ width:38, height:38, borderRadius:12, backgroundColor:THEME.primary+'10', justifyContent:'center', alignItems:'center', marginBottom:8, borderWidth:1, borderColor:THEME.primary+'20' }}>
                  <Feather name="lock" size={16} color={THEME.textMuted} />
                </View>
                <Text style={{ fontSize:11, color:THEME.textMuted, textAlign:'center', lineHeight:16 }}>Ajouté par le médecin</Text>
              </View>
            </View>
          </View>

          {/* ── PROFIL SÉLECTIONNÉ ── */}
          {selectedChild && (
            <View style={{ paddingHorizontal:18 }}>
              <ProfileCard child={selectedChild} onOpen={() => setModal(true)} />
            </View>
          )}
        </ScrollView>

        <DossierModal child={selectedChild} visible={modal} onClose={() => setModal(false)} />
      </View>
    </ParentLayout>
  );
}