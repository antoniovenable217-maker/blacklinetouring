import { Customer } from "@/app/types";

interface AddCustomerFormProps {
  newCustomer: Customer;
  onUpdateField: (field: keyof Customer, value: string) => void;
  onAddCustomer: () => void;
}

export default function AddCustomerForm({
  newCustomer,
  onUpdateField,
  onAddCustomer,
}: AddCustomerFormProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <h3 className="text-2xl font-bold mb-4">Add New Customer</h3>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        <input
          className="border p-3 rounded w-full"
          placeholder="Artist Name"
          value={newCustomer.artistName}
          onChange={(e) => onUpdateField("artistName", e.target.value)}
        />

        <input
          className="border p-3 rounded w-full"
          placeholder="Company Name"
          value={newCustomer.companyName}
          onChange={(e) => onUpdateField("companyName", e.target.value)}
        />

        <select
          className="border p-3 rounded w-full"
          value={newCustomer.status}
          onChange={(e) =>
            onUpdateField(
              "status",
              e.target.value as "Active" | "Inactive" | "Prospect"
            )
          }
        >
          <option>Prospect</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>

        <input
          className="border p-3 rounded w-full"
          placeholder="Company Address"
          value={newCustomer.companyAddress}
          onChange={(e) => onUpdateField("companyAddress", e.target.value)}
        />

        <input
          className="border p-3 rounded w-full"
          placeholder="Manager Email"
          value={newCustomer.managerEmail}
          onChange={(e) => onUpdateField("managerEmail", e.target.value)}
        />

        <input
          className="border p-3 rounded w-full"
          placeholder="AP Email"
          value={newCustomer.apEmail}
          onChange={(e) => onUpdateField("apEmail", e.target.value)}
        />

        <textarea
          className="border p-3 rounded w-full md:col-span-2 xl:col-span-3"
          placeholder="Client Notes"
          value={newCustomer.notes}
          onChange={(e) => onUpdateField("notes", e.target.value)}
        />
      </div>

      <button
        onClick={onAddCustomer}
        className="mt-6 bg-blue-600 text-white px-6 py-3 rounded font-semibold"
      >
        Add Customer
      </button>
    </div>
  );
}