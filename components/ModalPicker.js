import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  FlatList,
  TextInput,
  Pressable,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import theme from '../theme';

/**
 * Premium cross-platform picker for plant irrigation app.
 * - iOS: tappable field that opens a searchable bottom-sheet modal
 * - Android/Web: native dropdown picker in a styled container
 */
export default function ModalPicker({
  label,
  selectedValue,
  onValueChange,
  items, // [{ label, value }]
  placeholder = 'Choisir...',
  icon, // optional left icon (React element or emoji string)
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selectedItem = items.find((i) => i.value === selectedValue);
  const selectedLabel = selectedItem?.label || placeholder;
  const hasValue = !!selectedValue && !!selectedItem;

  const filtered = search
    ? items.filter((i) =>
        i.label.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  /* ─── Android only: native Picker in styled container ─── */
  if (Platform.OS === 'android') {
    return (
      <View style={styles.nativeWrapper}>
        {icon != null && (
          <View style={styles.iconArea}>
            {typeof icon === 'string' ? (
              <Text style={styles.iconText}>{icon}</Text>
            ) : (
              icon
            )}
          </View>
        )}
        <View style={styles.nativePickerContainer}>
          <Picker
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            style={styles.nativePicker}
            dropdownIconColor={theme.colors.textSecondary}
          >
            <Picker.Item
              label={placeholder}
              value=""
              color={theme.colors.textLight}
            />
            {items.map((item) => (
              <Picker.Item
                key={item.value}
                label={item.label}
                value={item.value}
                color={theme.colors.text}
              />
            ))}
          </Picker>
        </View>
        {hasValue && <View style={styles.greenDot} />}
        <View style={styles.chevronContainer}>
          <Text style={styles.chevron}>{'\u25BE'}</Text>
        </View>
      </View>
    );
  }

  /* ─── iOS: premium tappable field + bottom-sheet modal ─── */
  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.touchable}
        onPress={() => {
          setSearch('');
          setModalVisible(true);
        }}
      >
        {/* Left icon */}
        {icon != null && (
          <View style={styles.iconArea}>
            {typeof icon === 'string' ? (
              <Text style={styles.iconText}>{icon}</Text>
            ) : (
              icon
            )}
          </View>
        )}

        {/* Value / Placeholder */}
        <View style={styles.touchableBody}>
          <Text
            style={[
              styles.touchableText,
              !hasValue && styles.touchablePlaceholder,
            ]}
            numberOfLines={1}
          >
            {selectedLabel}
          </Text>
        </View>

        {/* Green dot indicator when a value is selected */}
        {hasValue && <View style={styles.greenDot} />}

        {/* Chevron */}
        <View style={styles.chevronContainer}>
          <Text style={styles.chevron}>{'\u25BE'}</Text>
        </View>
      </TouchableOpacity>

      {/* ─── Bottom Sheet Modal ─── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        {/* Overlay */}
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          {/* Prevent press-through on content */}
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            {/* Drag Handle */}
            <View style={styles.dragHandleRow}>
              <View style={styles.dragHandle} />
            </View>

            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalClose}>Fermer</Text>
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Text style={styles.searchIcon}>{'\uD83D\uDD0D'}</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Rechercher..."
                  placeholderTextColor={theme.colors.textLight}
                  value={search}
                  onChangeText={setSearch}
                  autoCorrect={false}
                  returnKeyType="search"
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <Text style={styles.searchClear}>{'\u2715'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* List */}
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.value}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = item.value === selectedValue;
                return (
                  <TouchableOpacity
                    activeOpacity={0.6}
                    style={[
                      styles.listItem,
                      isSelected && styles.listItemSelected,
                    ]}
                    onPress={() => {
                      onValueChange(item.value);
                      setModalVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.listItemText,
                        isSelected && styles.listItemTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Text style={styles.checkmark}>{'\u2713'}</Text>
                    )}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Aucun r\u00e9sultat</Text>
                </View>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

/* ─── Styles ─── */
const styles = StyleSheet.create({
  /* ─── Native Picker (Android / Web) ─── */
  nativeWrapper: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '100%',
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  nativePickerContainer: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
  },
  nativePicker: {
    width: '100%',
    height: 52,
    color: theme.colors.text,
  },

  /* ─── iOS Touchable Field ─── */
  touchable: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    width: '100%',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md + 2,
    marginBottom: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    ...theme.shadows.sm,
  },
  iconArea: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.primaryLight + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  iconText: {
    fontSize: theme.fontSize.lg,
  },
  touchableBody: {
    flex: 1,
  },
  touchableText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: '500',
    fontFamily: theme.fontFamily.body,
  },
  touchablePlaceholder: {
    color: theme.colors.textLight,
    fontWeight: '400',
    fontFamily: theme.fontFamily.body,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginHorizontal: theme.spacing.sm,
  },
  chevronContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: -1,
  },

  /* ─── Modal Overlay ─── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  /* ─── Bottom Sheet ─── */
  modalSheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '75%',
    paddingBottom: theme.spacing.xxxl + 8,
  },

  /* Drag Handle */
  dragHandleRow: {
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  dragHandle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.border,
  },

  /* Header */
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.2,
    fontFamily: theme.fontFamily.display,
  },
  modalClose: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.primaryLight,
    fontFamily: theme.fontFamily.body,
  },

  /* Search */
  searchContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.lg,
    height: 42,
  },
  searchIcon: {
    fontSize: theme.fontSize.sm,
    marginRight: theme.spacing.sm,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    paddingVertical: 0,
    fontFamily: theme.fontFamily.body,
  },
  searchClear: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    paddingLeft: theme.spacing.sm,
  },

  /* List */
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  listItem: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: theme.borderRadius.md,
  },
  listItemSelected: {
    backgroundColor: theme.colors.primaryLight + '18',
  },
  listItemText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    flex: 1,
    fontFamily: theme.fontFamily.body,
  },
  listItemTextSelected: {
    color: theme.colors.primaryDark,
    fontWeight: '600',
    fontFamily: theme.fontFamily.body,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.lg,
  },
  checkmark: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
  },

  /* Empty state */
  emptyContainer: {
    paddingVertical: theme.spacing.xxxl * 2,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textLight,
    fontFamily: theme.fontFamily.body,
  },
});
