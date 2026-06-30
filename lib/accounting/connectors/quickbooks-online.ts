import {
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
  AccountingSubsidiary,
} from "@/lib/accounting/types";

export class QuickBooksOnlineConnector implements AccountingConnector {
  // TODO: Replace placeholder with Intuit OAuth2 flow and QBO client.
  private readonly client: Record<string, never> = {};

  async getCustomers(): Promise<AccountingCustomer[]> {
    void this.client;
    return [];
  }

  async getInvoices(): Promise<AccountingInvoice[]> {
    return [];
  }

  async getPayments(): Promise<AccountingPayment[]> {
    return [];
  }

  async getItems(): Promise<AccountingItem[]> {
    return [];
  }

  async getAccounts(): Promise<AccountingAccount[]> {
    return [];
  }

  async getDepartments(): Promise<AccountingDepartment[]> {
    return [];
  }

  async getClasses(): Promise<AccountingClass[]> {
    return [];
  }

  async getLocations(): Promise<AccountingLocation[]> {
    return [];
  }

  async getSubsidiaries(): Promise<AccountingSubsidiary[]> {
    return [];
  }

  async getOpenAR(): Promise<AccountingOpenAR[]> {
    return [];
  }

  async getCustomerDeposits(): Promise<AccountingCustomerDeposit[]> {
    return [];
  }
}
