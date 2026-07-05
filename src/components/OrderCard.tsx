import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Button, Divider } from 'react-native-paper';
import { Order } from '../types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
  onStartPress?: () => void;
  isStarting?: boolean;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPress,
  onStartPress,
  isStarting = false,
}) => {
  const itemsCount = order.items?.reduce((sum, item) => sum + item.quantity_required, 0) || 0;
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch {
      return dateStr;
    }
  };

  const getPlatformLabel = (platform: string | null) => {
    if (!platform) return 'MANUAL';
    return platform.toUpperCase();
  };

  const showStartButton = order.status === 'pending' || order.status === 'issue';

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content style={styles.content}>
        {/* Header Block */}
        <View style={styles.header}>
          <Text style={styles.orderNumber}>{order.order_number}</Text>
          <StatusBadge status={order.status} />
        </View>

        {/* Badges Block */}
        <View style={styles.badgeRow}>
          <PriorityBadge priority={order.priority} />
          <Text style={styles.platformText}>
            Platform: <Text style={styles.bold}>{getPlatformLabel(order.platform)}</Text>
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* Customer & Details Info */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Customer:</Text>
          <Text style={styles.infoValue}>{order.customer_name || '—'}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Items Count:</Text>
          <Text style={styles.infoValue}>{itemsCount} units</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Deadline:</Text>
          <Text style={[styles.infoValue, order.priority === 'urgent' && styles.urgentText]}>
            {formatDate(order.pickup_deadline)}
          </Text>
        </View>

        {/* Action Button */}
        {showStartButton && onStartPress && (
          <Button
            mode="contained"
            onPress={onStartPress}
            loading={isStarting}
            disabled={isStarting}
            style={styles.startButton}
            labelStyle={styles.startButtonLabel}
          >
            START PACKING
          </Button>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  platformText: {
    fontSize: 12,
    color: '#546E7A',
  },
  bold: {
    fontWeight: 'bold',
    color: '#263238',
  },
  divider: {
    marginVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  infoLabel: {
    color: '#78909C',
    fontSize: 14,
  },
  infoValue: {
    fontWeight: '600',
    color: '#37474F',
    fontSize: 14,
  },
  urgentText: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  startButton: {
    marginTop: 16,
    backgroundColor: '#3F51B5',
    paddingVertical: 4,
    borderRadius: 6,
  },
  startButtonLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
});
