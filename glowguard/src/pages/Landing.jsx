import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { updateProfile } from '../api/services'

import heroBg from '../assets/landing/land bg.png'

import addProducts from '../assets/landing/add-products.png';
import buildRoutine from '../assets/landing/build-routine.png';
import trackCheck from '../assets/landing/track-check.png';

import quizIntro from '../assets/quiz/quiz-intro.png'
import quiz0 from '../assets/quiz/quiz-0.png'
import quiz1 from '../assets/quiz/quiz-1.png'
import quiz2 from '../assets/quiz/quiz-2.png'
import quiz3 from '../assets/quiz/quiz-3.png'
import quiz4 from '../assets/quiz/quiz-4.png'

import oilySkin from '../assets/results/Oily Skin.jpeg';
import drySkin from '../assets/results/Dry skin.jpeg';
import combinationSkin from '../assets/results/Combination Skin.jpeg';
import balancedSkin from '../assets/results/Normal Skin.jpeg';

import botanicalImage from '../assets/landing/track-check.png';
import skincareImage from '../assets/landing/build-routine.png';

import ctaBg from '../assets/landing/add-products.png';



const features = [
  {
    title: 'AM/PM Routines',
    desc: 'Create flexible morning and night routines with unlimited skincare steps and completion tracking.',
    more: 'Reorder steps by priority, set reminders per step, and mark each one complete to build consistent habits.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
        <rect x="3" y="4" width="18" height="17" rx="3" />
        <path d="M7 2v4M17 2v4M3 9h18M8 14l2 2 5-5" />
      </svg>
    ),
  },
  {
    title: 'Digital Product Shelf',
    desc: 'Keep your cleansers, toners, serums, moisturizers, sunscreen, and other products organized.',
    more: 'Track your products, categories, ingredients, and usage so you always know what belongs in your routine.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
        <path d="M6 7h12M7 4h10l1 16H6L7 4Z" />
        <path d="M9 4V2h6v2" />
      </svg>
    ),
  },
  {
    title: 'Chemical Safety',
    desc: 'Review ingredient combinations that may need extra care before you use them together.',
    more: 'GlowGuard can flag stored active combinations such as retinol + AHA and help you separate them across your routine.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
        <path d="M12 3 20 6v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3Z" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
      </svg>
    ),
  },
  {
    title: 'Progress Tracker',
    desc: 'See your daily and weekly completion so you can build a more consistent skincare habit.',
    more: 'Use routine completion data to understand your consistency and keep your skincare workflow organized.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
        <path d="M4 19V5M4 19h17" />
        <path d="M8 16v-4M12 16V8M16 16v-7M20 16V6" />
      </svg>
    ),
  },
]

const questions = [
  {
    text: 'How does your skin usually feel after cleansing?',
    options: ['Tight or Dry', 'Comfy and Balanced', 'Oily or Shiny', 'Dry in some areas, oily in others'],
  },
  {
    text: 'By the middle of the day, what does your skin usually look like?',
    options: ['Still dry or sometimes flaky', 'Mostly balanced', 'Shiny across most of my face', 'Shiny mostly on my forehead and nose'],
  },
  {
    text: 'How often does your skin react to new skincare products?',
    options: ['Rarely', 'Sometimes', 'Often', "I'm not sure"],
  },
  {
    text: 'What would you most like help with in your routine?',
    options: ['Keeping my skin hydrated', 'Managing excess oil', 'Managing breakouts', 'Keeping my routine gentle', 'Staying consistent with skincare'],
  },
  {
    text: 'How familiar are you with active ingredients?',
    options: ["I'm completely new", 'I know a few common actives', 'I already use several actives', "I'm not sure what counts as an active"],
  },
]

const goalMap = {
  'Keeping my skin hydrated': 'Hydration',
  'Managing excess oil': 'Oil Control',
  'Managing breakouts': 'Breakout Care',
  'Keeping my routine gentle': 'Gentle Care',
  'Staying consistent with skincare': 'Consistency',
}

