import React, { useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const FadeScrollView = ({
  children,
  horizontal = true,
  showsHorizontalScrollIndicator = false,
  style,
  contentContainerStyle,
  fadeWidth = 20,
  fadeColor = '#ffffff',
  ...props
}) => {
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);
  const scrollViewRef = useRef(null);

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollX = contentOffset.x;
    const contentWidth = contentSize.width;
    const viewWidth = layoutMeasurement.width;

    setShowLeftFade(scrollX > 5);
    setShowRightFade(scrollX < contentWidth - viewWidth - 5);

    // Call parent's onScroll if provided
    if (props.onScroll) {
      props.onScroll(event);
    }
  };

  const handleContentSizeChange = (contentWidth, contentHeight) => {
    // Initial check for right fade
    if (scrollViewRef.current) {
      scrollViewRef.current.getNode?.()?.measure?.((x, y, width, height) => {
        setShowRightFade(contentWidth > width);
      });
    }

    // Call parent's onContentSizeChange if provided
    if (props.onContentSizeChange) {
      props.onContentSizeChange(contentWidth, contentHeight);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal={horizontal}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        onScroll={handleScroll}
        onContentSizeChange={handleContentSizeChange}
        scrollEventThrottle={16}
        contentContainerStyle={contentContainerStyle}
        {...props}
      >
        {children}
      </ScrollView>

      {/* Left fade */}
      {showLeftFade && (
        <LinearGradient
          colors={[fadeColor, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.leftFade,
            { width: fadeWidth }
          ]}
          pointerEvents="none"
        />
      )}

      {/* Right fade */}
      {showRightFade && (
        <LinearGradient
          colors={['transparent', fadeColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.rightFade,
            { width: fadeWidth }
          ]}
          pointerEvents="none"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  leftFade: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  rightFade: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
});

export default FadeScrollView;