import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';

interface ProgressTrackerProps {
  totalItems: number;
  confirmedItems: number;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  totalItems,
  confirmedItems,
}) => {
  const progress = totalItems > 0 ? confirmedItems / totalItems : 0;
  const remaining = Math.max(0, totalItems - confirmedItems);

  // High contrast color based on progress percentage
  const getProgressColor = () => {
    if (progress >= 1) return '#388E3C'; // Complete: Green
    if (progress > 0.5) return '#1976D2'; // Halfway: Blue
    return '#FBC02D'; // Just started: Yellow
  };

  return (
    <View style={styles.container}>
      <View style={styles.textRow}>
        <Text style={styles.progressText}>
          Packing Checklist: <Text style={styles.boldText}>{confirmedItems} of {totalItems}</Text> items confirmed
        </Text>
        <Text style={styles.percentageText}>
          {Math.round(progress * 100)}%
        </Text>
      </View>

      <ProgressBar
        progress={progress}
        color={getProgressColor()}
        style={styles.progressBar}
      />

      {remaining > 0 ? (
        <Text style={styles.remainingText}>
          ⚠️ {remaining} more items remaining to complete this order.
        </Text>
      ) : (
        <Text style={styles.completeText}>
          ✅ All items verified! Ready to capture open-box photo.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#455A64',
    flex: 1,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#1A237E',
  },
  percentageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#37474F',
    marginLeft: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ECEFF1',
  },
  remainingText: {
    fontSize: 12,
    color: '#EF6C00',
    fontWeight: 'bold',
    marginTop: 8,
  },
  completeText: {
    fontSize: 12,
    color: '#388E3C',
    fontWeight: 'bold',
    marginTop: 8,
  },
});
