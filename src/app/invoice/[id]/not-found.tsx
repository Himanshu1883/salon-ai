export default function PublicInvoiceNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 text-center">
      <h1 className="text-xl font-semibold text-stone-900">Invoice not found</h1>
      <p className="mt-2 max-w-sm text-sm text-stone-600">
        This invoice link is invalid or the invoice is no longer available.
      </p>
    </div>
  );
}
