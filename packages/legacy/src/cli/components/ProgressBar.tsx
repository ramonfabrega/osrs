import { Text } from "ink";
import { useEffect, useState } from "react";

type ProgressBarProps = {
  nextFetchAt: number | null;
  interval: number;
  width?: number;
};

export default function ProgressBar({
  nextFetchAt,
  interval,
  width = 40,
}: ProgressBarProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(timer);
  }, []);

  if (!nextFetchAt) {
    return <Text dimColor>{slots(width, "░")}</Text>;
  }

  const { filled, empty } = calculateSlots(nextFetchAt, interval, width);

  return (
    <Text>
      {slots(filled, "█")}
      <Text dimColor>{slots(empty, "░")}</Text>
    </Text>
  );
}

function calculateSlots(
  nextFetchAt: number,
  interval: number,
  totalSlots: number
) {
  const timeRemainingMs = Math.max(0, nextFetchAt - Date.now());
  const progress = 1 - timeRemainingMs / interval;

  const filled = Math.floor(progress * totalSlots);
  const empty = totalSlots - filled;
  return { filled, empty };
}

function slots(length: number, char: string): string {
  return char.repeat(length);
}
