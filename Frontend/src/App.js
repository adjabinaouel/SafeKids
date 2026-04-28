import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginPage            from './pages/common/LoginPage/LoginPage';
import SignupPage           from './pages/common/SignupPage/SignupPage';
import FeedbackScreen       from './pages/parents/FeedbackScreen/FeedbackScreen';
import ActivitiesScreen     from './pages/parents/ActivitiesScreen/ActivitiesScreen';
import ActivityPlayerScreen from './pages/parents/ActivityPlayerScreen/ActivityPlayerScreen';
import PremiumScreen        from './pages/parents/PremiumScreen/PremiumScreen';
import ProfileScreen        from './pages/common/profile/ProfileScreen';
import SettingsScreen       from './pages/common/profile/settings/SettingsScreen'; 
import AdminSettingsScreen from './pages/common/profile/settings/AdminSettingsScreen';
import HomeScreen           from './pages/parents/HomeScreen/HomeScreen';
import NotificationScreen from './pages/parents/NotificationScreen/NotificationScreen';
import ChildrenScreen      from './pages/parents/ChildrenScreen/ChildrenScreen';
import MessagesScreen      from './pages/parents/MessagesScreen/MessagesScreen';
import DashboardScreen from './pages/admin/DashboardScreen/DashboardScreen';
import ComptesScreen from './pages/admin/ComptesScreen/ComptesScreen';
import ActivitesScreen from './pages/admin/ActivitesScreen/ActivitesScreen';
import NotificationsAdminScreen from './pages/admin/NotificationsAdminScreen/NotificationsAdminScreen';
import ProfilAdminScreen from './pages/common/profile/AdminProfileScreen';
import StatistiquesScreen from './pages/admin/StatistiquesScreen/StatistiquesScreen';
import AnnuaireScreen from './pages/parents/AnnuaireMedecal/AnnuaireMedecal';
import MedecinProfileScreen from './pages/common/profile/MedecinProfileScreen';
import MedecinSettingsScreen from './pages/common/profile/settings/MedecinSettingsScreen';
import MessageMedecin from './pages/medecin/Message/MedecinMessageSecreen';
import MedecinNotification from './pages/medecin/NotificationMedecin/Medecinnotificationsscreen ';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isPremium, setIsPremium] = useState(false);

  const ActivitiesWithPremium = (props) => (
    <ActivitiesScreen {...props} isPremium={isPremium} />
  );

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="Login"
        >
          <Stack.Screen name="Login"          component={LoginPage} />
          <Stack.Screen name="Signup"         component={SignupPage} />
          <Stack.Screen name="Activities"     component={ActivitiesWithPremium} />
          <Stack.Screen name="ActivityPlayer" component={ActivityPlayerScreen} />
          <Stack.Screen name="Feedback"       component={FeedbackScreen} />
          <Stack.Screen name="Profile"        component={ProfileScreen} />
          <Stack.Screen name="Settings"       component={SettingsScreen} />
          <Stack.Screen name="Home"           component={HomeScreen} />
          <Stack.Screen name='Notifications'  component={NotificationScreen}/>
          <Stack.Screen name="Children"       component={ChildrenScreen} />
          <Stack.Screen name="Messages"       component={MessagesScreen} />
          <Stack.Screen name="Annuaire"       component={AnnuaireScreen} />
          
          <Stack.Screen name="Premium"        component={(props) => (
            <PremiumScreen {...props} onPremiumActivated={() => setIsPremium(true)} />
          )} />

          <Stack.Screen name="Dashboard"      component={DashboardScreen} />
          <Stack.Screen name="Comptes"        component={ComptesScreen} />
          <Stack.Screen name='AdminSettings'  component={AdminSettingsScreen}/>
          <Stack.Screen name="Activites"      component={ActivitesScreen} />
          <Stack.Screen name="NotificationsAdmin" component={NotificationsAdminScreen} />
          <Stack.Screen name="ProfilAdmin"    component={ProfilAdminScreen} />
          <Stack.Screen name="Statistiques"   component={StatistiquesScreen} />

            
          <Stack.Screen name="MedecinProfile" component={MedecinProfileScreen} />
          <Stack.Screen name="MedecinSettings" component={MedecinSettingsScreen} />
          <Stack.Screen name="MessageMedecin" component={MessageMedecin} />
          <Stack.Screen name="MedecinNotification" component={MedecinNotification} />
          
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}