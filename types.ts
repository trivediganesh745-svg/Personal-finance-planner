export interface FormData {
  netMonthlyIncome: number;
  monthlyTaxDeduction: number;
  rent: number;
  groceries: number;
  utilities: number;
  transport: number;
  emi: number;
  insurance: number;
  subscriptions: number;
  education: number;
  health: number;
  entertainment: number;
  shopping: number;
  others: number;
  currentEmergencyFund: number;
  emergencyMonthsTarget: number;
  currentInvestments: number;
  monthlySideIncome: number;
  riskProfile: 'Conservative' | 'Moderate' | 'Aggressive';
  targetPassiveMonthly: number;
  targetTimelineMonths: number;
  assumedYieldIncomeAssets: number;
  assumedAccumulationReturn: number;
}

export interface Sheet {
  sheetName: string;
  data: (string | number)[][];
}

export interface PlanResults {
  sheets: Sheet[];
}

// FIX: Add missing ChartData interface to resolve type error in Charts.tsx
export interface ChartData {
  expenseBreakdown: { name: string; value: number }[];
  cashFlow: { name: string; income: number; expenses: number; surplus: number }[];
  investmentProjection: { month: number; value: number }[];
}
