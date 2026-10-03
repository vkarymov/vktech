import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PROJECTS } from './data/projects'

import './styles.css'

gsap.registerPlugin(ScrollTrigger)

function App() {
  const heroRef = useRef(null)
  const manifestoRef = useRef(null)
  const casesRef = useRef(null)

  const heroContentRef = useRef(null)
  const heroTitleRef = useRef(null)
  const manifestoContentRef = useRef(null)
  const manifestoTitleRef = useRef(null)
  const manifestoTextRef = useRef(null)
  const manifestoItemsRef = useRef(null)

  const noiseRef = useRef(null)
  const scrollFillRef = useRef(null)
  const scrollCursorRef = useRef(null)
  const railRef = useRef(null)
  const matrixCanvasRef = useRef(null)

  const [currentSection, setCurrentSection] = useState('01')
  const [activeProjectIdx, setActiveProjectIdx] = useState(0)
  const [activeNodeIdx, setActiveNodeIdx] = useState(0)

  // Состояния для модалки и пасхалки
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formStatus, setFormStatus] = useState('IDLE') // 'IDLE' | 'SENDING' | 'SUCCESS'
  const [formData, setFormData] = useState({ name: '', contact: '', message: '' })
  
  const [isMatrixActive, setIsMatrixActive] = useState(false)
  const logoClicksRef = useRef(0)

  // Пасхалка: клик по логотипу 3 раза запускает матрицу
  const handleLogoClick = (e) => {
    e.preventDefault()
    logoClicksRef.current += 1
    if (logoClicksRef.current >= 3) {
      logoClicksRef.current = 0
      setIsMatrixActive(true)
      setTimeout(() => {
        setIsMatrixActive(false)
      }, 6000)
    }
  }

  // Эффект падающего кода Матрицы для пасхалки
  useEffect(() => {
    if (!isMatrixActive || !matrixCanvasRef.current) return
    const canvas = matrixCanvasRef.current
    const ctx = canvas.getContext('2d')

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const letters = 'VKTECH010101SYSTEMSBYTECONFIG_ROOT_ACCESS'
    const fontSize = 14
    const columns = canvas.width / fontSize
    const drops = Array.from({ length: Math.floor(columns) }).fill(1)

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#7cff72'
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const text = letters.charAt(Math.floor(Math.random() * letters.length))
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }

    const interval = setInterval(draw, 33)
    return () => clearInterval(interval)
  }, [isMatrixActive])

  // Жесткий сброс шага схемы при смене активного кейса
  useEffect(() => {
    setActiveNodeIdx(0)
  }, [activeProjectIdx])

  const handleRailClick = (e) => {
    if (!railRef.current) return
    const rect = railRef.current.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    const percentage = Math.max(0, Math.min(1, clickY / rect.height))
    const totalScroll = document.documentElement.scrollHeight - window.innerHeight

    window.scrollTo({
      top: totalScroll * percentage,
      behavior: 'smooth',
    })
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const scrollToBottom = () =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    })

  // Отслеживание скролла для рельсы HUD
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isDesktop = window.matchMedia('(min-width: 901px)').matches

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight
      if (totalScroll <= 0) return
      const progress = Math.max(0, Math.min(1, window.scrollY / totalScroll))

      if (scrollFillRef.current) {
        gsap.set(scrollFillRef.current, { scaleY: progress })
      }

      if (scrollCursorRef.current) {
        gsap.set(scrollCursorRef.current, { top: `${progress * 100}%` })
      }

      const sectionNum = Math.min(Math.floor(progress * 7) + 1, 7)
      setCurrentSection(`0${sectionNum}`)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    if (prefersReducedMotion || !isDesktop) {
      return () => window.removeEventListener('scroll', handleScroll)
    }

    const ctx = gsap.context(() => {
      const heroLines = heroTitleRef.current?.querySelectorAll('.hero__title-line')
      if (heroLines?.length) {
        gsap.fromTo(
          heroLines,
          { opacity: 0, yPercent: 110, rotateX: -18 },
          {
            opacity: 1,
            yPercent: 0,
            rotateX: 0,
            duration: 1.15,
            stagger: 0.12,
            ease: 'power4.out',
            delay: 0.15,
          }
        )
      }

      gsap.to(heroContentRef.current, {
        scale: 0.75,
        rotateX: 25,
        y: -100,
        opacity: 0,
        filter: 'blur(20px)',
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
          pin: true,
          pinSpacing: false,
        },
      })

      gsap.to(manifestoContentRef.current, {
        scale: 0.75,
        rotateX: 25,
        y: -100,
        opacity: 0,
        filter: 'blur(20px)',
        ease: 'none',
        scrollTrigger: {
          trigger: manifestoRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
          pin: true,
          pinSpacing: false,
        },
      })

      if (manifestoTitleRef.current) {
        gsap.fromTo(
          manifestoTitleRef.current.children,
          { opacity: 0, y: 55 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.1,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: manifestoRef.current,
              start: 'top 60%',
              once: true,
            },
          }
        )
      }

      gsap.fromTo(
        manifestoTextRef.current,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: manifestoTextRef.current,
            start: 'top 75%',
            once: true,
          },
        }
      )

      if (manifestoItemsRef.current) {
        gsap.fromTo(
          manifestoItemsRef.current.children,
          { opacity: 0, y: 25, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: manifestoItemsRef.current,
              start: 'top 85%',
              once: true,
            },
          }
        )
      }

      ScrollTrigger.create({
        trigger: casesRef.current,
        start: 'top top',
        end: '+=350%',
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress
          const idx = Math.min(Math.floor(p * PROJECTS.length), PROJECTS.length - 1)
          setActiveProjectIdx(idx)
        },
      })
    }, document)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      ctx.revert()
    }
  }, [])

  const currentProject = PROJECTS[activeProjectIdx]
  const currentNode = currentProject.schema[activeNodeIdx] || currentProject.schema[0]

  // Обработка отправки формы в модалке (в будущем здесь будет fetch к твоему Node.js бэкенду)
  const handleFormSubmit = (e) => {
    e.preventDefault()
    setFormStatus('SENDING')

    // Имитируем отправку на бэкенд и в телеграм-бот
    setTimeout(() => {
      setFormStatus('SUCCESS')
      setTimeout(() => {
        setIsModalOpen(false)
        setFormStatus('IDLE')
        setFormData({ name: '', contact: '', message: '' })
      }, 2500)
    }, 1200)
  }

  return (
    <>
      {/* МАТРИЦА ПАСХАЛКА */}
      {isMatrixActive && <canvas ref={matrixCanvasRef} className="matrix-canvas" />}

      {/* МОДАЛКА ЗАЯВОК */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" role="dialog" aria-modal="true" aria-labelledby="contact-dialog-title" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span>// ИНИЦИАЛИЗАЦИЯ ЗАЯВКИ</span>
              <button type="button" className="modal-close" aria-label="Закрыть форму" onClick={() => setIsModalOpen(false)}>[X]</button>
            </div>
            <div className="modal-body">
              {formStatus === 'SUCCESS' ? (
                <div className="modal-success">
                  <span>✓ ДАННЫЕ УСПЕШНО ПЕРЕДАНЫ В СИСТЕМУ.</span>
                  <span>МЫ СВЯЖЕМСЯ С ВАМИ В БЛИЖАЙШЕЕ ВРЕМЯ.</span>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <h3 id="contact-dialog-title" className="modal-title">Оставить задачу</h3>
                    <p style={{ color: '#888', fontSize: '11px', margin: 0 }}>Заполните поля, и пакет данных уйдет в разработку.</p>
                  </div>

                  <div className="modal-field">
                    <label className="modal-label" htmlFor="contact-name">ВАШЕ ИМЯ</label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      className="modal-input"
                      placeholder="Александр"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="modal-field">
                    <label className="modal-label" htmlFor="contact-details">ТЕЛЕГРАМ / ТЕЛЕФОН</label>
                    <input
                      id="contact-details"
                      type="text"
                      required
                      className="modal-input"
                      placeholder="@username или номер"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    />
                  </div>

                  <div className="modal-field">
                    <label className="modal-label" htmlFor="contact-message">ОПИСАНИЕ ЗАДАЧИ</label>
                    <textarea
                      id="contact-message"
                      required
                      className="modal-textarea"
                      placeholder="Нужна система автоматизации или сайт..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="modal-submit" disabled={formStatus === 'SENDING'}>
                    {formStatus === 'SENDING' ? 'ПЕРЕДАЧА ПАКЕТА...' : '[ ОТПРАВИТЬ ЗАЯВКУ → ]'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <header className="navigation">
        <a href="/" className="navigation__logo" onClick={handleLogoClick} title="Кликните 3 раза...">
          <span className="navigation__logo-main">VKTECH</span>
          <span className="navigation__logo-sub">ЦИФРОВЫЕ СИСТЕМЫ</span>
        </a>

        <div className="navigation__status">
          <span className="navigation__dot" />
          <span>В СЕТИ</span>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}
          className="navigation__contact"
        >
          НА СВЯЗЬ →
        </button>
      </header>

      <div className="scroll-interface">
        <button type="button" className="scroll-interface__top" onClick={scrollToTop} aria-label="Прокрутить в начало страницы">
          <span>ПРОКРУТКА</span>
          <span className="scroll-interface__num">{currentSection}</span>
        </button>

        <button
          type="button"
          ref={railRef}
          className="scroll-interface__rail"
          onClick={handleRailClick}
          aria-label="Перейти к выбранной позиции на странице"
        >
          <div ref={scrollFillRef} className="scroll-interface__fill" />
          <div ref={scrollCursorRef} className="scroll-interface__cursor">
            <span />
          </div>
        </button>

        <button type="button" className="scroll-interface__bottom" onClick={scrollToBottom} aria-label="Прокрутить в конец страницы">
          <span>↓</span>
          <span>07</span>
        </button>
      </div>

      <main>
        {/* 01. HERO */}
        <section ref={heroRef} className="hero">
          <div className="hero__grid" />
          <div className="hero__top">
            <span>VKTECH / ЦИФРОВЫЕ СИСТЕМЫ</span>
            <span>{currentSection} / 07</span>
          </div>

          <div ref={heroContentRef} className="hero__content">
            <div className="hero__eyebrow">
              <span>САЙТЫ</span>
              <span>/</span>
              <span>АВТОМАТИЗАЦИЯ</span>
              <span>/</span>
              <span>ПРОГРАММЫ</span>
            </div>

            <h1 ref={heroTitleRef} className="hero__title">
              <span className="hero__title-line">ЦИФРОВЫЕ</span>
              <span className="hero__title-line">СИСТЕМЫ</span>
              <span className="hero__title-line">КОТОРЫЕ</span>
              <span className="hero__title-line hero__title-line--status">
                РАБОТАЮТ.
              </span>
            </h1>
          </div>

          <div className="hero__bottom">
            <span>
              ЦИФРОВЫЕ СИСТЕМЫ,
              <br />
              КОТОРЫЕ РЕШАЮТ ЗАДАЧИ.
            </span>
            <span className="hero__scroll">
              ПРОКРУТКА
              <span className="hero__arrow">↓</span>
            </span>
          </div>
        </section>

        {/* 02. MANIFESTO */}
        <section ref={manifestoRef} className="manifesto" style={{ perspective: '1200px' }}>
          <div ref={manifestoContentRef} style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', willChange: 'transform, opacity, filter' }}>
            <div className="manifesto__laser-line">
              <div className="laser__hud">
                <span>[ СБРОС СИСТЕМЫ ]</span>
                <span>РАЗДЕЛ_02 :: АКТИВИРОВАН</span>
              </div>
            </div>

            <div className="manifesto__top">
              <span>VKTECH</span>
              <span>02 / 07</span>
            </div>

            <div className="manifesto__main">
              <div ref={manifestoTitleRef} className="manifesto__title">
                <span className="manifesto__title-line">НЕ ДЕЛАЕМ</span>
                <span className="manifesto__title-line">ЦИФРОВОЙ</span>
                <span
                  ref={noiseRef}
                  className="manifesto__noise-word manifesto__title-line"
                  data-text="ШУМ."
                >
                  ШУМ.
                </span>
              </div>

              <div ref={manifestoTextRef} className="manifesto__terminal">
                <div className="terminal__header">
                  <div className="terminal__dots">
                    <span className="terminal__dot terminal__dot--red" />
                    <span className="terminal__dot terminal__dot--yellow" />
                    <span className="terminal__dot terminal__dot--green" />
                  </div>
                  <span className="terminal__title">manifesto_v2.0.log</span>
                </div>

                <div className="terminal__body">
                  <div className="terminal__line">
                    <span className="terminal__prompt">&gt;</span>
                    <span className="terminal__cmd">
                      Мы создаём цифровые системы, которые решают реальные задачи.
                    </span>
                  </div>
                  <div className="terminal__line">
                    <span className="terminal__prompt">&gt;</span>
                    <span>Сайты. Автоматизация. Программное обеспечение.</span>
                    <span className="terminal__sub">
                      // Без лишней сложности и ручной работы.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div ref={manifestoItemsRef} className="manifesto__items">
              <div className="manifesto__card">
                <div className="manifesto__card-header">
                  <span className="manifesto__card-addr">0x01</span>
                  <span className="manifesto__card-badge">АКТИВНО</span>
                </div>
                <span className="manifesto__card-title">СПРОЕКТИРОВАНО</span>
                <span className="manifesto__card-sub">// АРХИТЕКТУРА И ЛОГИКА</span>
              </div>

              <div className="manifesto__card">
                <div className="manifesto__card-header">
                  <span className="manifesto__card-addr">0x02</span>
                  <span className="manifesto__card-badge">СБОРКА</span>
                </div>
                <span className="manifesto__card-title">РАЗРАБОТАНО</span>
                <span className="manifesto__card-sub">// КОД И АВТОМАТИЗАЦИЯ</span>
              </div>

              <div className="manifesto__card">
                <div className="manifesto__card-header">
                  <span className="manifesto__card-addr">0x03</span>
                  <span className="manifesto__card-badge">РАЗВЕРНУТО</span>
                </div>
                <span className="manifesto__card-title">ЗАПУЩЕНО</span>
                <span className="manifesto__card-sub">// СТАБИЛЬНЫЙ ПРОДАКШН</span>
              </div>
            </div>
          </div>
        </section>

        {/* 03. SELECTED SYSTEMS */}
        <section ref={casesRef} className="cases">
          <div className="cases__top">
            <span>VKTECH / ИЗБРАННЫЕ СИСТЕМЫ</span>
            <span>03 / 07</span>
          </div>

          <div className="cases__container">
            <div className="cases__info">
              <div className="cases__meta-top">
                <span className="cases__index">СИСТЕМА_{currentProject.id}</span>
                <span className="cases__badge">{currentProject.status === 'DEPLOYED' ? 'РАЗВЕРНУТО' : 'АКТИВНО'}</span>
              </div>

              <h2 className="cases__title">{currentProject.title}</h2>
              <p className="cases__description">{currentProject.desc}</p>

              <div className="cases__details">
                <div>
                  <span>СТЕК: </span>
                  <span className="cases__details-val">{currentProject.category}</span>
                </div>
                <div>
                  <span>ГОД: </span>
                  <span className="cases__details-val">{currentProject.year}</span>
                </div>
              </div>

              {currentProject.url && (
                <div style={{ marginTop: '4px' }}>
                  <a
                    href={currentProject.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.1em', textDecoration: 'underline' }}
                  >
                    ПЕРЕЙТИ НА САЙТ ПРОЕКТА →
                  </a>
                </div>
              )}

              <div className="cases__progress-bar">
                {PROJECTS.map((proj, idx) => (
                  <div key={proj.id} className={`cases__progress-seg ${idx === activeProjectIdx ? 'is-active' : ''}`} />
                ))}
              </div>
            </div>

            <div className="cases__visual">
              <div className="cases__visual-header">
                <div className="cases__browser-dots">
                  <span className="cases__browser-dot cases__browser-dot--red" />
                  <span className="cases__browser-dot cases__browser-dot--yellow" />
                  <span className="cases__browser-dot cases__browser-dot--green" />
                </div>
                <span>ВИЗУАЛЬНЫЙ_ПОТОК // ИНТЕРАКТИВНО</span>
                <div className="cases__status-online">
                  <span className="cases__online-dot" />
                  <span>В СЕТИ</span>
                </div>
              </div>

              <div className="cases__artwork-screen">
                <svg className="cases__artwork-svg" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="20" y1="50" x2="180" y2="50" stroke="rgba(214,168,79,0.2)" strokeWidth="2" strokeDasharray="4 4" />
                  {currentNode.illustrationType.includes('client') || currentNode.illustrationType.includes('pos') || currentNode.illustrationType.includes('vps') ? (
                    <g>
                      <rect x="25" y="25" width="40" height="50" rx="4" fill="#151515" stroke="#d6a84f" strokeWidth="2" />
                      <circle cx="45" cy="45" r="12" fill="#d6a84f" fillOpacity="0.2" />
                      <path d="M35 60 C35 55 55 55 55 60" stroke="#d6a84f" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="85" cy="50" r="6" fill="#7cff72" className="cases__sim-pulse" />
                      <path d="M70 50 L110 50" stroke="#7cff72" strokeWidth="2" strokeDasharray="3 3" />
                      <rect x="120" y="30" width="55" height="40" rx="4" fill="#151515" stroke="#7cff72" strokeWidth="2" />
                      <circle cx="135" cy="45" r="4" fill="#7cff72" />
                      <circle cx="135" cy="58" r="4" fill="#d6a84f" />
                    </g>
                  ) : currentNode.illustrationType.includes('webhook') || currentNode.illustrationType.includes('daemon') || currentNode.illustrationType.includes('watchdog') ? (
                    <g>
                      <rect x="30" y="35" width="40" height="30" rx="4" fill="#151515" stroke="#d6a84f" strokeWidth="2" />
                      <path d="M45 45 L55 50 L45 55" stroke="#d6a84f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M75 50 L125 50" stroke="#d6a84f" strokeWidth="3" strokeDasharray="6 4" />
                      <polygon points="125,46 135,50 125,54" fill="#d6a84f" />
                      <rect x="135" y="30" width="35" height="40" rx="4" fill="#151515" stroke="#7cff72" strokeWidth="2" />
                      <line x1="143" y1="45" x2="162" y2="45" stroke="#7cff72" strokeWidth="2" />
                      <line x1="143" y1="55" x2="155" y2="55" stroke="#7cff72" strokeWidth="2" />
                    </g>
                  ) : currentNode.illustrationType.includes('telegram') || currentNode.illustrationType.includes('cloud') || currentNode.illustrationType.includes('sqlite') ? (
                    <g>
                      <circle cx="60" cy="50" r="20" fill="#151515" stroke="#d6a84f" strokeWidth="2" />
                      <circle cx="53" cy="45" r="3" fill="#d6a84f" />
                      <circle cx="67" cy="45" r="3" fill="#d6a84f" />
                      <path d="M53 58 Q60 63 67 58" stroke="#d6a84f" strokeWidth="2" strokeLinecap="round" />
                      <rect x="95" y="30" width="75" height="40" rx="6" fill="#151515" stroke="#7cff72" strokeWidth="2" />
                      <circle cx="110" cy="50" r="6" fill="#7cff72" />
                      <line x1="122" y1="43" x2="155" y2="43" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                      <line x1="122" y1="55" x2="145" y2="55" stroke="#888" strokeWidth="2" strokeLinecap="round" />
                    </g>
                  ) : (
                    <g>
                      <rect x="35" y="25" width="130" height="50" rx="4" fill="#151515" stroke="#7cff72" strokeWidth="2" />
                      <rect x="50" y="50" width="12" height="15" rx="2" fill="#d6a84f" />
                      <rect x="70" y="40" width="12" height="25" rx="2" fill="#7cff72" />
                      <rect x="90" y="32" width="12" height="33" rx="2" fill="#d6a84f" />
                      <path d="M56 45 L76 35 L96 28 L120 40" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                      <circle cx="145" cy="40" r="5" fill="#7cff72" />
                    </g>
                  )}
                </svg>

                <div className="cases__artwork-caption">
                  <div className="cases__artwork-title">{currentNode.label}</div>
                  <div className="cases__artwork-desc">{currentNode.desc}</div>
                </div>
              </div>

              <div className="cases__steps-grid">
                {currentProject.schema.map((node, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className={`cases__step-btn ${activeNodeIdx === idx ? 'is-active' : ''}`}
                    onClick={() => setActiveNodeIdx(idx)}
                    aria-pressed={activeNodeIdx === idx}
                  >
                    <span className="cases__step-num">{node.step}</span>
                    <span className="cases__step-name">{node.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="cases__top" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
            <span>ПРОКРУТИТЕ К ВОЗМОЖНОСТЯМ</span>
            <span>03 / 07</span>
          </div>
        </section>

        {/* 04. CAPABILITIES */}
        <section className="capabilities">
          <div className="cases__top">
            <span>VKTECH / ВОЗМОЖНОСТИ</span>
            <span>04 / 07</span>
          </div>

          <div className="capabilities__container">
            <div className="capabilities__left">
              <div className="cases__meta-top">
                <span className="cases__index">РАЗДЕЛ_04</span>
                <span className="cases__badge">УСЛУГИ</span>
              </div>
              <h2 className="capabilities__title">ЧТО<br />МЫ<br />СОЗДАЁМ</h2>
              <p className="cases__description">
                Проектируем и разворачиваем цифровые решения под ключ. Никаких шаблонных сайтов — только кастомная архитектура, интеграции и стабильная инфраструктура.
              </p>
            </div>

            <div className="capabilities__list">
              <div className="capabilities__item">
                <div className="capabilities__item-header">
                  <span className="capabilities__item-num">01</span>
                  <span className="capabilities__item-name">ЦИФРОВЫЕ ПРОДУКТЫ</span>
                </div>
                <div className="capabilities__item-details">// Сайты / Интернет-магазины / Высоконагруженные платформы</div>
              </div>

              <div className="capabilities__item">
                <div className="capabilities__item-header">
                  <span className="capabilities__item-num">02</span>
                  <span className="capabilities__item-name">АВТОМАТИЗАЦИЯ</span>
                </div>
                <div className="capabilities__item-details">// API / Вебхуки / Кастомные Telegram-боты / Синхронизация iiko</div>
              </div>

              <div className="capabilities__item">
                <div className="capabilities__item-header">
                  <span className="capabilities__item-num">03</span>
                  <span className="capabilities__item-name">ВНУТРЕННИЕ СИСТЕМЫ</span>
                </div>
                <div className="capabilities__item-details">// CRM-панели / Дашборды / Бизнес-инструменты управления</div>
              </div>

              <div className="capabilities__item">
                <div className="capabilities__item-header">
                  <span className="capabilities__item-num">04</span>
                  <span className="capabilities__item-name">ИНФРАСТРУКТУРА</span>
                </div>
                <div className="capabilities__item-details">// VPS / Docker-контейнеры / Мониторинг / Автоматические бэкапы</div>
              </div>
            </div>
          </div>

          <div className="cases__top" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
            <span>ПРОКРУТИТЕ К КОНВЕЙЕРУ СИСТЕМЫ</span>
            <span>04 / 07</span>
          </div>
        </section>

        {/* 05. SYSTEM PIPELINE */}
        <section className="pipeline">
          <div className="cases__top">
            <span>VKTECH / КОНВЕЙЕР СИСТЕМЫ</span>
            <span>05 / 07</span>
          </div>

          <div className="pipeline__container">
            <div className="capabilities__left">
              <div className="cases__meta-top">
                <span className="cases__index">РАЗДЕЛ_05</span>
                <span className="cases__badge">ПРОЦЕСС</span>
              </div>
              <h2 className="capabilities__title">КОНВЕЙЕР<br />РАЗРАБОТКИ</h2>
              <p className="cases__description">
                Каждый проект проходит строгие инженерные фазы. Никакой хаотичной разработки — только последовательный конвейер от логики до стабильного продакшна.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '4vw', alignItems: 'center' }}>
              <div className="pipeline__steps">
                <span>ВХОДНЫЕ ДАННЫЕ</span><span className="pipeline__arrow">↓</span>
                <span>АНАЛИЗ</span><span className="pipeline__arrow">↓</span>
                <span>АРХИТЕКТУРА</span><span className="pipeline__arrow">↓</span>
                <span>СБОРКА</span><span className="pipeline__arrow">↓</span>
                <span>ИНТЕГРАЦИЯ</span><span className="pipeline__arrow">↓</span>
                <span>ЗАПУСК</span><span className="pipeline__arrow">↓</span>
                <span>МОНИТОРИНГ</span>
              </div>

              <div className="pipeline__status-box">
                <div className="pipeline__status-header">
                  <span>REALTIME_PIPELINE_STATUS.log</span>
                </div>
                <div className="pipeline__status-list">
                  <div className="pipeline__status-row"><span>АРХИТЕКТУРА</span><span className="pipeline__status-check">✓</span></div>
                  <div className="pipeline__status-row"><span>РАЗРАБОТКА</span><span className="pipeline__status-check">✓</span></div>
                  <div className="pipeline__status-row"><span>ИНТЕГРАЦИЯ</span><span className="pipeline__status-check">✓</span></div>
                  <div className="pipeline__status-row"><span>РАЗВЕРТЫВАНИЕ</span><span className="pipeline__status-check">✓</span></div>
                  <div className="pipeline__status-row pipeline__status-row--active"><span>МОНИТОРИНГ</span><span className="pipeline__status-dot" /></div>
                </div>
              </div>
            </div>
          </div>

          <div className="cases__top" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
            <span>ПРОКРУТИТЕ К КОМАНДЕ И СТЕКУ</span>
            <span>05 / 07</span>
          </div>
        </section>

        {/* 06. ABOUT / STACK */}
        <section className="stack">
          <div className="cases__top">
            <span>VKTECH / КОМАНДА И СТЕК</span>
            <span>06 / 07</span>
          </div>

          <div className="stack__container">
            <div className="capabilities__left">
              <div className="cases__meta-top">
                <span className="cases__index">РАЗДЕЛ_06</span>
                <span className="cases__badge">VKTECH</span>
              </div>
              <h2 className="stack__tagline">МАЛАЯ КОМАНДА.<br />СЕРЬЕЗНЫЕ СИСТЕМЫ.</h2>
              <p className="cases__description">
                Без раздутых штатов, маркетологов и бюрократии. Прямая разработка архитектуры, кода и инфраструктуры с упором на стабильность и производительность.
              </p>
              <div className="stack__location">
                <span>БАЗИРУЕМСЯ В УЗБЕКИСТАНЕ</span>
                <span>СОЗДАЕМ ЦИФРОВЫЕ СИСТЕМЫ</span>
              </div>
            </div>

            <div className="stack__grid">
              <div className="stack__category">
                <span className="stack__cat-title">// ФРОНТЕНД</span>
                <span className="stack__cat-items">REACT / VITE / GSAP</span>
              </div>
              <div className="stack__category">
                <span className="stack__cat-title">// БЭКЕНД</span>
                <span className="stack__cat-items">NODE / API / WEBHOOKS</span>
              </div>
              <div className="stack__category">
                <span className="stack__cat-title">// БАЗЫ ДАННЫХ</span>
                <span className="stack__cat-items">SQLITE / POSTGRESQL</span>
              </div>
              <div className="stack__category">
                <span className="stack__cat-title">// ИНФРАСТРУКТУРА</span>
                <span className="stack__cat-items">LINUX / DOCKER / NGINX</span>
              </div>
              <div className="stack__category" style={{ gridColumn: 'span 2' }}>
                <span className="stack__cat-title">// АВТОМАТИЗАЦИЯ</span>
                <span className="stack__cat-items">TELEGRAM / iiko / CUSTOM APIs</span>
              </div>
            </div>
          </div>

          <div className="cases__top" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
            <span>ПРОКРУТИТЕ К СЕКЦИИ СВЯЗИ</span>
            <span>06 / 07</span>
          </div>
        </section>

        {/* 07. CONTACT */}
        <section id="contact" className="contact-section">
          <div className="cases__top">
            <span>VKTECH / ИНИЦИАЛИЗАЦИЯ ПРОЕКТА</span>
            <span>07 / 07</span>
          </div>

          <div className="contact__container">
            <div>
              <div className="cases__meta-top" style={{ marginBottom: '16px' }}>
                <span className="cases__index">РАЗДЕЛ_07</span>
                <span className="cases__badge">КОНТАКТЫ</span>
              </div>
              <h2 className="contact__heading">
                ЕСТЬ ЗАДАЧА,
                <br />
                КОТОРОЙ НУЖНА
                <br />
                СИСТЕМА?
              </h2>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="contact__cta-btn"
              style={{ cursor: 'pointer' }}
            >
              [ НАЧАТЬ ДИАЛОГ → ]
            </button>
          </div>

          <div className="contact__footer-info">
            <span>VKTECH / ЦИФРОВЫЕ СИСТЕМЫ</span>
            <div className="contact__online-status">
              <span className="navigation__dot" />
              <span>В СЕТИ</span>
            </div>
            <span>2026</span>
          </div>
        </section>
      </main>

      <footer className="site-end">
        <div>© 2026 Алёна Дэрр. Все права защищены.</div>
        <div>VKTECH · Разработка и инфраструктура: <a href="https://t.me/karimov_vadim" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>vktech.uz</a></div>
      </footer>
    </>
  )
}

export default App
