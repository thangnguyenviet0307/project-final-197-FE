export type StorefrontContentCard = {
  title: string
  description: string
}

export type AboutPageContent = {
  eyebrow: string
  title: string
  highlight: string
  intro: string
  story: {
    eyebrow: string
    title: string
    paragraphs: string[]
  }
  offerings: StorefrontContentCard[]
  principles: StorefrontContentCard[]
  steps: StorefrontContentCard[]
  notice: StorefrontContentCard
}

export type FAQQuestion = {
  id: string
  question: string
  answer: string
}

export type FAQCategory = {
  id: string
  label: string
  title: string
  questions: FAQQuestion[]
}

export type FAQPageContent = {
  eyebrow: string
  title: string
  intro: string
  categories: FAQCategory[]
}
