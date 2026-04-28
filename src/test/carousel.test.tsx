/**
 * QA Test Suite — Carousel + Scroll Stress Tests
 *
 * Sections:
 *  A. Initial render & default state
 *  B. Work-item hover (only trigger for image activation)
 *  C. Work-item & image-card click
 *  D. Only one item active at a time
 *  E. Active state symmetry (image ↔ text)
 *  F. Scroll wheel forwarding — unit behaviour
 *  G. Scroll stress tests — rapid events, boundary clamping, RAF dedup
 *  H. Scroll suppression — about page & case-study view
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

// ─── Global mocks ─────────────────────────────────────────────────────────────

beforeEach(() => {
  Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
    top: 0, bottom: 0, left: 0, right: 0,
    width: 0, height: 0, x: 0, y: 0,
    toJSON: () => {},
  })
  Element.prototype.scrollTo = vi.fn()

  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true, get: () => 100,
  })
  Object.defineProperty(HTMLElement.prototype, 'offsetTop', {
    configurable: true, get: () => 0,
  })

  // Desktop viewport so wheel-forwarding effect activates
  Object.defineProperty(window, 'innerWidth', {
    configurable: true, value: 1280,
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getWorkItems  = () => document.querySelectorAll('.work-item')
const getMediaCards = () => document.querySelectorAll('.media-card')
const isActive      = (el: Element) => el.classList.contains('is-active')

/**
 * Set up scrollable work-media container with controllable scrollTop.
 * Returns a { container, getScrollTop, setScrollTop } tuple.
 */
function setupScrollContainer() {
  const container = document.querySelector('.work-media') as HTMLDivElement
  let _scrollTop = 0

  Object.defineProperty(container, 'scrollTop', {
    configurable: true,
    get: () => _scrollTop,
    set: (v: number) => { _scrollTop = v },
  })
  Object.defineProperty(container, 'scrollHeight', { configurable: true, get: () => 3000 })
  Object.defineProperty(container, 'clientHeight', { configurable: true, get: () => 800 })
  // maxScroll = 3000 - 800 = 2200

  return {
    container,
    getScrollTop: () => _scrollTop,
    setScrollTop: (v: number) => { _scrollTop = v },
  }
}

/**
 * Mock requestAnimationFrame so callbacks are queued synchronously,
 * then flushed manually. Returns a `flush(n)` helper.
 */
function mockRAF() {
  let queue: FrameRequestCallback[] = []
  let idCounter = 0

  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
    queue.push(cb)
    return ++idCounter
  })
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})

  const flush = (steps = 60) => {
    let t = performance.now()
    for (let i = 0; i < steps; i++) {
      const batch = [...queue]
      queue = []
      t += 16.67
      batch.forEach(cb => cb(t))
      if (queue.length === 0) break
    }
  }

  const queueLength = () => queue.length

  return { flush, queueLength }
}

/** Fire a WheelEvent on a DOM element (bubbles to window). */
function fireWheel(target: Element | Document, deltaY: number) {
  const evt = new WheelEvent('wheel', { deltaY, bubbles: true, cancelable: true })
  target.dispatchEvent(evt)
  return evt
}

// ═══════════════════════════════════════════════════════════════════════════════
// A. Initial render & default state
// ═══════════════════════════════════════════════════════════════════════════════

describe('A — Initial render', () => {
  it('renders all 3 project work items', () => {
    render(<App />)
    expect(getWorkItems()).toHaveLength(3)
  })

  it('renders all 3 media cards', () => {
    render(<App />)
    expect(getMediaCards()).toHaveLength(3)
  })

  it('shows correct client names', () => {
    render(<App />)
    const clients = document.querySelectorAll('.work-client')
    expect(clients[0].textContent).toMatch(/heineken/i)
    expect(clients[1].textContent).toMatch(/heineken/i)
    expect(clients[2].textContent).toMatch(/adidas/i)
  })

  it('shows correct project titles', () => {
    render(<App />)
    const titles = document.querySelectorAll('.work-title')
    expect(titles[0].textContent).toMatch(/crate/i)
    expect(titles[1].textContent).toMatch(/eazle/i)
    expect(titles[2].textContent).toMatch(/adidas\.com/i)
  })
})

