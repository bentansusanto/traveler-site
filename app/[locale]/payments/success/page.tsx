import { Suspense } from "react";
import { PaymentSuccessContent } from "./PaymentSuccessContent";

export const dynamic = "force-dynamic";

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
