import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";

interface InvoiceItem {
  medicineName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  vatPercent: number;
  total: number;
}

interface InvoiceData {
  billNumber: string;
  saleDate: string;
  customerName?: string | null;
  customerPhone?: string | null;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  vatAmount: number;
  totalAmount: number;
  paidAmount?: number | null;
  isCredit?: boolean | null;
}

interface InvoiceProps {
  data: InvoiceData;
  onClose: () => void;
}

function formatNPR(amount: number): string {
  return `NPR ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function Invoice({ data, onClose }: InvoiceProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank", "width=800,height=900");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${data.billNumber} - Sanjay Medical</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #111; background: #fff; padding: 24px; }
            .invoice-header { text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 16px; }
            .pharmacy-name { font-size: 24px; font-weight: 800; color: #0d9488; letter-spacing: -0.5px; }
            .pharmacy-sub { font-size: 12px; color: #555; margin-top: 2px; }
            .invoice-meta { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 12px; }
            .invoice-meta-block { }
            .invoice-meta-block .label { color: #666; }
            .invoice-meta-block .value { font-weight: 600; font-size: 13px; }
            .bill-title { font-size: 14px; font-weight: 700; color: #0d9488; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
            thead tr { background: #0d9488; color: white; }
            thead th { padding: 8px 10px; text-align: left; font-size: 12px; font-weight: 600; }
            thead th:last-child { text-align: right; }
            tbody tr { border-bottom: 1px solid #e5e7eb; }
            tbody tr:nth-child(even) { background: #f9fafb; }
            tbody td { padding: 7px 10px; font-size: 12px; }
            tbody td:last-child { text-align: right; font-weight: 500; }
            .totals { width: 260px; margin-left: auto; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; }
            .totals-row { display: flex; justify-content: space-between; padding: 6px 12px; font-size: 12px; }
            .totals-row:nth-child(even) { background: #f9fafb; }
            .totals-grand { display: flex; justify-content: space-between; padding: 10px 12px; background: #0d9488; color: white; font-weight: 700; font-size: 14px; }
            .footer { text-align: center; margin-top: 24px; padding-top: 12px; border-top: 1px dashed #ccc; font-size: 11px; color: #777; }
            .status-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
            .status-paid { background: #dcfce7; color: #166534; }
            .status-credit { background: #fef9c3; color: #854d0e; }
            @media print {
              body { padding: 10px; }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); }, 300);
  };

  const paidAmount = data.paidAmount ?? data.totalAmount;
  const due = data.totalAmount - paidAmount;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" data-testid="invoice-modal">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Modal Controls */}
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <span className="font-semibold text-gray-800">Invoice Preview</span>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handlePrint} className="gap-2 bg-teal-600 hover:bg-teal-700 text-white">
              <Printer className="w-4 h-4" />
              Print Invoice
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose} data-testid="invoice-close">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="overflow-auto flex-1 p-6">
          <div ref={printRef}>
            {/* Header */}
            <div className="invoice-header text-center border-b-2 border-teal-600 pb-3 mb-4">
              <div className="pharmacy-name text-2xl font-extrabold text-teal-600 tracking-tight">Sanjay Medical</div>
              <div className="pharmacy-sub text-xs text-gray-500 mt-1">
                Horizon Chowk, Butwal-11, Rupandehi, Nepal<br />
                Phone: 071-XXXXXX &nbsp;|&nbsp; PAN: XXXXXXXXX
              </div>
            </div>

            {/* Meta */}
            <div className="invoice-meta flex justify-between mb-4 text-xs">
              <div className="invoice-meta-block">
                <div className="bill-title text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">Tax Invoice</div>
                <div className="text-gray-500">Bill No: <span className="font-semibold text-gray-800">{data.billNumber}</span></div>
                <div className="text-gray-500">Date: <span className="font-semibold text-gray-800">{formatDate(data.saleDate)}</span></div>
              </div>
              <div className="invoice-meta-block text-right">
                {data.customerName ? (
                  <>
                    <div className="text-gray-500">Customer:</div>
                    <div className="font-semibold text-gray-800">{data.customerName}</div>
                    {data.customerPhone && <div className="text-gray-500">{data.customerPhone}</div>}
                  </>
                ) : (
                  <div className="text-gray-400 italic">Walk-in Customer</div>
                )}
                <div className="mt-1">
                  <span className={`status-badge text-xs font-semibold px-2 py-0.5 rounded ${data.isCredit ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                    {data.isCredit ? "Credit" : "Paid"}
                  </span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full border-collapse text-xs mb-4">
              <thead>
                <tr className="bg-teal-600 text-white">
                  <th className="px-2 py-2 text-left font-semibold">#</th>
                  <th className="px-2 py-2 text-left font-semibold">Medicine</th>
                  <th className="px-2 py-2 text-right font-semibold">Qty</th>
                  <th className="px-2 py-2 text-right font-semibold">Rate</th>
                  <th className="px-2 py-2 text-right font-semibold">VAT%</th>
                  <th className="px-2 py-2 text-right font-semibold">Disc.</th>
                  <th className="px-2 py-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-2 py-1.5 border-b border-gray-100 text-gray-500">{i + 1}</td>
                    <td className="px-2 py-1.5 border-b border-gray-100 font-medium">{item.medicineName}</td>
                    <td className="px-2 py-1.5 border-b border-gray-100 text-right">{item.quantity}</td>
                    <td className="px-2 py-1.5 border-b border-gray-100 text-right">{item.unitPrice.toFixed(2)}</td>
                    <td className="px-2 py-1.5 border-b border-gray-100 text-right">{item.vatPercent}%</td>
                    <td className="px-2 py-1.5 border-b border-gray-100 text-right">{item.discount > 0 ? item.discount.toFixed(2) : "—"}</td>
                    <td className="px-2 py-1.5 border-b border-gray-100 text-right font-semibold">{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-6">
              <div className="w-60 border border-gray-200 rounded-lg overflow-hidden text-xs">
                <div className="flex justify-between px-3 py-1.5 bg-gray-50">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatNPR(data.subtotal)}</span>
                </div>
                {data.discountAmount > 0 && (
                  <div className="flex justify-between px-3 py-1.5">
                    <span className="text-gray-500">Discount</span>
                    <span className="font-medium text-red-600">- {formatNPR(data.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between px-3 py-1.5 bg-gray-50">
                  <span className="text-gray-500">VAT</span>
                  <span className="font-medium">{formatNPR(data.vatAmount)}</span>
                </div>
                <div className="flex justify-between px-3 py-2 bg-teal-600 text-white font-bold text-sm">
                  <span>Grand Total</span>
                  <span>{formatNPR(data.totalAmount)}</span>
                </div>
                {data.isCredit && (
                  <>
                    <div className="flex justify-between px-3 py-1.5">
                      <span className="text-gray-500">Paid</span>
                      <span className="font-medium">{formatNPR(paidAmount)}</span>
                    </div>
                    <div className="flex justify-between px-3 py-1.5 bg-yellow-50">
                      <span className="text-yellow-700 font-semibold">Due Amount</span>
                      <span className="text-yellow-700 font-bold">{formatNPR(due)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-3 border-t border-dashed border-gray-300 text-xs text-gray-400">
              <div>Thank you for your purchase from Sanjay Medical!</div>
              <div className="mt-0.5">Exchange within 7 days with bill. No exchange on opened medicines.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
