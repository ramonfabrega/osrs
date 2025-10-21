import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import zod from "zod";
import { fetchStars, type ParsedStar } from "../../stars";
import { usePolling } from "../../hooks/use-polling";
import ProgressBar from "../components/ProgressBar";
import Table, { calculateTableWidth, createColumns } from "../components/Table";

export const alias = "s";

export const options = zod.object({
  interval: zod.number().default(60).describe("Polling interval in seconds"),
});

type Props = {
  options: zod.infer<typeof options>;
};

export default function Stars({ options }: Props) {
  const intervalMs = options.interval * 1000;
  const { data, loading, error, nextFetchAt } = usePolling(
    fetchStars,
    intervalMs
  );

  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">Error fetching stars:</Text>
        <Text color="red">{error.message}</Text>
      </Box>
    );
  }

  if (loading || !data) {
    return (
      <Box>
        <Text color="cyan">
          <Spinner type="dots" />
        </Text>
        <Text> Loading stars...</Text>
      </Box>
    );
  }

  if (data.length === 0) {
    return <Text color="gray">No active stars found</Text>;
  }

  const columns = createColumns<ParsedStar>([
    {
      accessor: "tier",
      header: "Tier",
      align: "center",
      cell: (value) => <Text color={getTierColor(value)}>{value}</Text>,
    },
    { accessor: "world", header: "World", align: "center" },
    { accessor: "location", header: "Location" },
    { accessor: "called", header: "Called" },
    {
      accessor: "key",
      header: "Key",
      cell: (value) => <Text dimColor>{value}</Text>,
    },
  ]);

  const tableWidth = calculateTableWidth(data, columns);
  const title = `Shooting Stars (${data.length} active)`;
  const spacing = 1;
  const progressBarWidth = calculateProgressBarWidth(
    title,
    tableWidth,
    spacing
  );

  return (
    <Box flexDirection="column" marginTop={1}>
      <Box>
        <Text bold color="cyan">
          {title}
        </Text>
        <Box marginLeft={spacing}>
          <ProgressBar
            nextFetchAt={nextFetchAt}
            interval={intervalMs}
            width={progressBarWidth}
          />
        </Box>
      </Box>

      <Table data={data} columns={columns} />
    </Box>
  );
}

function calculateProgressBarWidth(
  title: string,
  tableWidth: number,
  spacing: number
): number {
  const titleLength = title.length;
  return Math.max(20, tableWidth - titleLength - spacing);
}

function getTierColor(tier: number | string) {
  switch (tier) {
    case 9:
      return "#00ff00";
    case 8:
      return "#40ff00";
    case 7:
      return "#80ff00";
    case 6:
      return "#bfff00";
    case 5:
      return "#ffff00";
    case 4:
      return "#ffbf00";
    case 3:
      return "#ff8000";
    case 2:
      return "#ff4000";
    case 1:
      return "#ff0000";
    default:
      return "#ffffff";
  }
}
