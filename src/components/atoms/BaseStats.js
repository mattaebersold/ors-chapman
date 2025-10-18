import React from 'react';
import {
	View,
	StyleSheet,
} from 'react-native';
const BaseStats = ({small, children}) => {
	
	return (
		<View 
			key="type"
			style={small ? styles.statsSmall : styles.stats}
		>
			{children}
		</View>
	);
}

const styles = StyleSheet.create({
	stats: {
    flexDirection: 'row',
    gap: 8,
  },
	statsSmall: {
    flexDirection: 'row',
  },
});

export default BaseStats;