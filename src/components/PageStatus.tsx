import { ArrowLeft, FileX2 } from "lucide-react";

interface PageStatusProps {
  message: string;
  loading?: boolean;
  onBack?: () => void;
}

/** Centered loading / empty state card used while a page's data is loading or missing. */
const PageStatus = ({ message, loading = false, onBack }: PageStatusProps) => (
  <div className="flex min-h-[60vh] items-center justify-center px-4">
    <div className="flex w-full max-w-sm flex-col items-center rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
      {loading ? (
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#1e3a5f] border-t-transparent" />
      ) : (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
          <FileX2 className="h-7 w-7 text-slate-400" />
        </div>
      )}
      <p className="text-sm font-medium text-slate-600">{message}</p>
      {onBack && (
        <button
          onClick={onBack}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#16304f]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to invoices
        </button>
      )}
    </div>
  </div>
);

export default PageStatus;
