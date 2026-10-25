export function Logo({ className = 'h-9 w-40' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 50"
      className={className}
      role="img"
      aria-label="KULTUREMETRIX"
    >
      <text
        x="0"
        y="38"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="34"
        fontWeight="800"
        letterSpacing="0.5"
      >
        <tspan fill="#205072">KULTURE</tspan>
        <tspan fill="#43B59C">METRIX</tspan>
      </text>
    </svg>
  );
}
