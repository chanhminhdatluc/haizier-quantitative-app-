import { useState } from 'react'
import { FinalConfirmationScreen } from './components/FinalConfirmationScreen'
import { IntelligenceReviewScreen } from './components/IntelligenceReviewScreen'
import { LoginScreen } from './components/LoginScreen'
import { ProgressStepper } from './components/ProgressStepper'
import { RiskConsentScreen } from './components/RiskConsentScreen'
import { StockAnalysisInputScreen } from './components/StockAnalysisInputScreen'
import type {
  AnalysisResult,
  LoginForm,
  OpportunityScannerInput,
  RiskProfileForm,
  ScannerCandidate,
  SignalType,
  Step,
  StockInputForm,
} from './types'
import { submitAnalysis } from './services/apiClient'

const initialLogin: LoginForm = { email: '', password: '' }
const initialProfile: RiskProfileForm = { experience: '', riskTolerance: '', goal: '', consent: false }
const initialStockInput: StockInputForm = { ticker: '', horizon: '', amountRange: '', signals: [] }

function App() {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [login, setLogin] = useState<LoginForm>(initialLogin)
  const [riskProfile, setRiskProfile] = useState<RiskProfileForm>(initialProfile)
  const [stockInput, setStockInput] = useState<StockInputForm>(initialStockInput)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [finalStatus, setFinalStatus] = useState<'success' | 'failure' | null>(null)
  const [isSubmittingAnalysis, setIsSubmittingAnalysis] = useState(false)
  const [analysisError, setAnalysisError] = useState('')

  const [loginErrors, setLoginErrors] = useState<Partial<Record<keyof LoginForm, string>>>({})
  const [riskErrors, setRiskErrors] = useState<Partial<Record<keyof RiskProfileForm, string>>>({})
  const [stockErrors, setStockErrors] = useState<Partial<Record<'ticker' | 'horizon', string>>>({})

  const handleLoginSubmit = () => {
    const errors: Partial<Record<keyof LoginForm, string>> = {}

    if (!login.email.trim()) {
      errors.email = 'Email is required.'
    } else if (!/\S+@\S+\.\S+/.test(login.email)) {
      errors.email = 'Please enter a valid email address.'
    }

    if (!login.password.trim()) {
      errors.password = 'Password is required.'
    }

    setLoginErrors(errors)
    if (Object.keys(errors).length === 0) {
      setCurrentStep(2)
    }
  }

  const handleRiskSubmit = () => {
    const errors: Partial<Record<keyof RiskProfileForm, string>> = {}

    if (!riskProfile.experience) errors.experience = 'Please select your investment experience.'
    if (!riskProfile.riskTolerance) errors.riskTolerance = 'Please select your risk tolerance.'
    if (!riskProfile.goal.trim()) errors.goal = 'Please provide your investment goal.'
    if (!riskProfile.consent)
      errors.consent = 'You must provide consent before continuing to analysis.'

    setRiskErrors(errors)
    if (Object.keys(errors).length === 0) {
      setCurrentStep(3)
    }
  }

  const handleStockSubmit = async () => {
    const errors: Partial<Record<'ticker' | 'horizon', string>> = {}

    if (!stockInput.ticker.trim()) errors.ticker = 'Stock ticker is required.'
    if (!stockInput.horizon) errors.horizon = 'Investment horizon is required.'

    setStockErrors(errors)
    if (Object.keys(errors).length === 0) {
      setIsSubmittingAnalysis(true)
      setAnalysisError('')
      try {
        const result = await submitAnalysis(login, riskProfile, stockInput)
        setAnalysisResult(result)
        setCurrentStep(4)
      } catch (error) {
        setAnalysisError(error instanceof Error ? error.message : 'Unable to generate analysis.')
      } finally {
        setIsSubmittingAnalysis(false)
      }
    }
  }

  const handleStockChange = (field: keyof StockInputForm, value: string | SignalType[]) => {
    setStockInput((prev) => ({ ...prev, [field]: value } as StockInputForm))
  }

  const handleScannerSelect = (
    candidate: ScannerCandidate,
    scannerInput: OpportunityScannerInput,
  ) => {
    const horizonMap: Record<OpportunityScannerInput['horizon'], StockInputForm['horizon']> = {
      'Short-term': 'Short-term (0-12 months)',
      'Medium-term': 'Medium-term (1-3 years)',
      'Long-term': 'Long-term (3+ years)',
    }

    setStockInput((prev) => ({
      ...prev,
      ticker: candidate.ticker,
      horizon: prev.horizon || horizonMap[scannerInput.horizon],
    }))
  }

  const handleConfirmAnalysis = () => {
    const isValid = Boolean(stockInput.ticker && stockInput.horizon && riskProfile.consent && analysisResult)
    setFinalStatus(isValid ? 'success' : 'failure')
    setCurrentStep(5)
  }

  const handleRestart = () => {
    setCurrentStep(1)
    setLogin(initialLogin)
    setRiskProfile(initialProfile)
    setStockInput(initialStockInput)
    setAnalysisResult(null)
    setFinalStatus(null)
    setIsSubmittingAnalysis(false)
    setAnalysisError('')
    setLoginErrors({})
    setRiskErrors({})
    setStockErrors({})
  }

  return (
    <main className="min-h-screen bg-fintech-50 text-fintech-900">
      <div className="app-shell">
        <header className="surface-card space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fintech-600">Haizier MVP</p>
          <h1 className="text-3xl font-bold sm:text-4xl lg:text-[2.6rem]">Quantitative Decision-Support Journey</h1>
          <p className="max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Evaluate whether stock opportunities are supported by cross-evidence intelligence or
            temporary hype.
          </p>
          <p className="ethics-note">
            Educational MVP only: Haizier retrieves market data through the secure Python backend,
            stores analysis records in Supabase for assignment evidence, and does not provide financial advice.
          </p>
        </header>

        <ProgressStepper currentStep={currentStep} />

        {currentStep === 1 && (
          <LoginScreen
            data={login}
            errors={loginErrors}
            onChange={(field, value) => setLogin((prev) => ({ ...prev, [field]: value }))}
            onSubmit={handleLoginSubmit}
          />
        )}

        {currentStep === 2 && (
          <RiskConsentScreen
            data={riskProfile}
            errors={riskErrors}
            onChange={(field, value) => setRiskProfile((prev) => ({ ...prev, [field]: value }))}
            onSubmit={handleRiskSubmit}
          />
        )}

        {currentStep === 3 && (
          <StockAnalysisInputScreen
            data={stockInput}
            riskProfile={riskProfile}
            errors={stockErrors}
            onChange={handleStockChange}
            onScannerSelect={handleScannerSelect}
            onSubmit={handleStockSubmit}
            isSubmitting={isSubmittingAnalysis}
            submitError={analysisError}
          />
        )}

        {currentStep === 4 && analysisResult && (
          <IntelligenceReviewScreen
            ticker={stockInput.ticker}
            result={analysisResult}
            onConfirm={handleConfirmAnalysis}
            onBack={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 5 && finalStatus && (
          <FinalConfirmationScreen
            status={finalStatus}
            riskProfile={riskProfile}
            stockInput={stockInput}
            analysisResult={analysisResult}
            onRestart={handleRestart}
          />
        )}

        <footer className="px-1 pb-2">
          <p className="text-center text-xs leading-relaxed text-slate-500">
            Haizier is an educational decision-support prototype. Outputs compare evidence-supported vs
            hype-driven signals and are not financial advice.
          </p>
        </footer>
      </div>
    </main>
  )
}

export default App
