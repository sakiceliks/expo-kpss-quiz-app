import React, { useEffect } from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Canvas, Skia, Path, Circle, BlurMask } from '@shopify/react-native-skia';
import Animated, { useSharedValue, withTiming, Easing } from 'react-native-reanimated';

import { styles } from './styles';
import { THEME } from '../../styles/theme';


type Props = TouchableOpacityProps & {
  checked: boolean;
  title: string;
}

const CHECK_SIZE = 28;
const CHECK_STROKE = 2;
const RADIUS = (CHECK_SIZE - CHECK_STROKE) / 2;
const CENTER_CIRCLE = RADIUS / 2;

export function Option({ checked, title, ...rest }: Props) {
  const percentage = useSharedValue(0);
  const circle = useSharedValue(0);


  const path = Skia.Path.Make();
  path.addCircle(CHECK_SIZE, CHECK_SIZE, RADIUS)

   useEffect(() => {
    if (checked) {
      percentage.value = withTiming(1, { duration: 700 });
      circle.value = withTiming(CENTER_CIRCLE, { duration: 700, easing: Easing.out(Easing.exp) });
    } else {
      percentage.value = withTiming(0, { duration: 700 });
      circle.value = withTiming(0, { duration: 300 });
    }
  }, [checked]);
  return (
    <TouchableOpacity
      style={
        [
          styles.container,
          checked && styles.checked
        ]
      }
      {...rest}
    >
      <Text style={styles.title}>
        {title}
      </Text>

      <Canvas style={{width: CHECK_SIZE * 2, height: CHECK_SIZE * 2}}>
        <Path
          path={path}
          color={THEME.COLORS.GREY_500}
          style="stroke"
          strokeWidth={CHECK_STROKE}
        />

        <Path
          path={path}
          color={THEME.COLORS.BRAND_LIGHT}
          style="stroke"
          strokeWidth={CHECK_STROKE}
          start={0}
          end={percentage}
        />

        <Circle
          cx={CHECK_SIZE}
          cy={CHECK_SIZE}
          r={circle}
          color={THEME.COLORS.BRAND_LIGHT}
        >
          <BlurMask blur={4} style="solid" />
        </Circle>
      </Canvas>
    </TouchableOpacity>
  );
}