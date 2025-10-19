import React from 'react';
import {
	View,
	Text,
	StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getContrastTextColor } from '../../constants/colors';

const BaseTag = ({color, label, pro, admin}) => {
	// Define rainbow gradients with fewer colors
	const proGradient = ['#00BFFF', '#00FF00', '#9370DB'];
	const adminGradient = ['#FF1493', '#9370DB', '#00BFFF'];

	// Determine if we should use a gradient
	const isPro = color === 'pro' || pro;
	const isAdmin = color === 'admin' || admin;
	const useGradient = isPro || isAdmin;

	// Get the appropriate gradient colors
	const gradientColors = isPro ? proGradient : isAdmin ? adminGradient : [];

	// Get text color
	const textColor = useGradient ? '#000' : getContrastTextColor(color);

	if (useGradient) {
		return (
			<LinearGradient
				colors={gradientColors}
				start={{x: .2, y: .2}}
				end={{x: 1.2, y: 1.2}}
				style={styles.tag}
			>
				<Text style={[styles.tagText, { color: textColor }]}>
					{label}
				</Text>
			</LinearGradient>
		);
	}

	return (
		<View
			style={[
				styles.tag,
				{ backgroundColor: color }
			]}
		>
			<Text style={[
				styles.tagText,
				{ color: textColor }
			]}>
				{label}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	tag: {
    borderRadius: 30,
    elevation: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 6,
    alignSelf: 'flex-start',
    opacity: .9
  },
  tagText: {
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: .5,
    fontSize: 9,
  },
});

export default BaseTag;