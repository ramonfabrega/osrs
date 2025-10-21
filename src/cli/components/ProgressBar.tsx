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

  const totalSlots = calculateTotalSlots(width);

  if (!nextFetchAt) {
    return <Text dimColor>{slots(totalSlots, "○")}</Text>;
  }

  const progress = calculateProgress(nextFetchAt, interval);
  const filledSlots = calculateFilledSlots(progress, totalSlots);
  const emptySlots = totalSlots - filledSlots;

  return (
    <Text>
      {slots(filledSlots, "●")}
      {filledSlots > 0 && emptySlots > 0 && " "}
      <Text dimColor>{slots(emptySlots, "○")}</Text>
    </Text>
  );
}

function calculateTotalSlots(width: number): number {
  return Math.floor((width + 1) / 2);
}

function calculateProgress(nextFetchAt: number, interval: number): number {
  const timeRemainingMs = Math.max(0, nextFetchAt - Date.now());
  return 1 - timeRemainingMs / interval;
}

function calculateFilledSlots(progress: number, totalSlots: number): number {
  return Math.floor(progress * totalSlots);
}

function slots(length: number, char: string): string {
  return Array.from({ length }, () => char).join(" ");
}
