import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface PriorityBadgeProps {
  priority: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const getPriorityStyle = () => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return { bg: '#FFEBEE', text: '#C62828', label: 'Urgent' };
      case 'high':
        return { bg: '#FFF3E0', text: '#EF6C00', label: 'High' };
      case 'normal':
        return { bg: '#ECEFF1', text: '#455A64', label: 'Normal' };
      case 'low':
        return { bg: '#ECEFF1', text: '#455A64', label: 'Low' };
      default:
        return { bg: '#ECEFF1', text: '#455A64', label: priority };
    }
  };

  const config = getPriorityStyle();

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
