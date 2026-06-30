import { Customer } from "@/app/types";

interface CustomerListProps {
  customers: Customer[];
  onSelectCustomer: (id: number) => void;
}

export default function CustomerList({
  customers,
  onSelectCustomer,
}: CustomerListProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-2xl font-bold mb-4">Customer List</h3>

      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-slate-100">
            <th className="border p-2 text-left">Artist</th>
            <th className="border p-2 text-left">Company</th>
            <th className="border p-2 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((customer) => (
            <tr
              key={customer.id}
              onClick={() => onSelectCustomer(customer.id)}
              className="cursor-pointer hover:bg-slate-100"
            >
              <td className="border p-2">{customer.artistName}</td>
              <td className="border p-2">{customer.companyName}</td>
              <td className="border p-2">{customer.status}</td>
            </tr>
          ))}

          {customers.length === 0 && (
            <tr>
              <td className="border p-4 text-center" colSpan={3}>
                No customers created yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
