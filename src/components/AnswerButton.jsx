import clsx from "clsx"

export default function AnswerButton({
  className,
  icon: Icon,
  children,
  ...otherProps
}) {
  return (
    <button
      className={clsx(
        "shadow-inset flex items-center gap-3 rounded-xl px-4 py-6 text-left transition-all transform hover:scale-102 active:scale-98",
        className,
      )}
      {...otherProps}
    >
      <Icon className="h-6 w-6 flex-shrink-0" />
      <span className="drop-shadow-md font-medium text-lg">{children}</span>
    </button>
  )
}