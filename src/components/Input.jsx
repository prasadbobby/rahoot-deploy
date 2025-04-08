import clsx from "clsx"

export default function Input({ className, ...otherProps }) {
  return (
    <input
      className={clsx(
        "form-input",
        className,
      )}
      {...otherProps}
    />
  )
}