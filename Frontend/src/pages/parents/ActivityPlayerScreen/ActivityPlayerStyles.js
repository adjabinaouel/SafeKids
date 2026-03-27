import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
  primary:      '#7C3AED',
  primaryDark:  '#5B21B6',
  primaryLight: '#F5F3FF',
  background:   '#FFFFFF',
  surface:      '#F8FAFC',
  text:         '#1E293B',
  textLight:    '#64748B',
  textMuted:    '#94A3B8',
  border:       '#E2E8F0',
  white:        '#FFFFFF',
  black:        '#000000',
  success:      '#10B981',
  successLight: '#D1FAE5',
  warning:      '#F59E0B',
  error:        '#EF4444',
};

export default StyleSheet.create({

  // ── Layout ────────────────────────────────────────────────
  safeArea:       { flex:1, backgroundColor: COLORS.black },
  videoZone:      { width:'100%', backgroundColor: COLORS.black, position:'relative' },
  webview:        { flex:1, backgroundColor: COLORS.black },

  // ── Overlay vidéo ────────────────────────────────────────
  overlay:       { position:'absolute', top:0, left:0, right:0, bottom:0, justifyContent:'space-between', padding:14 },
  overlayTop:    { flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  overlayBottom: { columnGap:8, rowGap:8 },

  // Bouton retour — même forme que sectionTitle du Login (borderRadius:14)
  backBtn: {
    flexDirection:'row', alignItems:'center', columnGap:6, rowGap:6,
    backgroundColor:'rgba(0,0,0,0.45)',
    borderRadius:14, paddingHorizontal:14, paddingVertical:8,
    borderWidth:1, borderColor:'rgba(255,255,255,0.15)',
  },
  backBtnText: { color: COLORS.white, fontSize:13, fontWeight:'700' },

  // Timer pill
  timerPill: {
    flexDirection:'row', alignItems:'center', columnGap:6, rowGap:6,
    backgroundColor:'rgba(0,0,0,0.45)',
    borderRadius:14, paddingHorizontal:12, paddingVertical:8,
    borderWidth:1, borderColor:'rgba(255,255,255,0.15)',
  },
  timerText: { fontSize:14, fontWeight:'800', color: COLORS.white, letterSpacing:1 },

  // Notes btn
  notesBtn: {
    backgroundColor:'rgba(124,58,237,0.75)',
    borderRadius:14, paddingHorizontal:12, paddingVertical:8,
    borderWidth:1, borderColor:'rgba(255,255,255,0.25)',
  },
  notesBtnText: { color: COLORS.white, fontSize:12, fontWeight:'700' },

  // Play/Pause central
  playPauseBtn: {
    alignSelf:'center',
    width:68, height:68, borderRadius:34,
    backgroundColor:'rgba(255,255,255,0.2)',
    borderWidth:2, borderColor:'rgba(255,255,255,0.4)',
    justifyContent:'center', alignItems:'center',
  },
  playPauseIcon: { fontSize:28 },

  // Barre de progression
  progressTrack: { height:4, backgroundColor:'rgba(255,255,255,0.25)', borderRadius:4, overflow:'hidden' },
  progressFill:  { height:'100%', borderRadius:4 },
  progressRow:   { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:4 },
  progressText:  { color:'rgba(255,255,255,0.75)', fontSize:11, fontWeight:'600' },
  fullscreenBtn: { padding:4 },

  // ── Info section (sous la vidéo) ─────────────────────────
  infoScroll:     { flex:1, backgroundColor: COLORS.surface },

  // Carte info — même surface que les inputWrapper du Login
  infoCard: {
    flexDirection:'row', alignItems:'center', columnGap:14, rowGap:14,
    backgroundColor: COLORS.white,
    padding:16, marginBottom:1,
    ...Platform.select({
      ios:     { shadowColor:'#1E293B', shadowOffset:{ width:0, height:2 }, shadowOpacity:0.06, shadowRadius:6 },
      android: { elevation:3 },
      web:     { boxShadow:'0 2px 6px rgba(30,41,59,0.06)' },
    }),
  },
  infoIconWrap:  { width:52, height:52, borderRadius:16, justifyContent:'center', alignItems:'center' },
  infoTitle:     { fontSize:15, fontWeight:'700', color: COLORS.text, marginBottom:2, letterSpacing:-0.2 },
  infoSubtitle:  { fontSize:12, color: COLORS.textLight },
  infoSuccessBadge: {
    paddingHorizontal:10, paddingVertical:4,
    backgroundColor: COLORS.successLight,
    borderRadius:20,
  },
  infoSuccessText: { fontSize:12, fontWeight:'800', color: COLORS.success },

  // Stats row (3 cartes)
  statsRow:     { flexDirection:'row', columnGap:10, rowGap:10, padding:16, paddingBottom:0 },
  statCard: {
    flex:1, backgroundColor: COLORS.white, borderRadius:14,
    padding:12, alignItems:'center',
    borderWidth:1.5, borderColor: COLORS.border,
    ...Platform.select({
      ios:     { shadowColor:'#1E293B', shadowOffset:{width:0,height:2}, shadowOpacity:0.05, shadowRadius:4 },
      android: { elevation:2 },
      web:     { boxShadow:'0 2px 4px rgba(30,41,59,0.05)' },
    }),
  },
  statIcon:  { fontSize:20, marginBottom:4 },
  statValue: { fontSize:15, fontWeight:'800', color: COLORS.text, marginBottom:2 },
  statLabel: { fontSize:10, color: COLORS.textLight },

  // Section cartes (matériel, notes)
  section: {
    backgroundColor: COLORS.white,
    borderRadius:16, margin:16, marginBottom:0,
    padding:16,
    borderWidth:1, borderColor: COLORS.border,
    ...Platform.select({
      ios:     { shadowColor:'#1E293B', shadowOffset:{width:0,height:2}, shadowOpacity:0.05, shadowRadius:6 },
      android: { elevation:2 },
      web:     { boxShadow:'0 2px 6px rgba(30,41,59,0.05)' },
    }),
  },
  sectionTitle: {
    fontSize:12, fontWeight:'800', color: COLORS.text,
    textTransform:'uppercase', letterSpacing:0.9, marginBottom:8,
  },
  sectionText: { fontSize:13, color: COLORS.textLight, lineHeight:20 },

  // Notes preview clickable
  notesPreview: {
    flexDirection:'row', alignItems:'center', justifyContent:'space-between',
    backgroundColor: COLORS.white,
    borderRadius:16, margin:16, marginBottom:0, padding:16,
    borderWidth:1, borderColor: COLORS.border,
    ...Platform.select({
      ios:     { shadowColor:'#1E293B', shadowOffset:{width:0,height:2}, shadowOpacity:0.05, shadowRadius:6 },
      android: { elevation:2 },
      web:     { boxShadow:'0 2px 6px rgba(30,41,59,0.05)' },
    }),
  },
  notesPreviewLeft:  { flexDirection:'row', alignItems:'center', columnGap:12, rowGap:12 },
  notesPreviewTitle: { fontSize:14, fontWeight:'700', color: COLORS.text, marginBottom:2 },
  notesPreviewSub:   { fontSize:11, color: COLORS.textLight },
  notesArrow:        { fontSize:22, color: COLORS.textMuted },

  // Bouton Terminer — identique au primaryButton du Login
  endBtn: {
    backgroundColor: COLORS.primary,
    height:58, borderRadius:18,
    flexDirection:'row', justifyContent:'center', alignItems:'center', columnGap:8, rowGap:8,
    margin:16, marginTop:20,
    ...Platform.select({
      ios:     { shadowColor: COLORS.primary, shadowOffset:{ width:0, height:8 }, shadowOpacity:0.3, shadowRadius:12 },
      android: { elevation:8 },
      web:     { boxShadow:'0 8px 12px rgba(124,58,237,0.3)' },
    }),
  },
  endBtnText: { color: COLORS.white, fontSize:16, fontWeight:'700' },

  // ── Modal Notes ───────────────────────────────────────────
  modalOverlay:  { flex:1, backgroundColor:'rgba(15,23,42,0.6)', justifyContent:'flex-end' },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius:28, borderTopRightRadius:28,
    paddingHorizontal:24, paddingBottom:40,
    maxHeight: height * 0.72,
    ...Platform.select({
      ios:     { shadowColor:'#7C3AED', shadowOffset:{width:0,height:-4}, shadowOpacity:0.15, shadowRadius:20 },
      android: { elevation:16 },
      web:     { boxShadow:'0 -4px 20px rgba(124,58,237,0.15)' },
    }),
  },
  modalHandle:      { width:40, height:4, backgroundColor: COLORS.border, borderRadius:4, alignSelf:'center', marginVertical:14 },
  modalHeaderRow:   { flexDirection:'row', alignItems:'center', columnGap:10, rowGap:10, marginBottom:20 },
  modalHeaderTitle: { fontSize:18, fontWeight:'800', color: COLORS.text, letterSpacing:-0.3 },
  noteCard: {
    flexDirection:'row', columnGap:12, rowGap:12,
    backgroundColor: COLORS.surface,
    borderRadius:14, padding:14, marginBottom:10,
    borderWidth:1, borderColor: COLORS.border,
  },
  noteDot:    { width:10, height:10, borderRadius:5, marginTop:3, flexShrink:0 },
  noteTitle:  { fontSize:13, fontWeight:'800', color: COLORS.text, marginBottom:3 },
  noteText:   { fontSize:12, color: COLORS.textLight, lineHeight:18 },
  // Bouton fermer modal — même que primaryButton
  modalCloseBtn: {
    backgroundColor: COLORS.primary,
    height:54, borderRadius:14,
    justifyContent:'center', alignItems:'center', marginTop:16,
    ...Platform.select({
      ios:     { shadowColor: COLORS.primary, shadowOffset:{width:0,height:6}, shadowOpacity:0.25, shadowRadius:10 },
      android: { elevation:6 },
      web:     { boxShadow:'0 6px 10px rgba(124,58,237,0.25)' },
    }),
  },
  modalCloseBtnText: { color: COLORS.white, fontSize:15, fontWeight:'700' },

  // ── Modal fin d'activité ──────────────────────────────────
  endModalOverlay: { flex:1, backgroundColor:'rgba(15,23,42,0.65)', justifyContent:'center', alignItems:'center', padding:24 },
  endModalCard: {
    backgroundColor: COLORS.white,
    borderRadius:24, padding:28, width:'100%', alignItems:'center',
    ...Platform.select({
      ios:     { shadowColor:'#7C3AED', shadowOffset:{width:0,height:12}, shadowOpacity:0.2, shadowRadius:24 },
      android: { elevation:16 },
      web:     { boxShadow:'0 12px 24px rgba(124,58,237,0.2)' },
    }),
  },
  endModalEmoji: { fontSize:64, marginBottom:14 },
  endModalTitle: { fontSize:24, fontWeight:'800', color: COLORS.text, letterSpacing:-0.5, marginBottom:8 },
  endModalSub:   { fontSize:13, color: COLORS.textLight, textAlign:'center', lineHeight:20, marginBottom:24 },
  // Bouton primaire — identique Login
  endModalBtnPrimary: {
    backgroundColor: COLORS.primary,
    height:58, borderRadius:18, width:'100%',
    flexDirection:'row', justifyContent:'center', alignItems:'center', columnGap:8, rowGap:8, marginBottom:10,
    ...Platform.select({
      ios:     { shadowColor: COLORS.primary, shadowOffset:{width:0,height:8}, shadowOpacity:0.3, shadowRadius:12 },
      android: { elevation:8 },
      web:     { boxShadow:'0 8px 12px rgba(124,58,237,0.3)' },
    }),
  },
  endModalBtnPrimaryText: { color: COLORS.white, fontSize:15, fontWeight:'700' },
  endModalBtnSecondary: {
    height:48, borderRadius:14, width:'100%',
    flexDirection:'row', justifyContent:'center', alignItems:'center',
    backgroundColor: COLORS.surface,
    borderWidth:1.5, borderColor: COLORS.border,
  },
  endModalBtnSecondaryText: { fontSize:14, fontWeight:'600', color: COLORS.textLight },
});