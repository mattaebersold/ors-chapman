import React, { useCallback } from 'react';

import FAIcon from '../ui/FAIcon';
import { colors } from '../../constants/colors';
import { useModal } from '../../contexts/ModalContext';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useGetUserDetailsQuery } from '../../services/apiService';

const EditButton = ({post}) => {

	const { showEditPostModal } = useModal();
  const { data: currentUser } = useGetUserDetailsQuery();
  const isOwner = currentUser && post && (
    currentUser.user_id === post.user_id
  );

	const handleEdit = useCallback(() => {
    showEditPostModal(post);
  }, [showEditPostModal, post]);


	return (
		<>
			{isOwner && (
				<View style={styles.editCell}>
					<TouchableOpacity
						style={styles.editButton}
						onPress={handleEdit}
					>
						<Text style={{ color: colors.WHITE, fontSize: 14 }}>⋯</Text>
{/* 
						<FAIcon name="ellipsis" size={14} color={colors.WHITE} /> */}
					</TouchableOpacity>
				</View>
			)}
		</>
	)

}

const styles = StyleSheet.create({
editButton: {
		width: 32,
		height: 32,
    borderRadius: 16,
    backgroundColor: colors.BLACK,
		justifyContent: 'center',
		alignItems: 'center',
		opacity: 0.6,
  },

});

export default EditButton;