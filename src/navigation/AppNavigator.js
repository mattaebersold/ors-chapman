import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FAIcon from '../components/FAIcon';
import { useAuth } from '../utils/AuthContext';
import { colors } from '../constants/colors';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useGetUserDetailsQuery } from '../services/apiService';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import SocietyScreen from '../screens/SocietyScreen';
import CarsScreen from '../screens/CarsScreen';
import ArticlesScreen from '../screens/ArticlesScreen';
import NewButtonFAB from '../components/NewButtonFAB';
import ProfileScreen from '../screens/ProfileScreen';
import SearchScreen from '../screens/SearchScreen';
import MyGarageScreen from '../screens/MyGarageScreen';
import UserDetailScreen from '../screens/UserDetailScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import CarDetailScreen from '../screens/CarDetailScreen';
import LoadingScreen from '../screens/LoadingScreen';

// Import marketing screens
import AboutScreen from '../screens/AboutScreen';
import FeaturesScreen from '../screens/FeaturesScreen';
import ChangelogScreen from '../screens/ChangelogScreen';
import RoadmapScreen from '../screens/RoadmapScreen';
import SupportScreen from '../screens/SupportScreen';

// Import brands/models screens
import BrandDetailScreen from '../screens/BrandDetailScreen';
import ModelDetailScreen from '../screens/ModelDetailScreen';

// Import components
import HamburgerMenu from '../components/HamburgerMenu';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const AppStack = createStackNavigator();

const AuthNavigator = () => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false 
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

// Profile button component
const ProfileButton = ({ onPress }) => {
  const { data: userDetails } = useGetUserDetailsQuery();
  const profileImageUrl = userDetails?.gallery?.[0]?.filename 
    ? `https://partstash-ghia-images.s3.us-west-2.amazonaws.com/${userDetails.gallery[0].filename}`
    : null;

  return (
    <TouchableOpacity style={styles.profileButton} onPress={onPress}>
      {profileImageUrl ? (
        <Image 
          source={{ uri: profileImageUrl }} 
          style={styles.profileButtonImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.profileButtonPlaceholder}>
          <FAIcon name="user" size={16} color={colors.WHITE} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const TabNavigator = ({ navigation }) => (
  <View style={{ flex: 1 }}>
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Feed') {
            iconName = 'feed';
          } else if (route.name === 'Society') {
            iconName = 'society';
          } else if (route.name === 'Browse') {
            iconName = 'marketplace';
          } else if (route.name === 'Cars') {
            iconName = 'car';
          } else if (route.name === 'Articles') {
            iconName = 'feed';
          }

          return <FAIcon name={iconName} size={size} color={color} />;
        },
      tabBarActiveTintColor: colors.SPEED,
      tabBarInactiveTintColor: colors.WHITE,
      tabBarStyle: {
        backgroundColor: colors.BRG,
        paddingTop: 8,
        paddingBottom: 8,
        height: 90,
      },
      headerStyle: {
        backgroundColor: colors.BRG,
        height: 100, // Increased height for better spacing
      },
      headerTintColor: colors.WHITE,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerLeft: () => (
        <View style={styles.headerLeft}>
          <HamburgerMenu navigation={navigation} />
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => navigation.navigate('Search')}
          >
            <FAIcon name="search" size={20} color={colors.WHITE} />
          </TouchableOpacity>
        </View>
      ),
      headerRight: () => (
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.garageButton}
            onPress={() => navigation.navigate('MyGarage')}
          >
            <FAIcon name="car" size={16} color={colors.WHITE} />
            <Text style={styles.garageButtonText}>My Garage</Text>
          </TouchableOpacity>
          <ProfileButton onPress={() => navigation.navigate('Profile')} />
        </View>
      ),
    })}
  >
    <Tab.Screen 
      name="Feed" 
      component={HomeScreen}
      options={{ title: 'Feed' }}
    />
    <Tab.Screen 
      name="Society" 
      component={SocietyScreen}
      options={{ title: 'Society' }}
    />
    <Tab.Screen 
      name="Browse" 
      component={MarketplaceScreen}
      options={{ title: 'Marketplace' }}
    />
    <Tab.Screen 
      name="Cars" 
      component={CarsScreen}
      options={{ title: 'Cars' }}
    />
    <Tab.Screen 
      name="Articles" 
      component={ArticlesScreen}
      options={{ title: 'Articles' }}
    />
    </Tab.Navigator>
    
    {/* Floating Action Button */}
    <NewButtonFAB />
  </View>
);

