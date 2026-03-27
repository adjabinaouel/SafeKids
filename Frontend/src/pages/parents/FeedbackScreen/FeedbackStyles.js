// src/pages/parents/FeedbackScreen/FeedbackStyles.js
import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const COLORS = {
  primary:      '#7C3AED',
  primaryDark:  '#5B21B6',
  primaryLight: '#F5F3FF',
  primaryMid:   '#EDE9FE',
  background:   '#FFFFFF',
  surface:      '#F8FAFC',
  surfaceAlt:   '#F1F5F9',
  text:         '#1E293B',
  textLight:    '#64748B',
  textMuted:    '#94A3B8',
  border:       '#E2E8F0',
  white:        '#FFFFFF',
  success:      '#10B981',
  successLight: '#D1FAE5',
  warning:      '#F59E0B',
  warningLight: '#FEF3C7',
  error:        '#EF4444',
  errorLight:   '#FEE2E2',
  amber:        '#FFB547',
};

export default StyleSheet.create({

  // ── Layout (identique Login) ──────────────────────────────
  safeArea:  { flex:1, backgroundColor: COLORS.white },
  container: { flexGrow:1, paddingHorizontal:24, paddingBottom:40 },

  // ── Header ────────────────────────────────────────────────
  header: {
    alignItems:'center',
    marginBottom:28,
    paddingTop:8,
  },
  // Icône — identique iconBg du Login
  iconBg: {
    width:80, height:80, borderRadius:24,
    backgroundColor: COLORS.surface,
    justifyContent:'center', alignItems:'center',
    marginBottom:16,
    ...Platform.select({
      ios:     { shadowColor: COLORS.primary, shadowOffset:{width:0,height:8}, shadowOpacity:0.15, shadowRadius:18 },
      android: { elevation:6 },
      web:     { boxShadow:'0 8px 18px rgba(124,58,237,0.15)' },
    }),
  },
  // Titre identique au title du Login
  title: {
    fontSize:26, fontWeight:'800', color: COLORS.text,
    marginBottom:6, textAlign:'center', letterSpacing:-0.5,
  },
  subtitle: {
    fontSize:14, color: COLORS.textLight,
    textAlign:'center', lineHeight:21, paddingHorizontal:16,
  },

  // ── Stepper ───────────────────────────────────────────────
  stepperRow:    { flexDirection:'row', alignItems:'center', marginBottom:28 },
  stepDot: {
    width:30, height:30, borderRadius:15,
    justifyContent:'center', alignItems:'center',
    backgroundColor: COLORS.surface,
    borderWidth:2, borderColor: COLORS.border,
  },
  stepDotActive:    { backgroundColor: COLORS.primary,   borderColor: COLORS.primary   },
  stepDotCompleted: { backgroundColor: COLORS.success,   borderColor: COLORS.success   },
  stepDotText:      { fontSize:12, fontWeight:'800', color: COLORS.textMuted },
  stepDotTextActive:{ color: COLORS.white },
  stepLine:  { flex:1, height:2, backgroundColor: COLORS.border, marginHorizontal:6 },
  stepLineActive:{ backgroundColor: COLORS.primary },

  // ── Carte activité récap (en haut) ────────────────────────
  activityRecap: {
    flexDirection:'row', alignItems:'center', columnGap:14, rowGap:14,
    backgroundColor: COLORS.surface,
    borderRadius:16, padding:14, marginBottom:24,
    borderWidth:1.5, borderColor: COLORS.border,
  },
  activityIconWrap: { width:50, height:50, borderRadius:14, justifyContent:'center', alignItems:'center' },
  activityName:     { fontSize:14, fontWeight:'700', color: COLORS.text, marginBottom:2 },
  activityMeta:     { fontSize:12, color: COLORS.textLight },

  // ── sectionTitle (identique au Login) ─────────────────────
  sectionTitle: {
    fontSize:13, fontWeight:'700', color: COLORS.text,
    marginBottom:12, textTransform:'uppercase', letterSpacing:1.2,
  },

  // ── Étoiles de notation ───────────────────────────────────
  starsRow:  { flexDirection:'row', justifyContent:'center', columnGap:8, rowGap:8, marginBottom:24 },
  starBtn:   { padding:4 },
  starText:  { fontSize:40 },

  // ── Humeur (grille comme roleGrid du Login) ───────────────
  moodGrid:  { flexDirection:'row', flexWrap:'wrap', columnGap:10, rowGap:10, marginBottom:24 },
  moodCard: {
    flex:1, minWidth: (width - 48 - 20) / 3,
    backgroundColor: COLORS.surface,
    borderRadius:16, paddingVertical:16, alignItems:'center',
    borderWidth:2, borderColor: COLORS.surface,
  },
  moodCardActive:   { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  moodEmoji:        { fontSize:28, marginBottom:6 },
  moodLabel:        { fontSize:11, fontWeight:'800', color: COLORS.textLight },
  moodLabelActive:  { color: COLORS.primary },

  // ── Slider durée ─────────────────────────────────────────
  sliderRow:    { flexDirection:'row', justifyContent:'space-between', marginBottom:8 },
  sliderLabel:  { fontSize:12, color: COLORS.textLight, fontWeight:'600' },
  sliderTrack:  { height:8, backgroundColor: COLORS.surface, borderRadius:8, marginBottom:16, overflow:'hidden', borderWidth:1, borderColor: COLORS.border },
  sliderFill:   { height:'100%', borderRadius:8 },
  durationBtns: { flexDirection:'row', columnGap:8, rowGap:8, marginBottom:24 },
  durationBtn: {
    flex:1, paddingVertical:12, borderRadius:14,
    backgroundColor: COLORS.surface, alignItems:'center',
    borderWidth:1.5, borderColor: COLORS.border,
  },
  durationBtnActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  durationBtnText:   { fontSize:13, fontWeight:'700', color: COLORS.textLight },
  durationBtnTextActive: { color: COLORS.primary },

  // ── Zone commentaire (identique inputWrapper Login) ────────
  inputGroup:  { marginBottom:20 },
  inputLabel: {
    fontSize:14, fontWeight:'600', color: COLORS.text,
    marginBottom:6, marginLeft:4,
  },
  inputWrapper: {
    backgroundColor: COLORS.surface,
    borderRadius:14, borderWidth:1.5, borderColor: COLORS.border,
    paddingHorizontal:16, paddingVertical:14, minHeight:100,
  },
  inputWrapperActive: { borderColor: COLORS.primary, backgroundColor: COLORS.white },
  inputText: {
    fontSize:14, color: COLORS.text, fontWeight:'500',
    textAlignVertical:'top', lineHeight:20,
    ...Platform.select({ web: { outlineStyle:'none' } }),
  },

  // ── Tags comportement ─────────────────────────────────────
  tagsRow:  { flexDirection:'row', flexWrap:'wrap', columnGap:8, rowGap:8, marginBottom:24 },
  tag: {
    paddingHorizontal:14, paddingVertical:8,
    backgroundColor: COLORS.surface,
    borderRadius:20, borderWidth:1.5, borderColor: COLORS.border,
  },
  tagActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  tagText:   { fontSize:12, fontWeight:'700', color: COLORS.textLight },
  tagTextActive: { color: COLORS.primary },

  // ── Récap final ───────────────────────────────────────────
  recapCard: {
    backgroundColor: COLORS.surface,
    borderRadius:18, padding:20, marginBottom:20,
    borderWidth:1.5, borderColor: COLORS.border,
  },
  recapRow:    { flexDirection:'row', justifyContent:'space-between', alignItems:'center', paddingVertical:10, borderBottomWidth:1, borderBottomColor: COLORS.border },
  recapLabel:  { fontSize:13, color: COLORS.textLight, fontWeight:'600' },
  recapValue:  { fontSize:14, fontWeight:'700', color: COLORS.text },
  recapNote:   { backgroundColor: COLORS.primaryLight, borderRadius:12, padding:14, marginTop:12 },
  recapNoteText:{ fontSize:13, color: COLORS.primary, lineHeight:20, fontStyle:'italic' },

  // ── Boutons navigation (identiques Login) ─────────────────
  btnRow:  { flexDirection:'row', columnGap:12, rowGap:12, marginTop:8 },
  btnBack: {
    flex:1, height:54, borderRadius:14,
    backgroundColor: COLORS.surface,
    justifyContent:'center', alignItems:'center',
    borderWidth:1.5, borderColor: COLORS.border,
  },
  btnBackText: { fontSize:15, fontWeight:'700', color: COLORS.textLight },
  btnNext: {
    flex:2, height:58, borderRadius:18,
    backgroundColor: COLORS.primary,
    flexDirection:'row', justifyContent:'center', alignItems:'center', columnGap:8, rowGap:8,
    ...Platform.select({
      ios:     { shadowColor: COLORS.primary, shadowOffset:{width:0,height:8}, shadowOpacity:0.3, shadowRadius:12 },
      android: { elevation:8 },
      web:     { boxShadow:'0 8px 12px rgba(124,58,237,0.3)' },
    }),
  },
  btnNextText: { color: COLORS.white, fontSize:16, fontWeight:'700' },
  btnFull: {
    height:58, borderRadius:18,
    backgroundColor: COLORS.primary,
    flexDirection:'row', justifyContent:'center', alignItems:'center', columnGap:8, rowGap:8,
    marginTop:4,
    ...Platform.select({
      ios:     { shadowColor: COLORS.primary, shadowOffset:{width:0,height:8}, shadowOpacity:0.3, shadowRadius:12 },
      android: { elevation:8 },
      web:     { boxShadow:'0 8px 12px rgba(124,58,237,0.3)' },
    }),
  },
  btnFullText: { color: COLORS.white, fontSize:16, fontWeight:'700' },

  // ── Succès animé ──────────────────────────────────────────
  successContainer: { flex:1, justifyContent:'center', alignItems:'center', padding:32 },
  successEmoji:  { fontSize:80, marginBottom:20 },
  successTitle:  { fontSize:28, fontWeight:'800', color: COLORS.text, textAlign:'center', letterSpacing:-0.5, marginBottom:10 },
  successSub:    { fontSize:14, color: COLORS.textLight, textAlign:'center', lineHeight:22, marginBottom:32 },
  successCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius:18, padding:20, width:'100%', marginBottom:28,
    borderWidth:1.5, borderColor: COLORS.primaryMid,
  },
  successCardRow:  { flexDirection:'row', justifyContent:'space-between', paddingVertical:8, borderBottomWidth:1, borderBottomColor: COLORS.primaryMid },
  successCardLabel:{ fontSize:13, color: COLORS.primary, fontWeight:'600' },
  successCardValue:{ fontSize:13, fontWeight:'800', color: COLORS.text },
});