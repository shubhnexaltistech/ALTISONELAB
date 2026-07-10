import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { API_V1, getErrorMessage } from "@itp/utils";
import { Button, Card, CardHeader, SkeletonPage } from "@itp/ui";

interface OrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PaymentPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void loadRazorpay().then(setReady);
  }, []);

  const payMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post<OrderResponse>(`${API_V1}/public/payments/create-order`, {
        application_id: applicationId,
      });
      return data;
    },
    onSuccess: async (order) => {
      if (!window.Razorpay) {
        toast.error("Payment gateway failed to load");
        return;
      }
      const rzp = new window.Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: "AltisOne ITP",
        description: "Internship Application Fee",
        handler: () => {
          toast.success("Payment successful! Check your application status.");
          window.location.href = `/status/${applicationId}`;
        },
      });
      rzp.open();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (!applicationId) return <p className="p-8 text-red-600">Invalid application.</p>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-lg">
        <Card>
          <CardHeader
            title="Complete Payment"
            description="Pay the application fee to proceed with your internship application."
          />
          {!ready ? (
            <SkeletonPage />
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">Application ID: {applicationId}</p>
              <Button
                className="w-full"
                loading={payMutation.isPending}
                onClick={() => payMutation.mutate()}
              >
                Pay with Razorpay
              </Button>
              <Link to={`/status/${applicationId}`} className="block text-center text-sm text-brand-600 hover:underline">
                Check application status
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
