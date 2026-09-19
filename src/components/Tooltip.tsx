type TooltipProps = {
  text: string;
};

export default function Tooltip({ text }: TooltipProps) {
  return (
    <span
      title={text}
      style={{
        cursor: "help",
        color: "#64748b",
        fontSize: "12px",
      }}
    >
      ⓘ
    </span>
  );
}
