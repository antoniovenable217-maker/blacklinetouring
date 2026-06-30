import { SavedQuote } from "@/app/types";

interface QuoteTableProps {
  quotes: SavedQuote[];
  money: (value: number) => string;
}

export default function QuoteTable({ quotes, money }: QuoteTableProps) {
  return (
    <table className="w-full border-collapse border">
      <thead>
        <tr className="bg-slate-100">
          <th className="border p-2 text-left">Quote #</th>
          <th className="border p-2 text-left">Tour Name</th>
          <th className="border p-2 text-left">Status</th>
          <th className="border p-2 text-left">Total</th>
        </tr>
      </thead>

      <tbody>
        {quotes.map((quote) => (
          <tr key={quote.id ?? quote.quoteNumber}>
            <td className="border p-2">{quote.quoteNumber}</td>
            <td className="border p-2">{quote.tourName}</td>
            <td className="border p-2">{quote.quoteStatus}</td>
            <td className="border p-2">{money(quote.totalTourBudget)}</td>
          </tr>
        ))}

        {quotes.length === 0 && (
          <tr>
            <td className="border p-4 text-center" colSpan={4}>
              No quotes in this section.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
