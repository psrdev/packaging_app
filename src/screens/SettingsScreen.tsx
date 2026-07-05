import React from 'react';
import { StyleSheet, View, Alert, ScrollView } from 'react-native';
import { Text, Card, Button, List, Divider, Avatar } from 'react-native-paper';
import { useAuth } from '../hooks/useAuth';

export const SettingsScreen = () => {
  const { user, signOut, apiUrl } = useAuth();

  const handleLogoutPress = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out from this device?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes, Sign Out', onPress: () => signOut() },
    ]);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Profile Card */}
      {user && (
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileContent}>
            <Avatar.Text
              size={64}
              label={getInitials(user.name)}
              style={styles.avatar}
            />
            <View style={styles.profileText}>
              <Text style={styles.packerName}>{user.name}</Text>
              <Text style={styles.packerEmail}>{user.email}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Information settings list */}
      <Card style={styles.card}>
        <List.Section>
          <List.Item
            title="App Version"
            description="1.0.0 (Expo Go SDK 54)"
            left={(props) => <List.Icon {...props} icon="information-outline" />}
          />
          <Divider />
          <List.Item
            title="Active Backend Endpoint"
            description={apiUrl}
            descriptionNumberOfLines={2}
            left={(props) => <List.Icon {...props} icon="server" />}
          />
          <Divider />
          <List.Item
            title="Authentication State"
            description="Session Synced & Cached"
            left={(props) => <List.Icon {...props} icon="shield-check" />}
          />
        </List.Section>
      </Card>

      {/* Logout Action Button */}
      <Button
        mode="contained"
        icon="logout"
        onPress={handleLogoutPress}
        style={styles.logoutBtn}
        labelStyle={styles.logoutBtnLabel}
      >
        LOGOUT FROM DEVICE
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    elevation: 3,
    borderRadius: 8,
    marginBottom: 16,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  avatar: {
    marginRight: 16,
    backgroundColor: '#3F51B5',
  },
  profileText: {
    flex: 1,
  },
  packerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#37474F',
  },
  packerEmail: {
    fontSize: 14,
    color: '#78909C',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: '#E8EAF6',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  roleText: {
    color: '#3F51B5',
    fontSize: 10,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    borderRadius: 8,
    marginBottom: 16,
  },
  logoutBtn: {
    backgroundColor: '#C62828',
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  logoutBtnLabel: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
