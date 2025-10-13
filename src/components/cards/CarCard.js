import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import BaseCard from './BaseCard';
import UserBadge from '../overlays/UserBadge';
import { colors } from '../../constants/colors';
import FAIcon from '../ui/FAIcon';
import { useGetCarModsByInternalIdQuery, useGetCarTasksQuery } from '../../services/apiService';

const CarCard = ({ user: car, displayOptions = {} }) => {
  const navigation = useNavigation();
  const { userInfo } = useSelector(state => state.auth);
  if (!car) return null;

  const isOwner = userInfo?.user_id === car.user_id;

  // Fetch mods and tasks data for counts
  const { data: modsData } = useGetCarModsByInternalIdQuery(
    car.internal_id,
    { skip: !car.internal_id }
  );

  const { data: tasksData } = useGetCarTasksQuery(
    { carId: car.internal_id },
    { skip: !car.internal_id || !isOwner }
  );

  const handlePress = () => {
    const carId = car._id || car.id;
    navigation.navigate('CarDetail', { carId });
  };

  const getCarImageSource = () => {
    if (car?.gallery?.[0]?.filename) {
      return `https://d2481n2uw7a0p.cloudfront.net/${car.gallery[0].filename}`;
    }
    return null;
  };

  const getDisplayName = () => {
    const parts = [car.year, car.make, car.model].filter(Boolean);
    if (parts.length > 0) {
      return parts.join(' ');
    }
    if (car.title) return car.title;
    return 'Car';
  };

  const renderOverlay = () => {
    const badges = [];

    // Add category badge if available
    if (car.category) {
      badges.push(
        <View key="category" style={styles.categoryBadge}>
          <Text style={styles.badgeText}>{car.category}</Text>
        </View>
      );
    }

    // Add type badge if available
    if (car.type && car.type !== car.category) {
      badges.push(
        <View key="type" style={styles.typeBadge}>
          <Text style={styles.badgeText}>{car.type}</Text>
        </View>
      );
    }

    if (badges.length === 0) return null;

    return (
      <View style={styles.badgeContainer}>
        {badges}
      </View>
    );
  };

  const renderStats = () => {
    const stats = [];

    // Gallery count
    if (car.gallery && car.gallery.length > 0) {
      stats.push(
        <View key="gallery" style={styles.statItem}>
          <FAIcon name="image" size={12} color={colors.TEXT_SECONDARY} />
          <Text style={styles.statText}>{car.gallery.length}</Text>
        </View>
      );
    }

    // Mods count (from fetched data)
    const modCount = modsData?.entries?.length || 0;
    if (modCount > 0) {
      stats.push(
        <View key="mods" style={styles.statItem}>
          <FAIcon name="wrench" size={12} color={colors.TEXT_SECONDARY} />
          <Text style={styles.statText}>{modCount}</Text>
        </View>
      );
    }

    // Tasks count (only for owner, from fetched data)
    const taskCount = tasksData?.entries?.length || 0;
    if (isOwner && taskCount > 0) {
      stats.push(
        <View key="tasks" style={styles.statItem}>
          <FAIcon name="check-square" size={12} color={colors.TEXT_SECONDARY} />
          <Text style={styles.statText}>{taskCount}</Text>
        </View>
      );
    }

    if (stats.length === 0) return null;

    return (
      <View style={styles.statsContainer}>
        {stats}
      </View>
    );
  };

  const renderFooter = () => {
    const components = [];

    // Add stats
    const statsComponent = renderStats();
    if (statsComponent) {
      components.push(
        <View key="stats" style={styles.statsWrapper}>
          {statsComponent}
        </View>
      );
    }

    // Add user badge
    if (car.user_id && !displayOptions.hideUserBadge) {
      components.push(
        <View key="user" style={styles.userBadgeContainer}>
          <UserBadge userId={car.user_id} />
        </View>
      );
    }

    if (components.length === 0) return null;

    return <View style={styles.footerContainer}>{components}</View>;
  };

  return (
    <BaseCard
      imageSource={getCarImageSource()}
      imageHeight={200}
      placeholderIcon="car"
      placeholderText=""
      title={getDisplayName()}
      description={car.description}
      onPress={handlePress}
      cardStyle={styles.carCard}
      overlayComponent={renderOverlay()}
      footerComponent={renderFooter()}
    />
  );
};

const styles = StyleSheet.create({
  carCard: {
    marginTop: 12,
  },
  // Overlay badges
  badgeContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 4,
  },
  categoryBadge: {
    backgroundColor: colors.BRG,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadge: {
    backgroundColor: colors.SPEED,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.WHITE,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  // Footer components
  footerContainer: {
    gap: 8,
  },
  statsWrapper: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
    fontWeight: '500',
  },
  userBadgeContainer: {
    alignSelf: 'flex-start',
  },
});

export default CarCard;