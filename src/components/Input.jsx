import clsx from "clsx"

export default function Input({ className, icon: Icon, ...otherProps }) {
  return (
    <div className="relative w-full">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="text-gray-400 h-5 w-5" />
        </div>
      )}
      <input
        className={clsx(
          "input",
          Icon && "pl-10",
          className,
        )}
        {...otherProps}
      />
    </div>
  )
}