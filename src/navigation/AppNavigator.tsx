import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../hooks/useAuth';
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { OrderDetailsScreen } from '../screens/OrderDetailsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type RootStackParamList = {
  HomeList: undefined;
  OrderDetails: { orderId: number };
};

export type AppTabParamList = {
  OrdersTab: undefined;
  SettingsTab: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();
const AuthStack = createNativeStackNavigator();

const OrderStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#3F51B5' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
      }}
    >
      <Stack.Screen
        name="HomeList"
        component={HomeScreen}
        options={{ title: "Today's Orders" }}
      />
      <Stack.Screen
        name="OrderDetails"
        component={OrderDetailsScreen}
        options={{ title: 'Packing Checklist' }}
      />
    </Stack.Navigator>
  );
};

export const AppNavigator = () => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3F51B5" />
      </View>
    );
  }

  return token ? (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = 'clipboard-text';
          if (route.name === 'SettingsTab') {
            iconName = 'cog';
          }
          return <MaterialCommunityIcons name={iconName as any} color={color} size={size + 4} />;
        },
        tabBarActiveTintColor: '#3F51B5',
        tabBarInactiveTintColor: '#78909C',
        headerShown: false,
        tabBarStyle: {
          height: 66,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#ECEFF1',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: 'bold',
          marginBottom: 2,
        },
      })}
    >
      <Tab.Screen
        name="OrdersTab"
        component={OrderStackNavigator}
        options={{ tabBarLabel: 'Orders' }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          headerShown: true,
          title: 'Settings',
          headerStyle: { backgroundColor: '#3F51B5' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  ) : (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  tabIcon: {
    margin: 0,
    padding: 0,
  },
});
