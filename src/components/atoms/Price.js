import React from 'react';
import { colors } from '../../constants/colors';
import {
	View,
	Text,
	StyleSheet,
} from 'react-native';
import { spacing } from '../../constants/layout';


const Price = ({post}) => {

	return (

		<View style={styles.priceOverlay}>
			{post.previous_price ? (
				<View style={styles.priceContainer}>
					<Text style={styles.previousPriceText}>
						{post.previous_price.startsWith('$') ? post.previous_price : `$${post.previous_price}`}
					</Text>
					<Text style={styles.currentPriceText}>
						{post.price.startsWith('$') ? post.price : `$${post.price}`}
					</Text>
				</View>
			) : (
				<Text style={styles.priceText}>
					{post.price.startsWith('$') ? post.price : `$${post.price}`}
				</Text>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	priceOverlay: {
    backgroundColor: 'rgba(57, 142, 51, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
		alignSelf: 'flex-start',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    color: colors.WHITE,
    fontSize: 11,
    fontWeight: 'bold',
  },
  previousPriceText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '500',
    textDecorationLine: 'line-through',
  },
  currentPriceText: {
    color: colors.WHITE,
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default Price;
