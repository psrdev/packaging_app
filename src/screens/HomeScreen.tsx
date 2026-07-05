import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Searchbar, ActivityIndicator, Text, Button, SegmentedButtons } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getOrders, startPacking } from '../api/orders';
import { OrderCard } from '../components/OrderCard';
import { Order } from '../types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'HomeList'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'packing' | 'issue'>('all');
  const [page, setPage] = useState(1);
  const [startingOrderId, setStartingOrderId] = useState<number | null>(null);

  // Fetch orders query
  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ['orders', page, searchQuery],
    queryFn: () => getOrders(page, searchQuery),
  });

  // Start packing mutation
  const startPackingMutation = useMutation({
    mutationFn: (id: number) => startPacking(id),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      navigation.navigate('OrderDetails', { orderId: updatedOrder.id });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || err.message || 'Could not start packing.');
    },
    onSettled: () => {
      setStartingOrderId(null);
    },
  });

  const handleStartPacking = (orderId: number) => {
    setStartingOrderId(orderId);
    startPackingMutation.mutate(orderId);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset page on search
  };

  const handleRefresh = () => {
    refetch();
  };

  // Filter local data based on the segmented buttons selection
  const orders = data?.data || [];
  const filteredOrders = orders.filter((order: Order) => {
    if (activeFilter === 'all') return true;
    return order.status === activeFilter;
  });

  const renderItem = ({ item }: { item: Order }) => (
    <OrderCard
      order={item}
      onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
      onStartPress={() => handleStartPacking(item.id)}
      isStarting={startingOrderId === item.id}
    />
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search by Order # or Customer..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchBarInput}
        />
      </View>

      {/* Segmented Filter Buttons */}
      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={activeFilter}
          onValueChange={(val: any) => setActiveFilter(val)}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'packing', label: 'Packing' },
            { value: 'issue', label: 'Issues' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {/* Loader State */}
      {isLoading && !isRefetching ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#3F51B5" />
          <Text style={styles.loadingText}>Loading warehouse orders...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <IconButton icon="alert-circle" size={48} iconColor="#D32F2F" />
          <Text style={styles.errorText}>Failed to load orders.</Text>
          <Button mode="outlined" onPress={handleRefresh} style={styles.retryButton}>
            RETRY
          </Button>
        </View>
      ) : filteredOrders.length === 0 ? (
        <FlatList
          data={[]}
          renderItem={null}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconButton icon="clipboard-alert" size={64} iconColor="#B0BEC5" />
              <Text style={styles.emptyTitle}>No Orders Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try matching a different SKU or order ID.' : 'There are no active orders assigned to you.'}
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} colors={['#3F51B5']} />
          }
        />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} colors={['#3F51B5']} />
          }
        />
      )}
    </View>
  );
};

// Simple wrapper since Paper doesn't export IconButton directly in our code
import { IconButton } from 'react-native-paper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchContainer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  searchBar: {
    backgroundColor: '#F5F7FA',
    borderRadius: 8,
    elevation: 0,
    height: 48,
  },
  searchBarInput: {
    minHeight: 0,
    fontSize: 15,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  segmentedButtons: {
    height: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: '#546E7A',
    fontSize: 16,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    borderColor: '#3F51B5',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#37474F',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#78909C',
    textAlign: 'center',
    marginTop: 8,
  },
});
