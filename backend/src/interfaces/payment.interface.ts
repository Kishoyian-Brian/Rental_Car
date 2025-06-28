export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  MOBILE_MONEY = 'MOBILE_MONEY',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentWithRelations extends Payment {
  user?: any; // User interface
  booking?: any; // Booking interface
} 