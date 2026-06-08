import type { Step } from '../types'

interface ProgressStepperProps {
  currentStep: Step
}

const steps: Array<{ id: Step; label: string }> = [
  { id: 1, label: 'Login' },
  { id: 2, label: 'Risk & Consent' },
  { id: 3, label: 'Stock Input' },
  { id: 4, label: 'Review' },
  { id: 5, label: 'Confirmation' },
]

export function ProgressStepper({ currentStep }: ProgressStepperProps) {
  const completion = Math.round((currentStep / steps.length) * 100)

  return (
    <section className="surface-card space-y-4" aria-label="Progress indicator">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-fintech-600">Progress</p>
          <p className="mt-1 text-sm text-slate-600">
            Step {currentStep} of {steps.length}
          </p>
        </div>
        <p className="text-lg font-semibold text-fintech-900">{completion}%</p>
      </div>

      <div className="h-2.5 rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-fintech-600 to-brand-500"
          style={{ width: `${completion}%` }}
        />
      </div>

      <ol className="grid gap-2 sm:grid-cols-5">
        {steps.map((step) => {
          const isActive = currentStep === step.id
          const isComplete = currentStep > step.id

          return (
            <li
              key={step.id}
              className={`rounded-xl border px-3 py-2.5 text-left ${
                isActive
                  ? 'border-fintech-300 bg-fintech-100 text-fintech-700 shadow-sm'
                  : isComplete
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-500'
              }`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em]">Step {step.id}</p>
              <p className="mt-0.5 text-xs font-medium sm:text-sm">{step.label}</p>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
