import React, { useState, useCallback, ChangeEvent, FormEvent, useEffect } from 'react';
import { DataTable } from './components/DataTable';
import { exportDataToExcel } from './services/excelService';
import { generatePlan } from './services/calculationService';
import { getAiFinancialAdvice } from './services/aiService';
import type { FormData, PlanResults } from './types';
import { 
    DownloadIcon, ResetIcon, SparklesIcon, CurrencyRupeeIcon, PiggyBankIcon,
    TrendingUpIcon, ShieldCheckIcon, CalendarIcon, TargetIcon 
} from './components/icons';

declare global {
    interface Window {
        marked: any;
    }
}

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

const FormField: React.FC<{ label: string; name: keyof FormData; value: string | number; onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void; type?: string; placeholder?: string; step?: string; min?: string; icon?: React.ReactNode; children?: React.ReactNode }> = ({ label, name, value, onChange, type = 'number', placeholder, step, min, icon, children }) => (
    <div className="flex flex-col">
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <div className="relative">
            {icon && <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">{icon}</div>}
            {children ? (
                 <select id={name} name={name} value={value} onChange={onChange} className={`block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${icon ? 'pl-10' : 'pl-3'}`}>
                    {children}
                </select>
            ) : (
                <input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} step={step} min={min} className={`block w-full rounded-md border-slate-300 shadow-sm placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${icon ? 'pl-10' : 'pl-3'}`} />
            )}
        </div>
    </div>
);

