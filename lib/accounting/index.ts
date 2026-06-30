import { NetSuiteConnector } from "@/lib/accounting/connectors/netsuite";
import { QuickBooksOnlineConnector } from "@/lib/accounting/connectors/quickbooks-online";
import { SageIntacctConnector } from "@/lib/accounting/connectors/sage-intacct";
import { AccountingConnector, AccountingProvider } from "@/lib/accounting/types";

const SUPPORTED_PROVIDERS: AccountingProvider[] = [
  "netsuite",
  "sage-intacct",
  "quickbooks-online",
];

export function getAccountingProvider(): AccountingProvider {
  const provider = process.env.ACCOUNTING_PROVIDER;

  if (provider && SUPPORTED_PROVIDERS.includes(provider as AccountingProvider)) {
    return provider as AccountingProvider;
  }

  // Keep development resilient when env is missing.
  return "netsuite";
}

export function getAccountingConnector(
  provider: AccountingProvider = getAccountingProvider()
): AccountingConnector {
  switch (provider) {
    case "netsuite":
      return new NetSuiteConnector();
    case "sage-intacct":
      return new SageIntacctConnector();
    case "quickbooks-online":
      return new QuickBooksOnlineConnector();
    default:
      return new NetSuiteConnector();
  }
}

export type {
  AccountingAccount,
  AccountingClass,
  AccountingConnector,
  AccountingCustomer,
  AccountingCustomerDeposit,
  AccountingDepartment,
  AccountingInvoice,
  AccountingItem,
  AccountingLocation,
  AccountingOpenAR,
  AccountingPayment,
  AccountingProvider,
  AccountingSubsidiary,
} from "@/lib/accounting/types";
