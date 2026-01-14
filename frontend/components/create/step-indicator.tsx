'use client'

interface StepIndicatorProps {
  steps: string[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isActive = stepNumber === currentStep
        const isComplete = stepNumber < currentStep

        return (
          <div key={step} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-stat text-sm ${
                  isActive
                    ? 'bg-tributary text-white'
                    : isComplete
                    ? 'bg-tributary/20 text-tributary'
                    : 'bg-cream-dark text-text-muted'
                }`}
              >
                {isComplete ? '✓' : stepNumber}
              </div>
              <p className={`font-body text-xs mt-2 ${
                isActive ? 'text-tributary' : 'text-text-muted'
              }`}>
                {step}
              </p>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-16 mx-2 ${
                  isComplete ? 'bg-tributary' : 'bg-cream-dark'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
