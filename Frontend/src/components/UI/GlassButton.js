// src/components/UI/GlassButton.js
import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GLASS, shadow } from '../../theme';

/**
 * Bouton glass unifié
 * @param {string}  variant   'primary' | 'secondary' | 'ghost' | 'gold' | 'danger'
 * @param {string}  bg        'hero' | 'light' | 'dark' — contexte de fond
 * @param {string}  label
 * @param {node}    icon      icône gauche
 * @param {node}    iconRight icône droite
 * @param {boolean} loading
 * @param {boolean} fullWidth
 * @param {string}  size      'sm' | 'md' | 'lg'
 */
const GlassButton = ({
  variant   = 'primary',
  bg        = 'light',
  label,
  icon,
  iconRight,
  loading   = false,
  fullWidth = false,
  size      = 'md',
  onPress,
  activeOpacity = 0.85,
  style,
  labelStyle,
  disabled,
}) => {
  const sizes = {
    sm: { height: 40, radius: 12, font: 13, px: 20 },
    md: { height: 54, radius: 16, font: 14, px: 28 },
    lg: { height: 60, radius: 18, font: 15, px: 36 },
  };
  const s = sizes[size] ?? sizes.md;

  // Config par variante
  const configs = {
    primary: {
      bgColor:   COLORS.primary,
      textColor: '#FFFFFF',
      border:    'rgba(255,255,255,0.22)',
      shadowFn:  () => shadow(COLORS.primary, 10, 0.35, 18, 10),
      useGradient: false,
    },
    secondary: {
      bgColor:   GLASS[bg].bg,
      textColor: bg === 'hero' || bg === 'dark' ? '#FFFFFF' : COLORS.text,
      border:    GLASS[bg].border,
      shadowFn:  () => shadow(GLASS[bg].shadow, 4, 1, 12, 3),
      useGradient: false,
    },
    ghost: {
      bgColor:   'transparent',
      textColor: bg === 'hero' || bg === 'dark' ? 'rgba(255,255,255,0.75)' : COLORS.textLight,
      border:    GLASS[bg].border,
      shadowFn:  () => ({}),
      useGradient: false,
    },
    gold: {
      bgColor:   '#FCD34D',
      textColor: '#1E1B4B',
      border:    'rgba(255,255,255,0.40)',
      shadowFn:  () => shadow('#FCD34D', 8, 0.45, 16, 8),
      useGradient: false,
    },
    danger: {
      bgColor:   COLORS.error,
      textColor: '#FFFFFF',
      border:    'rgba(255,255,255,0.2)',
      shadowFn:  () => shadow(COLORS.error, 8, 0.3, 14, 6),
      useGradient: false,
    },
  };

  const cfg = configs[variant] ?? configs.primary;

  const containerStyle = [
    {
      height:             s.height,
      borderRadius:       s.radius,
      paddingHorizontal:  s.px,
      backgroundColor:    disabled ? COLORS.border : cfg.bgColor,
      borderWidth:        1,
      borderColor:        disabled ? 'transparent' : cfg.border,
      flexDirection:      'row',
      alignItems:         'center',
      justifyContent:     'center',
      gap:                8,
      ...(fullWidth && { width: '100%' }),
      ...(disabled ? {} : cfg.shadowFn()),
      overflow:           'hidden',
    },
    style,
  ];

  const textStyle = [
    {
      fontSize:    s.font,
      fontWeight:  '800',
      color:       disabled ? COLORS.textMuted : cfg.textColor,
      letterSpacing: 0.2,
    },
    labelStyle,
  ];

  return (
    <TouchableOpacity
      onPress={disabled || loading ? undefined : onPress}
      activeOpacity={disabled ? 1 : activeOpacity}
      style={containerStyle}
    >
      {/* Shimmer top */}
      {!disabled && (
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          backgroundColor: 'rgba(255,255,255,0.38)',
          zIndex: 1,
        }} />
      )}
      {loading
        ? <ActivityIndicator color={cfg.textColor} size="small" />
        : (
          <>
            {icon}
            {label && <Text style={textStyle}>{label}</Text>}
            {iconRight}
          </>
        )
      }
    </TouchableOpacity>
  );
};

export default GlassButton;