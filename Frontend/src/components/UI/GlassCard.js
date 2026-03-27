// src/components/UI/GlassCard.js
// Composant glass universel — 3 variantes : hero | light | dark
import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { GLASS } from '../../theme';

/**
 * @param {string}  variant      'hero' | 'light' | 'dark'   (défaut: 'light')
 * @param {boolean} shimmer      affiche le reflet haut      (défaut: true)
 * @param {boolean} pressable    rend la card cliquable       (défaut: false)
 * @param {func}    onPress      handler si pressable
 * @param {number}  borderRadius rayon custom                 (défaut: 20)
 * @param {object}  style        styles additionnels
 */
const GlassCard = ({
  children,
  variant = 'light',
  shimmer = true,
  pressable = false,
  onPress,
  borderRadius = 20,
  activeOpacity = 0.88,
  style,
  ...props
}) => {
  const g = GLASS[variant];

  const cardStyle = {
    backgroundColor: g.bg,
    borderWidth:     1,
    borderColor:     g.border,
    borderRadius,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor:   g.shadow,
        shadowOffset:  { width: 0, height: variant === 'hero' ? 10 : 6 },
        shadowOpacity: 1,
        shadowRadius:  variant === 'hero' ? 22 : 16,
      },
      android: { elevation: variant === 'dark' ? 8 : 5 },
    }),
    ...style,
  };

  const shimmerLine = shimmer ? (
    <View
      pointerEvents="none"
      style={{
        position:          'absolute',
        top:               0, left: 0, right: 0,
        height:            1,
        backgroundColor:   g.shimmer,
        borderTopLeftRadius:  borderRadius,
        borderTopRightRadius: borderRadius,
        zIndex:            1,
      }}
    />
  ) : null;

  if (pressable || onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={activeOpacity}
        style={cardStyle}
        {...props}
      >
        {shimmerLine}
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {shimmerLine}
      {children}
    </View>
  );
};

export default GlassCard;