import { useState } from "react";

type StreamSearchProps = {
  onSearch: (query: string) => void;
};

export default function StreamSearch({ onSearch }: StreamSearchProps) {
  const [query, setQuery] = useState("");

  const handleChange = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div style={styles.container}>
      <span style={styles.icon}>🔍</span>

      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search streams by name or ID..."
        style={styles.input}
      />

      {query && (
        <button onClick={clearSearch} style={styles.clearButton}>
          ×
        </button>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    alignItems: "center",
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    padding: "0 12px",
    marginBottom: "20px",
  },

  icon: {
    fontSize: "15px",
    marginRight: "8px",
  },

  input: {
    width: "100%",
    padding: "12px 0",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#e2e8f0",
    fontSize: "14px",
  },

  clearButton: {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    fontSize: "20px",
    cursor: "pointer",
  },
};
