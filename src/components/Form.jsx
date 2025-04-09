import clsx from "clsx"

export default function Form({ children, className }) {
  return (
    <div className={clsx(
      "z-10 flex w-full max-w-md flex-col gap-4 rounded-2xl bg-white dark:bg-brand-dark-card p-6 shadow-lg border border-gray-100 dark:border-gray-700",
      className
    )}>
      {children}
    </div>
  )
}