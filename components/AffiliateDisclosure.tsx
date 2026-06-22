// FTC affiliate disclosure. Rendered near the top of the storefront (not buried in
// a footer). Text is per-store so each tenant stays self-contained.
export default function AffiliateDisclosure({ text }: { text: string }) {
  return (
    <p className="mx-auto max-w-2xl rounded-[var(--radius)] bg-black/[0.03] px-4 py-3 text-center text-xs leading-relaxed text-[var(--muted)]">
      {text}
    </p>
  );
}
