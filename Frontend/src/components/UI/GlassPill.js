// src/components/UI/GlassPill.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { GLASS, COLORS } from '../../theme';

/**
 * Pill / badge glass
 * @param {string}  variant   'hero' | 'light' | 'dark' | 'success' | 'warning' | 'primary'
 * @param {node}    icon      icône à gauche (optionnel)
 * @param {string}  label     texte
 * @param {boolean} dot       affiche un dot coloré à gauche
 * @param {string}  dotColor  couleur du dot
 * @param {func}    onPress   rend la pill cliquable
 */
const GlassPill = ({
  variant = 'light',
  icon,
  label,
  dot,
  dotColor = COLORS.success,
  onPress,
  style,
  labelStyle,
}) => {
  const map = {
    hero:    { bg: GLASS.hero.bg,    border: GLASS.hero.border,    color: '#FFFFFF'       },
    light:   { bg: GLASS.light.bg,   border: GLASS.light.border,   color: COLORS.textMuted },
    dark:    { bg: GLASS.dark.bg,    border: GLASS.dark.border,    color: '#FFFFFF'       },
    primary: { bg: COLORS.primaryMid,border: COLORS.primary+'28',  color: COLORS.primary  },
    success: { bg: COLORS.successLight,border:'rgba(16,185,129,.2)',color: COLORS.success  },
    warning: { bg: COLORS.warningLight,border:'rgba(245,158,11,.2)',color: COLORS.warning  },
    gold:    { bg: 'rgba(253,211,77,.14)', border:'rgba(253,211,77,.30)', color:'#FCD34D'  },
  };
  const t = map[variant] ?? map.light;

  const inner = (
    <View style={[{
      flexDirection: 'row', alignItems: 'center', gap: 6,
      backgroundColor: t.bg,
      borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5,
      borderWidth: 1, borderColor: t.border,
      alignSelf: 'flex-start',
    }, style]}>
      {dot && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dotColor }} />}
      {icon}
      {label && (
        <Text style={[{ fontSize: 11, fontWeight: '700', color: t.color, letterSpacing: 0.4 }, labelStyle]}>
          {label}
        </Text>
      )}
    </View>
  );

  if (onPress) return <TouchableOpacity onPress={onPress} activeOpacity={0.82}>{inner}</TouchableOpacity>;
  return inner;
};

export default GlassPill;