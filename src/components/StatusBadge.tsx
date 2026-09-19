type StatusBadgeProps = {
  status: string;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isRunning = status.toLowerCase() === "running";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 10px",
        borderRadius: "20px",
        fontSize: "11px",
        textTransform: "uppercase",
        color: isRunning ? "#86efac" : "#cbd5e1",
        background: isRunning ? "#14532d" : "#334155",
      }}
    >
      <span>●</span>
      {status}
    </span>
  );
}
