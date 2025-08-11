import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import Listing from '../components/Listing';


const HomeScreen = () => {
  const { userInfo } = useSelector(state => state.auth);

  // config for the listing
  const listingConfig = {
    type: 'posts',
    heading: ''
  }

  // display options for the listing
  const displayOptions = {
    badgeProfile: false,
    badgeCar: false,
  }

  return (
    <View style={styles.container}>
      <Listing 
        config={listingConfig} 
        displayOptions={displayOptions} 
        showFilters={true} 
        filterTypes={['postType']} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default HomeScreen;