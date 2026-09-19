import { useEffect, useRef, useState } from "react";

type Stream = {
  id: string;
  name: string;
  url: string;
  status: string;
};

const API = "http://127.0.0.1:8000";

export default function App() {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [loading, setLoading] = useState(true);
  const [webrtcLoading, setWebrtcLoading] = useState(false);
  const [webrtcError, setWebrtcError] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const loadStreams = async () => {
    try {
      const response = await fetch(`${API}/api/v1/streams/`);
      const data = await response.json();
      setStreams(data);
    } catch (error) {
      console.error("Unable to load streams:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStreams();

    return () => {
      peerConnectionRef.current?.close();
    };
  }, []);

  const startStream = async (id: string) => {
    try {
      await fetch(`${API}/api/v1/streams/${id}/start`, {
        method: "POST",
      });

      await loadStreams();
    } catch (error) {
      console.error("Unable to start stream:", error);
    }
  };

  const stopStream = async (id: string) => {
    try {
      await fetch(`${API}/api/v1/streams/${id}/stop`, {
        method: "POST",
      });

      await loadStreams();
    } catch (error) {
      console.error("Unable to stop stream:", error);
    }
  };

  const startWebRTC = async () => {
    setWebrtcLoading(true);
    setWebrtcError("");

    try {
      peerConnectionRef.current?.close();

      const peerConnection = new RTCPeerConnection();

      peerConnectionRef.current = peerConnection;

      peerConnection.addTransceiver("video", {
        direction: "recvonly",
      });

      peerConnection.ontrack = (event) => {
        console.log("WebRTC video track received.");

        const [stream] = event.streams;

        if (videoRef.current && stream) {
          videoRef.current.srcObject = stream;
        }
      };

      peerConnection.onconnectionstatechange = () => {
        console.log(
          "WebRTC connection state:",
          peerConnection.connectionState
        );
      };

      const offer = await peerConnection.createOffer();

      await peerConnection.setLocalDescription(offer);

      const response = await fetch(
        `${API}/api/v1/webrtc/offer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sdp: peerConnection.localDescription?.sdp,
            type: peerConnection.localDescription?.type,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `WebRTC server returned ${response.status}`
        );
      }

      const answer = await response.json();

      await peerConnection.setRemoteDescription(answer);

      console.log("WebRTC negotiation completed.");
    } catch (error) {
      console.error("WebRTC connection failed:", error);

      setWebrtcError(
        "Unable to start WebRTC video stream."
      );
    } finally {
      setWebrtcLoading(false);
    }
  };

  const stopWebRTC = () => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setWebrtcError("");
  };

  const runningStreams = streams.filter(
    (stream) => stream.status.toLowerCase() === "running"
  ).length;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.logo}>VisionEdge</h1>

          <p style={styles.subtitle}>
            Hardware-Accelerated Real-Time Video Pipeline
          </p>
        </div>

        <div style={styles.connection}>
          <span style={styles.onlineDot} />
          API Connected
        </div>
      </header>

      <main style={styles.container}>
        <section style={styles.stats}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>TOTAL STREAMS</span>

            <strong style={styles.statValue}>
              {streams.length}
            </strong>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statLabel}>RUNNING</span>

            <strong style={styles.statValue}>
              {runningStreams}
            </strong>
          </div>

          <div style={styles.statCard}>
            <span style={styles.statLabel}>SYSTEM STATUS</span>

            <strong style={styles.healthy}>
              ● Healthy
            </strong>
          </div>
        </section>

        <section style={styles.videoSection}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.heading}>
                WebRTC Video Preview
              </h2>

              <p style={styles.description}>
                Live video stream delivered from the Python
                aiortc backend.
              </p>
            </div>
          </div>

          <div style={styles.videoContainer}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={styles.video}
            />

            {!webrtcLoading && !videoRef.current?.srcObject && (
              <div style={styles.videoPlaceholder}>
                <div style={styles.videoIcon}>▶</div>

                <p>
                  Click "Start WebRTC" to begin video playback.
                </p>
              </div>
            )}
          </div>

          <div style={styles.videoActions}>
            <button
              style={styles.startButton}
              onClick={startWebRTC}
              disabled={webrtcLoading}
            >
              {webrtcLoading
                ? "Connecting..."
                : "▶ Start WebRTC"}
            </button>

            <button
              style={styles.stopButton}
              onClick={stopWebRTC}
            >
              ■ Stop WebRTC
            </button>
          </div>

          {webrtcError && (
            <div style={styles.error}>
              {webrtcError}
            </div>
          )}
        </section>

        <section>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.heading}>Video Streams</h2>

              <p style={styles.description}>
                Monitor and control registered video streams.
              </p>
            </div>

            <button
              style={styles.refreshButton}
              onClick={loadStreams}
            >
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div style={styles.message}>
              Loading streams...
            </div>
          ) : streams.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyIcon}>◉</div>

              <h3>No streams available</h3>

              <p>
                Create a stream through the VisionEdge API to
                see it here.
              </p>
            </div>
          ) : (
            <div style={styles.grid}>
              {streams.map((stream) => {
                const isRunning =
                  stream.status.toLowerCase() === "running";

                return (
                  <article
                    key={stream.id}
                    style={styles.streamCard}
                  >
                    <div style={styles.cardHeader}>
                      <div>
                        <h3 style={styles.streamName}>
                          {stream.name}
                        </h3>

                        <p style={styles.streamId}>
                          ID: {stream.id.slice(0, 8)}...
                        </p>
                      </div>

                      <span
                        style={{
                          ...styles.status,
                          ...(isRunning
                            ? styles.running
                            : styles.stopped),
                        }}
                      >
                        ● {stream.status}
                      </span>
                    </div>

                    <div style={styles.urlBox}>
                      <span style={styles.urlLabel}>
                        STREAM URL
                      </span>

                      <span style={styles.url}>
                        {stream.url}
                      </span>
                    </div>

                    <div style={styles.actions}>
                      <button
                        style={{
                          ...styles.startButton,
                          opacity: isRunning ? 0.5 : 1,
                        }}
                        disabled={isRunning}
                        onClick={() =>
                          startStream(stream.id)
                        }
                      >
                        ▶ Start
                      </button>

                      <button
                        style={{
                          ...styles.stopButton,
                          opacity: isRunning ? 1 : 0.5,
                        }}
                        disabled={!isRunning}
                        onClick={() =>
                          stopStream(stream.id)
                        }
                      >
                        ■ Stop
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <footer style={styles.footer}>
        VisionEdge • Real-Time Edge Computing Platform
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#020617",
    color: "#e2e8f0",
    fontFamily: "Arial, sans-serif",
  },

  header: {
    padding: "24px 6%",
    borderBottom: "1px solid #1e293b",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    margin: 0,
    fontSize: "30px",
    letterSpacing: "-1px",
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#94a3b8",
    fontSize: "14px",
  },

  connection: {
    padding: "9px 15px",
    border: "1px solid #1e293b",
    borderRadius: "20px",
    background: "#0f172a",
    fontSize: "13px",
  },

  onlineDot: {
    display: "inline-block",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#22c55e",
    marginRight: "8px",
  },

  container: {
    width: "88%",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 0",
  },

  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    marginBottom: "45px",
  },

  statCard: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "24px",
  },

  statLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "11px",
    fontWeight: "bold",
    letterSpacing: "1px",
    marginBottom: "12px",
  },

  statValue: {
    fontSize: "30px",
  },

  healthy: {
    color: "#22c55e",
    fontSize: "20px",
  },

  videoSection: {
    marginBottom: "50px",
  },

  videoContainer: {
    position: "relative",
    width: "100%",
    minHeight: "450px",
    background: "#000",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    overflow: "hidden",
  },

  video: {
    width: "100%",
    height: "450px",
    objectFit: "contain",
    display: "block",
    background: "#000",
  },

  videoPlaceholder: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#64748b",
    pointerEvents: "none",
  },

  videoIcon: {
    fontSize: "42px",
    marginBottom: "12px",
  },

  videoActions: {
    display: "flex",
    gap: "10px",
    marginTop: "16px",
  },

  error: {
    marginTop: "12px",
    padding: "12px",
    background: "#450a0a",
    border: "1px solid #7f1d1d",
    borderRadius: "8px",
    color: "#fca5a5",
    fontSize: "13px",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "22px",
  },

  heading: {
    margin: 0,
    fontSize: "24px",
  },

  description: {
    color: "#64748b",
    marginTop: "7px",
    fontSize: "14px",
  },

  refreshButton: {
    background: "#e2e8f0",
    color: "#020617",
    border: "none",
    borderRadius: "7px",
    padding: "10px 17px",
    cursor: "pointer",
    fontWeight: "bold",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
  },

  streamCard: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
    padding: "22px",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  streamName: {
    margin: 0,
    fontSize: "18px",
  },

  streamId: {
    color: "#64748b",
    fontSize: "11px",
    marginTop: "6px",
  },

  status: {
    padding: "6px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    textTransform: "uppercase",
  },

  running: {
    color: "#86efac",
    background: "#14532d",
  },

  stopped: {
    color: "#cbd5e1",
    background: "#334155",
  },

  urlBox: {
    marginTop: "22px",
    padding: "13px",
    background: "#020617",
    borderRadius: "8px",
  },

  urlLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "9px",
    marginBottom: "6px",
    letterSpacing: "1px",
  },

  url: {
    display: "block",
    color: "#94a3b8",
    fontSize: "12px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  actions: {
    display: "flex",
    gap: "10px",
    marginTop: "18px",
  },

  startButton: {
    flex: 1,
    padding: "10px",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    background: "#22c55e",
    color: "#052e16",
    fontWeight: "bold",
  },

  stopButton: {
    flex: 1,
    padding: "10px",
    border: "1px solid #475569",
    borderRadius: "7px",
    cursor: "pointer",
    background: "#1e293b",
    color: "#e2e8f0",
    fontWeight: "bold",
  },

  empty: {
    textAlign: "center",
    padding: "70px 20px",
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "14px",
  },

  emptyIcon: {
    fontSize: "35px",
    color: "#64748b",
  },

  message: {
    textAlign: "center",
    padding: "50px",
    color: "#94a3b8",
  },

  footer: {
    textAlign: "center",
    padding: "25px",
    borderTop: "1px solid #1e293b",
    color: "#475569",
    fontSize: "12px",
  },
};