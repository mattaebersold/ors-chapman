import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	Image,
	TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/layout';


const BaseRow = ({
	// Image props
	imageSource,
	// placeholderIcon = 'camera',
	// placeholderText = 'No Image',
	
	// Action props
	onPress,
		
	// Layout props
	headerComponent,
	footerComponent,
	badges,

	topRight,
	topLeft,
	bottomRight,
	bottomLeft,
	topCenter,
	bottomCenter,

}) => {
	
	const getImageSource = () => {
		if (typeof imageSource === 'string') {
			return { uri: imageSource };
		}
		return imageSource;
	};

	const renderImageContainer = () => (
		<View style={styles.imageContainer}>
			{imageSource ? (
				<Image 
					source={getImageSource()} 
					style={styles.image}
					resizeMode="cover"
				/>
			) : (
				<Image
					source={require('../../../assets/placeholder.jpg')}
					style={styles.image}
					resizeMode="cover"
				/>
			)}
			
			{/* Gradient overlay */}
			<LinearGradient
				colors={['rgba(240, 240, 240, 0)', 'rgba(240, 240, 240, 1)']}
				locations={[0, 1]}
				start={{ x: 1, y: 0 }}
				end={{ x: 0, y: 0 }}
				style={styles.gradient}
			/>
			

		</View>
	);

	const renderContent = () => (
		<View style={styles.content}>

			{topLeft && (
				<View style={styles.topLeft}>{topLeft}</View>
			)}

			{topRight && (
				<View style={styles.topRight}>{topRight}</View>
			)}

			{bottomLeft && (
				<View style={styles.bottomLeft}>{bottomLeft}</View>
			)}

			{bottomRight && (
				<View style={styles.bottomRight}>{bottomRight}</View>
			)}

			{topCenter && (
				<View style={styles.topCenter}>{topCenter}</View>
			)}

			{bottomCenter && (
				<View style={styles.bottomCenter}>{bottomCenter}</View>
			)}

		</View>
	);

	const CardContainer = onPress ? TouchableOpacity : View;
	const containerProps = onPress ? { onPress, activeOpacity: 0.8 } : {};

	return (
		<CardContainer style={styles.card} {...containerProps}>
			{renderImageContainer()}
			{renderContent()}
		</CardContainer>
	);
};

const styles = StyleSheet.create({
	card: {
		aspectRatio: 85/25,
		width: '100%',
		elevation: 3,
		overflow: 'hidden',
		marginTop: 4,
		backgroundColor: colors.TEXT_LIGHT,
		borderRadius: 10,
		marginBottom: spacing.sm,
		marginTop: spacing.sm,
	},
	imageContainer: {
		position: 'absolute',
		width: '60%',
		height: '100%',
		right: 0
	},
	image: {
		position: 'absolute',
		inset: '0',
		width: '100%',
		height: '100%',
		objectFit: 'cover',
	},
	gradient: {
		position: 'absolute',
		left: 0,
		top: 0,
		bottom: 0,
		width: '50%'
	},
	placeholderContainer: {
		width: '100%',
		backgroundColor: colors.LIGHT_GRAY,
		justifyContent: 'center',
		alignItems: 'center',
	},
	content: {
		flex: 1,
	},
	topLeft: {
		position: 'absolute',
		top: 12,
		left: 12,
		width: '50%'
	},
	topRight: {
		position: 'absolute',
		top: 12,
		right: 12,
		width: '50%',
		alignItems: 'flex-end'
	},
	bottomLeft: {
		position: 'absolute',
		bottom: 10,
		left: 10,
		width: '80%',
	},
	bottomRight: {
		position: 'absolute',
		bottom: 16,
		right: 12,
		width: '20%',
		alignItems: 'flex-end'
	},
	bottomCenter: {
		position: 'absolute',
		bottom: 16,
		width: '75%',
		alignItems: 'center',
		alignSelf: 'center'
	},
	topCenter: {
		position: 'absolute',
		top: 16,
		width: '50%',
		alignItems: 'center',
		alignSelf: 'center'
	},
});

export default BaseRow;