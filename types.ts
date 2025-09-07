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

export interface ExpenseBreakdownData {
  name: string;
  value: number;
}

export interface CashFlowData {
  name: string;
  income: number;
  expenses: number;
  surplus: number;
}

export interface InvestmentProjectionData {
  month: number;
  value: number;
}

export interface ChartData {
  expenseBreakdown: ExpenseBreakdownData[];
  cashFlow: CashFlowData[];
  investmentProjection: InvestmentProjectionData[];
}

export interface PlanResults {
  sheets: Sheet[];
  chartData: ChartData;
}