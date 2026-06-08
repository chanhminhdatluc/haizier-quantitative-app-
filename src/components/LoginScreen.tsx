import type { LoginForm } from '../types'

interface LoginScreenProps {
  data: LoginForm
  errors: Partial<Record<keyof LoginForm, string>>
  onChange: (field: keyof LoginForm, value: string) => void
  onSubmit: () => void
}

export function LoginScreen({ data, errors, onChange, onSubmit }: LoginScreenProps) {
  return (
    <section className="surface-card">
      <p className="helper-heading">Step 1 · Access Setup</p>
      <h2 className="section-title">Welcome to Haizier</h2>
      <p className="section-subtitle">
        Login to begin your educational stock evidence review.
      </p>

      <p className="ethics-note mt-4">
        Why this step matters: this MVP demonstrates how structured intelligence can support safer
        decision thinking. Your details are used only for this session and are not permanently stored.
      </p>

      <div className="mt-6 grid gap-5">
        <label className="field-label">
          Email
          <input
            type="email"
            value={data.email}
            onChange={(event) => onChange('email', event.target.value)}
            className={`field-input ${errors.email ? 'field-input-error' : ''}`}
            placeholder="you@example.com"
          />
          {errors.email ? <span className="field-error">{errors.email}</span> : null}
        </label>

        <label className="field-label">
          Password
          <input
            type="password"
            value={data.password}
            onChange={(event) => onChange('password', event.target.value)}
            className={`field-input ${errors.password ? 'field-input-error' : ''}`}
            placeholder="Enter your password"
          />
          {errors.password ? <span className="field-error">{errors.password}</span> : null}
        </label>
      </div>

      <p className="info-alert mt-5 border-amber-200 bg-amber-50 text-amber-800">
        Haizier provides educational decision-support insights, not financial advice. Outputs are
        generated from mock analysis logic for demonstration purposes.
      </p>

      <button
        type="button"
        onClick={onSubmit}
        className="btn-primary mt-6"
      >
        Login
      </button>
    </section>
  )
}
