import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/common/LoginPage/LoginPage';
import SignupPage from './pages/common/SignupPage/SignupPage';
import FeedbackScreen from './pages/parents/FeedbackScreen/FeedbackScreen';
import ActivitiesScreen from './pages/parents/ActivitiesScreen/ActivitiesScreen';
import ActivityPlayerScreen from './pages/parents/ActivityPlayerScreen/ActivityPlayerScreen';
import PremiumScreen from './pages/parents/PremiumScreen/PremiumScreen';
import ProfileScreen from './pages/common/profile/ProfileScreen';
import SettingsScreen from './pages/common/profile/settings/SettingsScreen';
import AdminSettingsScreen from './pages/common/profile/settings/AdminSettingsScreen';
import HomeScreen from './pages/parents/HomeScreen/HomeScreen';
import NotificationScreen from './pages/parents/NotificationScreen/NotificationScreen';
import ChildrenScreen from './pages/parents/ChildrenScreen/ChildrenScreen';
import MessagesScreen from './pages/parents/MessagesScreen/MessagesScreen';
import DashboardScreen from './pages/admin/DashboardScreen/DashboardScreen';
import ComptesScreen from './pages/admin/ComptesScreen/ComptesScreen';
import ActivitesScreen from './pages/admin/ActivitesScreen/ActivitesScreen';
import NotificationsAdminScreen from './pages/admin/NotificationsAdminScreen/NotificationsAdminScreen';
import ProfilAdminScreen from './pages/common/profile/AdminProfileScreen';
import StatistiquesScreen from './pages/admin/StatistiquesScreen/StatistiquesScreen';
import DashboardMedecin from './pages/Medecins/DashboardMedecin/DashboardMedecin';
import AddChildren from './pages/Medecins/AddChildren/AddChildren';
import NotificationsMedecin from './pages/Medecins/NotificationsMedecin/NotificationsMedecin';
import ProfilMedecin from './pages/Medecins/ProfilMedecin/ProfilMedecin';
import ChildProfile from './pages/Medecins/ChildProfile/ChildProfile';
import PatientsScreen from './pages/Medecins/PatientsScreen/PatientsScreen';

const Stack = createNativeStackNavigator();

// Thème personnalisé
const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#7C3AED',
    background: '#F8F7FF',
    card: '#FFFFFF',
    text: '#1E1B4B',
    border: '#E2E8F0',
  },
};

// Navigation principale avec gestion de la session
function AppNavigator() {
  const { isLoading, isSignout, userToken, userRole } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  // Déterminer la route initiale selon la session
  let initialRoute = 'Login';
  if (userToken && !isSignout) {
    switch (userRole) {
      case 'admin':
        initialRoute = 'Dashboard';
        break;
      case 'medecin':
        initialRoute = 'DashboardMedecin';
        break;
      case 'parent':
        initialRoute = 'Home';
        break;
      default:
        initialRoute = 'Login';
    }
  }

  return (
    <NavigationContainer theme={AppTheme}>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRoute}
      >
            <Stack.Screen name="Login" component={LoginPage} />
            <Stack.Screen name="Signup" component={SignupPage} />
            <Stack.Screen name="Activities" component={ActivitiesScreen} />
            <Stack.Screen name="ActivityPlayer" component={ActivityPlayerScreen} />
            <Stack.Screen name="Feedback" component={FeedbackScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Notifications" component={NotificationScreen} />
            <Stack.Screen name="Children" component={ChildrenScreen} />
            <Stack.Screen name="Messages" component={MessagesScreen} />
            <Stack.Screen name="Premium" component={PremiumScreen} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Comptes" component={ComptesScreen} />
            <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
            <Stack.Screen name="Activites" component={ActivitesScreen} />
            <Stack.Screen name="NotificationsAdmin" component={NotificationsAdminScreen} />
            <Stack.Screen name="ProfilAdmin" component={ProfilAdminScreen} />
            <Stack.Screen name="Statistiques" component={StatistiquesScreen} />
            <Stack.Screen name="DashboardMedecin" component={DashboardMedecin} />
            <Stack.Screen name="AddChildren" component={AddChildren} />
            <Stack.Screen name="NotificationsMedecin" component={NotificationsMedecin} />
            <Stack.Screen name="ProfilMedecin" component={ProfilMedecin} />
            <Stack.Screen name="ChildProfile" component={ChildProfile} />
            <Stack.Screen name="Patients" component={PatientsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F7FF',
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
