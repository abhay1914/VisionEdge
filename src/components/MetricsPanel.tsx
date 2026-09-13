type Metrics = {
  framesProcessed: number;
  errors: number;
  startedAt?: string | null;
  lastFrameAt?: string | null;
};

type MetricsPanelProps = {
  metrics?: Metrics;
};

export default function MetricsPanel({
  metrics,
}: MetricsPanelProps) {
  const formatTime = (value?: string | null) => {
    if (!value) return "—";

    return new Date(value).toLocaleTimeString();
  };

  return (
    <section style={styles.panel}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Performance Metrics</h2>
          <p style={styles.subtitle}>
            Real-time stream processing statistics
          </p>
        </div>

        <span style={styles.live}>
          <span style={styles.dot} />
          LIVE
        </span>
      </div>

      <div style={styles.grid}>
        <div style={styles.metric}>
          <span style={styles.label}>FRAMES PROCESSED</span>
          <strong style={styles.value}>
            {metrics?.framesProcessed ?? 0}
          </strong>
        </div>

        <div style={styles.metric}>
          <span style={styles.label}>ERRORS</span>
          <strong style={styles.value}>
            {metrics?.errors ?? 0}
          </strong>
        </div>

        <div style={styles.metric}>
          <span style={styles.label}>STARTED AT</span>
          <strong style={styles.time}>
            {formatTime(metrics?.startedAt)}
          </strong>
        </div>

        <div style={styles.metric}>
          <span style={styles.label}>LAST FRAME</span>
          <strong style={styles.time}>
            {formatTime(metrics?.lastFrameAt)}
          </strong>
        </div>
      </div>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    marginTop: "30px",
    padding: "24px",
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },

  title: {
    margin: 0,
    fontSize: "20px",
    color: "#e2e8f0",
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  live: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 10px",
    borderRadius: "20px",
    background: "#052e16",
    color: "#86efac",
    fontSize: "11px",
    fontWeight: "bold",
  },

  dot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#22c55e",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "14px",
  },

  metric: {
    padding: "18px",
    background: "#020617",
    border: "1px solid #1e293b",
    borderRadius: "10px",
  },

  label: {
    display: "block",
    color: "#64748b",
    fontSize: "10px",
    fontWeight: "bold",
    letterSpacing: "0.8px",
    marginBottom: "10px",
  },

  value: {
    color: "#e2e8f0",
    fontSize: "24px",
  },

  time: {
    color: "#cbd5e1",
    fontSize: "16px",
  },
};
