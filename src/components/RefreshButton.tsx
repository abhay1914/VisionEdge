type RefreshButtonProps = {
  onClick: () => void;
  loading?: boolean;
};

export default function RefreshButton({
  onClick,
  loading = false,
}: RefreshButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        background: "#e2e8f0",
        color: "#020617",
        border: "none",
        borderRadius: "7px",
        padding: "10px 17px",
        cursor: loading ? "not-allowed" : "pointer",
        fontWeight: "bold",
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? "Refreshing..." : "↻ Refresh"}
    </button>
  );
}