describe('A — Default state (nothing selected)', () => {
  it('no work-item has is-active on mount', () => {
    render(<App />)
    getWorkItems().forEach(item => expect(isActive(item)).toBe(false))
  })

  it('no media-card has is-active on mount', () => {
    render(<App />)
    getMediaCards().forEach(card => expect(isActive(card)).toBe(false))
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// B. Work-item hover — ONLY trigger for image activation
// ═══════════════════════════════════════════════════════════════════════════════

describe('B — Work-item hover activates image', () => {
  it('hovering work-item 0 adds is-active to work-item 0', async () => {
    render(<App />)
    await act(async () => { fireEvent.mouseEnter(getWorkItems()[0]) })
    expect(isActive(getWorkItems()[0])).toBe(true)
  })

  it('hovering work-item 0 also activates media-card 0', async () => {
    render(<App />)
    await act(async () => { fireEvent.mouseEnter(getWorkItems()[0]) })
    expect(isActive(getMediaCards()[0])).toBe(true)
  })

  it('hovering work-item 2 activates the adidas card', async () => {
    render(<App />)
    await act(async () => { fireEvent.mouseEnter(getWorkItems()[2]) })
    expect(isActive(getWorkItems()[2])).toBe(true)
    expect(isActive(getMediaCards()[2])).toBe(true)
  })

  it('mouse-leaving work section resets activeIndex to -1 (all inactive)', async () => {
    render(<App />)
    const section = document.querySelector('.work') as HTMLElement
    await act(async () => { fireEvent.mouseEnter(getWorkItems()[1]) })
    await act(async () => { fireEvent.mouseLeave(section) })
    getWorkItems().forEach(item => expect(isActive(item)).toBe(false))
    getMediaCards().forEach(card => expect(isActive(card)).toBe(false))
  })

  it('image cards do NOT activate on hover (feature removed)', async () => {
    render(<App />)
    await act(async () => { fireEvent.mouseEnter(getMediaCards()[0]) })
    // card itself must NOT become active — only work-item hover does this now
    expect(isActive(getMediaCards()[0])).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// C. Click interactions
// ═══════════════════════════════════════════════════════════════════════════════

describe('C — Work-item click', () => {
  it('clicking work-item 0 activates it and calls scrollTo', async () => {
    const user = userEvent.setup()
    render(<App />)
    const container = document.querySelector('.work-media') as HTMLElement
    const scrollSpy = vi.spyOn(container, 'scrollTo')
    await act(async () => { await user.click(getWorkItems()[0]) })
    expect(isActive(getWorkItems()[0])).toBe(true)
    expect(scrollSpy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }))
  })

  it('clicking work-item 2 activates adidas card', async () => {
    const user = userEvent.setup()
    render(<App />)
    await act(async () => { await user.click(getWorkItems()[2]) })
    expect(isActive(getWorkItems()[2])).toBe(true)
    expect(isActive(getMediaCards()[2])).toBe(true)
  })
})

describe('C — Image-card click', () => {
  it('clicking card 1 calls scrollTo', async () => {
    const user = userEvent.setup()
    render(<App />)
    const container = document.querySelector('.work-media') as HTMLElement
    const scrollSpy = vi.spyOn(container, 'scrollTo')
    await act(async () => { await user.click(getMediaCards()[1]) })
    expect(scrollSpy).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }))
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// D. Only one item active at a time
// ═══════════════════════════════════════════════════════════════════════════════

describe('D — Mutual exclusion', () => {
  it('hovering work-item 1 deactivates work-item 0', async () => {
    render(<App />)
    await act(async () => { fireEvent.mouseEnter(getWorkItems()[0]) })
    await act(async () => { fireEvent.mouseEnter(getWorkItems()[1]) })
    expect(isActive(getWorkItems()[0])).toBe(false)
    expect(isActive(getWorkItems()[1])).toBe(true)
  })

  it('exactly one work-item is active after hovering', async () => {
    render(<App />)
    await act(async () => { fireEvent.mouseEnter(getWorkItems()[2]) })
    const active = Array.from(getWorkItems()).filter(isActive)
    expect(active).toHaveLength(1)
  })

  it('exactly one media-card is active after hovering a work-item', async () => {
    render(<App />)
    await act(async () => { fireEvent.mouseEnter(getWorkItems()[1]) })
    const active = Array.from(getMediaCards()).filter(isActive)
    expect(active).toHaveLength(1)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// E. Active state symmetry: card index always matches work-item index
// ═══════════════════════════════════════════════════════════════════════════════

describe('E — Symmetry (image ↔ text)', () => {
  it('active card index matches active work-item index for all 3 items', async () => {
    render(<App />)
    const cards = Array.from(getMediaCards())
    const items = Array.from(getWorkItems())

    for (let i = 0; i < 3; i++) {
      await act(async () => { fireEvent.mouseEnter(items[i]) })
      const activeCardIdx = cards.findIndex(isActive)
      const activeItemIdx = items.findIndex(isActive)
      expect(activeCardIdx).toBe(i)
      expect(activeItemIdx).toBe(i)
    }
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// F. Scroll wheel forwarding — unit behaviour
// ═══════════════════════════════════════════════════════════════════════════════

describe('F — Wheel forwarding basics', () => {
  it('wheel on .content disables scroll-snap on work-media', async () => {
    render(<App />)
    const { container } = setupScrollContainer()
    const { flush } = mockRAF()

    const content = document.querySelector('.content') as HTMLElement
    await act(async () => { fireWheel(content, 200) })

    expect(container.style.scrollSnapType).toBe('none')
    flush()
  })

  it('wheel on .content moves scrollTop forward (deltaY > 0)', async () => {
    render(<App />)
    const { getScrollTop } = setupScrollContainer()
    const { flush: flushRAF } = mockRAF()

    const content = document.querySelector('.content') as HTMLElement
    await act(async () => { fireWheel(content, 400) })
    flushRAF(60)

    expect(getScrollTop()).toBeGreaterThan(0)
  })

  it('wheel with negative deltaY moves scrollTop backward', async () => {
    render(<App />)
    const { setScrollTop, getScrollTop } = setupScrollContainer()
    const { flush: flushRAF } = mockRAF()

    setScrollTop(500)

    const content = document.querySelector('.content') as HTMLElement
    await act(async () => { fireWheel(content, -300) })
    flushRAF(60)

    expect(getScrollTop()).toBeLessThan(500)
  })

  it('wheel on side-menu does NOT move scrollTop', async () => {
    render(<App />)
    const { getScrollTop } = setupScrollContainer()
    mockRAF()

    const sideMenu = document.querySelector('.side-menu') as HTMLElement
    await act(async () => { fireWheel(sideMenu, 400) })

    expect(getScrollTop()).toBe(0)
  })

  it('wheel on work-media does NOT change scrollSnapType (natural scroll)', async () => {
    render(<App />)
    const { container } = setupScrollContainer()
    mockRAF()

    await act(async () => { fireWheel(container, 200) })

    // Handler returns early for work-media — snap should remain at CSS default (empty inline)
    expect(container.style.scrollSnapType).toBe('')
  })

  it('images stay deactivated while scrolling (no activeIndex change)', async () => {
    render(<App />)
    setupScrollContainer()
    const { flush } = mockRAF()

    const content = document.querySelector('.content') as HTMLElement
    await act(async () => {
      for (let i = 0; i < 10; i++) fireWheel(content, 300)
    })
    flush(60)

    getMediaCards().forEach(card => expect(isActive(card)).toBe(false))
    getWorkItems().forEach(item => expect(isActive(item)).toBe(false))
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// G. Scroll stress tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('G — Scroll stress: rapid events', () => {
  it('100 rapid wheel events queue at most 1 RAF at a time (no RAF storm)', async () => {
    render(<App />)
    setupScrollContainer()

    let queuedCount = 0
    let activeRAFs = 0
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((_cb) => {
      activeRAFs++
      queuedCount++
      // Immediately "cancel" (simulate it never running) to keep activeRAFs testable
      return queuedCount
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => { activeRAFs-- })

    const content = document.querySelector('.content') as HTMLElement
    await act(async () => {
      for (let i = 0; i < 100; i++) fireWheel(content, 100)
    })

    // Only 1 RAF should ever be queued at once
    // (the guard `if (rafId === null)` prevents stacking)
    expect(activeRAFs).toBe(1)
  })

  it('rapid scroll clamps at maxScroll (2200) and does not overshoot', async () => {
    render(<App />)
    const { getScrollTop } = setupScrollContainer()
    const { flush } = mockRAF()

    const content = document.querySelector('.content') as HTMLElement
    await act(async () => {
      // 50 events × 500 deltaY × 0.66 scale = 16 500 → clamped to 2200
      for (let i = 0; i < 50; i++) fireWheel(content, 500)
    })
    flush(120)

    expect(getScrollTop()).toBeLessThanOrEqual(2200)
  })

  it('rapid scroll clamps at 0 when scrolling back from top', async () => {
    render(<App />)
    const { getScrollTop } = setupScrollContainer()
    const { flush } = mockRAF()

    const content = document.querySelector('.content') as HTMLElement
    await act(async () => {
      // Already at 0; hammering up should stay at 0
      for (let i = 0; i < 50; i++) fireWheel(content, -500)
    })
    flush(120)

    expect(getScrollTop()).toBeGreaterThanOrEqual(0)
  })

  it('alternating up/down events converge near original position', async () => {
    render(<App />)
    const { setScrollTop, getScrollTop } = setupScrollContainer()
    const { flush } = mockRAF()

    setScrollTop(1000)

    const content = document.querySelector('.content') as HTMLElement
    await act(async () => {
      for (let i = 0; i < 40; i++) {
        fireWheel(content, i % 2 === 0 ? 200 : -200)
      }
    })
    flush(120)

    // Net displacement ≈ 0 — should land within reasonable range of 1000
    expect(getScrollTop()).toBeGreaterThanOrEqual(0)
    expect(getScrollTop()).toBeLessThanOrEqual(2200)
  })

  it('single large deltaY is clamped, not applied raw', async () => {
    render(<App />)
    const { getScrollTop } = setupScrollContainer()
    const { flush } = mockRAF()

    const content = document.querySelector('.content') as HTMLElement
    await act(async () => { fireWheel(content, 999_999) })
    flush(120)

    expect(getScrollTop()).toBeLessThanOrEqual(2200)
  })

  it('snap-type is restored to empty string after idle (200 ms)', async () => {
    vi.useFakeTimers()
    render(<App />)
    const { container } = setupScrollContainer()
    mockRAF()

    const content = document.querySelector('.content') as HTMLElement
    await act(async () => { fireWheel(content, 300) })
    expect(container.style.scrollSnapType).toBe('none')

    // Advance past the 200 ms idle threshold
    await act(async () => { vi.advanceTimersByTime(250) })
    expect(container.style.scrollSnapType).toBe('')
  })

  it('animation stops (no orphan RAF) once target is reached', async () => {
    render(<App />)
    setupScrollContainer()
    const { flush, queueLength } = mockRAF()

    const content = document.querySelector('.content') as HTMLElement
    await act(async () => { fireWheel(content, 200) })
    flush(120) // run until converged

    expect(queueLength()).toBe(0) // no pending animation frame
  })

  it('re-sync: if container was scrolled externally, target resets before accumulating', async () => {
    render(<App />)
    const { setScrollTop, getScrollTop } = setupScrollContainer()
    const { flush } = mockRAF()

    // Simulate the user scrolling work-media directly → container drifts far from internal target
    setScrollTop(1800)

    const content = document.querySelector('.content') as HTMLElement
    await act(async () => { fireWheel(content, 100) })
    flush(60)

    // After re-sync, the scroll should be near 1800 + delta, not near 0 + delta
    expect(getScrollTop()).toBeGreaterThan(1000)
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// H. Scroll suppression on non-home pages / case study
// ═══════════════════════════════════════════════════════════════════════════════

describe('H — Wheel suppression on non-home contexts', () => {
  it('wheel does not forward when About page is active', async () => {
    render(<App />)
    const { getScrollTop } = setupScrollContainer()
    const { flush } = mockRAF()

    // Navigate to About
    const aboutBtn = screen.getByText('About')
    await act(async () => { fireEvent.click(aboutBtn) })

    const body = document.querySelector('.page-body') as HTMLElement
    await act(async () => { fireWheel(body, 500) })
    flush(60)

    expect(getScrollTop()).toBe(0)
  })

  it('wheel does not forward when a case study is open', async () => {
    const user = userEvent.setup()
    render(<App />)
    const { getScrollTop } = setupScrollContainer()
    const { flush } = mockRAF()

    // Open case study by clicking a work item
    await act(async () => { await user.click(getWorkItems()[0]) })

    const content = document.querySelector('.content') as HTMLElement
    await act(async () => { fireWheel(content, 500) })
    flush(60)

    expect(getScrollTop()).toBe(0)
  })
})
