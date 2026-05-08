import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { theme } from '../theme';

export default function Logo({ size = 48, showName = false }) {
  const scale = size / 64;

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={theme.colors.primaryLight} />
            <Stop offset="1" stopColor={theme.colors.primary} />
          </LinearGradient>
          <LinearGradient id="dropGrad" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0" stopColor={theme.colors.waterBlue} />
            <Stop offset="1" stopColor={theme.colors.accent} />
          </LinearGradient>
        </Defs>

        {/* Background circle */}
        <Circle cx="32" cy="32" r="30" fill={theme.colors.primaryDark} opacity="0.08" />

        {/* Main leaf — a curved, tapered leaf shape */}
        <Path
          d="M32 12 C18 18, 12 32, 20 46 C22 42, 26 36, 32 32 C38 36, 42 42, 44 46 C52 32, 46 18, 32 12Z"
          fill="url(#leafGrad)"
        />

        {/* Leaf centre vein */}
        <Path
          d="M32 16 C30 26, 31 34, 32 44"
          stroke={theme.colors.primaryDark}
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.35"
        />

        {/* Side veins — left */}
        <Path
          d="M32 24 C28 26, 24 30, 22 34"
          stroke={theme.colors.primaryDark}
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.25"
        />

        {/* Side veins — right */}
        <Path
          d="M32 24 C36 26, 40 30, 42 34"
          stroke={theme.colors.primaryDark}
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.25"
        />

        {/* Water droplet sitting at the leaf tip */}
        <Path
          d="M32 44 C32 44, 27 50, 27 53 C27 55.8, 29.2 58, 32 58 C34.8 58, 37 55.8, 37 53 C37 50, 32 44, 32 44Z"
          fill="url(#dropGrad)"
        />

        {/* Droplet highlight */}
        <Circle cx="30.5" cy="52" r="1.2" fill="#FFFFFF" opacity="0.6" />
      </Svg>

      {showName && (
        <Text
          style={{
            marginTop: theme.spacing.sm,
            fontSize: theme.fontSize.lg * scale,
            fontWeight: '700',
            color: theme.colors.primary,
            letterSpacing: 0.5,
          }}
        >
          PlantApp
        </Text>
      )}
    </View>
  );
}
