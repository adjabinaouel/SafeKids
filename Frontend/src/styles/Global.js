import { StyleSheet, Platform } from 'react-native';
import Responsive from './Responsive';
import Colors from './Colors';

export default StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: Responsive.layout.safePaddingH,
    paddingTop: Responsive.layout.safePaddingT,
    paddingBottom: Responsive.layout.safePaddingB,
  },
  mainCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: Responsive.sizes.borderRadius,
    padding: Responsive.sizes.cardPadding,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.2)',
    shadowColor: '#556ebf',
    shadowOffset: { width: 0, height: Responsive.screen.lg ? 30 : 20 },
    shadowOpacity: 0.2,
    shadowRadius: Responsive.screen.lg ? 40 : 25,
    elevation: Platform.OS === 'android' ? 25 : 0,
    width: '100%',
    maxWidth: Responsive.layout.maxCardWidth,
    alignSelf: 'center',
  },
});
