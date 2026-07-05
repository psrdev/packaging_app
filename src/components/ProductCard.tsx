import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card, Text, Button, IconButton, TextInput, Badge } from 'react-native-paper';
import { OrderItem } from '../types';
import { useAuth } from '../hooks/useAuth';
import { resolveImageUrl } from '../utils/url';

interface ProductCardProps {
  item: OrderItem;
  onConfirm: (payload: { quantity: number; packer_note?: string | null }) => Promise<void>;
  isUpdating?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  onConfirm,
  isUpdating = false,
}) => {
  const { apiUrl } = useAuth();
  // Stepper state starts at the item's currently confirmed quantity
  const [localConfirmed, setLocalConfirmed] = useState(item.quantity_confirmed);
  const [packerNote, setPackerNote] = useState(item.packer_note || '');
  const [showNoteField, setShowNoteField] = useState(false);

  const increment = () => {
    if (localConfirmed < item.quantity_required) {
      setLocalConfirmed(localConfirmed + 1);
    }
  };

  const decrement = () => {
    if (localConfirmed > 0) {
      setLocalConfirmed(localConfirmed - 1);
    }
  };

  const handleConfirmPress = () => {
    onConfirm({
      quantity: localConfirmed,
      packer_note: packerNote.trim() || null,
    });
  };

  const imageUrl = resolveImageUrl(item.product?.image || null, apiUrl);

  return (
    <Card style={[styles.card, item.is_confirmed && styles.confirmedCard]}>
      <Card.Content style={styles.cardContent}>
        {/* Core Product Information Row */}
        <View style={styles.itemRow}>
          {/* Thumbnail Image */}
          <View style={styles.imageContainer}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.image} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <IconButton icon="package-variant" size={24} iconColor="#90A4AE" />
              </View>
            )}
            {item.product?.is_fragile && (
              <Badge style={styles.fragileBadge} size={18}>
                !
              </Badge>
            )}
          </View>

          {/* Text Info */}
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.product_name}
              </Text>
            </View>
            <Text style={styles.skuText}>SKU: {item.sku || '—'}</Text>
            
            {item.product?.is_fragile && (
              <Text style={styles.fragileText}>⚠️ FRAGILE ITEM - Handle with care</Text>
            )}
          </View>
        </View>

        {/* Master Packing Instructions / Notes */}
        {item.product?.packing_notes && (
          <View style={styles.packingNotesBox}>
            <Text style={styles.packingNotesTitle}>Packing Instructions:</Text>
            <Text style={styles.packingNotesText}>{item.product.packing_notes}</Text>
          </View>
        )}

        {/* Current Stepper / Confirmation State */}
        <View style={styles.stepperContainer}>
          <View style={styles.quantityLabelColumn}>
            <Text style={styles.qtyLabel}>
              Required: <Text style={styles.qtyBold}>{item.quantity_required}</Text>
            </Text>
            <Text style={styles.qtyLabel}>
              Confirmed: <Text style={[styles.qtyBold, item.is_confirmed && styles.confirmedText]}>
                {item.quantity_confirmed}
              </Text>
            </Text>
          </View>

          {item.is_confirmed ? (
            <View style={styles.fullyConfirmedBox}>
              <IconButton icon="check-circle" iconColor="#388E3C" size={24} style={styles.noMargin} />
              <Text style={styles.fullyConfirmedText}>PACKED</Text>
            </View>
          ) : (
            <View style={styles.stepperControls}>
              <IconButton
                icon="minus-box"
                size={36}
                iconColor="#D32F2F"
                onPress={decrement}
                disabled={localConfirmed === 0 || isUpdating}
                style={styles.stepperButton}
              />
              <Text style={styles.stepperText}>{localConfirmed}</Text>
              <IconButton
                icon="plus-box"
                size={36}
                iconColor="#388E3C"
                onPress={increment}
                disabled={localConfirmed >= item.quantity_required || isUpdating}
                style={styles.stepperButton}
              />
            </View>
          )}
        </View>

        {/* Dynamic Note Field Trigger */}
        {!item.is_confirmed && (
          <View style={styles.noteActionRow}>
            {showNoteField ? (
              <TextInput
                label="Packer Note (optional)"
                value={packerNote}
                onChangeText={setPackerNote}
                mode="outlined"
                dense
                style={styles.noteInput}
                disabled={isUpdating}
              />
            ) : (
              <Button
                mode="text"
                icon="note-plus"
                onPress={() => setShowNoteField(true)}
                labelStyle={styles.addNoteLabel}
              >
                {packerNote ? 'Edit Packer Note' : 'Add Packer Note'}
              </Button>
            )}
          </View>
        )}

        {/* Packer note read-only view if confirmed */}
        {item.is_confirmed && item.packer_note && (
          <View style={styles.savedNoteBox}>
            <Text style={styles.savedNoteTitle}>Packer Note:</Text>
            <Text style={styles.savedNoteText}>{item.packer_note}</Text>
          </View>
        )}

        {/* Confirm Action Button */}
        {!item.is_confirmed && (
          <Button
            mode="contained"
            onPress={handleConfirmPress}
            loading={isUpdating}
            disabled={isUpdating || localConfirmed === 0}
            style={[styles.confirmButton, localConfirmed === item.quantity_required && styles.fullMatchButton]}
            labelStyle={styles.confirmButtonLabel}
          >
            {localConfirmed === item.quantity_required ? 'CONFIRM ALL' : 'CONFIRM QUANTITY'}
          </Button>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    borderRadius: 8,
  },
  confirmedCard: {
    borderLeftWidth: 6,
    borderLeftColor: '#4CAF50',
    backgroundColor: '#FAFAFA',
  },
  cardContent: {
    padding: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 6,
    backgroundColor: '#ECEFF1',
  },
  imagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 6,
    backgroundColor: '#ECEFF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fragileBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#D32F2F',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#263238',
  },
  skuText: {
    fontSize: 13,
    color: '#78909C',
    marginTop: 2,
  },
  fragileText: {
    fontSize: 11,
    color: '#D32F2F',
    fontWeight: 'bold',
    marginTop: 4,
  },
  packingNotesBox: {
    backgroundColor: '#FFFDE7',
    padding: 8,
    borderRadius: 4,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#FFF59D',
  },
  packingNotesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F57F17',
  },
  packingNotesText: {
    fontSize: 12,
    color: '#5D4037',
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#F5F7FA',
    padding: 8,
    borderRadius: 6,
  },
  quantityLabelColumn: {
    flexDirection: 'column',
  },
  qtyLabel: {
    fontSize: 14,
    color: '#546E7A',
    marginVertical: 1,
  },
  qtyBold: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#263238',
  },
  confirmedText: {
    color: '#388E3C',
  },
  fullyConfirmedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  fullyConfirmedText: {
    color: '#388E3C',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 4,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperButton: {
    margin: 0,
  },
  stepperText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginHorizontal: 12,
    color: '#37474F',
    minWidth: 24,
    textAlign: 'center',
  },
  noteActionRow: {
    marginTop: 8,
  },
  noteInput: {
    backgroundColor: '#FFFFFF',
  },
  addNoteLabel: {
    fontSize: 13,
    color: '#3F51B5',
  },
  savedNoteBox: {
    backgroundColor: '#ECEFF1',
    padding: 6,
    borderRadius: 4,
    marginTop: 8,
  },
  savedNoteTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#455A64',
  },
  savedNoteText: {
    fontSize: 12,
    color: '#263238',
  },
  confirmButton: {
    marginTop: 12,
    backgroundColor: '#78909C',
    borderRadius: 4,
  },
  fullMatchButton: {
    backgroundColor: '#4CAF50',
  },
  confirmButtonLabel: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  noMargin: {
    margin: 0,
  },
});
