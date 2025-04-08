import clsx from "clsx"

export default function Button({ children, className, ...otherProps }) {
  return (
    <button
      className={clsx(
        "btn-primary",
        className,
      )}
      {...otherProps}
    >
      <span>{children}</span>
    </button>
  )
}