const AppNavigator = () => (
  <AppStack.Navigator screenOptions={{ headerShown: false }}>
    <AppStack.Screen name="Main" component={TabNavigator} />
    <AppStack.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{
        headerShown: true,
        title: 'Profile',
        headerStyle: {
          backgroundColor: colors.BRG,
          height: 100, // Increased height for better spacing
        },
        headerTintColor: colors.WHITE,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
    <AppStack.Screen 
      name="Search" 
      component={SearchScreen}
      options={{
        headerShown: true,
        title: 'Search',
        headerStyle: {
          backgroundColor: colors.BRG,
          height: 100, // Increased height for better spacing
        },
        headerTintColor: colors.WHITE,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
    <AppStack.Screen 
      name="MyGarage" 
      component={MyGarageScreen}
      options={{
        headerShown: true,
        title: 'My Garage',
        headerStyle: {
          backgroundColor: colors.BRG,
          height: 100,
        },
        headerTintColor: colors.WHITE,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
    <AppStack.Screen 
      name="UserDetail" 
      component={UserDetailScreen}
      options={({ route }) => ({
        headerShown: true,
        title: route.params?.user?.username || route.params?.user?.name || 'User Profile',
        headerStyle: {
          backgroundColor: colors.BRG,
          height: 100, // Increased height for better spacing
        },
        headerTintColor: colors.WHITE,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    />
    <AppStack.Screen 
      name="EventDetail" 
      component={EventDetailScreen}
      options={({ route }) => ({
        headerShown: false, // Custom header in component
        title: route.params?.event?.title || 'Event Details',
      })}
    />
    <AppStack.Screen 
      name="CarDetail" 
      component={CarDetailScreen}
      options={({ route }) => ({
        headerShown: true,
        title: 'Car Details',
        headerStyle: {
          backgroundColor: colors.BRG,
          height: 100,
        },
        headerTintColor: colors.WHITE,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    />
    <AppStack.Screen 
      name="PostDetail" 
      component={require('../components/PostDetailModal').default}
      options={{
        headerShown: false,
        presentation: 'modal',
      }}
    />
    
    {/* Brand/Model Detail Pages */}
    <AppStack.Screen 
      name="BrandDetail" 
      component={BrandDetailScreen}
      options={({ route }) => ({
        headerShown: true,
        title: route.params?.brandName || 'Brand Details',
        headerStyle: {
          backgroundColor: colors.BRG,
          height: 100,
        },
        headerTintColor: colors.WHITE,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    />
    <AppStack.Screen 
      name="ModelDetail" 
      component={ModelDetailScreen}
      options={({ route }) => ({
        headerShown: true,
        title: `${route.params?.brandName || 'Brand'} ${route.params?.modelName || 'Model'}`,
        headerStyle: {
          backgroundColor: colors.BRG,
          height: 100,
        },
        headerTintColor: colors.WHITE,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    />
    
    {/* Marketing Pages */}
    <AppStack.Screen 
      name="About" 
      component={AboutScreen}
      options={{
        headerShown: true,
        title: 'About',
        headerStyle: {
          backgroundColor: colors.BRG,
          height: 100,
        },
        headerTintColor: colors.WHITE,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
    <AppStack.Screen 
      name="Features" 
      component={FeaturesScreen}
      options={{
        headerShown: true,
        title: 'Features',
        headerStyle: {
          backgroundColor: colors.BRG,
          height: 100,
        },
        headerTintColor: colors.WHITE,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
    <AppStack.Screen 
      name="Changelog" 
      component={ChangelogScreen}
      options={{
        headerShown: true,
        title: 'Changelog',
        headerStyle: {
          backgroundColor: colors.BRG,
          height: 100,
        },
        headerTintColor: colors.WHITE,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
    <AppStack.Screen 
      name="Roadmap" 
      component={RoadmapScreen}
      options={{
        headerShown: true,
        title: 'Roadmap',
        headerStyle: {
          backgroundColor: colors.BRG,
          height: 100,
        },
        headerTintColor: colors.WHITE,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
    <AppStack.Screen 
      name="Support" 
      component={SupportScreen}
      options={{
        headerShown: true,
        title: 'Support',
        headerStyle: {
          backgroundColor: colors.BRG,
          height: 100,
        },
        headerTintColor: colors.WHITE,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
  </AppStack.Navigator>
);

const MainNavigator = () => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isLoggedIn ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  searchButton: {
    marginLeft: 12,
    padding: 4,
  },
  garageButton: {
    marginRight: 12,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  garageButtonText: {
    color: colors.WHITE,
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  profileButton: {
    // marginRight: 16, // removed since it's now inside headerRight
  },
  profileButtonImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  profileButtonPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.LIGHT_BRG,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.WHITE,
  },
})

export default MainNavigator;