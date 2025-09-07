import React, { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { DataTable } from './components/DataTable';
import { exportDataToExcel } from './services/excelService';
import { generatePlan } from './services/calculationService';
import type { FormData, PlanResults } from './types';
import { DownloadIcon, ResetIcon } from './components/icons';
import { Charts } from './components/Charts';

const initialFormData: FormData = {
  netMonthlyIncome: 50000,
  monthlyTaxDeduction: 0,
  rent: 15000,
  groceries: 5000,
  utilities: 2000,
  transport: 1500,
  emi: 0,
  insurance: 1000,
  subscriptions: 500,
  education: 0,
  health: 1000,
  entertainment: 2000,
  shopping: 2000,
  others: 1000,
  currentEmergencyFund: 50000,
  emergencyMonthsTarget: 6,
  currentInvestments: 100000,
  monthlySideIncome: 0,
  riskProfile: 'Moderate',
  targetPassiveMonthly: 10000,
  targetTimelineMonths: 36,
  assumedYieldIncomeAssets: 7,
  assumedAccumulationReturn: 12,
};

const FormField: React.FC<{ label: string; name: keyof FormData; value: string | number; onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void; type?: string; placeholder?: string; step?: string; min?: string, children?: React.ReactNode }> = ({ label, name, value, onChange, type = 'number', placeholder, step, min, children }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1">
            {children ? (
                 <select id={name} name={name} value={value} onChange={onChange} className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    {children}
                </select>
            ) : (
                <input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} step={step} min={min} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            )}
        </div>
    </div>
);


