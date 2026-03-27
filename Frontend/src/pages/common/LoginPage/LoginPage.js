import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './LoginPage.Styles.js';

const COLORS = {
  primary: '#7C3AED',
  textLight: '#64748B',
  white: '#FFFFFF',
};

export default function LoginPage({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('parent');
  const [focusField, setFocusField] = useState(null);

  const ROLES = [
    { id: 'admin', label: 'ADMIN', icon: '🛡️' },
    { id: 'parent', label: 'PARENT', icon: '👨‍👩‍👧' },
    { id: 'medecin', label: 'MÉDECIN', icon: '🩺' },
  ];

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Remplissez tous les champs');
      return;
    }
    Alert.alert('Connexion réussie', `Bienvenue en tant que ${role.toUpperCase()} !`);
    navigation.navigate(role === 'admin' ? 'DashboardAdmin' : 'DashboardParent');
  };

  const renderInput = (label, value, onChange, icon, type = 'default', secure = false, fieldKey) => {
    const isFocused = focusField === fieldKey;
    return (
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, isFocused && { color: COLORS.primary }]}>{label}</Text>
        <View style={[styles.inputWrapper, isFocused && styles.inputWrapperActive]}>
          <Ionicons 
            name={icon} 
            size={20} 
            color={isFocused ? COLORS.primary : COLORS.textLight} 
            style={styles.inputIcon} 
          />
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChange}
            placeholder={label}
            placeholderTextColor="#94A3B8"
            keyboardType={type}
            secureTextEntry={secure}
            autoCapitalize={type === 'email-address' ? 'none' : 'sentences'}
            onFocus={() => setFocusField(fieldKey)}
            onBlur={() => setFocusField(null)}
            underlineColorAndroid="transparent"
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.header, { marginTop: 60 }]}>
            <View style={styles.iconBg}>
              <Ionicons name="settings-sharp" size={44} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Ravi de vous revoir</Text>
            <Text style={styles.subtitle}>Connectez-vous pour accéder à votre espace d'accompagnement apaisé.</Text>
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={styles.sectionTitle}>Sélectionnez votre rôle</Text>
            <View style={styles.roleGrid}>
              {ROLES.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.roleCard, role === item.id && styles.roleCardActive]}
                  onPress={() => setRole(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.roleIcon}>{item.icon}</Text>
                  <Text style={[styles.roleText, role === item.id && styles.roleTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.form}>
            {renderInput('E-mail', email, setEmail, 'mail-outline', 'email-address', false, 'email')}
            {renderInput('Mot de passe', password, setPassword, 'lock-closed-outline', 'default', true, 'password')}

            <TouchableOpacity style={{ alignSelf: 'flex-end', marginTop: 8 }}>
              <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Se connecter</Text>
              <Ionicons name="log-in-outline" size={22} color={COLORS.white} style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            <Text style={[styles.subtitle, { fontSize: 13, marginTop: 24 }]}>
              En vous connectant, vous acceptez nos <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Conditions d'utilisation</Text>.
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas de compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.footerLink}>Créer un compte</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}