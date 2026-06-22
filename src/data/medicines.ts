// Curated formulary the psychiatrist picks from when prescribing. Grouped by
// class so the dropdown is scannable; common starting strengths are offered as
// dosage suggestions. Not exhaustive — the prescribe form keeps an "Other"
// escape hatch for anything off-list.

export type Medicine = {
  /** Generic name shown in the dropdown. */
  name: string
  /** Drug class, used to group options. */
  class: string
  /** Typical strengths offered as dosage suggestions. */
  strengths: string[]
}

export const MEDICINES: Medicine[] = [
  // SSRIs
  { name: 'Sertraline', class: 'SSRI', strengths: ['25 mg', '50 mg', '100 mg'] },
  { name: 'Escitalopram', class: 'SSRI', strengths: ['5 mg', '10 mg', '20 mg'] },
  { name: 'Fluoxetine', class: 'SSRI', strengths: ['10 mg', '20 mg', '40 mg'] },
  { name: 'Paroxetine', class: 'SSRI', strengths: ['10 mg', '20 mg', '25 mg'] },
  { name: 'Citalopram', class: 'SSRI', strengths: ['10 mg', '20 mg', '40 mg'] },
  { name: 'Fluvoxamine', class: 'SSRI', strengths: ['50 mg', '100 mg'] },
  // SNRIs
  { name: 'Venlafaxine', class: 'SNRI', strengths: ['37.5 mg', '75 mg', '150 mg'] },
  { name: 'Desvenlafaxine', class: 'SNRI', strengths: ['50 mg', '100 mg'] },
  { name: 'Duloxetine', class: 'SNRI', strengths: ['20 mg', '30 mg', '60 mg'] },
  // Atypical / other antidepressants
  { name: 'Mirtazapine', class: 'Atypical antidepressant', strengths: ['7.5 mg', '15 mg', '30 mg'] },
  { name: 'Bupropion', class: 'Atypical antidepressant', strengths: ['150 mg', '300 mg'] },
  { name: 'Vortioxetine', class: 'Atypical antidepressant', strengths: ['5 mg', '10 mg', '20 mg'] },
  // Tricyclics
  { name: 'Amitriptyline', class: 'Tricyclic', strengths: ['10 mg', '25 mg', '50 mg'] },
  { name: 'Nortriptyline', class: 'Tricyclic', strengths: ['10 mg', '25 mg'] },
  { name: 'Imipramine', class: 'Tricyclic', strengths: ['25 mg', '75 mg'] },
  // Anxiolytics / sleep
  { name: 'Clonazepam', class: 'Benzodiazepine', strengths: ['0.25 mg', '0.5 mg', '1 mg'] },
  { name: 'Lorazepam', class: 'Benzodiazepine', strengths: ['0.5 mg', '1 mg', '2 mg'] },
  { name: 'Alprazolam', class: 'Benzodiazepine', strengths: ['0.25 mg', '0.5 mg', '1 mg'] },
  { name: 'Buspirone', class: 'Anxiolytic', strengths: ['5 mg', '10 mg'] },
  { name: 'Propranolol', class: 'Beta-blocker', strengths: ['10 mg', '20 mg', '40 mg'] },
  { name: 'Hydroxyzine', class: 'Antihistamine', strengths: ['10 mg', '25 mg'] },
  { name: 'Melatonin', class: 'Sleep aid', strengths: ['3 mg', '5 mg'] },
  { name: 'Zolpidem', class: 'Sleep aid', strengths: ['5 mg', '10 mg'] },
  // Mood stabilisers
  { name: 'Lithium', class: 'Mood stabiliser', strengths: ['300 mg', '450 mg'] },
  { name: 'Valproate', class: 'Mood stabiliser', strengths: ['200 mg', '500 mg'] },
  { name: 'Lamotrigine', class: 'Mood stabiliser', strengths: ['25 mg', '50 mg', '100 mg'] },
  // Antipsychotics
  { name: 'Quetiapine', class: 'Antipsychotic', strengths: ['25 mg', '50 mg', '100 mg', '200 mg'] },
  { name: 'Olanzapine', class: 'Antipsychotic', strengths: ['2.5 mg', '5 mg', '10 mg'] },
  { name: 'Risperidone', class: 'Antipsychotic', strengths: ['1 mg', '2 mg', '3 mg'] },
  { name: 'Aripiprazole', class: 'Antipsychotic', strengths: ['5 mg', '10 mg', '15 mg'] },
  // ADHD
  { name: 'Methylphenidate', class: 'Stimulant (ADHD)', strengths: ['10 mg', '18 mg', '36 mg'] },
  { name: 'Atomoxetine', class: 'Non-stimulant (ADHD)', strengths: ['10 mg', '25 mg', '40 mg'] },
]

export const FREQUENCY_OPTIONS = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'At bedtime',
  'In the morning',
  'As needed (PRN)',
  'Once weekly',
]
