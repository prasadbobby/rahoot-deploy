import clsx from "clsx"

export default function Button({ children, className, variant = "primary", ...otherProps }) {
  return (
    <button
      className={clsx(
        "btn",
        {
          "btn-primary": variant === "primary",
          "btn-secondary": variant === "secondary",
          "btn-accent": variant === "accent",
          "btn-success": variant === "success",
          "btn-ghost": variant === "ghost",
        },
        className,
      )}
      {...otherProps}
    >
      <span className="flex items-center justify-center">{children}</span>
    </button>
  )
}