import { useEffect, useState } from 'react';
import type { Numeric, Unit } from 'relative-time-format';
import RelativeTimeFormat from 'relative-time-format';

export type FormattedRelativeTimeProps = {
  value: Date;
  numeric?: Numeric;
  updateIntervalInSeconds?: number;
};

const formatRelativeTime = (value: Date, numeric: Numeric = 'auto') => {
  let diff = Math.floor((value.getTime() - Date.now()) / 1000);
  let unit: Unit = 'second';
  if (-diff >= 86400) {
    unit = 'day';
    diff = diff / 86400;
  } else if (-diff >= 3600) {
    unit = 'hour';
    diff = diff / 3600;
  } else if (-diff >= 60) {
    unit = 'minute';
    diff = diff / 60;
  }
  return new RelativeTimeFormat('default', { numeric }).format(
    Math.round(diff),
    unit
  );
};

const FormattedRelativeTime = ({
  value,
  numeric = 'auto',
  updateIntervalInSeconds,
}: FormattedRelativeTimeProps) => {
  const [time, setTime] = useState(formatRelativeTime(value, numeric));

  useEffect(() => {
    if (updateIntervalInSeconds) {
      const interval = setInterval(() => {
        setTime(formatRelativeTime(value, numeric));
      }, updateIntervalInSeconds * 1000);

      return () => clearInterval(interval);
    }
  }, [value, numeric, updateIntervalInSeconds]);

  return <>{time}</>;
};

export default FormattedRelativeTime;
