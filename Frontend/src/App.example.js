import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// ✅ IMPORT AUTHPROVIDER
//import { AuthProvider } from './src/context/AuthContext';

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

function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Login"
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
      <Stack.Screen
        name="Premium"
        component={PremiumScreen}
      />
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
  );
}

