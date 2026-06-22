// Neutral, brand-less 404. No platform name and no list of valid stores — this is
// shown for the root, for unknown slugs, and for any unmatched URL.
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-6 text-center text-zinc-800">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-zinc-500">
        The page you’re looking for doesn’t exist.
      </p>
    </div>
  );
}
