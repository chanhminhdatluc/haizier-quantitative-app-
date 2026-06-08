import type { RiskProfileForm } from '../types'

interface RiskConsentScreenProps {
  data: RiskProfileForm
  errors: Partial<Record<keyof RiskProfileForm, string>>
  onChange: (field: keyof RiskProfileForm, value: string | boolean) => void
  onSubmit: () => void
}

export function RiskConsentScreen({ data, errors, onChange, onSubmit }: RiskConsentScreenProps) {
  return (
    <section className="surface-card">
      <p className="helper-heading">Step 2 · Risk Context & Ethical Consent</p>
      <h2 className="section-title">Risk Profile & Consent</h2>
      <p className="section-subtitle">
        We use this information only to tailor your in-session educational analysis context.
      </p>

      <p className="ethics-note mt-4">
        Consent summary: Haizier processes these inputs only during this live MVP session, does not
        permanently store personal information, and does not execute trades or provide financial advice.
      </p>

      <div className="mt-6 grid gap-5">
        <label className="field-label">
          Investment Experience
          <select
            value={data.experience}
            onChange={(event) => onChange('experience', event.target.value)}
            className={`field-input ${errors.experience ? 'field-input-error' : ''}`}
          >
            <option value="">Select experience</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          {errors.experience ? <span className="field-error">{errors.experience}</span> : null}
        </label>

        <label className="field-label">
          Risk Tolerance
          <select
            value={data.riskTolerance}
            onChange={(event) => onChange('riskTolerance', event.target.value)}
            className={`field-input ${errors.riskTolerance ? 'field-input-error' : ''}`}
          >
            <option value="">Select tolerance</option>
            <option value="Conservative">Conservative</option>
            <option value="Balanced">Balanced</option>
            <option value="Aggressive">Aggressive</option>
          </select>
          {errors.riskTolerance ? <span className="field-error">{errors.riskTolerance}</span> : null}
        </label>

        <label className="field-label">
          Investment Goal
          <input
            type="text"
            value={data.goal}
            onChange={(event) => onChange('goal', event.target.value)}
            className={`field-input ${errors.goal ? 'field-input-error' : ''}`}
            placeholder="e.g. Long-term growth"
          />
          {errors.goal ? <span className="field-error">{errors.goal}</span> : null}
        </label>

        <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-left text-sm text-slate-700">
          <input
            type="checkbox"
            checked={data.consent}
            onChange={(event) => onChange('consent', event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 bg-white text-fintech-500"
          />
          <span>
            I understand this is an educational prototype and I consent to Haizier using my entered
            details only within this session to generate mock decision-support outputs. I understand no
            personal data is permanently stored.
          </span>
        </label>
        {errors.consent ? <p className="field-error text-left">{errors.consent}</p> : null}
      </div>

      <button
        type="button"
        onClick={onSubmit}
        className="btn-primary mt-6"
      >
        Continue
      </button>
    </section>
  )
}
