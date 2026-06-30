import { Customer, SavedQuote } from "@/app/types";
import QuoteTable from "./QuoteTable";

interface CustomerCardProps {
  customer: Customer;
  activeTab: string;
  onChangeTab: (tab: string) => void;
  onBack: () => void;
  onDelete: () => void;
  activeQuotes: SavedQuote[];
  acceptedQuotes: SavedQuote[];
  rejectedQuotes: SavedQuote[];
  money: (value: number) => string;
  onInvoiceClick?: () => void;
}

export default function CustomerCard({
  customer,
  activeTab,
  onChangeTab,
  onBack,
  onDelete,
  activeQuotes,
  acceptedQuotes,
  rejectedQuotes,
  money,
  onInvoiceClick,
}: CustomerCardProps) {
  const tabs = [
    "Overview",
    "Active Quotes",
    "Accepted Quotes",
    "Rejected Quotes",
    "Invoices",
    "Client Notes",
    "Contacts",
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-3xl font-bold">
            {customer.artistName || customer.companyName}
          </h3>
          <p className="text-lg">{customer.companyName}</p>
          <p className="font-semibold mt-2">Status: {customer.status}</p>
        </div>

        <div className="space-y-2">
          <button
            onClick={onBack}
            className="mb-4 bg-slate-700 text-white px-4 py-2 rounded font-semibold block w-full"
          >
            ← Back to Customers
          </button>
          <button
            onClick={onDelete}
            className="bg-red-600 text-white px-4 py-2 rounded w-full"
          >
            Delete Customer
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onChangeTab(tab)}
            className={`px-4 py-2 rounded border font-semibold ${
              activeTab === tab ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-bold">Artist Name</p>
            <p>{customer.artistName}</p>
          </div>

          <div>
            <p className="font-bold">Company Name</p>
            <p>{customer.companyName}</p>
          </div>

          <div>
            <p className="font-bold">Company Address</p>
            <p>{customer.companyAddress}</p>
          </div>

          <div>
            <p className="font-bold">Manager Email</p>
            <p>{customer.managerEmail}</p>
          </div>

          <div>
            <p className="font-bold">AP Email</p>
            <p>{customer.apEmail}</p>
          </div>

          <div>
            <p className="font-bold">Total Quotes</p>
            <p>{activeQuotes.length + acceptedQuotes.length + rejectedQuotes.length}</p>
          </div>
        </div>
      )}

      {activeTab === "Active Quotes" && (
        <QuoteTable quotes={activeQuotes} money={money} />
      )}

      {activeTab === "Accepted Quotes" && (
        <QuoteTable quotes={acceptedQuotes} money={money} />
      )}

      {activeTab === "Rejected Quotes" && (
        <QuoteTable quotes={rejectedQuotes} money={money} />
      )}

      {activeTab === "Invoices" && (
        <div>
          <p>No invoices created yet.</p>
          <p className="text-sm text-slate-600 mt-2">
            Later this will show invoice number, date, balance, paid status,
            and payment history.
          </p>
        </div>
      )}

      {activeTab === "Client Notes" && (
        <div>
          <h4 className="text-xl font-bold mb-2">Client Notes</h4>
          <p>{customer.notes || "No notes entered yet."}</p>
        </div>
      )}

      {activeTab === "Contacts" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-bold">Manager Email</p>
            <p>{customer.managerEmail}</p>
          </div>

          <div>
            <p className="font-bold">AP Email</p>
            <p>{customer.apEmail}</p>
          </div>
        </div>
      )}
    </div>
  );
}
