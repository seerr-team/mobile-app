import { useRef } from 'react';
import Svg, { Circle } from 'react-native-svg';

interface ProgressCircleProps {
  className?: string;
  progress?: number;
  useHeatLevel?: boolean;
  size?: number;
}

const ProgressCircle = ({
  className,
  progress = 0,
  useHeatLevel,
  size = 24,
}: ProgressCircleProps) => {
  const ref = useRef<Circle>(null);

  let color = '';
  let emptyColor = '#d1d5db'; // gray-300

  if (useHeatLevel) {
    color = '#10b981'; // green-500

    if (progress <= 50) {
      color = '#eab308'; // yellow-500
    }

    if (progress <= 10) {
      color = '#ef4444'; // red-500
    }

    if (progress === 0) {
      emptyColor = '#dc2626'; // red-600
    }
  }

  const radius = 10;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Svg className={className} width={size} height={size} viewBox="0 0 24 24">
      <Circle
        stroke={emptyColor}
        strokeWidth="3"
        fill="transparent"
        r={radius}
        cx="12"
        cy="12"
        opacity={0.3}
      />
      <Circle
        ref={ref}
        stroke={color}
        strokeWidth="3"
        fill="transparent"
        r={radius}
        cx="12"
        cy="12"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        transform="rotate(-90 12 12)"
      />
    </Svg>
  );
};

export default ProgressCircle;