const FormSection: React.FC<{ title: string; subtitle: string; children: React.ReactNode; gridCols?: string }> = ({ title, subtitle, children, gridCols = 'lg:grid-cols-4' }) => (
    <fieldset className="p-6 bg-white rounded-lg border border-slate-200">
        <div className="border-b border-slate-200 pb-4 mb-6">
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols} gap-6`}>
            {children}
        </div>
    </fieldset>
);

const AiResponseRenderer: React.FC<{ text: string }> = ({ text }) => {
    const [html, setHtml] = useState('');

    useEffect(() => {
        if (window.marked) {
            setHtml(window.marked.parse(text));
        } else {
            // Fallback for simple markdown if marked.js is not loaded
             const fallbackHtml = text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\* (.*?)\n/g, '<li>$1</li>')
                .replace(/<li>/g, '<ul><li>')
                .replace(/<\/li>\n/g, '</li></ul>');
            setHtml(fallbackHtml);
        }
    }, [text]);

    return <div className="text-slate-700 space-y-4 ai-response" dangerouslySetInnerHTML={{ __html: html }} />;
};

const App: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [results, setResults] = useState<PlanResults | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');


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
        setActiveTab(plan.sheets[0]?.sheetName || '');
        setIsLoading(false);
        window.scrollTo(0, 0);
    }, 500);
  };
  
  const handleReset = useCallback(() => {
    setResults(null);
    setFormData(initialFormData);
    setAiQuestion('');
    setAiResponse('');
    setAiError('');
    window.scrollTo(0, 0);
  }, []);

  const handleDownload = useCallback(() => {
    if (results) {
        exportDataToExcel(results.sheets, `personal_finance_plan_${new Date().toISOString().split('T')[0]}.xlsx`);
    }
  }, [results]);

  const handleAiSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!aiQuestion.trim() || !results) return;

    setIsAiLoading(true);
    setAiResponse('');
    setAiError('');

    try {
        const response = await getAiFinancialAdvice(results, aiQuestion);
        setAiResponse(response);
    } catch (error) {
        console.error(error);
        setAiError('An error occurred. Please try again.');
    } finally {
        setIsAiLoading(false);
    }
  };

  const activeSheetData = results?.sheets.find(sheet => sheet.sheetName === activeTab);
  const resultTabs = results ? results.sheets.map(s => s.sheetName) : [];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900">Interactive Personal Finance Planner</h1>
          <p className="mt-2 text-lg text-slate-600">
            {results ? 'Your personalized financial roadmap.' : 'Fill in your details to generate a custom financial plan.'}
          </p>
        </header>

        <main className="bg-slate-50 rounded-xl shadow-lg ring-1 ring-slate-200">
            {!results ? (
                 <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 animate-fade-in">
                    <FormSection title="Income" subtitle="Your monthly earnings and other sources." gridCols="lg:grid-cols-3">
                        <FormField label="Net Monthly Income" name="netMonthlyIncome" value={formData.netMonthlyIncome} onChange={handleChange} icon={<CurrencyRupeeIcon />} />
                        <FormField label="Monthly Side Income" name="monthlySideIncome" value={formData.monthlySideIncome} onChange={handleChange} icon={<CurrencyRupeeIcon />} />
                        <FormField label="Monthly Tax / TDS" name="monthlyTaxDeduction" value={formData.monthlyTaxDeduction} onChange={handleChange} icon={<CurrencyRupeeIcon />} />
                    </FormSection>
                    
                    <FormSection title="Current Assets" subtitle="What you currently have saved and invested." gridCols="lg:grid-cols-2">
                        <FormField label="Investments" name="currentInvestments" value={formData.currentInvestments} onChange={handleChange} icon={<TrendingUpIcon />} />
                        <FormField label="Emergency Fund" name="currentEmergencyFund" value={formData.currentEmergencyFund} onChange={handleChange} icon={<ShieldCheckIcon />} />
                    </FormSection>

                    <FormSection title="Monthly Expenses" subtitle="All your recurring monthly expenditures.">
                        <FormField label="Rent / Mortgage" name="rent" value={formData.rent} onChange={handleChange} icon={<CurrencyRupeeIcon />} />
                        <FormField label="Groceries" name="groceries" value={formData.groceries} onChange={handleChange} icon={<CurrencyRupeeIcon />} />
                        <FormField label="Utilities" name="utilities" value={formData.utilities} onChange={handleChange} icon={<CurrencyRupeeIcon />} />
                        <FormField label="Transport" name="transport" value={formData.transport} onChange={handleChange} icon={<CurrencyRupeeIcon />} />
                        <FormField label="EMIs / Loans" name="emi" value={formData.emi} onChange={handleChange} icon={<CurrencyRupeeIcon />} />
                        <FormField label="Insurance" name="insurance" value={formData.insurance} onChange={handleChange} icon={<CurrencyRupeeIcon />} />
                        <FormField label="Subscriptions" name="subscriptions" value={formData.subscriptions} onChange={handleChange} icon={<CurrencyRupeeIcon />} />
                        <FormField label="Education" name="education" value={formData.education} onChange={handleChange} icon={<CurrencyRupeeIcon />} />
                        <FormField label="Health / Medical" name="health" value={formData.health} onChange={handleChange} icon={<CurrencyRupeeIcon />} />
                        <FormField label="Entertainment" name="entertainment" value={formData.entertainment} onChange={handleChange} icon={<CurrencyRupeeIcon />} />
                        <FormField label="Shopping" name="shopping" value={formData.shopping} onChange={handleChange} icon={<CurrencyRupeeIcon />} />
                        <FormField label="Other Expenses" name="others" value={formData.others} onChange={handleChange} icon={<CurrencyRupeeIcon />} />
                    </FormSection>
                    
                    <FormSection title="Financial Goals & Profile" subtitle="Your targets and investment preferences." gridCols="lg:grid-cols-3">
                        <FormField label="Passive Income Target / mo" name="targetPassiveMonthly" value={formData.targetPassiveMonthly} onChange={handleChange} icon={<TargetIcon />} />
                        <FormField label="Target Timeline (Months)" name="targetTimelineMonths" value={formData.targetTimelineMonths} onChange={handleChange} min="1" icon={<CalendarIcon />}/>
                        <FormField label="Risk Profile" name="riskProfile" value={formData.riskProfile} onChange={handleChange} icon={<ShieldCheckIcon />}>
                            <option>Conservative</option>
                            <option>Moderate</option>
                            <option>Aggressive</option>
                        </FormField>
                        <FormField label="Emergency Fund Target (Months)" name="emergencyMonthsTarget" value={formData.emergencyMonthsTarget} onChange={handleChange} min="1" icon={<PiggyBankIcon />} />
                        <FormField label="Assumed Accumulation Return (%)" name="assumedAccumulationReturn" value={formData.assumedAccumulationReturn} onChange={handleChange} step="0.1" icon={<TrendingUpIcon />} />
                        <FormField label="Assumed Income Yield (%)" name="assumedYieldIncomeAssets" value={formData.assumedYieldIncomeAssets} onChange={handleChange} step="0.1" icon={<TrendingUpIcon />} />
                    </FormSection>
                    
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
                    <div className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur-sm border-b border-slate-200">
                        <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 container mx-auto">
                            <nav className="flex flex-wrap gap-2" aria-label="Tabs">
                                {resultTabs.map((tabName) => (
                                    <button
                                    key={tabName}
                                    onClick={() => setActiveTab(tabName)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                        activeTab === tabName
                                        ? 'bg-indigo-600 text-white shadow'
                                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                    }`}
                                    >
                                    {tabName.replace(/_/g, ' ')}
                                    </button>
                                ))}
                            </nav>
                            <div className="flex w-full sm:w-auto gap-3">
                                <button onClick={handleReset} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-200 rounded-lg shadow-sm hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-transform transform hover:scale-105">
                                    <ResetIcon />
                                    Start Over
                                </button>
                                <button onClick={handleDownload} className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105">
                                    <DownloadIcon />
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 sm:p-8">
                       {activeSheetData ? (
                            <DataTable 
                                title={activeSheetData.sheetName.replace(/_/g, ' ')} 
                                data={activeSheetData.data} 
                            />
                        ) : null}
                    </div>

                    {results && (
                        <div className="mx-6 sm:mx-8 mb-6 mt-2 p-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg border border-slate-200 shadow-inner">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-shrink-0 bg-indigo-100 text-indigo-600 rounded-full p-2">
                                    <SparklesIcon />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-800">Ask Your AI Financial Assistant</h3>
                            </div>
                            <form onSubmit={handleAiSubmit} className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    value={aiQuestion}
                                    onChange={(e) => setAiQuestion(e.target.value)}
                                    placeholder="e.g., How can I reach my goal faster?"
                                    className="flex-grow block w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
                                    disabled={isAiLoading}
                                />
                                <button type="submit" disabled={isAiLoading || !aiQuestion.trim()} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed">
                                    {isAiLoading ? <div className="spinner h-5 w-5"></div> : 'Ask FinPal'}
                                </button>
                            </form>
                            <div className="mt-6 min-h-[50px]">
                                {isAiLoading && <div className="flex items-center justify-center p-4 text-slate-500"><div className="spinner h-6 w-6 mr-3"></div>FinPal is thinking...</div>}
                                {aiError && <div className="p-4 bg-red-100 border border-red-300 text-red-800 rounded-md"><strong className="font-semibold">Error:</strong> {aiError}</div>}
                                {!isAiLoading && !aiResponse && !aiError && <div className="text-center text-slate-500 p-4">Ask a question to get personalized advice from FinPal.</div>}
                                {aiResponse && (
                                    <div className="p-4 bg-white rounded-md border border-slate-200 shadow-sm animate-fade-in">
                                        <AiResponseRenderer text={aiResponse} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </main>
        
        <footer className="text-center mt-8 text-slate-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Financial Planner. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
