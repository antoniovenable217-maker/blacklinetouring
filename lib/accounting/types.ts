export type AccountingProvider =
  | "netsuite"
  | "sage-intacct"
  | "quickbooks-online";

export type NameOrNumber =
  | {
      name: string;
      number?: string;
    }
  | {
      name?: string;
      number: string;
    };

export type AccountingRecordBase = {
  id: string;
  externalId: string;
  sourceSystem: AccountingProvider;
  status: string;
  raw: unknown;
};

export type AccountingCustomer = AccountingRecordBase &
  NameOrNumber & {
    email?: string;
  };

export type AccountingInvoice = AccountingRecordBase &
  NameOrNumber & {
    customerId?: string;
    totalAmount?: number;
    openAmount?: number;
    dueDate?: string;
  };

export type AccountingPayment = AccountingRecordBase &
  NameOrNumber & {
    customerId?: string;
    amount?: number;
    paymentDate?: string;
  };

export type AccountingItem = AccountingRecordBase &
  NameOrNumber & {
    itemType?: string;
  };

export type AccountingAccount = AccountingRecordBase &
  NameOrNumber & {
    accountType?: string;
  };

export type AccountingDepartment = AccountingRecordBase & NameOrNumber;

export type AccountingClass = AccountingRecordBase & NameOrNumber;

export type AccountingLocation = AccountingRecordBase & NameOrNumber;

export type AccountingSubsidiary = AccountingRecordBase & NameOrNumber;

export type AccountingOpenAR = AccountingRecordBase &
  NameOrNumber & {
    customerId?: string;
    invoiceId?: string;
    openAmount?: number;
    dueDate?: string;
  };

export type AccountingCustomerDeposit = AccountingRecordBase &
  NameOrNumber & {
    customerId?: string;
    amount?: number;
    depositDate?: string;
  };

export type AccountingConnector = {
  getCustomers(): Promise<AccountingCustomer[]>;
  getInvoices(): Promise<AccountingInvoice[]>;
  getPayments(): Promise<AccountingPayment[]>;
  getItems(): Promise<AccountingItem[]>;
  getAccounts(): Promise<AccountingAccount[]>;
  getDepartments(): Promise<AccountingDepartment[]>;
  getClasses(): Promise<AccountingClass[]>;
  getLocations(): Promise<AccountingLocation[]>;
  getSubsidiaries(): Promise<AccountingSubsidiary[]>;
  getOpenAR(): Promise<AccountingOpenAR[]>;
  getCustomerDeposits(): Promise<AccountingCustomerDeposit[]>;

  // Future write methods (intentionally optional until write-sync is enabled).
  createCustomer?: (customer: AccountingCustomer) => Promise<AccountingCustomer>;
  createSalesOrder?: (payload: unknown) => Promise<unknown>;
  createInvoice?: (invoice: AccountingInvoice) => Promise<AccountingInvoice>;
  createCustomerDeposit?: (
    deposit: AccountingCustomerDeposit
  ) => Promise<AccountingCustomerDeposit>;
  applyPayment?: (payment: AccountingPayment) => Promise<AccountingPayment>;
  syncAcceptedQuote?: (payload: unknown) => Promise<unknown>;
  syncCompletedTourInvoice?: (payload: unknown) => Promise<unknown>;
};
