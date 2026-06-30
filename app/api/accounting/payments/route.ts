import { getAccountingConnector, getAccountingProvider } from "@/lib/accounting";

export async function GET() {
  try {
    const provider = getAccountingProvider();
    const connector = getAccountingConnector(provider);
    const data = await connector.getPayments();

    return Response.json({ provider, data });
  } catch {
    return Response.json(
      { error: "Failed to fetch accounting payments." },
      { status: 500 }
    );
  }
}
