import type { FormData, PlanResults, Sheet, ChartData } from '../types';

const currency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const shortCurrency = (value: number) => {
    if (Math.abs(value) >= 10000000) {
        return `₹${(value / 10000000).toFixed(2)}Cr`;
    }
    if (Math.abs(value) >= 100000) {
        return `₹${(value / 100000).toFixed(2)}L`;
    }
    if (Math.abs(value) >= 1000) {
        return `₹${(value / 1000).toFixed(1)}k`;
    }
    return `₹${value.toFixed(0)}`;
}

const calcSipRequired = (targetCorpus: number, annualReturn: number, months: number): number => {
    if (months <= 0) return 0;
    const r = annualReturn / 12.0;
    if (r === 0) {
        return targetCorpus / months;
    }
    const factor = (Math.pow(1 + r, months) - 1) / r;
    if (factor === 0) return 0;
    const sip = targetCorpus / factor;
    return sip;
};


export const generatePlan = (formData: FormData): PlanResults => {
    // ---------- CALCULATIONS ----------
    const { rent, groceries, utilities, transport, emi, insurance, subscriptions, education, health, entertainment, shopping, others } = formData;
    const monthlyExpenses = rent + groceries + utilities + transport + emi + insurance + subscriptions + education + health + entertainment + shopping + others;

    const netIncomeAfterTax = formData.netMonthlyIncome - formData.monthlyTaxDeduction + formData.monthlySideIncome;
    const monthlySurplus = netIncomeAfterTax - monthlyExpenses;

    const needs_pct = 0.50, wants_pct = 0.30, savings_pct = 0.20;
    const actualNeeds = rent + groceries + utilities + emi + insurance + transport + health;
    const actualWants = subscriptions + entertainment + shopping + education + others;
    const recommendedNeeds = needs_pct * formData.netMonthlyIncome;
    const recommendedWants = wants_pct * formData.netMonthlyIncome;
    const recommendedSavings = savings_pct * formData.netMonthlyIncome;

    const overspendThreshold = 0.10;
    const overspendNeeds = actualNeeds > recommendedNeeds * (1 + overspendThreshold);
    const overspendWants = actualWants > recommendedWants * (1 + overspendThreshold);
    
    const emergencyTargetAmount = actualNeeds * formData.emergencyMonthsTarget;
    const emergencyFundShortfall = Math.max(0, emergencyTargetAmount - formData.currentEmergencyFund);
    
    const annualPassiveNeeded = formData.targetPassiveMonthly * 12;
    const assumedYield = formData.assumedYieldIncomeAssets / 100.0;
    const corpusNeeded = assumedYield > 0 ? annualPassiveNeeded / assumedYield : 0;
    
    const corpusToBeAccumulated = Math.max(0, corpusNeeded - formData.currentInvestments);
    const assumedAccumulationReturn = formData.assumedAccumulationReturn / 100.0;
    const sipReq = calcSipRequired(corpusToBeAccumulated, assumedAccumulationReturn, formData.targetTimelineMonths);

    let alloc: { Equity: number; Debt: number; REITs: number };
    if (formData.riskProfile === "Conservative") {
        alloc = { "Equity": 30, "Debt": 45, "REITs": 25 };
    } else if (formData.riskProfile === "Aggressive") {
        alloc = { "Equity": 70, "Debt": 15, "REITs": 15 };
    } else { // Moderate
        alloc = { "Equity": 55, "Debt": 30, "REITs": 15 };
    }

    const allocationFromSurplus = monthlySurplus <= 0 ? 
        { Equity: 0, Debt: 0, REITs: 0 } :
        {
            Equity: Math.round(monthlySurplus * alloc.Equity / 100),
            Debt: Math.round(monthlySurplus * alloc.Debt / 100),
            REITs: Math.round(monthlySurplus * alloc.REITs / 100),
        };

    // ---------- SUGGESTIONS ----------
    const suggestions: string[] = [];
    if (overspendNeeds) suggestions.push(`Overspending on NEEDS: Your essential expenses are ${currency(actualNeeds)}, which is higher than the recommended ${currency(recommendedNeeds)}. Review major costs like rent/EMI.`);
    if (overspendWants) suggestions.push(`Overspending on WANTS: Your discretionary spending is ${currency(actualWants)}, exceeding the recommended ${currency(recommendedWants)}. Consider reducing non-essential spending.`);
    if (monthlySurplus <= 0) suggestions.push(`Negative Cashflow: Your expenses exceed your income. Urgent action is needed to cut costs or increase income to start saving.`);
    else suggestions.push(`Monthly Surplus: You have ${currency(monthlySurplus)} available for investment. It's being allocated based on your '${formData.riskProfile}' profile.`);
    if (emergencyFundShortfall > 0) suggestions.push(`Emergency Fund Shortfall: You need ${currency(emergencyFundShortfall)} more to be secure. Prioritize building this fund.`);
    if (sipReq > 0) {
        suggestions.push(`Goal SIP: To reach ${currency(formData.targetPassiveMonthly)}/month passive income in ${formData.targetTimelineMonths} months, a monthly SIP of ≈ ${currency(sipReq)} is needed.`);
        if (monthlySurplus < sipReq) {
            const deficit = sipReq - Math.max(monthlySurplus, 0);
            suggestions.push(`SIP Deficit: Your surplus is ${currency(deficit)} less than the required SIP. Consider extending your timeline, increasing savings, or boosting income.`);
        } else {
            suggestions.push(`On Track: Your monthly surplus is sufficient to fund the required SIP for your goal. Stay consistent!`);
        }
    } else {
        suggestions.push(`Goal Achieved: Your current investments are sufficient to generate your passive income goal. Consider shifting to income-generating assets.`);
    }

    // ---------- CHART DATA ----------
    const expenseBreakdown = Object.entries({ rent, groceries, utilities, transport, emi, insurance, subscriptions, education, health, entertainment, shopping, others })
        .filter(([, value]) => value > 0)
        .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

    const cashFlow = [
        { name: 'Cash Flow', income: netIncomeAfterTax, expenses: monthlyExpenses, surplus: Math.max(0, monthlySurplus) }
    ];

    const investmentProjection = [];
    let currentValue = formData.currentInvestments;
    const monthlyInvestment = Math.max(0, monthlySurplus);
    const monthlyRate = assumedAccumulationReturn / 12;
    for (let i = 0; i <= formData.targetTimelineMonths; i++) {
        investmentProjection.push({ month: i, value: Math.round(currentValue) });
        currentValue = (currentValue + monthlyInvestment) * (1 + monthlyRate);
    }
    
    const chartData: ChartData = {
        expenseBreakdown,
        cashFlow,
        investmentProjection,
    };

    // ---------- DATA SHEETS ----------
    const inputsSheet: Sheet = {
        sheetName: "Inputs_Summary",
        data: [
            ["Field", "Value"],
            ["Net Monthly Income", currency(formData.netMonthlyIncome)],
            ["Side Income", currency(formData.monthlySideIncome)],
            ["Risk Profile", formData.riskProfile],
            ["Passive Income Target", currency(formData.targetPassiveMonthly) + "/mo"],
            ["Target Timeline", `${formData.targetTimelineMonths} months`],
            ["Current Investments", currency(formData.currentInvestments)],
            ["Current Emergency Fund", currency(formData.currentEmergencyFund)],
        ]
    };

    const expensesSheet: Sheet = {
        sheetName: "Expenses",
        data: [
            ["Category", "Amount (₹)"],
            ...expenseBreakdown.map(item => [item.name, currency(item.value)]),
            ["Total Monthly Expenses", currency(monthlyExpenses)]
        ]
    };
    
    const budgetSheet: Sheet = {
        sheetName: "Budget",
        data: [
            ["Budget Component", "Actual (₹)", "Recommended (₹)"],
            ["Needs (Essentials)", currency(actualNeeds), currency(recommendedNeeds)],
            ["Wants (Discretionary)", currency(actualWants), currency(recommendedWants)],
            ["Savings & Investments", currency(Math.max(0, monthlySurplus)), currency(recommendedSavings)]
        ]
    };

    const allocationSheet: Sheet = {
        sheetName: "Investment_Allocation",
        data: [
            ["Asset Class", "Allocation %", "Monthly Investment (₹)"],
            ["Equity", `${alloc.Equity}%`, currency(allocationFromSurplus.Equity)],
            ["Debt", `${alloc.Debt}%`, currency(allocationFromSurplus.Debt)],
            ["REITs", `${alloc.REITs}%`, currency(allocationFromSurplus.REITs)],
            ["Total Surplus Allocated", "100%", currency(Object.values(allocationFromSurplus).reduce((a, b) => a + b, 0))]
        ]
    };

    const sipSheet: Sheet = {
        sheetName: "SIP_Plan",
        data: [
            ["Metric", "Value"],
            ["Passive Monthly Target", currency(formData.targetPassiveMonthly)],
            ["Corpus Needed for Goal", currency(corpusNeeded)],
            ["Current Investments", currency(formData.currentInvestments)],
            ["Corpus to Accumulate", currency(corpusToBeAccumulated)],
            ["Required Monthly SIP", currency(sipReq)],
            ["Available Monthly Surplus", currency(monthlySurplus)],
            ["Sufficient Surplus for SIP?", monthlySurplus >= sipReq ? "Yes" : "No"]
        ]
    };
    
    const recommendationsSheet: Sheet = {
        sheetName: "Recommendations",
        data: [
            ["Actionable Advice"],
            ...suggestions.map(s => [s])
        ]
    };

    return {
        sheets: [recommendationsSheet, sipSheet, budgetSheet, allocationSheet, expensesSheet, inputsSheet],
        chartData,
    };
};