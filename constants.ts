
export interface Sheet {
    sheetName: string;
    data: (string | number)[][];
}

export const SHEETS_DATA: Sheet[] = [
    {
        sheetName: "Summary",
        data: [
            ["Category", "Details"],
            ["Goal", "Passive income of ₹10k–20k/month in 18 months"],
            ["Corpus Required", "₹15–20 Lakhs"],
            ["Assumption", "12% p.a. equity mutual funds, 6.5% FD/RD, 7% PPF"],
            ["Time Horizon", "1.5 years (18 months)"],
            ["Strategy", "Aggressive SIPs, diversified investments, tax efficiency"],
        ]
    },
    {
        sheetName: "SIP_Plans",
        data: [
            ["Plan", "Monthly SIP", "Tenure", "Expected Corpus (12% p.a.)"],
            ["Aggressive", "₹50,000", "18 months", "₹11 Lakhs"],
            ["Balanced", "₹30,000", "18 months", "₹6.6 Lakhs"],
            ["Starter", "₹15,000", "18 months", "₹3.3 Lakhs"],
        ]
    },
    {
        sheetName: "Budget_Template",
        data: [
            ["Category", "Percentage", "Allocation (Example: Salary ₹100,000)"],
            ["Needs", "50%", "₹50,000"],
            ["Wants", "30%", "₹30,000"],
            ["Savings/Investments", "20%", "₹20,000"],
            ["Emergency Fund Target", "-", "6 months of expenses (~₹3 Lakhs)"],
        ]
    },
    {
        sheetName: "Investment_Allocation",
        data: [
            ["Phase", "Instrument", "Allocation %", "Notes"],
            ["Accumulation", "Equity MF (Index + Flexicap)", "60%", "Growth engine"],
            ["Accumulation", "Debt (FD, Liquid)", "20%", "Stability & liquidity"],
            ["Accumulation", "Gold ETF/SGB", "10%", "Hedge"],
            ["Accumulation", "PPF/EPF", "10%", "Long-term safety"],
            ["Post-Corpus", "Equity", "40%", "Balanced growth"],
            ["Post-Corpus", "Debt", "40%", "Regular passive income"],
            ["Post-Corpus", "REITs/InvITs", "10%", "Rental-style income"],
            ["Post-Corpus", "Gold", "10%", "Wealth preservation"],
        ]
    },
    {
        sheetName: "Roadmap_MVP",
        data: [
            ["Phase", "Steps"],
            ["Phase 1", "Define scope, Create Excel prototype, Data model"],
            ["Phase 2", "Backend with Python (FastAPI/Django), Budgeting engine"],
            ["Phase 3", "Investment APIs integration, Wealth forecasting AI"],
            ["Phase 4", "Deploy secure AI assistant"],
        ]
    },
    {
        sheetName: "Data_Model",
        data: [
            ["Entity", "Fields"],
            ["User", "Salary, Expenses, Age, Goals, Risk Profile"],
            ["Budget", "Needs, Wants, Savings"],
            ["Investment", "Type, Risk, Returns, Lock-in"],
            ["Forecast", "Corpus projection, Passive income"],
        ]
    },
    {
        sheetName: "Prompts",
        data: [
            ["Prompt Type", "Example"],
            ["System", "You are a financial planning AI for Indian salaried employees."],
            ["User", "Given salary = 75k, expenses = 45k, suggest SIP + FD split."],
            ["Assistant", "Split: SIP ₹20k in equity MF, FD ₹5k, Gold ₹2k."],
        ]
    },
    {
        sheetName: "Security_Checklist",
        data: [
            ["Checklist Item", "Details"],
            ["Data Privacy", "Store only minimal financial data, encrypt DB"],
            ["API Security", "Use OAuth2 for APIs (broker, MF)"],
            ["Compliance", "SEBI/RBI rules for investment advisors"],
            ["User Control", "Allow opt-in/opt-out anytime"],
        ]
    },
    {
        sheetName: "Action_Plan",
        data: [
            ["Step", "Action"],
            [1, "Track all expenses in Budget sheet"],
            [2, "Start SIP of at least 20–30% salary"],
            [3, "Build 3–6 months emergency fund"],
            [4, "Diversify into MF, FD, Gold, PPF"],
            [5, "Use Excel AI tool for monthly forecasts"],
            [6, "Review investments every quarter"],
            [7, "Shift to passive income assets after corpus"],
        ]
    }
];
