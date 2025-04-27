import React from 'react'

const LatexMathGuide: React.FC = () => {
  const mathCategories = [
    {
      title: 'Greek Letters',
      items: [
        { code: '\\alpha', example: 'α' },
        { code: '\\beta', example: 'β' },
        { code: '\\gamma', example: 'γ' },
        { code: '\\delta', example: 'δ' },
        { code: '\\epsilon', example: 'ϵ' },
        { code: '\\theta', example: 'θ' },
        { code: '\\lambda', example: 'λ' },
        { code: '\\pi', example: 'π' },
        { code: '\\sigma', example: 'σ' },
        { code: '\\omega', example: 'ω' }
      ]
    },
    {
      title: 'Subscripts/Superscripts',
      items: [
        { code: 'x^2', example: 'x²' },
        { code: 'x_i', example: 'xᵢ' },
        { code: 'x_{i+1}', example: 'xᵢ₊₁' },
        { code: 'e^{x}', example: 'eˣ' },
        { code: '^{235}_{92}U', example: '²³⁵₉₂U' }
      ]
    },
    {
      title: 'Brackets',
      items: [
        { code: '\\left( \\frac{x}{y} \\right)', example: '(ˣ⁄ᵧ)' },
        { code: '\\left[ \\frac{x}{y} \\right]', example: '[ˣ⁄ᵧ]' },
        { code: '\\left\\{ \\frac{x}{y} \\right\\}', example: '{ˣ⁄ᵧ}' },
        { code: '\\langle x \\rangle', example: '⟨x⟩' }
      ]
    },
    {
      title: 'Fractions/Binomials',
      items: [
        { code: '\\frac{a}{b}', example: 'ᵃ⁄₆' },
        { code: '\\dfrac{a}{b}', example: 'Display style fraction' },
        { code: '\\binom{n}{k}', example: '(ⁿₖ)' }
      ]
    },
    {
      title: 'Integrals/Sums',
      items: [
        { code: '\\int_a^b f(x)dx', example: '∫ₐᵇ f(x)dx' },
        { code: '\\sum_{i=1}^n', example: 'Σᵢ₌₁ⁿ' },
        { code: '\\prod_{i=1}^n', example: '∏ᵢ₌₁ⁿ' },
        { code: '\\lim_{x \\to \\infty}', example: 'limₓ→∞' }
      ]
    },
    {
      title: 'Operators',
      items: [
        { code: '\\times', example: '×' },
        { code: '\\pm', example: '±' },
        { code: '\\leq \\geq', example: '≤ ≥' },
        { code: '\\approx', example: '≈' },
        { code: '\\in', example: '∈' },
        { code: '\\subset', example: '⊂' }
      ]
    },
    {
      title: 'Matrices',
      items: [
        { code: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', example: '2×2 matrix' },
        { code: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}', example: 'Bracketed matrix' }
      ]
    },
    {
      title: 'Multi-line Equations',
      items: [
        {
          code: '\\begin{align}\n  a &= b + c \\\\\n  &= d + e\n\\end{align}',
          example: 'Aligned equations'
        },
        {
          code: '\\begin{cases}\n  x & \\text{if } y \\\\\n  z & \\text{otherwise}\n\\end{cases}',
          example: 'Case statement'
        }
      ]
    }
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        LaTeX Math Cheat Sheet
      </h1>

      <div className="grid grid-cols-1 gap-6">
        {mathCategories.map((category, index) => (
          <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200">
              {category.title}
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 dark:border-blue-500">
                <thead className="border-b border-gray-200 dark:border-sky-700">
                  <tr>
                    <th className="px-2 py-1 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                      LaTeX
                    </th>
                    <th className="px-2 py-1 text-left text-sm font-medium text-gray-500 dark:text-gray-300">
                      Output
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {category.items.map((item, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-100 dark:border-gray-600 last:border-0"
                    >
                      <td className="px-2 py-2 text-sm font-mono text-blue-600 dark:text-blue-400">
                        {item.code}
                      </td>
                      <td className="px-2 py-2 text-sm text-gray-700 dark:text-gray-300">
                        {item.example}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">Pro Tips</h2>
        <ul className="list-disc pl-5 space-y-1 text-blue-700 dark:text-blue-300">
          <li>
            Use <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">$...$</code> for inline
            math and <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">\[...\]</code> for
            display math
          </li>
          <li>
            Use <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">\left</code> and{' '}
            <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">\right</code> for
            auto-scaling delimiters
          </li>
          <li>
            Prefix with{' '}
            <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">\displaystyle</code> to
            force larger rendering
          </li>
        </ul>
      </div>
    </div>
  )
}

export default LatexMathGuide