const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [results, setResults] = useState<PlanResults | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
        const plan = generatePlan(formData);
        setResults(plan);
        setActiveTab('Dashboard'); // Default to dashboard view
        setIsLoading(false);
        window.scrollTo(0, 0);
    }, 500);
  };
  
  const handleReset = useCallback(() => {
    setResults(null);
    setFormData(initialFormData);
    window.scrollTo(0, 0);
  }, []);

  const handleDownload = useCallback(() => {
    if (results) {
        exportDataToExcel(results.sheets, `personal_finance_plan_${new Date().toISOString().split('T')[0]}.xlsx`);
    }
  }, [results]);

  const activeSheetData = results?.sheets.find(sheet => sheet.sheetName === activeTab);
  const resultTabs = results ? ['Dashboard', ...results.sheets.map(s => s.sheetName)] : [];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Interactive Personal Finance Planner</h1>
          <p className="mt-2 text-lg text-gray-600">
            {results ? 'Your personalized financial roadmap.' : 'Fill in your details to generate a custom financial plan.'}
          </p>
        </header>

        <main className="bg-white rounded-xl shadow-lg">
            {!results ? (
                 <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8 animate-fade-in">
                    <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <legend className="text-xl font-semibold text-gray-900 mb-4 w-full col-span-full border-b pb-2">Income</legend>
                        <FormField label="Net Monthly Income (₹)" name="netMonthlyIncome" value={formData.netMonthlyIncome} onChange={handleChange} />
                        <FormField label="Monthly Side Income (₹)" name="monthlySideIncome" value={formData.monthlySideIncome} onChange={handleChange} />
                        <FormField label="Monthly Tax / TDS (₹)" name="monthlyTaxDeduction" value={formData.monthlyTaxDeduction} onChange={handleChange} />
                    </fieldset>

                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <legend className="text-xl font-semibold text-gray-900 mb-4 w-full col-span-full border-b pb-2">Current Assets</legend>
                        <FormField label="Current Investments (₹)" name="currentInvestments" value={formData.currentInvestments} onChange={handleChange} />
                        <FormField label="Current Emergency Fund (₹)" name="currentEmergencyFund" value={formData.currentEmergencyFund} onChange={handleChange} />
                    </fieldset>

                    <fieldset className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <legend className="text-xl font-semibold text-gray-900 mb-4 w-full col-span-full border-b pb-2">Monthly Expenses</legend>
                         <FormField label="Rent / Mortgage (₹)" name="rent" value={formData.rent} onChange={handleChange} />
                        <FormField label="Groceries (₹)" name="groceries" value={formData.groceries} onChange={handleChange} />
                        <FormField label="Utilities (₹)" name="utilities" value={formData.utilities} onChange={handleChange} />
                        <FormField label="Transport (₹)" name="transport" value={formData.transport} onChange={handleChange} />
                        <FormField label="EMIs / Loans (₹)" name="emi" value={formData.emi} onChange={handleChange} />
                        <FormField label="Insurance (₹)" name="insurance" value={formData.insurance} onChange={handleChange} />
                        <FormField label="Subscriptions (₹)" name="subscriptions" value={formData.subscriptions} onChange={handleChange} />
                        <FormField label="Education (₹)" name="education" value={formData.education} onChange={handleChange} />
                        <FormField label="Health / Medical (₹)" name="health" value={formData.health} onChange={handleChange} />
                        <FormField label="Entertainment (₹)" name="entertainment" value={formData.entertainment} onChange={handleChange} />
                        <FormField label="Shopping (₹)" name="shopping" value={formData.shopping} onChange={handleChange} />
                        <FormField label="Other Expenses (₹)" name="others" value={formData.others} onChange={handleChange} />
                    </fieldset>
                    
                     <fieldset className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <legend className="text-xl font-semibold text-gray-900 mb-4 w-full col-span-full border-b pb-2">Financial Goals & Profile</legend>
                        <FormField label="Passive Income Target / mo (₹)" name="targetPassiveMonthly" value={formData.targetPassiveMonthly} onChange={handleChange} />
                        <FormField label="Target Timeline (Months)" name="targetTimelineMonths" value={formData.targetTimelineMonths} onChange={handleChange} min="1" />
                         <FormField label="Risk Profile" name="riskProfile" value={formData.riskProfile} onChange={handleChange}>
                            <option>Conservative</option>
                            <option>Moderate</option>
                            <option>Aggressive</option>
                        </FormField>
                        <FormField label="Emergency Fund Target (Months)" name="emergencyMonthsTarget" value={formData.emergencyMonthsTarget} onChange={handleChange} min="1" />
                        <FormField label="Assumed Accumulation Return (%)" name="assumedAccumulationReturn" value={formData.assumedAccumulationReturn} onChange={handleChange} step="0.1" />
                        <FormField label="Assumed Income Yield (%)" name="assumedYieldIncomeAssets" value={formData.assumedYieldIncomeAssets} onChange={handleChange} step="0.1" />
                    </fieldset>
                    
                    <div className="pt-5">
                        <div className="flex justify-end">
                            <button type="submit" disabled={isLoading} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 text-base font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                                {isLoading ? <div className="spinner h-5 w-5"></div> : 'Generate My Plan'}
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="animate-fade-in">
                    <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <nav className="flex flex-wrap gap-2" aria-label="Tabs">
                            {resultTabs.map((tabName) => (
                                <button
                                key={tabName}
                                onClick={() => setActiveTab(tabName)}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                    activeTab === tabName
                                    ? 'bg-indigo-600 text-white shadow'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                                >
                                {tabName.replace(/_/g, ' ')}
                                </button>
                            ))}
                        </nav>
                        <div className="flex w-full sm:w-auto gap-2">
                             <button onClick={handleReset} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-transform transform hover:scale-105">
                                <ResetIcon />
                                Start Over
                            </button>
                            <button onClick={handleDownload} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105">
                                <DownloadIcon />
                                Download
                            </button>
                        </div>
                    </div>
                    <div className="p-6">
                       {activeTab === 'Dashboard' ? (
                          <Charts chartData={results.chartData} />
                       ) : activeSheetData ? (
                            <DataTable 
                                title={activeSheetData.sheetName.replace(/_/g, ' ')} 
                                data={activeSheetData.data} 
                            />
                        ) : null}
                    </div>
                </div>
            )}
        </main>
        
        <footer className="text-center mt-8 text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Financial Planner. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;