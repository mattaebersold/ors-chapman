import React from 'react';
import { colors } from '../../constants/colors';
import {
	View,
	Text,
	StyleSheet,
} from 'react-native';
import FAIcon from '../ui/FAIcon';


const CardStat = ({count, icon}) => {

	return (
		<View style={styles.statItem}>
			<Text style={styles.statText}>{count}</Text>
			<FAIcon name={icon} size={16} color={colors.WHITE} />
		</View>
	)
}

const styles = StyleSheet.create({
	statItem: {
    marginLeft: 7,
    color: colors.WHITE,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
		padding: 6
  },

  statText:{
   fontWeight: '800',
    color: colors.WHITE
  },
});

export default CardStat;
