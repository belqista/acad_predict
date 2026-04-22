export default function LoadingSpinner({ message = 'Memuat data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-indigo-100 dark:border-indigo-900 animate-spin border-t-indigo-600 dark:border-t-indigo-400" />
        <div className="absolute inset-2 w-8 h-8 rounded-full border-4 border-purple-100 dark:border-purple-900 animate-spin border-t-purple-600 dark:border-t-purple-400" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
      </div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">{message}</p>
    </div>
  )
}

export function InlineSpinner() {
  return (
    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
  )
}
