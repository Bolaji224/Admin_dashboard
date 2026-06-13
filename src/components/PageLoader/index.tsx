function PageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-darkmode-600">
      <div className="relative flex items-center justify-center">
        {/* Outer ring */}
        <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-darkmode-400" />
        {/* Spinning arc */}
        <div className="absolute w-16 h-16 rounded-full border-4 border-transparent border-t-primary animate-spin" />
      </div>
      <p className="mt-6 text-sm font-medium text-slate-400 dark:text-slate-500 tracking-widest uppercase animate-pulse">
        Loading…
      </p>
    </div>
  );
}

export default PageLoader;