const chipMap = {
  Hydration: ['Hyaluronic Acid', 'Centella', 'Ceramides'],
  'Oil Control': ['Niacinamide', 'Green Tea', 'Salicylic Acid'],
  'Breakout Care': ['Salicylic Acid', 'Benzoyl Peroxide', 'Tea Tree'],
  'Gentle Care': ['Centella', 'Oat Extract', 'Squalane'],
  Consistency: ['Niacinamide', 'Ceramides', 'Hyaluronic Acid'],
}

const quizImages = {
  intro: {
    src: quizIntro,
    alt: 'Skincare products and serum',
  },
  0: {
    src: quiz0,
    alt: 'Skincare products and face care',
  },
  1: {
    src: quiz1,
    alt: 'Moisturizer and daily skincare',
  },
  2: {
    src: quiz2,
    alt: 'Woman with clear facial skin',
  },
  3: {
    src: quiz3,
    alt: 'Skincare products for a routine',
  },
  4: {
    src: quiz4,
    alt: 'Minimal skincare serum',
  },
}

const resultImages = {
  'Oily Skin': {
    src: oilySkin,
    alt: 'Close-up face representing an oily skin profile',
  },
  'Dry Skin': {
    src: drySkin,
    alt: 'Close-up face representing a dry skin profile',
  },
  'Combination Skin': {
    src: combinationSkin,
    alt: 'Close-up face representing a combination skin profile',
  },
  'Balanced Skin': {
    src: balancedSkin,
    alt: 'Close-up face representing a balanced skin profile',
  },
};

const workflowSteps = [
  [
    addProducts,
    '1',
    'Add your products',
    'Build your digital shelf with product details, categories, ingredients, and images.'
  ],
  [
    buildRoutine,
    '2',
    'Build your routine',
    'Choose products and arrange the order for your AM and PM routine.'
  ],
  [
    trackCheck,
    '3',
    'Track & check',
    'Complete each step, monitor progress, and review safety alerts when products change.'
  ],
];

const aboutHighlights = ['✓ Secure account', '✓ AM/PM routines', '✓ Product shelf', '✓ Safety checks']

const navigationItems = [
  ['home', 'Home'],
  ['features', 'Features'],
  ['how-it-works', 'How It Works'],
  ['about', 'About'],
]

const faqs = [
  ['Is GlowGuard free to use?', 'Yes! The core features — product shelf, AM/PM routines, safety checks, and the skin quiz — are completely free.'],
  ['Where is my data stored?', 'Your products, routines, and quiz results are saved to your account in the GlowGuard database, so they follow you between devices whenever you log in.'],
  ['How does the ingredient conflict checker work?', 'When products contain active ingredients, GlowGuard can compare them against its stored safety rules and flag combinations that need extra care.'],
  ['Is the skin quiz a medical diagnosis?', 'No. The quiz provides general skincare guidance based on your answers and does not diagnose skin conditions.'],
  ['Can I use it on my phone?', 'Yes. The landing page and the GlowGuard interface are designed to adapt to smaller screens.'],
]

function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <>
      <p className="text-center uppercase tracking-[.15em] text-gg-600 text-[11px] font-extrabold mb-2">{eyebrow}</p>
      <h2 className="text-center font-serif italic font-semibold text-3xl sm:text-4xl text-gg-900 tracking-tight">{title}</h2>
      {subtitle && <p className="text-center text-muted max-w-2xl mx-auto mt-3 leading-7">{subtitle}</p>}
    </>
  )
}

function getQuizResult(answers) {
  const q1 = answers[0]
  const q2 = answers[1]

  let type
  let desc

  if (q2 === 'Shiny mostly on my forehead and nose' || q1 === 'Dry in some areas, oily in others') {
    type = 'Combination Skin'
    desc = 'Some areas of your face may become oilier while others stay relatively dry or balanced. Zone-aware hydration is your best friend.'
  } else if (q1 === 'Oily or Shiny' || q2 === 'Shiny across most of my face') {
    type = 'Oily Skin'
    desc = 'Your skin produces excess sebum, especially as the day goes on. Lightweight, non-comedogenic formulas may suit you best.'
  } else if (q1 === 'Tight or Dry' || q2 === 'Still dry or sometimes flaky') {
    type = 'Dry Skin'
    desc = 'Your skin may struggle to retain moisture. Layered hydration can help support comfort and a healthy-looking glow.'
  } else {
    type = 'Balanced Skin'
    desc = 'Your skin is generally well-balanced. A consistent, gentle routine can help maintain it.'
  }

  const goal = goalMap[answers[3]] || 'Hydration'
  return { type, desc, goal, chips: chipMap[goal] || [] }
}

