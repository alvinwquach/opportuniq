/**
 * Type definitions for encrypted financial data.
 * Separates encrypted (server-stored) from decrypted (display) types.
 */

import type { IncomeFrequency } from "@/app/dashboard/settings/income/schemas";
import type { ExpenseFrequency } from "@/app/dashboard/settings/expenses/schemas";

// ============================================
// ENCRYPTED INPUT TYPES (sent to server)
// ============================================

export interface EncryptedIncomeInput {
  encryptedSource: string;
  sourceIv: string;
  encryptedAmount: string;
  amountIv: string;
  encryptedDescription?: string;
  descriptionIv?: string;
  frequency: IncomeFrequency;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  keyVersion?: number;
}

export interface EncryptedExpenseInput {
  encryptedCategory: string;
  categoryIv: string;
  encryptedAmount: string;
  amountIv: string;
  encryptedDescription?: string;
  descriptionIv?: string;
  date: Date;
  frequency: ExpenseFrequency;
  issueId?: string;
  keyVersion?: number;
}

export interface EncryptedBudgetInput {
  encryptedCategory: string;
  categoryIv: string;
  encryptedMonthlyLimit: string;
  monthlyLimitIv: string;
  encryptedCurrentSpend?: string;
  currentSpendIv?: string;
  keyVersion?: number;
}

export interface EncryptedProfileInput {
  encryptedName?: string;
  nameIv?: string;
  encryptedPhoneNumber?: string;
  phoneNumberIv?: string;
  encryptedStreetAddress?: string;
  streetAddressIv?: string;
  encryptedCity?: string;
  cityIv?: string;
  encryptedStateProvince?: string;
  stateProvinceIv?: string;
  encryptedPostalCode?: string;
  postalCodeIv?: string;
  encryptedFormattedAddress?: string;
  formattedAddressIv?: string;
  encryptedMonthlyBudget?: string;
  monthlyBudgetIv?: string;
  encryptedEmergencyBuffer?: string;
  emergencyBufferIv?: string;
  keyVersion?: number;
}

// ============================================
// DECRYPTED TYPES (for display in UI)
// ============================================

export interface DecryptedIncomeStream {
  id: string;
  source: string;
  amount: number;
  description: string | null;
  frequency: IncomeFrequency;
  isActive: boolean;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DecryptedExpense {
  id: string;
  category: string;
  amount: number;
  description: string | null;
  date: Date;
  isRecurring: boolean | null;
  recurringFrequency: ExpenseFrequency | null;
  nextDueDate: Date | null;
  issueId: string | null;
  createdAt: Date;
}

export interface DecryptedBudget {
  id: string;
  category: string;
  monthlyLimit: number;
  currentSpend: number;
  updatedAt: Date;
}

export interface DecryptedProfile {
  id: string;
  email: string;
  avatarUrl: string | null;
  name: string | null;
  phoneNumber: string | null;
  streetAddress: string | null;
  city: string | null;
  stateProvince: string | null;
  postalCode: string | null;
  formattedAddress: string | null;
  country: string | null;
  monthlyBudget: number | null;
  emergencyBuffer: number | null;
}

// ============================================
// RAW SERVER RESPONSE TYPES (encrypted or legacy plaintext)
// ============================================

export interface RawIncomeStream {
  id: string;
  userId: string;
  isEncrypted: boolean;
  keyVersion: number;
  algorithm: string;
  // Encrypted fields
  encryptedSource: string | null;
  sourceIv: string | null;
  encryptedAmount: string | null;
  amountIv: string | null;
  encryptedDescription: string | null;
  descriptionIv: string | null;
  // Plaintext fields
  source: string | null;
  amount: string | null;
  description: string | null;
  // Always plaintext
  frequency: IncomeFrequency;
  isActive: boolean;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RawExpense {
  id: string;
  userId: string;
  isEncrypted: boolean;
  keyVersion: number;
  algorithm: string;
  // Encrypted fields
  encryptedCategory: string | null;
  categoryIv: string | null;
  encryptedAmount: string | null;
  amountIv: string | null;
  encryptedDescription: string | null;
  descriptionIv: string | null;
  // Plaintext fields
  category: string | null;
  amount: string | null;
  description: string | null;
  // Always plaintext
  date: Date;
  isRecurring: boolean | null;
  recurringFrequency: ExpenseFrequency | null;
  nextDueDate: Date | null;
  issueId: string | null;
  createdAt: Date;
}

export interface RawBudget {
  id: string;
  userId: string;
  isEncrypted: boolean;
  keyVersion: number;
  algorithm: string;
  // Encrypted fields
  encryptedCategory: string | null;
  categoryIv: string | null;
  encryptedMonthlyLimit: string | null;
  monthlyLimitIv: string | null;
  encryptedCurrentSpend: string | null;
  currentSpendIv: string | null;
  // Plaintext fields
  category: string | null;
  monthlyLimit: string | null;
  currentSpend: string | null;
  // Always plaintext
  updatedAt: Date;
}

export interface RawProfile {
  id: string;
  email: string;
  avatarUrl: string | null;
  isProfileEncrypted: boolean;
  profileKeyVersion: number;
  profileAlgorithm: string;
  // Encrypted fields
  encryptedName: string | null;
  nameIv: string | null;
  encryptedPhoneNumber: string | null;
  phoneNumberIv: string | null;
  encryptedStreetAddress: string | null;
  streetAddressIv: string | null;
  encryptedCity: string | null;
  cityIv: string | null;
  encryptedStateProvince: string | null;
  stateProvinceIv: string | null;
  encryptedPostalCode: string | null;
  postalCodeIv: string | null;
  encryptedFormattedAddress: string | null;
  formattedAddressIv: string | null;
  encryptedMonthlyBudget: string | null;
  monthlyBudgetIv: string | null;
  encryptedEmergencyBuffer: string | null;
  emergencyBufferIv: string | null;
  // Plaintext fields
  name: string | null;
  phoneNumber: string | null;
  streetAddress: string | null;
  city: string | null;
  stateProvince: string | null;
  postalCode: string | null;
  formattedAddress: string | null;
  country: string | null;
  monthlyBudget: string | null;
  emergencyBuffer: string | null;
}
