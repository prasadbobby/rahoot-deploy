import clsx from "clsx"

export default function Form({ children, className }) {
  return (
    <div className={clsx(
      "z-10 flex w-full max-w-md flex-col gap-4 rounded-xl bg-white dark:bg-slate-800 p-6 shadow-lg border border-gray-100 dark:border-slate-700",
      className
    )}>
      {children}
    </div>
  )
}