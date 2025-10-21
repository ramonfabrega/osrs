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

  const progress = calculateProgress(nextFetchAt, interval);
  const filledSlots = calculateFilledSlots(progress, width);
  const emptySlots = width - filledSlots;

  return (
    <Text>
      {slots(filledSlots, "█")}
      <Text dimColor>{slots(emptySlots, "░")}</Text>
    </Text>
  );
}

function calculateProgress(nextFetchAt: number, interval: number): number {
  const timeRemainingMs = Math.max(0, nextFetchAt - Date.now());
  return 1 - timeRemainingMs / interval;
}

function calculateFilledSlots(progress: number, totalSlots: number): number {
  return Math.floor(progress * totalSlots);
}

function slots(length: number, char: string): string {
  return char.repeat(length);
}
