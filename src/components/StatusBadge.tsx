import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { bg: '#FFF9C4', text: '#FBC02D', label: 'Pending' };
      case 'packing':
        return { bg: '#E3F2FD', text: '#1976D2', label: 'Packing' };
      case 'packed':
        return { bg: '#F3E5F5', text: '#7B1FA2', label: 'Packed' };
      case 'ready_to_ship':
        return { bg: '#E8F5E9', text: '#388E3C', label: 'Ready' };
      case 'shipped':
        return { bg: '#E8F5E9', text: '#388E3C', label: 'Shipped' };
      case 'issue':
        return { bg: '#FFEBEE', text: '#D32F2F', label: 'Issue' };
      default:
        return { bg: '#ECEFF1', text: '#607D8B', label: status };
    }
  };

  const config = getBadgeStyle();

  return (
    <View style={[styles.container, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>
        {config.label.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
