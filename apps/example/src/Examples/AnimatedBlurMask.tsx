import React from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  BlurMask,
  Canvas,
  Group,
  Paint,
  Path,
  Skia,
} from "@shopify/react-native-skia";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import {
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export const lerp = (a: number, b: number, t: number) => {
  "worklet";
  return a + (b - a) * t;
};

export const AnimatedBlurMask = () => {
  const imageSize = 375;
  const progress = useSharedValue(0);
  const canvasSize = imageSize / 2.2;
  const strokeWidth = Math.min(canvasSize * 0.06, 15);
  const radius = (canvasSize - strokeWidth) / 2;
  const center = canvasSize / 2;
  const strokeColor = "#0066CC";
  // Looping animation 0 → 1 → 0
  useFocusEffect(
    useCallback(() => {
      progress.value = withRepeat(withTiming(1, { duration: 3000 }), -1, true);
    }, [])
  );

  const animatedPath = useDerivedValue(() => {
    const t = progress.value;

    // Define key animation phases
    const growEnd = 0.5; // 0 → 0.25: arc end grows
    const moveStart = 0.75; // 0 → 0.75: arc start moves

    // Arc end angle
    let endAngle = 0;
    if (t <= growEnd) {
      endAngle = lerp(-50, -90, t / growEnd);
    } else {
      endAngle = lerp(-90, -180, (t - growEnd) / (1 - growEnd));
    }

    // Arc start angle
    let startAngle = 0;
    if (t <= moveStart) {
      startAngle = lerp(0, -90, t / moveStart);
    } else {
      startAngle = lerp(-90, -130, (t - moveStart) / (1 - moveStart));
    }

    const rect = {
      x: center - radius,
      y: center - radius,
      width: radius * 2,
      height: radius * 2,
    };

    const path = Skia.Path.Make();
    path.addArc(rect, startAngle, endAngle - startAngle);
    return path;
  }, [progress]);

  return (
    <View style={[styles.container]}>
      <View style={[StyleSheet.absoluteFill]}>
        <Canvas style={{ width: canvasSize + 20, height: canvasSize + 20 }}>
          {/* Glowing Arc */}
          <Group transform={[{ translateX: 10 }, { translateY: 10 }]}>
            <Path path={animatedPath} style="stroke" strokeWidth={strokeWidth}>
              <Paint
                color={strokeColor}
                strokeWidth={strokeWidth * 1.25}
                strokeCap="round"
              >
                <BlurMask blur={5} style="normal" />
              </Paint>
            </Path>
          </Group>
        </Canvas>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 200,
    marginLeft: 100,
  },
});
