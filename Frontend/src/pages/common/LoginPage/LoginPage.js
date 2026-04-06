import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './LoginPage.Styles.js';

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123';

const COLORS = {
  primary: '#7C3AED',
  textLight: '#8B7AA8',
  white: '#FFFFFF',
};

const ROLES = [
  { id: 'admin',   label: 'ADMIN',   icon: 'shield'  },
  { id: 'parent',  label: 'PARENT',  icon: 'people'  },
  { id: 'medecin', label: 'MÉDECIN', icon: 'medkit'  },
];

const SERVER_IP = '10.243.127.170';

export default function LoginPage({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('parent');
  const [focusField, setFocusField] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const clearError = () => setErrorMsg('');

  const handleLogin = async () => {
    clearError();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      if (role === 'admin') {
        if (email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
          await AsyncStorage.setItem('userRole', 'Admin');
          navigation.navigate('DashboardAdmin');
          setLoading(false);
          return;
        } else {
          setErrorMsg('Identifiants administrateur invalides.');
          setLoading(false);
          return;
        }
      }

      const response = await fetch(`http://${SERVER_IP}:5000/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          motDePasse: password,
          role: role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.message || 'Connexion échouée');
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));

      if (data.user.role === 'Parent') {
        navigation.navigate('Home');
      } else if (data.user.role === 'Medecin') {
        navigation.navigate('DashboardMedecin');
      } else {
        navigation.navigate('DashboardParent');
      }

    } catch (error) {
      setErrorMsg(
        "Impossible de se connecter au serveur.\nVérifie que :\n• Le backend est lancé\n• Ton téléphone est sur le même WiFi\n• L'IP est correcte"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label, value, onChange, iconName, type = 'default', secure = false, key) => {
    const focused = focusField === key;
    return (
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, focused && { color: COLORS.primary }]}>{label}</Text>
        <View style={[styles.inputWrapper, focused && styles.inputWrapperActive]}>
          <Ionicons
            name={iconName}
            size={18}
            color={focused ? COLORS.primary : COLORS.textLight}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={(v) => { onChange(v); clearError(); }}
            placeholder={label}
            placeholderTextColor="#C4B5FD"
            keyboardType={type}
            secureTextEntry={secure}
            autoCapitalize={type === 'email-address' ? 'none' : 'sentences'}
            onFocus={() => setFocusField(key)}
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

      {/* ✅ FIX ANDROID : pas de KeyboardAvoidingView, ScrollView direct */}
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      >
        <View style={styles.card}>

          <View style={styles.brand}>
            <View style={styles.brandIcon}>
              <Ionicons name="shield-checkmark" size={20} color={COLORS.white} />
            </View>
            <Text style={styles.brandName}>
              Safe<Text style={{ color: COLORS.primary }}>Kids</Text>
            </Text>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>
              Ravi de vous <Text style={styles.titleAccent}>revoir</Text>
            </Text>
            <Text style={styles.subtitle}>
              Connectez-vous pour accéder à votre espace d'accompagnement apaisé.
            </Text>
          </View>

          {!!errorMsg && (
            <View style={[styles.alert, styles.alertError]}>
              <Text style={styles.alertText}>{errorMsg}</Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Sélectionnez votre rôle</Text>
          <View style={styles.roleGrid}>
            {ROLES.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.roleCard, role === item.id && styles.roleCardActive]}
                onPress={() => { setRole(item.id); clearError(); }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={role === item.id ? COLORS.primary : COLORS.textLight}
                  style={{ marginBottom: 4 }}
                />
                <Text style={[styles.roleText, role === item.id && styles.roleTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.form}>
            {renderInput('Adresse e-mail', email, setEmail, 'mail-outline', 'email-address', false, 'email')}
            {renderInput('Mot de passe', password, setPassword, 'lock-closed-outline', 'default', true, 'password')}
          </View>

          <TouchableOpacity style={{ alignSelf: 'flex-end' }}>
            <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.primaryButton, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.buttonText}>Se connecter</Text>
                <Ionicons name="arrow-forward" size={18} color={COLORS.white} style={{ marginLeft: 7 }} />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.footerLink}>Créer un compte</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}