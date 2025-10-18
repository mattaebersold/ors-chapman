import React from 'react';
import { colors } from '../../constants/colors';
import {
	Text,
	StyleSheet,
} from 'react-native';

const Title = ({title, small = false}) => {
	const truncateText = (text, maxLength) => {
		if (!text) return '';
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + '...';
	};

	const displayTitle = small ? truncateText(title, 13) : truncateText(title, 25);

	return (
		<Text style={small ? styles.titleStylesSmall : styles.titleStyles} numberOfLines={2}>
			{displayTitle}
		</Text>
	)
}

const styles = StyleSheet.create({
	titleStyles: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.WHITE,
		marginVertical: 8,
  },
	titleStylesSmall: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.WHITE,
		marginVertical: 6,
  },
});

export default Title;