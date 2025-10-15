import React from 'react';
import { colors } from '../../constants/colors';
import {
	Text,
	StyleSheet,
} from 'react-native';

const Title = ({title, small = false}) => {

	return (
		<Text style={small ? styles.titleStylesSmall : styles.titleStyles} numberOfLines={2}>
			{title}
		</Text>
	)
}

const styles = StyleSheet.create({
	titleStyles: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.WHITE,
		marginVertical: 6,
  },
	titleStylesSmall: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.WHITE,
		marginVertical: 6,
  },
});

export default Title;
