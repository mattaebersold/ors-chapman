import { Schema } from '../types/postTypes';

// Sanitize input (simple version for React Native)
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim();
};

// Create FormData similar to Murray's approach but adapted for React Native
export const createFormData = (postData, schema = Schema) => {
  const fd = new FormData();

  Object.keys(schema).forEach((key) => {
    if (postData[key] !== undefined) {
      if (key === "gallery" && Array.isArray(postData[key])) {
        postData[key].forEach((imgObj, index) => {
          
          // New images from React Native (isNew flag)
          if (imgObj.isNew && imgObj.uri) {
            // Append the actual file for React Native
            fd.append(key, {
              uri: imgObj.uri,
              type: imgObj.type || 'image/jpeg',
              name: imgObj.filename || `image_${index}.jpg`,
            });
            // Add metadata for new image
            fd.append(`modifyImage:new:${imgObj.filename || `image_${index}.jpg`}`, index);
          } else {
            // Handle existing images (for future editing functionality)
            if (imgObj.remove) {
              fd.append(`modifyImage:remove:${index}`, imgObj.filename);
            } else {
              fd.append(
                `modifyImage:setIndex:${index}:${imgObj.filename}`,
                imgObj.index || index
              );
            }
          }
        });
      } else if (key === "images" && Array.isArray(postData[key])) {
        // Handle the images array from our React Native form
        postData[key].forEach((imgObj, index) => {
          
          if (imgObj.isNew && imgObj.uri) {
            // Append to gallery key (server expects this)
            fd.append('gallery', {
              uri: imgObj.uri,
              type: imgObj.type || 'image/jpeg',
              name: imgObj.filename || `image_${index}.jpg`,
            });
            // Add metadata for new image
            fd.append(`modifyImage:new:${imgObj.filename || `image_${index}.jpg`}`, index);
          }
        });
      } else if (key === "group_ids" && Array.isArray(postData[key])) {
        fd.append(key, JSON.stringify(postData[key]));
      } else if (key === "also_public" && typeof postData[key] === 'boolean') {
        fd.append(key, String(postData[key]));
      } else if (key === "video" && postData[key]) {
        // Handle video files (for future video support)
        if (postData[key].uri) {
          fd.append("video", {
            uri: postData[key].uri,
            type: postData[key].type || 'video/mp4',
            name: postData[key].filename || 'video.mp4',
          });
        }
      } else {
        // Handle regular text fields
        const value = postData[key];
        if (value !== null && value !== undefined) {
          fd.append(key, sanitizeInput(value.toString()));
        }
      }
    }
  });

  // Only add car fields if they have values (don't send empty strings)
  const carFields = ['year', 'make', 'model', 'trim', 'color'];
  carFields.forEach(field => {
    if (postData[field] && postData[field].trim() !== '') {
      fd.append(field, sanitizeInput(postData[field].toString()));
    }
  });

  // Debug logging
  // for (const pair of fd.entries()) {
  //   console.log(pair[0], typeof pair[1] === 'object' ? JSON.stringify(pair[1]) : pair[1]);
  // }

  return fd;
};

// Helper function to prepare post data from form state
export const preparePostData = (formData) => {
  return {
    ...formData,
    gallery: formData.images || [], // Map images to gallery for server compatibility
  };
};