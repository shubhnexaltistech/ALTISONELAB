import clsx from "clsx";

export interface MaterialIconProps {
  name: string;
  className?: string;
  filled?: boolean;
  size?: number;
}

export function MaterialIcon({ name, className, filled = false, size }: MaterialIconProps) {
  return (
    <span
      className={clsx("material-symbols-outlined", filled && "filled", className)}
      style={size ? { fontSize: size } : undefined}
    >
      {name}
    </span>
  );
}
