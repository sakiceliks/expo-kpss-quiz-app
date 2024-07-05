import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming, runOnJS } from 'react-native-reanimated';
import { Canvas, LinearGradient } from '@shopify/react-native-skia';
import TrophySvg from '../../assets/trophy.svg';
import { Path, Svg, Path as SvgPath } from 'react-native-svg';
import { useState,useEffect } from 'react';


import { styles } from './styles';
import { THEME } from '../../styles/theme';

export function Stars() {
  const [svgData, setSvgData] = useState<string | null>(null);

  useEffect(() => {
    // Load SVG data asynchronously (replace with your actual loading logic)
    fetch(TrophySvg)
      .then(response => response.text())
      .then(setSvgData);
  }, []);





  return (
    <View style={styles.container}>
      {svgData && (
        <Animated.View style={[styles.backStar]}>
          <Canvas style={{ width: 200, height: 200 }}>
            <Svg width={200} height={200}>
              <SvgPath
                d={svgData} // Use the loaded SVG data
                fill="transparent"
                stroke={THEME.COLORS.GREY_500}
              />
            </Svg>
          </Canvas>
        </Animated.View>
      )}

   </View>
  );
}




