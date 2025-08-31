import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../constants/colors';

const ContentItem = ({ item, onPress }) => {
  const getImageUrl = (item) => {
    if (item.gallery && item.gallery.length > 0) {
      return `https://d2481n2uw7a0p.cloudfront.net/${item.gallery[0].filename}`;
    }
    return null;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getItemTitle = (item) => {
    return item.title || item.name || item.make_model || 'Untitled';
  };

  const getItemSubtitle = (item) => {
    if (item.type) return item.type.charAt(0).toUpperCase() + item.type.slice(1);
    if (item.year) return `${item.year} ${item.make} ${item.model}`;
    if (item.location) return item.location;
    return '';
  };

  const imageUrl = getImageUrl(item);

  return (
    <TouchableOpacity style={styles.itemContainer} onPress={() => onPress(item)}>
      <View style={styles.itemContent}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.itemImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {getItemTitle(item)}
          </Text>
          {getItemSubtitle(item) ? (
            <Text style={styles.itemSubtitle}>{getItemSubtitle(item)}</Text>
          ) : null}
          <Text style={styles.itemDate}>
            {formatDate(item.created_at)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ContentSection = ({ 
  title, 
  data, 
  isLoading, 
  error, 
  onItemPress, 
  onViewAll,
  showViewAll = true 
}) => {
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load {title.toLowerCase()}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showViewAll && data && data.length > 0 && (
          <TouchableOpacity onPress={onViewAll}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.BRG} />
        </View>
      ) : data && data.length > 0 ? (
        <FlatList
          data={data}
          keyExtractor={(item) => item._id || item.internal_id}
          renderItem={({ item }) => (
            <ContentItem item={item} onPress={onItemPress} />
          )}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No {title.toLowerCase()} yet</Text>
          <Text style={styles.emptySubtext}>
            Start creating content to see it here
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: colors.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.BRG,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.BRG,
    fontWeight: '500',
  },
  itemContainer: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.LIGHT_GRAY,
    paddingBottom: 12,
  },
  itemContent: {
    flexDirection: 'row',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  placeholderText: {
    fontSize: 10,
    color: colors.GRAY,
    textAlign: 'center',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.BLACK,
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: colors.GRAY,
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
    color: colors.GRAY,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.GRAY,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.LIGHT_GRAY,
    textAlign: 'center',
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.ERROR,
  },
});

export default ContentSection;