import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Divider, IconButton, HelperText, TextInput } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getOrder, startPacking, confirmItem, uploadPhoto, completePacking, flagOrderIssue } from '../api/orders';
import { ProductCard } from '../components/ProductCard';
import { ProgressTracker } from '../components/ProgressTracker';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../hooks/useAuth';
import { resolveImageUrl } from '../utils/url';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type OrderDetailsScreenRouteProp = RouteProp<RootStackParamList, 'OrderDetails'>;
type OrderDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderDetails'>;

interface OrderDetailsScreenProps {
  route: OrderDetailsScreenRouteProp;
  navigation: OrderDetailsScreenNavigationProp;
}

export const OrderDetailsScreen: React.FC<OrderDetailsScreenProps> = ({ route, navigation }) => {
  const { orderId } = route.params;
  const insets = useSafeAreaInsets();
  const { apiUrl } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoNote, setPhotoNote] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [confirmingItemId, setConfirmingItemId] = useState<number | null>(null);
  const [showIssueInput, setShowIssueInput] = useState(false);
  const [issueReason, setIssueReason] = useState('');

  // 1. Fetch Order Query
  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId),
  });

  // 2. Start Packing Mutation
  const startPackingMutation = useMutation({
    mutationFn: () => startPacking(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Could not start packing.');
    },
  });

  // 3. Confirm Item Mutation
  const confirmItemMutation = useMutation({
    mutationFn: ({ itemId, payload }: { itemId: number; payload: { quantity: number; packer_note?: string | null } }) =>
      confirmItem(itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Could not confirm item.');
    },
    onSettled: () => {
      setConfirmingItemId(null);
    },
  });

  // 4. Upload Photo Mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: ({ photoUri, note }: { photoUri: string; note?: string | null }) =>
      uploadPhoto(orderId, photoUri, note),
    onSuccess: () => {
      setSelectedPhoto(null);
      setPhotoNote('');
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      Alert.alert('Success', 'Open-box photo uploaded successfully.');
    },
    onError: (err: any) => {
      Alert.alert('Upload Failed', err.response?.data?.message || err.message || 'Could not upload photo.');
    },
    onSettled: () => {
      setIsUploadingPhoto(false);
    },
  });

  // 5. Complete Packing Mutation
  const completeMutation = useMutation({
    mutationFn: () => completePacking(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      Alert.alert('Success 🎉', 'Order packed completely!', [
        { text: 'OK', onPress: () => navigation.navigate('HomeList') },
      ]);
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Could not complete packing.');
    },
  });

  // 6. Flag Packing Issue Mutation
  const flagIssueMutation = useMutation({
    mutationFn: (reason: string) => flagOrderIssue(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      Alert.alert('Issue Reported ⚠️', 'This order has been marked with an issue. The admin will resolve it.', [
        { text: 'OK', onPress: () => navigation.navigate('HomeList') },
      ]);
    },
    onError: (err: any) => {
      Alert.alert('Error', err.response?.data?.message || err.message || 'Could not report issue.');
    },
  });

  // Trigger camera launch using Expo Image Picker
  const handleTakePhoto = async () => {
    setIsCapturing(true);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required to take open-box photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedPhoto(result.assets[0].uri);
      }
    } catch (err) {
      console.log('Camera Error:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleUploadPhoto = () => {
    if (!selectedPhoto) return;
    setIsUploadingPhoto(true);
    uploadPhotoMutation.mutate({ photoUri: selectedPhoto, note: photoNote });
  };

  const handleConfirmItemQuantity = async (itemId: number, payload: { quantity: number; packer_note?: string | null }) => {
    setConfirmingItemId(itemId);
    confirmItemMutation.mutate({ itemId, payload });
  };

  const handleCompletePacking = () => {
    completeMutation.mutate();
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3F51B5" />
        <Text style={styles.loaderText}>Loading order checklist...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.centerContainer}>
        <IconButton icon="alert-circle" size={48} iconColor="#D32F2F" />
        <Text style={styles.errorText}>Could not load order details.</Text>
        <Button mode="outlined" onPress={() => refetch()} style={styles.retryButton}>
          RETRY
        </Button>
      </View>
    );
  }

  // Calculate overall checklist units progress
  const items = order.items || [];
  const totalQtyRequired = items.reduce((sum, i) => sum + i.quantity_required, 0);
  const totalQtyConfirmed = items.reduce((sum, i) => sum + i.quantity_confirmed, 0);
  const allItemsConfirmed = items.every((i) => i.is_confirmed) && items.length > 0;
  const hasPhotosUploaded = order.photos && order.photos.length > 0;
  const isPackingStarted = order.status === 'packing';
  const isCompleteAllowed = allItemsConfirmed && hasPhotosUploaded && isPackingStarted;

  const renderHeader = () => (
    <View>
      {/* Order Info Card */}
      <Card style={styles.metadataCard}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Text style={styles.orderNumber}>{order.order_number}</Text>
            <StatusBadge status={order.status} />
          </View>
          
          <View style={styles.badgeRow}>
            <PriorityBadge priority={order.priority} />
            <Text style={styles.platformLabel}>
              Platform: <Text style={styles.bold}>{order.platform?.toUpperCase() || 'MANUAL'}</Text>
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoGrid}>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Customer</Text>
              <Text style={styles.infoText}>{order.customer_name || '—'}</Text>
            </View>
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoText}>{order.customer_phone || '—'}</Text>
            </View>
          </View>

          <View style={styles.addressRow}>
            <Text style={styles.infoLabel}>Shipping Address</Text>
            <Text style={styles.infoText}>{order.shipping_address || '—'}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Start packing Call To Action if not started */}
      {!isPackingStarted && (
        <View style={styles.startPackingSection}>
          <Text style={styles.startPackingPrompt}>
            This order has not been started yet. Click below to lock this order and begin packing.
          </Text>
          <Button
            mode="contained"
            icon="play-circle"
            onPress={() => startPackingMutation.mutate()}
            loading={startPackingMutation.isPending}
            style={styles.startPackingBtn}
            labelStyle={styles.startPackingBtnLabel}
          >
            START PACKING ORDER
          </Button>
        </View>
      )}

      {/* Progress tracker if started */}
      {isPackingStarted && (
        <ProgressTracker totalItems={totalQtyRequired} confirmedItems={totalQtyConfirmed} />
      )}

      {/* Checklist Header */}
      <Text style={styles.sectionHeader}>Checklist Products ({items.length})</Text>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footerContainer}>
      {isPackingStarted && (
        <>
          <Divider style={styles.largeDivider} />
          
          {/* Photo Capture & Upload block */}
          <Text style={styles.sectionHeader}>Open Box Photo (Mandatory)</Text>
          <Card style={styles.photoCard}>
            <Card.Content style={styles.photoCardContent}>
              {selectedPhoto ? (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: selectedPhoto }} style={styles.photoPreview} />
                  <View style={styles.previewControls}>
                    <Button
                      mode="outlined"
                      icon="camera-retake"
                      onPress={handleTakePhoto}
                      style={styles.previewBtn}
                    >
                      RETAKE
                    </Button>
                    <Button
                      mode="contained"
                      icon="upload"
                      onPress={handleUploadPhoto}
                      loading={isUploadingPhoto}
                      disabled={isUploadingPhoto}
                      style={[styles.previewBtn, styles.uploadBtn]}
                    >
                      UPLOAD
                    </Button>
                  </View>
                </View>
              ) : (
                <View style={styles.photoPromptContainer}>
                  <IconButton icon="camera" size={48} iconColor="#546E7A" />
                  <Text style={styles.photoPromptText}>
                    Capture a photo of the open box with all items visible inside.
                  </Text>
                  <Button
                    mode="contained"
                    icon="camera"
                    onPress={handleTakePhoto}
                    loading={isCapturing}
                    style={styles.takePhotoBtn}
                  >
                    LAUNCH CAMERA
                  </Button>
                </View>
              )}

              {/* Uploaded Photos Gallery */}
              {order.photos && order.photos.length > 0 && (
                <View style={styles.gallerySection}>
                  <Text style={styles.galleryTitle}>Uploaded Photos ({order.photos.length})</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
                    {order.photos.map((photo) => {
                      const absolutePhotoUrl = resolveImageUrl(photo.photo_path, apiUrl) || '';
                      return (
                        <View key={photo.id} style={styles.galleryImageContainer}>
                          <Image source={{ uri: absolutePhotoUrl }} style={styles.galleryImage} />
                          <Text style={styles.galleryImageDate}>
                            {new Date(photo.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </Card.Content>
          </Card>

          <Divider style={styles.largeDivider} />

          {/* Validation Checklist hints */}
          {!allItemsConfirmed && (
            <HelperText type="info" visible={true} style={styles.checklistHint}>
              * Stepper quantities of all products must match required quantities.
            </HelperText>
          )}
          {!hasPhotosUploaded && (
            <HelperText type="info" visible={true} style={styles.checklistHint}>
              * You must upload at least one open-box verification photo.
            </HelperText>
          )}

          {/* Complete Packing trigger */}
          <Button
            mode="contained"
            icon="check-bold"
            onPress={handleCompletePacking}
            disabled={!isCompleteAllowed || completeMutation.isPending}
            loading={completeMutation.isPending}
            style={[styles.completeBtn, isCompleteAllowed && styles.completeBtnActive]}
            labelStyle={styles.completeBtnLabel}
          >
            COMPLETE PACKING
          </Button>

          <Divider style={styles.largeDivider} />

          {/* Issue Reporting Form Card */}
          {showIssueInput ? (
            <Card style={[styles.photoCard, { borderColor: '#D32F2F', borderWidth: 1 }]}>
              <Card.Content>
                <Text style={[styles.galleryTitle, { color: '#D32F2F', fontSize: 15 }]}>
                  ⚠️ Report Packing Issue
                </Text>
                <Text style={styles.photoPromptText}>
                  Please provide a detailed reason for flagging this order (e.g. damaged items, missing stock, incorrect items).
                </Text>
                <TextInput
                  mode="outlined"
                  label="Reason for Issue"
                  value={issueReason}
                  onChangeText={setIssueReason}
                  multiline
                  numberOfLines={3}
                  style={styles.issueInput}
                  disabled={flagIssueMutation.isPending}
                />
                <View style={styles.previewControls}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setShowIssueInput(false);
                      setIssueReason('');
                    }}
                    disabled={flagIssueMutation.isPending}
                    style={styles.previewBtn}
                    textColor="#546E7A"
                  >
                    CANCEL
                  </Button>
                  <Button
                    mode="contained"
                    buttonColor="#D32F2F"
                    onPress={() => flagIssueMutation.mutate(issueReason.trim())}
                    disabled={flagIssueMutation.isPending || issueReason.trim().length < 5}
                    loading={flagIssueMutation.isPending}
                    style={styles.previewBtn}
                  >
                    SUBMIT
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ) : (
            <Button
              mode="outlined"
              icon="alert-circle"
              textColor="#D32F2F"
              onPress={() => setShowIssueInput(true)}
              style={styles.issueBtn}
              labelStyle={styles.issueBtnLabel}
            >
              REPORT PACKING ISSUE
            </Button>
          )}
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={isPackingStarted ? items : []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductCard
            item={item}
            onConfirm={(payload) => handleConfirmItemQuantity(item.id, payload)}
            isUpdating={confirmingItemId === item.id}
          />
        )}
        ListHeaderComponent={renderHeader()}
        ListFooterComponent={renderFooter()}
        contentContainerStyle={[styles.scrollList, { paddingBottom: insets.bottom + 24 }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loaderText: {
    marginTop: 12,
    color: '#546E7A',
    fontSize: 16,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    borderColor: '#3F51B5',
  },
  scrollList: {
    paddingBottom: 24,
  },
  metadataCard: {
    margin: 16,
    elevation: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformLabel: {
    fontSize: 12,
    color: '#546E7A',
  },
  bold: {
    fontWeight: 'bold',
    color: '#37474F',
  },
  divider: {
    marginVertical: 10,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    color: '#90A4AE',
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    color: '#37474F',
    fontWeight: 'bold',
    marginTop: 2,
  },
  addressRow: {
    marginTop: 8,
  },
  startPackingSection: {
    backgroundColor: '#FFF9C4',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFF176',
    alignItems: 'center',
  },
  startPackingPrompt: {
    color: '#5D4037',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  startPackingBtn: {
    backgroundColor: '#1976D2',
    paddingVertical: 6,
    width: '100%',
  },
  startPackingBtnLabel: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#37474F',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  footerContainer: {
    paddingHorizontal: 16,
  },
  largeDivider: {
    marginVertical: 16,
  },
  photoCard: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    borderRadius: 8,
  },
  photoCardContent: {
    padding: 12,
  },
  photoPromptContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  photoPromptText: {
    fontSize: 13,
    color: '#78909C',
    textAlign: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
  },
  takePhotoBtn: {
    backgroundColor: '#546E7A',
    width: '80%',
  },
  previewContainer: {
    alignItems: 'center',
  },
  photoPreview: {
    width: '100%',
    height: 240,
    borderRadius: 6,
    backgroundColor: '#ECEFF1',
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
  },
  previewBtn: {
    flex: 1,
    marginHorizontal: 6,
    borderColor: '#546E7A',
  },
  uploadBtn: {
    backgroundColor: '#3F51B5',
  },
  gallerySection: {
    marginTop: 16,
  },
  galleryTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#455A64',
    marginBottom: 8,
  },
  galleryScroll: {
    flexDirection: 'row',
  },
  galleryImageContainer: {
    marginRight: 10,
    alignItems: 'center',
  },
  galleryImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    backgroundColor: '#ECEFF1',
  },
  galleryImageDate: {
    fontSize: 10,
    color: '#78909C',
    marginTop: 4,
  },
  checklistHint: {
    color: '#C62828',
    fontSize: 12,
    marginVertical: 2,
  },
  completeBtn: {
    marginTop: 16,
    backgroundColor: '#B0BEC5',
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 0,
  },
  completeBtnActive: {
    backgroundColor: '#388E3C',
    elevation: 3,
  },
  completeBtnLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  issueBtn: {
    marginTop: 12,
    borderColor: '#D32F2F',
    borderRadius: 8,
    borderWidth: 1.5,
  },
  issueBtnLabel: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  issueInput: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
});