function FeatureCard({ feature, index, openFeature, onToggle }) {
  const open = openFeature === index

  return (
    <button
      type="button"
      onClick={() => onToggle(open ? null : index)}
      aria-expanded={open}
      className="text-left bg-white border border-gg-100 rounded-2xl p-6 min-h-[250px] shadow-card hover:-translate-y-1.5 hover:shadow-pop transition flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-gg-500 focus-visible:ring-offset-2"
    >
      <div className="w-12 h-12 grid place-items-center rounded-xl bg-gg-100 text-gg-700 mb-5">
        {feature.icon}
      </div>
      <h3 className="font-bold text-gg-800 mb-2">{feature.title}</h3>
      <p className="text-muted text-sm leading-6 flex-1">{feature.desc}</p>
      <div
        className={`overflow-hidden transition-all duration-300 text-gg-700 text-xs font-semibold ${open ? 'max-h-24 opacity-100 mt-3' : 'max-h-0 opacity-0'
          }`}
      >
        {feature.more}
      </div>
      <span className="mt-3 text-gg-700 text-xs font-bold">
        {open ? 'Show less ▴' : 'Learn more ▾'}
      </span>
    </button>
  )
}

function FaqItem({ question, answer, index, openIndex, onToggle }) {
  const open = openIndex === index
  const panelId = `faq-panel-${index}`

  return (
    <div className="bg-white border border-gg-100 rounded-xl mb-3 overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(open ? null : index)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left font-bold text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-gg-500 focus-visible:ring-inset"
      >
        {question}
        <span
          aria-hidden="true"
          className={`text-gg-700 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          ⌄
        </span>
      </button>
      <div
        id={panelId}
        className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-muted text-sm leading-6">{answer}</p>
        </div>
      </div>
    </div>
  )
}

function SkinQuiz() {
  const { user, setUser } = useApp()
  const [step, setStep] = useState(-1)
  const [answers, setAnswers] = useState(Array(5).fill(null))
  const [visual, setVisual] = useState(quizImages.intro)
  const [changing, setChanging] = useState(false)
  const transitionTimer = useRef(null)
  const answerTimer = useRef(null)

  const showVisual = (data) => {
    if (!data) return

    window.clearTimeout(transitionTimer.current)
    setChanging(true)

    transitionTimer.current = window.setTimeout(() => {
      setVisual(data)
      requestAnimationFrame(() => setChanging(false))
    }, 140)
  }

  useEffect(() => () => {
    window.clearTimeout(transitionTimer.current)
    window.clearTimeout(answerTimer.current)
  }, [])

  const startQuiz = () => {
    setAnswers(Array(5).fill(null))
    setStep(0)
    showVisual(quizImages[0])
  }

  const selectAnswer = (answer) => {
    const next = [...answers]
    next[step] = answer
    setAnswers(next)
    window.clearTimeout(answerTimer.current)
    answerTimer.current = window.setTimeout(() => {
      if (step < questions.length - 1) {
        const nextStep = step + 1
        setStep(nextStep)
        showVisual(quizImages[nextStep])
      }
    }, 350)
  }

  const result = useMemo(() => {
    if (step !== 5) return null
    return getQuizResult(answers)
  }, [step, answers])

  const finishQuiz = async () => {
    if (!answers[4]) return

    const quizResult = getQuizResult(answers)

    // Logged in? Persist the result to the account in the database so
    // My Account and future visits reflect it. Not logged in? The result
    // is still shown below from React state — it just isn't saved
    // anywhere until the person creates an account.
    if (user) {
      try {
        const updated = await updateProfile({
          skinType: quizResult.type,
          skinGoal: quizResult.goal,
        })
        setUser(updated)
      } catch (error) {
        console.warn('Unable to save skin type to account.', error)
      }
    }

    setStep(5)
    showVisual(resultImages[quizResult.type])
  }

  const intro = (
    <div className="flex flex-col justify-center items-center text-center h-full">
      <div className="text-[11px] uppercase tracking-widest font-extrabold text-gg-700 mb-3">Skin Profile Quiz</div>
      <h3 className="text-2xl font-bold text-ink max-w-lg">Before we build your routine, let&apos;s get to know your skin.</h3>
      <p className="text-muted leading-7 max-w-lg mt-3 mb-6">
        Answer 5 quick questions about how your skin usually looks, feels, and reacts — you&apos;ll get an instant profile with ingredient suggestions.
      </p>
      <button type="button" onClick={startQuiz} className="btn-primary !px-7 !py-3.5">Take the quiz →</button>
      <p className="text-[11px] text-muted mt-5 max-w-sm">This quiz is for general skincare guidance only and does not diagnose skin conditions.</p>
    </div>
  )

  const question = step >= 0 && step < 5 ? questions[step] : null

  const questionView = question && (
    <div className="flex flex-col h-full">
      <div
        className="text-[11px] uppercase tracking-widest font-extrabold text-gg-700 mb-2"
        aria-live="polite"
      >
        Question {step + 1} of 5
      </div>
      <div
        className="h-2 rounded-full bg-gg-100 overflow-hidden mb-7"
        role="progressbar"
        aria-label={`Quiz progress: question ${step + 1} of 5`}
        aria-valuemin="1"
        aria-valuemax="5"
        aria-valuenow={step + 1}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-gg-400 to-gg-600 transition-all duration-500"
          style={{ width: `${((step + 1) / 5) * 100}%` }}
        />
      </div>
      <h3 className="text-xl font-bold text-ink leading-snug mb-5">{question.text}</h3>
      <div className="flex flex-col gap-2.5">
        {question.options.map((option) => {
          const selected = answers[step] === option
          return (
            <button
              type="button"
              key={option}
              onClick={() => selectAnswer(option)}
              aria-pressed={selected}
              className={`w-full text-left rounded-full px-5 py-3 border-[1.5px] transition-all ${selected
                ? 'border-gg-600 bg-gg-600 text-white font-semibold shadow-[0_6px_16px_rgba(22,163,74,.25)]'
                : 'border-gg-200 bg-white text-ink hover:border-gg-500 hover:bg-gg-50 hover:translate-x-1'
                }`}
            >
              {option}
            </button>
          )
        })}
      </div>
      <div className="mt-auto pt-6 flex justify-between gap-3">
        <button
          type="button"
          aria-label="Go to the previous quiz question"
          onClick={() => {
            if (step > 0) {
              const previous = step - 1
              setStep(previous)
              showVisual(quizImages[previous])
            }
          }}
          className={`btn-outline ${step === 0 ? 'invisible' : ''}`}
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={finishQuiz}
          disabled={!answers[step] || step !== 4}
          className={`btn-primary ${step !== 4 ? 'opacity-0 pointer-events-none' : ''}`}
        >
          See Results ✨
        </button>
      </div>
    </div>
  )

  const resultView = step === 5 && result && (
    <div className="flex flex-col h-full">
      <div className="text-[11px] uppercase tracking-[.14em] font-extrabold text-gg-600">Your Skin Profile</div>
      <h3 className="text-3xl font-bold text-gg-900 mt-1 mb-2">{result.type}</h3>
      <p className="text-muted leading-7">{result.desc}</p>
      <div className="my-5 px-4 py-3 bg-gg-50 border-l-4 border-gg-500 rounded-r-xl text-gg-800 font-semibold text-sm">
        🎯 Routine Goal: {result.goal}
      </div>
      <div className="text-sm font-bold text-muted mb-2">Ingredients you may want to explore</div>
      <div className="flex flex-wrap gap-2 mb-6">
        {result.chips.map((chip) => (
          <span key={chip} className="px-3.5 py-1.5 rounded-full bg-gg-100 border border-gg-200 text-gg-800 text-xs font-semibold">{chip}</span>
        ))}
      </div>
      {user ? (
        <Link to="/account" className="btn-primary w-full">View My Account</Link>
      ) : (
        <Link to="/auth" className="btn-primary w-full">Create My GlowGuard Account</Link>
      )}
      <button type="button" onClick={startQuiz} className="btn-outline w-full mt-3">Retake Quiz</button>
      <p className="text-[11px] text-muted text-center mt-auto pt-5">This result is based on your quiz responses and is not a medical diagnosis.</p>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white border border-gg-100 rounded-[28px] shadow-card overflow-hidden grid lg:grid-cols-[1fr_1.2fr] min-h-[500px]">
      <div className="relative min-h-[260px] lg:min-h-full bg-gg-100 overflow-hidden">
        <img
          src={visual.src}
          alt={visual.alt}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${changing ? 'opacity-30 scale-[1.04]' : 'opacity-100 scale-[1.01]'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gg-900/5 to-gg-900/45" />
        {/* Deliberately no overlay badge on quiz images. */}
      </div>
      <div className="p-7 sm:p-10 min-h-[420px]">
        {step === -1 && intro}
        {questionView}
        {resultView}
      </div>
    </div>
  )
}

export default function Landing() {
  const location = useLocation()
  const { user } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeNav, setActiveNav] = useState('home')
  const [openFeature, setOpenFeature] = useState(null)
  const [faqOpen, setFaqOpen] = useState(null)

  useEffect(() => {
    const sections = ['home', 'features', 'quiz', 'how-it-works', 'about']
    const sectionElements = sections
      .map((id) => document.getElementById(id))
      .filter(Boolean)

    const onScroll = () => {
      const current = sectionElements.reduce((found, el) => {
        return window.scrollY >= el.offsetTop - 140 ? el.id : found
      }, 'home')

      setActiveNav((previous) => (previous === current ? previous : current))
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = menuOpen ? 'hidden' : previousOverflow

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [menuOpen])

  const goTo = (id) => {
    setMenuOpen(false)

    const element = document.getElementById(id)
    if (!element) return

    const navOffset = 100
    const top = element.getBoundingClientRect().top + window.scrollY - navOffset

    window.scrollTo({ top, behavior: 'smooth' })
  }

  // Coming from My Account -> "Retake Skin Profile Quiz": jump straight to the quiz.
  useEffect(() => {
    const target = location.state?.scrollTo
    if (!target) return undefined

    const timer = window.setTimeout(() => goTo(target), 150)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  return (
    <div className="bg-gradient-to-br from-cream to-gg-50 text-ink overflow-x-hidden">
      {/* Landing-only navbar (with Log In / Get Started): only shown to
          logged-out visitors. Logged-in users get the normal app Navbar
          instead — see the showNavbar logic in App.jsx. */}
      {!user && (
        <nav aria-label="Main navigation" className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-[1325px] bg-[#f0fdf4] backdrop-blur-xl border border-white/70 rounded-[22px] shadow-[0_10px_35px_rgba(32,65,43,.14)]">
          <div className="h-[76px] px-4 sm:px-6 lg:px-7 flex items-center justify-between">
            <button type="button" onClick={() => goTo('home')} className="flex items-center gap-2.5 text-ink text-xl sm:text-2xl font-extrabold focus:outline-none focus-visible:ring-2 focus-visible:ring-gg-500 focus-visible:ring-offset-2 rounded-xl">
              <span className="w-10 h-10 grid place-items-center rounded-xl bg-gg-100 text-gg-700">✦</span>
              GlowGuard
            </button>

            <div className={`${menuOpen ? 'flex' : 'hidden'} md:flex absolute md:static top-[76px] left-0 right-0 md:items-center flex-col md:flex-row bg-white md:bg-transparent border-b md:border-0 border-gg-100 rounded-b-[22px] px-4 md:px-0 pb-4 md:pb-0 shadow-xl md:shadow-none`}>
              <div className="flex flex-col md:flex-row md:items-center gap-1 w-full md:w-auto">
                {navigationItems.map(([id, label]) => (
                  <button
                    type="button"
                    key={id}
                    onClick={() => goTo(id)}
                    aria-current={activeNav === id ? 'page' : undefined}
                    className={`px-4 py-3 md:py-3 rounded-xl text-sm font-semibold text-left md:text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-gg-500 focus-visible:ring-offset-2 ${activeNav === id ? 'text-gg-700 bg-gg-50' : 'text-muted hover:text-gg-700 hover:bg-gg-50'
                      }`}
                  >
                    {label}
                  </button>
                ))}
                <div className="flex flex-col sm:flex-row gap-2 md:ml-3 pt-2 md:pt-0 border-t md:border-0 border-gg-100">
                  <Link to="/auth" onClick={() => setMenuOpen(false)} className="px-4 py-2.5 text-sm font-bold text-gg-700 rounded-lg hover:bg-gg-50 text-center">Log In</Link>
                  <Link
                    to="/auth"
                    className="px-5 py-2.5 text-sm font-bold text-white rounded-full bg-gradient-to-br from-gg-600 to-gg-500 shadow-[0_6px_16px_rgba(34,197,94,.25)] hover:-translate-y-0.5 transition text-center"
                  >
                    Get Started
                  </Link>              </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="md:hidden w-10 h-10 grid place-items-center rounded-xl border border-[#cfe5d5] bg-[#dff3e5] text-gg-800 text-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gg-500 focus-visible:ring-offset-2"
            >
              {menuOpen ? '×' : '☰'}
            </button>
          </div>
        </nav>
      )}

      <section
        id="home"
        className={`relative min-h-screen grid place-items-center overflow-hidden px-5 pb-20 bg-center bg-cover bg-fixed max-sm:bg-scroll ${user ? 'pt-14' : 'pt-32'}`}
        style={{
          backgroundImage: `url("${heroBg}")`,
        }}
      >
        <div className="relative z-10 w-full max-w-5xl text-center text-black">

          <h1 className="font-serif italic font-semibold text-[clamp(3rem,7vw,5.4rem)] leading-[0.98] tracking-tight mb-6">
            Protection for your
            <span className="block text-[#060606]">Complexion.</span>
          </h1>

          <p className="max-w-3xl mx-auto text-black/90 text-base sm:text-lg leading-8">
            Organize your products, build personalized AM/PM routines, track your
            progress, and check ingredient conflicts — all in one simple skincare
            companion.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mt-9">
            <Link to="/auth" className="btn-primary !px-9 !py-3.5 shadow-lg">
              Get Started
            </Link>
            <button
              type="button"
              onClick={() => goTo('quiz')}
              className="btn !px-9 !py-3.5 bg-white text-gg-800 hover:bg-gg-50"
            >
              Take the Skin Quiz
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => goTo('features')}
          className="absolute bottom-7 left-1/2 -translate-x-1/2 text-white/75 text-2xl animate-bounce"
          aria-label="Scroll to features"
        >
          ⌄
        </button>
      </section>

      <div className="px-6 py-4 bg-white border-y border-gg-100 text-center text-muted text-sm">
        <strong className="text-gg-800">GlowGuard</strong> · Simple tools for a safer, more consistent skincare routine.
      </div>

      <section id="features" className="max-w-6xl mx-auto px-5 sm:px-6 py-20 sm:py-24">
        <SectionHeading eyebrow="Everything in one place" title="Your skincare, organized." subtitle="Designed to make everyday skincare easier to understand, follow, and track. Click any card to learn more." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              feature={feature}
              index={index}
              openFeature={openFeature}
              onToggle={setOpenFeature}
            />
          ))}
        </div>
      </section>

      <section id="quiz" className="py-20 sm:py-24 px-5 sm:px-6 bg-gradient-to-br from-gg-50 to-gg-100 border-y border-gg-100">
        <SectionHeading eyebrow="Know your skin first" title="Take the 60-second skin quiz." subtitle="Answer 5 quick questions and get an instant skin profile with ingredient suggestions — right here, no sign-up needed." />
        <SkinQuiz />
      </section>

      <section id="how-it-works" className="px-5 sm:px-6 py-20 sm:py-24 bg-white border-b border-gg-100">
        <SectionHeading eyebrow="Simple workflow" title="From shelf to routine in three steps." />
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-5 mt-10">
          {workflowSteps.map(([image, number, title, desc]) => (
            <div key={number} className="bg-cream border border-gg-100 rounded-2xl p-6 text-center hover:-translate-y-1 hover:shadow-card transition">
              <img src={image} alt={title} loading="lazy" className="w-full h-40 object-cover rounded-xl mb-5" />
              <div className="w-9 h-9 rounded-full mx-auto mb-3 grid place-items-center bg-gg-100 text-gg-700 font-extrabold text-sm">{number}</div>
              <h3 className="font-bold text-gg-800 mb-2">{title}</h3>
              <p className="text-muted text-sm leading-6">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="py-20 sm:py-24 px-5 sm:px-6 bg-gg-50 border-t border-gg-100">
        <SectionHeading eyebrow="Questions, answered" title="Frequently asked questions" />
        <div className="max-w-3xl mx-auto mt-9">
          {faqs.map(([question, answer], index) => (
            <FaqItem
              key={question}
              question={question}
              answer={answer}
              index={index}
              openIndex={faqOpen}
              onToggle={setFaqOpen}
            />
          ))}
        </div>
      </section>

      <section id="about" className="px-5 sm:px-6 py-20 sm:py-24 bg-white">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <div className="grid grid-cols-2 gap-4">
            <img
              loading="lazy"
              src={botanicalImage}
              alt="Green botanical texture"
              className="w-full h-56 object-cover rounded-2xl shadow-card translate-y-4"
            />

            <img
              loading="lazy"
              src={skincareImage}
              alt="Natural skincare flat lay"
              className="w-full h-56 object-cover rounded-2xl shadow-card"
            />
          </div>
          <div>
            <p className="uppercase tracking-[.15em] text-gg-600 text-[11px] font-extrabold mb-2">About GlowGuard</p>
            <h2 className="font-serif italic font-semibold text-3xl sm:text-4xl text-gg-900">A calmer way to manage skincare.</h2>
            <p className="text-muted leading-7 mt-4">GlowGuard is a skincare management and chemical-safety application designed to organize products, build routines, and surface ingredient safety rules in one place.</p>
            <p className="text-muted leading-7 mt-3">Your shelf, routines, and progress are saved to your account, so they're there whenever you sign back in.</p>
            <div className="flex flex-wrap gap-2.5 mt-5">
              {aboutHighlights.map((point) => (
                <span key={point} className="px-3.5 py-2 rounded-full border border-gg-200 bg-gg-50 text-gg-800 text-xs font-semibold">{point}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-5 py-20 text-center text-white bg-gradient-to-br from-gg-900 to-gg-700">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[.12]"
          style={{
            backgroundImage: `url("${ctaBg}")`,
          }}
        />

        <div className="relative">
          <h2 className="font-serif italic font-semibold text-3xl sm:text-4xl">
            Ready to build your routine?
          </h2>

          <p className="max-w-xl mx-auto mt-3 mb-7 text-gg-200 leading-7">
            Start organizing your skincare products and create a routine that is easy to follow every day.
          </p>

          <Link
            to="/auth"
            className="btn !px-8 !py-3.5 bg-white text-gg-800 hover:bg-gg-50"
          >
            Create Your GlowGuard
          </Link>
        </div>
      </section>

      <footer className="py-8 px-5 text-center text-muted text-xs border-t border-gg-100 bg-white">
        <p>Made with care · <b>GlowGuard</b> © 2026 · Skincare guidance, not medical advice</p>
      </footer>
    </div>
  )
}