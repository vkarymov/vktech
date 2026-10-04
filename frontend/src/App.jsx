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
  const [secrets, setSecrets] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vktech-secrets') || '[]') } catch { return [] }
  })
  const [matrixMessages, setMatrixMessages] = useState([])
  const [isRebootOpen, setIsRebootOpen] = useState(false)
  const [chatState, setChatState] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('vktech-chat') || '{"open":false,"messages":[],"draft":"","source":""}') } catch { return { open: false, messages: [], draft: '', source: '' } }
  })
  const statusClicksRef = useRef(0)
  const touchSecretTimerRef = useRef(null)
  const caseSwipeStartRef = useRef(null)
  const railFrameRef = useRef(null)
  const [isRailDragging, setIsRailDragging] = useState(false)
  const [isRewardOpen, setIsRewardOpen] = useState(false)
  const [rewardShown, setRewardShown] = useState(() => localStorage.getItem('vktech-reward-shown') === 'true')

  const unlockSecret = (id, message) => {
    setSecrets((previous) => {
      if (previous.includes(id)) return previous
      const next = [...previous, id]
      localStorage.setItem('vktech-secrets', JSON.stringify(next))
      if (message) setMatrixMessages((items) => [...items, message])
      return next
    })
  }

  const openChat = (source) => {
    setChatState((previous) => ({ ...previous, open: true, source: previous.source || source || `/#section-${currentSection}` }))
  }

  useEffect(() => {
    sessionStorage.setItem('vktech-chat', JSON.stringify(chatState))
  }, [chatState])

  useEffect(() => {
    if (secrets.length === 5 && !rewardShown) {
      setIsRewardOpen(true)
      setRewardShown(true)
      localStorage.setItem('vktech-reward-shown', 'true')
    }
  }, [secrets, rewardShown])

  useEffect(() => {
    const onKeyDown = (event) => {
      const tag = event.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target.isContentEditable) return
      if (event.key === 'ArrowLeft') { setActiveProjectIdx((index) => Math.max(0, index - 1)); return }
      if (event.key === 'ArrowRight') { setActiveProjectIdx((index) => Math.min(PROJECTS.length - 1, index + 1)); return }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const media = gsap.matchMedia()

    media.add('(max-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const panels = [manifestoRef.current, casesRef.current].filter(Boolean)
      const context = gsap.context(() => {
        panels.forEach((panel) => {
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: panel,
              start: 'top 92%',
              end: 'top 38%',
              scrub: true,
              invalidateOnRefresh: true,
            },
          })

          timeline
            .to(panel, { y: -18, scale: 0.992, duration: 0.45, ease: 'none' })
            .to(panel, { y: 0, scale: 1, duration: 0.55, ease: 'none' })
        })
      })

      return () => context.revert()
    })

    return () => media.revert()
  }, [])

  // Пасхалка: клик по логотипу 3 раза запускает матрицу
  const handleLogoClick = (e) => {
    e.preventDefault()
    logoClicksRef.current += 1
    if (logoClicksRef.current >= 3) {
      logoClicksRef.current = 0
      setIsMatrixActive(true)
      unlockSecret('01')
      setMatrixMessages([])
      const messages = ['DEBUG LAYER // UNLOCKED', 'SECRET_01 FOUND', 'WAIT...', "THAT WASN'T THE ONLY ONE.", 'FIND ALL FIVE. THERE MAY BE A REWARD.']
      messages.forEach((message, index) => setTimeout(() => setMatrixMessages((items) => [...items, message]), 700 + index * 850))
      setTimeout(() => setIsMatrixActive(false), 6200)
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

  const setScrollFromRailPointer = (clientY) => {
    if (!railRef.current) return
    const rect = railRef.current.getBoundingClientRect()
    const progress = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
    const total = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: total * progress, behavior: 'auto' })
  }

  const handleRailPointerDown = (event) => {
    if (event.pointerType === 'touch') return
    event.preventDefault()
    railRef.current?.setPointerCapture(event.pointerId)
    setIsRailDragging(true)
    setScrollFromRailPointer(event.clientY)
  }

  const handleRailPointerMove = (event) => {
    if (!isRailDragging) return
    event.preventDefault()
    if (railFrameRef.current) cancelAnimationFrame(railFrameRef.current)
    railFrameRef.current = requestAnimationFrame(() => setScrollFromRailPointer(event.clientY))
  }

  const handleRailPointerUp = (event) => {
    if (!isRailDragging) return
    railRef.current?.releasePointerCapture?.(event.pointerId)
    setIsRailDragging(false)
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const scrollToBottom = () =>
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    })

  const handleReboot = () => {
    if (chatState.draft) {
      setIsRebootOpen(true)
      return
    }
    unlockSecret('02')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const confirmReboot = () => {
    setChatState((previous) => ({ ...previous, draft: '' }))
    setIsRebootOpen(false)
    unlockSecret('02')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
      {isMatrixActive && <><canvas ref={matrixCanvasRef} className="matrix-canvas" /><div className="matrix-debug" role="status">{matrixMessages.map((message) => <span key={message}>{message}</span>)}</div></>}

      {secrets.length > 0 && <button type="button" className={`secret-progress ${secrets.length === 5 ? 'is-complete' : ''}`} onClick={() => secrets.length === 5 && setIsRewardOpen(true)} aria-live="polite">SECRETS // {String(secrets.length).padStart(2, '0')}:05{secrets.length === 5 && <strong> · REWARD UNLOCKED</strong>}</button>}

      {isRewardOpen && <aside className="reward-window" role="dialog" aria-modal="false" aria-labelledby="reward-title"><header><span>CHALLENGE COMPLETE</span><button type="button" aria-label="Закрыть награду" onClick={() => setIsRewardOpen(false)}>×</button></header><div className="reward-window__body"><h2 id="reward-title">5 / 5 ПАСХАЛОК НАЙДЕНО</h2><p>Поздравляю.<br />Вы нашли все мои пасхалки.</p><p>При обновлении сайта они появятся снова, а пока держите право на скидку 10% на первый заказ.</p><div className="reward-window__status">REWARD: 10% DISCOUNT<br />REWARD STATUS: UNLOCKED</div><div className="reward-window__actions"><button type="button" onClick={() => setIsRewardOpen(false)}>[ ОСТАТЬСЯ НА САЙТЕ ]</button><button type="button" disabled title="Ожидает интеграции Telegram Bot">[ ПЕРЕЙТИ В TELEGRAM → ]</button></div><small>VERIFICATION: PENDING // backend integration required</small></div></aside>}

      {isRebootOpen && <div className="modal-overlay" onClick={() => setIsRebootOpen(false)}><div className="modal-container reboot-dialog" role="dialog" aria-modal="true" aria-labelledby="reboot-title" onClick={(event) => event.stopPropagation()}><div className="modal-header"><span>// SYSTEM REBOOT</span><button type="button" className="modal-close" onClick={() => setIsRebootOpen(false)}>[X]</button></div><div className="modal-body"><h3 id="reboot-title" className="modal-title">Сбросить черновик?</h3><p className="modal-note">Несохранённый текст чата будет очищен. Переписка и найденные секреты останутся.</p><div className="dialog-actions"><button type="button" className="modal-close dialog-button" onClick={() => setIsRebootOpen(false)}>ОТМЕНА</button><button type="button" className="modal-submit" onClick={confirmReboot}>ПОДТВЕРДИТЬ REBOOT</button></div></div></div></div>}

      <aside className={`vk-chat ${chatState.open ? 'is-open' : 'is-minimized'}`} aria-label="VKTech связь">
        {!chatState.open ? <button type="button" className="vk-chat__launcher" onClick={() => openChat()}><span>●</span> VKTECH // СВЯЗЬ</button> : <div className="vk-chat__window"><div className="vk-chat__header"><span>VKTECH // СВЯЗЬ</span><div><button type="button" onClick={() => setChatState((previous) => ({ ...previous, open: false }))}>_</button><button type="button" onClick={() => setChatState((previous) => ({ ...previous, open: false }))}>×</button></div></div><div className="vk-chat__body"><p>Канал подготовлен. Доставка сообщений пока не подключена.</p>{secrets.length === 5 && <small>REWARD ELIGIBILITY: UNLOCKED<br />VERIFICATION: PENDING</small>}{chatState.messages.map((message, index) => <p key={`${message}-${index}`} className="vk-chat__message">&gt; {message}</p>)}<small>SOURCE: {chatState.source || `/#section-${currentSection}`}</small></div><form onSubmit={(event) => { event.preventDefault(); if (!chatState.draft.trim()) return; setChatState((previous) => ({ ...previous, messages: [...previous.messages, previous.draft.trim()], draft: '' })) }}><label className="sr-only" htmlFor="vk-chat-draft">Сообщение</label><textarea id="vk-chat-draft" value={chatState.draft} onChange={(event) => setChatState((previous) => ({ ...previous, draft: event.target.value }))} placeholder="Опишите задачу — черновик сохранится в этой сессии." /><button type="submit">СОХРАНИТЬ В ЧАТЕ</button></form></div>}
      </aside>

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
                    <p style={{ color: '#888', fontSize: '11px', margin: 0 }}>Канал доставки ещё не подключён. Откройте VKTECH // СВЯЗЬ: черновик сохранится в текущей сессии.</p>
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

                  <button type="button" className="modal-submit" onClick={() => { setIsModalOpen(false); openChat('/#contact') }}>
                    [ ОТКРЫТЬ КАНАЛ СВЯЗИ → ]
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
          onClick={() => openChat(`/#section-${currentSection}`)}
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
          className={`scroll-interface__rail ${isRailDragging ? 'is-dragging' : ''}`}
          onClick={handleRailClick}
          onPointerDown={handleRailPointerDown}
          onPointerMove={handleRailPointerMove}
          onPointerUp={handleRailPointerUp}
          onPointerCancel={handleRailPointerUp}
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
                <button type="button" className="reboot-trigger" onClick={handleReboot}>[ СБРОС СИСТЕМЫ ]</button>
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

              <div className="cases__bus-label">SYSTEMS // 03</div><div className="cases__progress-bar" onPointerDown={(event) => { if (event.pointerType !== 'mouse') caseSwipeStartRef.current = { x: event.clientX, y: event.clientY } }} onPointerUp={(event) => { const start = caseSwipeStartRef.current; caseSwipeStartRef.current = null; if (!start) return; const dx = event.clientX - start.x; const dy = event.clientY - start.y; if (Math.abs(dx) < 42 || Math.abs(dx) < Math.abs(dy)) return; setActiveProjectIdx((index) => Math.max(0, Math.min(PROJECTS.length - 1, index + (dx < 0 ? 1 : -1)))) }}>
                {PROJECTS.map((proj, idx) => (
                  <button type="button" key={proj.id} className={`cases__progress-seg ${idx === activeProjectIdx ? 'is-active' : ''}`} onClick={() => setActiveProjectIdx(idx)} aria-label={`Открыть кейс ${proj.title}`} aria-pressed={idx === activeProjectIdx}><strong>{proj.id}</strong><span className="cases__mobile-case">{proj.id} // {proj.title.split(' // ')[0]}</span></button>
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
                Разбираем задачу и собираем систему вокруг реального рабочего процесса.
              </p>
            </div>

            <div className="capabilities__list">
              <div className="capabilities__item">
                <div className="capabilities__item-header">
                  <span className="capabilities__item-num">01</span>
                  <span className="capabilities__item-name">АВТОМАТИЗАЦИЯ</span>
                </div>
                <div className="capabilities__item-details">// Убираем ручные действия и соединяем рабочие этапы</div>
              </div>

              <div className="capabilities__item">
                <div className="capabilities__item-header">
                  <span className="capabilities__item-num">02</span>
                  <span className="capabilities__item-name">ИНТЕГРАЦИИ</span>
                </div>
                <div className="capabilities__item-details">// API, вебхуки и передача контекста между сервисами</div>
              </div>

              <div className="capabilities__item">
                <div className="capabilities__item-header">
                  <span className="capabilities__item-num">03</span>
                  <span className="capabilities__item-name">TELEGRAM-СИСТЕМЫ</span>
                </div>
                <div className="capabilities__item-details">// Рабочие каналы, уведомления и понятные действия для команды</div>
              </div>

              <div className="capabilities__item">
                <div className="capabilities__item-header">
                  <span className="capabilities__item-num">04</span>
                  <span className="capabilities__item-name">BACKEND & DATA</span>
                </div>
                <div className="capabilities__item-details">// Логика, данные и контуры, на которых держится продукт</div>
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
              <h2 className="capabilities__title">КАК РУЧНОЕ<br />СТАНОВИТСЯ<br />СИСТЕМОЙ</h2>
              <p className="cases__description">
                Показываем путь без инженерного жаргона: данные не теряются между человеком, сервисами и командой.
              </p>
            </div>

            <div className="pipeline-story" aria-label="Наглядное сравнение ручного и автоматического потока данных">
              <div className="pipeline-story__chapter pipeline-story__chapter--before"><div className="pipeline-story__label">01 // БЫЛО</div><svg viewBox="0 0 620 170" className="pipeline-story__svg" role="img" aria-label="Человек вручную переносит заявку из Telegram в CRM"><g className="story-node"><rect x="18" y="35" width="112" height="90" rx="4"/><path d="M34 52h80M34 65h52M34 84h64M34 97h42"/><text x="38" y="148">TELEGRAM</text></g><g className="story-person"><circle cx="258" cy="48" r="16"/><path d="M258 64v38m-28-15 28-23 28 23m-28 15-19 32m19-32 19 32M210 136h98"/><rect x="216" y="108" width="84" height="42" rx="3"/></g><path className="story-manual-line" d="M132 82 C175 82 180 82 220 82M300 82 C350 82 360 82 402 82"/><g className="story-node"><rect x="410" y="35" width="112" height="90" rx="4"/><path d="M426 54h80M426 70h36M426 88h60M426 104h48"/><text x="452" y="148">CRM</text></g><text className="story-manual-copy" x="220" y="164">РУЧНОЙ ПЕРЕНОС</text></svg><p>Заявка уже есть в Telegram, но человек переписывает её в CRM.</p></div>
              <div className="pipeline-story__chapter pipeline-story__chapter--break"><div className="pipeline-story__label">02 // РАЗБОР</div><div className="pipeline-story__break-line"><span>TELEGRAM</span><i>?</i><span>CRM</span></div><p>Данные существуют в обеих системах. Между ними — ручная работа и риск потерять контекст.</p></div>
              <div className="pipeline-story__chapter pipeline-story__chapter--after"><div className="pipeline-story__label">03 // СТАЛО</div><svg viewBox="0 0 620 150" className="pipeline-story__svg" role="img" aria-label="Автоматический поток Telegram через API в CRM"><g className="story-node"><rect x="18" y="26" width="120" height="84" rx="4"/><path d="M36 46h84M36 61h50M36 78h67"/><text x="42" y="136">TELEGRAM</text></g><path className="story-auto-line" d="M140 68H242M378 68H482"/><g className="story-api"><rect x="245" y="30" width="130" height="76" rx="4"/><path d="M270 55l15 13-15 13m78-26-15 13 15 13"/><text x="284" y="136">BOT / API</text></g><g className="story-node"><rect x="485" y="26" width="120" height="84" rx="4"/><path d="M503 46h84M503 62h43M503 78h65"/><text x="526" y="136">CRM</text></g><g className="story-packets"><rect x="165" y="61" width="12" height="12" rx="1"/><rect x="408" y="61" width="12" height="12" rx="1"/></g></svg><button type="button" className="story-secret-packet" aria-label="Системный пакет" onClick={() => unlockSecret('04', 'PACKET INTERCEPTED // payload: { type: "easter_egg", id: "04" }')}></button><p>Пакеты сами передают данные. Человек остаётся в работе с заявкой, а не между системами.</p></div>
              {secrets.includes('04') && <div className="pipeline-story__payload" role="status">PACKET INTERCEPTED<br />payload: &#123; type: "easter_egg", id: "04" &#125;</div>}
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
              <h2 className="stack__tagline">ТЗ НЕ ОБЯЗАТЕЛЬНО.<br />ЗАДАЧА — ОБЯЗАТЕЛЬНА.</h2>
              <p className="cases__description">
                РАССКАЗЫВАЕТЕ → РАЗБИРАЕМ → ПРЕДЛАГАЕМ → РЕШАЕМ.
              </p>
              <div className="stack__location">
                <span>[×] ГОТОВОЕ ТЗ</span>
                <span>[✓] ПОНИМАНИЕ ЗАДАЧИ</span>
              </div>
            </div>

            <div className="stack__checklist"><span className="stack__cat-title">ДЛЯ СТАРТА НЕ НУЖНЫ:</span><p>[×] ГОТОВОЕ ТЗ</p><p>[×] ВЫБРАННЫЙ СТЕК</p><p>[×] ПРОДУМАННАЯ АРХИТЕКТУРА</p><span className="stack__cat-title">ДОСТАТОЧНО:</span><button type="button" className={`stack__checklist-ok ${secrets.includes('03') ? 'is-confirmed' : ''}`} onClick={() => unlockSecret('03')}>[✓] ПОНИМАНИЯ ЗАДАЧИ</button>{secrets.includes('03') && <div className="stack__secret-response" role="status">TASK UNDERSTOOD<br />TECHNICAL SPECIFICATION: NOT REQUIRED<br />HUMAN EXPLANATION: ACCEPTED<br />STATUS: READY<br /><strong>SECRET_03 FOUND</strong></div>}<small>ВАМ НЕ НУЖНО ПРИХОДИТЬ С ГОТОВЫМ РЕШЕНИЕМ.<br />ДОСТАТОЧНО ПРИЙТИ С ЗАДАЧЕЙ.</small></div>
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
              onClick={() => openChat('/#contact')}
              className="contact__cta-btn"
              style={{ cursor: 'pointer' }}
            >
              [ НАЧАТЬ ДИАЛОГ → ]
            </button>
          </div>

          <div className="contact__footer-info">
            <span>VKTECH / ЦИФРОВЫЕ СИСТЕМЫ</span>
            <button type="button" className="contact__online-status status-secret" onClick={() => { statusClicksRef.current += 1; if (statusClicksRef.current >= 3) { statusClicksRef.current = 0; unlockSecret('05', "YOU'RE LOOKING IN THE RIGHT PLACES. EASTER_EGG_05 FOUND.") } }}>
              <span className="navigation__dot" />
              <span>STATUS: WAITING_FOR_INPUT</span>
            </button>
            <span>2026</span>
          </div>
        </section>
      </main>

      <footer className="site-end">
        <div>© 2026 VKTECH. Все права защищены.</div>
        <div>VKTECH · Разработка и инфраструктура: <a href="https://t.me/karimov_vadim" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gold)' }}>vktech.uz</a></div>
      </footer>
    </>
  )
}

export default App
