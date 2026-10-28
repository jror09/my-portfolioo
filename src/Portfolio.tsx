import * as React from "react"
import {
    motion,
    AnimatePresence,
    useReducedMotion,
    useMotionValue,
} from "framer-motion"

interface Achievement {
    title: string
    year: string
    description: string
    image?: string
}

interface Props {
    name?: string
    bio?: string
    portrait?: string
    backPortrait?: string
    father?: string
    mother?: string
    dadMessage?: string
    momMessage?: string
    message?: string
    information?: string
    past?: string
    present?: string
    future?: string
    infoPhoto?: string
    pastPhoto?: string
    presentPhoto?: string
    futurePhoto?: string
    achievements?: Achievement[]
    facts?: string
    style?: React.CSSProperties
}

const chapters = ["Home", "Information", "Achievements", "Parents"]
const topics = ["Information", "Past", "Present", "Future"]
const ease = [0.22, 1, 0.36, 1] as const

function Atmosphere({
    pointer,
    dark,
    tab,
    reduced,
    burst,
}: {
    pointer: { x: number; y: number }
    dark: boolean
    tab: number
    reduced: boolean
    burst: { x: number; y: number; id: number } | null
}) {
    const canvas = React.useRef<HTMLCanvasElement>(null)
    const live = React.useRef({ pointer, dark, tab, burst })
    live.current = { pointer, dark, tab, burst }
    React.useEffect(() => {
        const el = canvas.current
        if (!el) return
        const ctx = el.getContext("2d")
        if (!ctx) return
        let w = 1,
            h = 1,
            frame = 0,
            time = 0,
            previous = 0,
            lastPaint = 0,
            active = true
        const mouse = { x: 0.72, y: 0.4 }
        const trail: { x: number; y: number; life: number }[] = []
        const resize = () => {
            const r = el.getBoundingClientRect()
            const nextW = Math.max(1, r.width),
                nextH = Math.max(1, r.height)
            if (nextW === w && nextH === h) return
            w = nextW
            h = nextH
            const d = Math.min(window.devicePixelRatio || 1, 1.25)
            el.width = Math.round(w * d)
            el.height = Math.round(h * d)
            ctx.setTransform(d, 0, 0, d, 0, 0)
        }
        const observer = new ResizeObserver(resize)
        observer.observe(el)
        resize()
        const points = Array.from({ length: 65 }, (_, i) => ({
            x: ((i * 73.13) % 997) / 997,
            y: ((i * 137.71) % 991) / 991,
            phase: i * 1.7,
        }))
        const draw = (stamp: number) => {
            if (!active) return
            frame = requestAnimationFrame(draw)
            if (document.hidden) {
                previous = 0
                return
            }
            if (stamp - lastPaint < 1000 / 30) return
            lastPaint = stamp
            const dt = Math.min((stamp - previous) / 1000 || 0.016, 0.04)
            previous = stamp
            if (!document.hidden) {
                time += reduced ? 0 : dt
                const state = live.current
                mouse.x += ((state.pointer.x + 1) / 2 - mouse.x) * 0.045
                mouse.y += ((state.pointer.y + 1) / 2 - mouse.y) * 0.045
                const mx = mouse.x * w,
                    my = mouse.y * h
                ctx.clearRect(0, 0, w, h)
                if (!reduced) {
                    trail.push({ x: mx, y: my, life: 1 })
                    if (trail.length > 35) trail.shift()
                    for (let i = 1; i < trail.length; i++) {
                        const p = trail[i],
                            prev = trail[i - 1]
                        p.life -= dt * 0.8
                        ctx.beginPath()
                        ctx.moveTo(prev.x, prev.y)
                        ctx.lineTo(p.x, p.y)
                        ctx.strokeStyle = state.dark
                            ? `rgba(218,225,239,${((Math.max(0, p.life) * i) / trail.length) * 0.2})`
                            : `rgba(55,65,82,${((Math.max(0, p.life) * i) / trail.length) * 0.16})`
                        ctx.lineWidth = (i / trail.length) * 1.6
                        ctx.stroke()
                    }
                }
                const glow = ctx.createRadialGradient(
                    mx,
                    my,
                    0,
                    mx,
                    my,
                    w * 0.5
                )
                glow.addColorStop(
                    0,
                    state.dark ? "rgba(180,186,196,.085)" : "rgba(58,69,89,.13)"
                )
                glow.addColorStop(1, "rgba(180,186,196,0)")
                ctx.fillStyle = glow
                ctx.fillRect(0, 0, w, h)
                for (let j = 0; j < 18; j++) {
                    ctx.beginPath()
                    for (let k = 0; k <= 60; k++) {
                        const x = w * (0.32 + (k / 60) * 0.87)
                        const base = h * (0.12 + j * 0.032)
                        const wave =
                            Math.sin(
                                k * 0.06375 + time * 0.24 + state.tab * 0.6
                            ) *
                            h *
                            0.12
                        const dist = (x - mx) / Math.max(w * 0.22, 1)
                        const pull =
                            Math.exp(-dist * dist) * (my - h * 0.5) * 0.3
                        const y =
                            base +
                            wave +
                            Math.sin(k * 0.1275 + j * 0.13 + time * 0.18) * 25 +
                            pull
                        if (k === 0) ctx.moveTo(x, y)
                        else ctx.lineTo(x, y)
                    }
                    ctx.strokeStyle = state.dark
                        ? `rgba(174,181,193,${0.025 + j * 0.0025})`
                        : `rgba(46,55,70,${0.09 + j * 0.003})`
                    ctx.lineWidth = j % 6 === 0 ? 1.1 : 0.55
                    ctx.stroke()
                }
                const locations = points.map((p, i) => {
                    let x = p.x * w + Math.sin(time * 0.16 + p.phase) * 18,
                        y = p.y * h + Math.cos(time * 0.2 + p.phase) * 18
                    const dx = x - mx,
                        dy = y - my,
                        d = Math.sqrt(dx * dx + dy * dy),
                        influence = Math.max(0, 1 - d / 180)
                    if (!reduced) {
                        x += dx * influence * 0.18
                        y += dy * influence * 0.18
                    }
                    return { x, y, influence }
                })
                for (let i = 0; i < locations.length; i++) {
                    const p = locations[i]
                    if (p.influence > 0.05)
                        for (let j = i + 1; j < locations.length; j++) {
                            const q = locations[j],
                                d = Math.hypot(p.x - q.x, p.y - q.y)
                            if (d < 130) {
                                ctx.beginPath()
                                ctx.moveTo(p.x, p.y)
                                ctx.lineTo(q.x, q.y)
                                ctx.strokeStyle = state.dark
                                    ? `rgba(180,186,196,${(1 - d / 130) * p.influence * 0.32})`
                                    : `rgba(40,52,72,${(1 - d / 130) * p.influence * 0.5})`
                                ctx.lineWidth = 0.6
                                ctx.stroke()
                            }
                        }
                    ctx.beginPath()
                    ctx.arc(p.x, p.y, 0.7 + p.influence * 1.7, 0, Math.PI * 2)
                    ctx.fillStyle =
                        p.influence > 0.15
                            ? state.dark
                                ? `rgba(205,212,223,${0.3 + p.influence * 0.6})`
                                : `rgba(40,50,66,${0.4 + p.influence * 0.5})`
                            : state.dark
                            ? "rgba(206,211,220,.22)"
                            : "rgba(52,57,66,.2)"
                    ctx.fill()
                }
            }
        }
        frame = requestAnimationFrame(draw)
        return () => {
            active = false
            cancelAnimationFrame(frame)
            observer.disconnect()
        }
    }, [reduced])
    return (
        <canvas
            ref={canvas}
            aria-hidden
            style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
            }}
        />
    )
}

export default function Portfolio(p: Props) {
    const [tab, setTab] = React.useState(0),
        [topic, setTopic] = React.useState(-1),
        [slide, setSlide] = React.useState(0),
        [dark, setDark] = React.useState(true),
        [fact, setFact] = React.useState(true)
    const [portraitFlipped, setPortraitFlipped] = React.useState(false)
    const [factIndex, setFactIndex] = React.useState(0)
    const autoFacts = true
    const robotFacts = (p.facts || "")
        .split("|")
        .map((v) => v.trim())
        .filter(Boolean)
    const currentFact = robotFacts.length
        ? robotFacts[factIndex % robotFacts.length]
        : ""
    
    // Fallback values since Framer's static renderer/canvas checks are removed
    const staticRender = false
    const canvas = false

    const [intro, setIntro] = React.useState(false)
    const [ripple, setRipple] = React.useState<{
        x: number
        y: number
        id: number
    } | null>(null)
    const reduced = useReducedMotion()
    const root = React.useRef<HTMLDivElement>(null),
        last = React.useRef(0),
        touch = React.useRef(0)
    const [pointer, setPointer] = React.useState({ x: 0, y: 0 })
    const pointerFrame = React.useRef(0),
        pendingPointer = React.useRef({ x: 0, y: 0 }),
        lastPointerPaint = React.useRef(0)
    
    React.useEffect(() => () => cancelAnimationFrame(pointerFrame.current), [])
    
    const updatePointer = (x: number, y: number) => {
        pendingPointer.current = { x, y }
        if (pointerFrame.current) return
        pointerFrame.current = requestAnimationFrame((stamp) => {
            pointerFrame.current = 0
            if (stamp - lastPointerPaint.current < 1000 / 30) return
            lastPointerPaint.current = stamp
            setPointer(pendingPointer.current)
        })
    }
    const cursorX = useMotionValue(0),
        cursorY = useMotionValue(0)
    const [cursor, setCursor] = React.useState({
        visible: false,
        clickable: false,
        down: false,
        flip: false,
    })
    
    React.useEffect(() => {
        if (canvas) return
        let played = false
        try {
            played = sessionStorage.getItem("rb-intro-v2") === "played"
            sessionStorage.setItem("rb-intro-v2", "played")
        } catch {}
        setIntro(!played)
        const t = setTimeout(() => setIntro(false), 2800)
        try {
            setDark(localStorage.getItem("rb-theme") !== "light")
        } catch {}
        return () => clearTimeout(t)
    }, [canvas])

    React.useEffect(() => {
        if (intro) {
            setFact(false)
            return
        }
        if (!autoFacts || robotFacts.length === 0) return
        setFact(true)
        if (canvas) return
        const cycle = setInterval(() => {
            if (document.hidden) return
            setFactIndex((previous) => (previous + 1) % robotFacts.length)
            setFact(true)
        }, 15000)
        return () => clearInterval(cycle)
    }, [canvas, intro, autoFacts, robotFacts.length])

    const go = (n: number) => {
        setTab(n)
        setTopic(-1)
        setSlide(0)
        if (!autoFacts) setFact(false)
    }

    const awards = p.achievements?.length
        ? p.achievements
        : [
              {
                  title: "Your next milestone",
                  year: "Your year",
                  description:
                      "Add your awards, certificates, and proudest moments here.",
              },
          ]

    const advance = (d: number) => {
        if (tab === 2)
            setSlide((v) => Math.max(0, Math.min(awards.length - 1, v + d)))
    }

    const wheel = (e: React.WheelEvent) => {
        if (tab !== 2) return
        if (Math.abs(e.deltaY) < 12 || Date.now() - last.current < 750) return
        last.current = Date.now()
        advance(e.deltaY > 0 ? 1 : -1)
    }

    const bg = dark ? "#0e0e10" : "#eff0f2",
        fg = dark ? "#f1f2f4" : "#17181b",
        muted = dark ? "#a4a7ae" : "#5c6068",
        line = dark ? "#ffffff24" : "#00000025",
        accent = dark ? "#d3d7df" : "#555c68"

    const button: React.CSSProperties = {
        border: "1px solid " + line,
        background: "transparent",
        color: fg,
        borderRadius: 100,
        padding: "13px 22px",
        cursor: "pointer",
        font: "inherit",
        fontSize: 12,
    }

    const photo = (
        url: string | undefined,
        label: string,
        extra: React.CSSProperties = {}
    ) => (
        <div
            className="rb-photo"
            style={{
                background: dark ? "#202125" : "#c9cbd0",
                border: "1px solid " + line,
                overflow: "hidden",
                position: "relative",
                display: "grid",
                placeItems: "center",
                ...extra,
            }}
        >
            {url ? (
                <img
                    src={url}
                    alt={label}
                    style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                    }}
                />
            ) : (
                <div style={{ textAlign: "center", color: muted }}>
                    <div
                        style={{
                            fontFamily: "Comfortaa, sans-serif",
                            fontSize: 70,
                            fontWeight: 300,
                            opacity: 0.35,
                        }}
                    >
                        R.B
                    </div>
                    <p
                        style={{
                            fontSize: 11,
                            letterSpacing: 2,
                            marginTop: 24,
                        }}
                    >
                        {label.toUpperCase()}
                    </p>
                </div>
            )}
        </div>
    )

    const robot = (
        <motion.div
            whileHover={reduced ? {} : { scale: 1.12, rotate: -4 }}
            whileTap={reduced ? {} : { scale: 0.94 }}
            style={{
                width: 68,
                height: 68,
                position: "relative",
                perspective: 350,
                borderRadius: "50%",
                background: dark
                    ? "radial-gradient(circle at 35% 20%,#505359,#222426)"
                    : "radial-gradient(circle at 35% 20%,#f1f2f3,#bfc2c6)",
                overflow: "hidden",
                border: "1px solid " + line,
                boxShadow: "inset 0 1px 0 #fff3,0 6px 18px #0003",
            }}
        >
            <motion.div
                animate={{ y: reduced ? 0 : [0, -1.5, 0] }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                style={{ position: "absolute", inset: 0 }}
            >
                <motion.div
                    animate={{
                        x: reduced ? 0 : pointer.x * 2,
                        rotate: reduced ? 0 : pointer.x * 3,
                    }}
                    transition={{ type: "spring", stiffness: 110, damping: 16 }}
                    style={{
                        position: "absolute",
                        bottom: -9,
                        left: 10,
                        width: 48,
                        height: 34,
                        borderRadius: "50% 50% 0 0",
                        background: "linear-gradient(120deg,#d6d8db,#92969c)",
                    }}
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={tab}
                            initial={
                                reduced
                                    ? false
                                    : { opacity: 0, y: 14, scale: 0.8 }
                            }
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={
                                reduced ? {} : { opacity: 0, y: 12, scale: 0.8 }
                            }
                            transition={{
                                type: "spring",
                                stiffness: 240,
                                damping: 19,
                            }}
                            style={{
                                position: "absolute",
                                inset: 0,
                                borderRadius: "50% 50% 0 0",
                                background:
                                    tab === 1
                                        ? "#252a32"
                                        : tab === 2
                                        ? "#25272c"
                                        : tab === 3
                                        ? "#b7bec8"
                                        : "#aeb4bc",
                            }}
                        >
                            {tab === 1 && (
                                <>
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 14,
                                            width: 20,
                                            height: 19,
                                            background: "#e6e8ec",
                                            clipPath:
                                                "polygon(0 0,100% 0,50% 100%)",
                                        }}
                                    />
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: 4,
                                            left: 21,
                                            width: 7,
                                            height: 20,
                                            background: accent,
                                            clipPath:
                                                "polygon(0 0,100% 0,65% 30%,95% 85%,50% 100%,5% 85%,35% 30%)",
                                        }}
                                    />
                                </>
                            )}
                            {tab === 2 && (
                                <div
                                    style={{
                                        position: "absolute",
                                        left: 8,
                                        top: 4,
                                        width: 5,
                                        height: 25,
                                        background: "#bbbfc6",
                                        transform: "rotate(-16deg)",
                                    }}
                                />
                            )}
                            {tab === 3 && (
                                <>
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: 11,
                                            right: 11,
                                            top: 0,
                                            height: 14,
                                            borderRadius: "0 0 14px 14px",
                                            background: "#e3e6eb",
                                        }}
                                    />
                                    <div
                                        style={{
                                            position: "absolute",
                                            left: 22,
                                            top: 8,
                                            width: 4,
                                            height: 4,
                                            borderRadius: 4,
                                            background: "#6b7480",
                                        }}
                                    />
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
                <motion.div
                    animate={{
                        rotateX: reduced ? 0 : -pointer.y * 14,
                        rotateY: reduced ? 0 : pointer.x * 24,
                        x: reduced ? 0 : pointer.x * 4,
                        y: reduced ? 0 : pointer.y * 2,
                        scale: tab === 3 ? 0.88 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 140, damping: 17 }}
                    style={{
                        position: "absolute",
                        top: 13,
                        left: 20,
                        width: 29,
                        height: 31,
                        borderRadius: "43% 43% 48% 48%",
                        background: "linear-gradient(130deg,#f0f1f3,#a5aab1)",
                        boxShadow:
                            "inset 1px 1px 2px #fff9,inset -3px -3px 6px #0002,0 3px 5px #0003",
                    }}
                >
                    <div
                        style={{
                            position: "absolute",
                            left: -3,
                            top: 11,
                            width: 4,
                            height: 10,
                            borderRadius: 4,
                            background: "#a4aab1",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            right: -3,
                            top: 11,
                            width: 4,
                            height: 10,
                            borderRadius: 4,
                            background: "#a4aab1",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            top: 9,
                            left: 4,
                            right: 4,
                            height: 13,
                            borderRadius: 7,
                            background: "linear-gradient(#20282e,#101619)",
                            display: "flex",
                            justifyContent: "space-around",
                            alignItems: "center",
                            padding: "0 2px",
                        }}
                    >
                        {[0, 1].map((i) => (
                            <motion.span
                                key={i}
                                animate={{
                                    scaleY: reduced ? 1 : [1, 1, 0.12, 1, 1],
                                    height: tab === 3 ? 6 : 5,
                                }}
                                transition={{
                                    duration: 4.6,
                                    repeat: Infinity,
                                    times: [0, 0.42, 0.45, 0.48, 1],
                                    delay: i * 0.035,
                                }}
                                style={{
                                    width: 4,
                                    borderRadius: 4,
                                    background: "#e8f0f5",
                                    boxShadow: "0 0 6px #e8f0f580",
                                    transformOrigin: "center",
                                    translateX: pointer.x,
                                    translateY: pointer.y,
                                }}
                            />
                        ))}
                    </div>
                    <motion.div
                        animate={{
                            width:
                                fact && !reduced
                                    ? [7, 10, 6, 9, 7]
                                    : tab === 3
                                    ? 9
                                    : 7,
                            borderRadius: tab === 3 ? "0 0 8px 8px" : "5px",
                            height:
                                fact && !reduced
                                    ? [2, 5, 2, 4, 2]
                                    : tab === 3
                                    ? 4
                                    : 2,
                        }}
                        transition={
                            fact && !reduced
                                ? { duration: 0.9, repeat: Infinity }
                                : { duration: 0.2 }
                        }
                        style={{
                            position: "absolute",
                            bottom: 4,
                            left: 11,
                            background: "#626c77",
                        }}
                    />
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={"hat" + tab}
                            initial={
                                reduced
                                    ? false
                                    : { opacity: 0, y: -16, rotate: -18 }
                            }
                            animate={{ opacity: 1, y: 0, rotate: 0 }}
                            exit={
                                reduced
                                    ? {}
                                    : { opacity: 0, y: -12, rotate: 15 }
                            }
                            transition={{
                                type: "spring",
                                stiffness: 240,
                                damping: 14,
                            }}
                            style={{
                                position: "absolute",
                                inset: 0,
                                pointerEvents: "none",
                            }}
                        >
                            {tab === 2 ? (
                                <>
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: -8,
                                            left: -7,
                                            width: 44,
                                            height: 17,
                                            background: "#161a20",
                                            borderTop: "1px solid #8c929c",
                                            clipPath:
                                                "polygon(50% 0,100% 40%,50% 90%,0 40%)",
                                        }}
                                    />
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: -1,
                                            right: -7,
                                            height: 19,
                                            width: 2,
                                            background: accent,
                                        }}
                                    />
                                    <motion.div
                                        animate={
                                            reduced
                                                ? {}
                                                : { rotate: [-8, 8, -8] }
                                        }
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                        }}
                                        style={{
                                            position: "absolute",
                                            top: 14,
                                            right: -9,
                                            width: 5,
                                            height: 7,
                                            borderRadius: 2,
                                            background: accent,
                                            transformOrigin: "top",
                                        }}
                                    />
                                </>
                            ) : tab === 3 ? (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: -5,
                                        left: 7,
                                        width: 16,
                                        height: 8,
                                        borderRadius: "9px 9px 0 0",
                                        borderTop: "3px solid #87919e",
                                        transform: "rotate(-15deg)",
                                    }}
                                />
                            ) : tab === 0 ? (
                                <>
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: -7,
                                            left: 13,
                                            width: 2,
                                            height: 7,
                                            background: "#b7bec8",
                                        }}
                                    />
                                    <motion.div
                                        animate={
                                            reduced
                                                ? {}
                                                : { opacity: [0.4, 1, 0.4] }
                                        }
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                        }}
                                        style={{
                                            position: "absolute",
                                            top: -9,
                                            left: 11,
                                            width: 6,
                                            height: 4,
                                            borderRadius: 4,
                                            background: accent,
                                            boxShadow: "0 0 6px " + accent,
                                        }}
                                    />
                                </>
                            ) : null}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </motion.div>
    )

    return (
        <div
            ref={root}
            className={
                "rb-portfolio" +
                (tab === 1 && topic >= 0 ? " rb-chapter-open" : "") +
                (cursor.visible ? " rb-custom-cursor" : "")
            }
            onPointerLeave={() => {
                cancelAnimationFrame(pointerFrame.current)
                pointerFrame.current = 0
                setPointer({ x: 0, y: 0 })
                setCursor({
                    visible: false,
                    clickable: false,
                    down: false,
                    flip: false,
                })
            }}
            onPointerUp={() => setCursor((v) => ({ ...v, down: false }))}
            onPointerCancel={() =>
                setCursor({
                    visible: false,
                    clickable: false,
                    down: false,
                    flip: false,
                })
            }
            onPointerOver={(e) => {
                if (e.pointerType !== "mouse") return
                const clickable = !!(e.target as Element).closest(
                    "button:not(:disabled),a[href],[role=button]"
                )
                const flip = !!(e.target as Element).closest(
                    "[data-portrait-flip]"
                )
                setCursor((v) =>
                    v.clickable === clickable && v.flip === flip
                        ? v
                        : { ...v, clickable, flip }
                )
            }}
            onPointerDown={(e) => {
                if (e.pointerType === "mouse")
                    setCursor((v) => ({ ...v, down: true }))
                if ((e.target as HTMLElement).closest("button")) return
                const r = e.currentTarget.getBoundingClientRect()
                setRipple({
                    x: e.clientX - r.left,
                    y: e.clientY - r.top,
                    id: Date.now(),
                })
            }}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Escape" && tab === 1 && topic >= 0) {
                    setTopic(-1)
                    return
                }
                if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                    e.preventDefault()
                    advance(1)
                }
                if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                    e.preventDefault()
                    advance(-1)
                }
            }}
            onWheel={wheel}
            onTouchStart={(e) => (touch.current = e.touches[0].clientY)}
            onTouchEnd={(e) => {
                const d = touch.current - e.changedTouches[0].clientY
                if (tab === 2 && Math.abs(d) > 40) advance(d > 0 ? 1 : -1)
            }}
            onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect()
                if (e.pointerType === "mouse") {
                    cursorX.set(e.clientX - r.left)
                    cursorY.set(e.clientY - r.top)
                    setCursor((v) => (v.visible ? v : { ...v, visible: true }))
                }
                updatePointer(
                    ((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1,
                    ((e.clientY - r.top) / Math.max(1, r.height)) * 2 - 1
                )
            }}
            style={{
                ...p.style,
                width: "100%",
                height: "100dvh",
                minHeight: 560,
                position: "relative",
                overflow: "hidden",
                background: bg,
                color: fg,
                fontFamily: "Arial, sans-serif",
                transition: "background .5s,color .5s",
                isolation: "isolate",
            }}
        >
            <style>{`
  @media(hover:hover) and (pointer:fine){.rb-portfolio.rb-custom-cursor,.rb-portfolio.rb-custom-cursor *{cursor:none!important}}.rb-portfolio .rb-cursor{display:none}@media(hover:hover) and (pointer:fine){.rb-portfolio .rb-cursor{display:block}}

  .rb-portfolio .rb-title span{background:linear-gradient(115deg,${dark ? "#f9fafc 5%,#8d95a3 45%,#e9edf5 75%" : "#171b23 5%,#778190 45%,#292f3a 75%"});background-size:200% 100%;background-clip:text;-webkit-background-clip:text;color:transparent!important}.rb-portfolio .rb-title:hover span{background-position:100% 50%}.rb-portfolio .rb-title{font-weight:400!important}.rb-portfolio .rb-nav{backdrop-filter:blur(20px);background:${dark ? "#17181a66" : "#eff0f366"};box-shadow:inset 0 1px 0 #ffffff10}.rb-portfolio .rb-photo{background:linear-gradient(140deg,${dark ? "#2a2c31,#17191c" : "#d4d7dd,#b5bbc6"})!important}.rb-portfolio .rb-topic:hover{box-shadow:0 25px 55px #0003,inset 0 1px 0 #ffffff30!important}

  .rb-portfolio *{box-sizing:border-box}.rb-portfolio button{position:relative;overflow:hidden;transition:background .3s,transform .4s cubic-bezier(.2,.8,.2,1),border-color .3s,box-shadow .3s}.rb-portfolio button::after{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 25%,#ffffff25 50%,transparent 75%);transform:translateX(-120%);transition:transform .65s;pointer-events:none}.rb-portfolio button:hover::after{transform:translateX(120%)}.rb-portfolio button:active{transform:translateY(0) scale(.96)!important}.rb-portfolio button:disabled{pointer-events:none}.rb-portfolio .rb-photo{transition:box-shadow .5s,border-color .4s}.rb-portfolio .rb-photo:hover{box-shadow:0 22px 55px #0003,0 0 0 1px #d3d7df70;border-color:#cbd0da!important}.rb-portfolio .rb-photo img{transition:transform .8s cubic-bezier(.2,.8,.2,1),filter .8s}.rb-portfolio .rb-photo:hover img{transform:scale(1.06);filter:saturate(1.12)}.rb-portfolio .rb-topic:hover{transform:translateY(-10px) rotate(-1deg)!important;box-shadow:0 24px 50px #0002}.rb-portfolio .rb-topic span{transition:transform .4s}.rb-portfolio .rb-topic:hover span:last-child{transform:translateX(8px)}.rb-portfolio .rb-title span{display:inline-block;transition:text-shadow .4s,transform .4s}.rb-portfolio .rb-title:hover span{transform:translateX(6px);text-shadow:0 0 35px #d3d7df40}.rb-portfolio button:hover{background:#aeb6c420!important;border-color:#cbd0da!important;transform:translateY(-4px);box-shadow:0 8px 25px #aeb6c418}.rb-portfolio button:focus-visible{outline:2px solid #cbd0da;outline-offset:5px}.rb-portfolio h1,.rb-portfolio h2,.rb-portfolio p{margin:0}.rb-portfolio .rb-grid{display:grid;grid-template-columns:1.05fr 1fr;align-items:center;gap:8vw}.rb-portfolio .rb-title{font-size:clamp(44px,6.8vw,96px);line-height:1.03;letter-spacing:-.065em;font-weight:500}.rb-portfolio .rb-main{position:absolute;inset:140px 7% 108px;display:flex;align-items:center}.rb-portfolio .rb-nav{display:flex;gap:5px;padding:5px;border:1px solid ${line};border-radius:100px}.rb-portfolio .rb-top{position:absolute;left:3.3%;right:3.3%;top:27px;display:flex;align-items:center;justify-content:space-between;z-index:3}.rb-portfolio .rb-portrait{height:min(53vh,490px);border-radius:110px 12px 12px 12px;transform:rotate(3deg)}.rb-portfolio .rb-topics{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}.rb-portfolio .rb-topic{backdrop-filter:blur(14px);height:240px;text-align:left;display:flex;flex-direction:column;justify-content:space-between}.rb-portfolio .rb-parentphotos{display:grid;grid-template-columns:1fr 1fr;gap:18px}.rb-portfolio .rb-footer{position:absolute;bottom:29px;left:3.3%;right:3.3%;display:flex;justify-content:space-between;align-items:center;font-size:10px;letter-spacing:1.4px;color:${muted}}
  @media(max-width:700px){.rb-portfolio .rb-fact-bubble{width:145px!important;padding:9px 11px!important}.rb-portfolio .rb-fact-bubble p{font-size:10px!important}.rb-portfolio .rb-top{gap:8px}.rb-portfolio .rb-top>button{padding:10px 12px!important;font-size:10px!important}.rb-portfolio .rb-top{top:12px;align-items:flex-start}.rb-portfolio .rb-nav{position:absolute;top:76px;left:0;right:0;justify-content:center}.rb-portfolio .rb-nav button{padding:10px 12px!important;font-size:10px!important}.rb-portfolio .rb-main{inset:145px 7% 80px}.rb-portfolio .rb-grid{gap:24px;grid-template-columns:1fr 0.85fr}.rb-portfolio .rb-title{font-size:42px}.rb-portfolio .rb-portrait{height:280px;border-radius:65px 10px 10px 10px}.rb-portfolio .rb-topics{grid-template-columns:1fr 1fr;gap:10px}.rb-portfolio .rb-topic{height:150px}.rb-portfolio .rb-detail{grid-template-columns:1fr!important}.rb-portfolio .rb-detail .rb-detailphoto{display:none}.rb-portfolio .rb-footer{font-size:9px}.rb-portfolio .rb-hide{display:none}.rb-portfolio .rb-parentphotos>div>.rb-photo{height:150px!important}.rb-portfolio .rb-parentphotos{gap:12px}}

  .rb-portfolio.rb-chapter-open .rb-top,.rb-portfolio.rb-chapter-open .rb-footer{display:none}
  .rb-portfolio.rb-chapter-open .rb-main{inset:0;padding:40px 7%;overflow-y:auto;align-items:safe center}
  .rb-portfolio.rb-chapter-open .rb-main>section{max-width:1440px;margin:auto}
  .rb-portfolio.rb-chapter-open .rb-detail{min-height:65dvh;gap:7vw!important}
  .rb-portfolio.rb-chapter-open .rb-detail p{max-width:620px!important;font-size:clamp(18px,2vw,26px)!important}
  .rb-portfolio.rb-chapter-open .rb-detailphoto .rb-photo{height:60dvh!important}
  .rb-portfolio.rb-chapter-open .rb-detail>div>div{flex-wrap:wrap}
  @media(max-width:700px){
  .rb-portfolio.rb-chapter-open .rb-main{inset:0;padding:28px 7%;align-items:flex-start}
  .rb-portfolio.rb-chapter-open .rb-detail{min-height:0;gap:28px!important}
  .rb-portfolio.rb-chapter-open .rb-detail .rb-detailphoto{display:block}
  .rb-portfolio.rb-chapter-open .rb-detailphoto .rb-photo{height:32dvh!important}
  }


  .rb-portfolio [data-portrait-flip] .rb-photo img{filter:grayscale(1)}
  .rb-portfolio [data-portrait-flip]:hover .rb-photo img,.rb-portfolio [data-portrait-flip]:focus-visible .rb-photo img{filter:grayscale(0)}
  @media(prefers-reduced-motion:reduce){.rb-portfolio button:hover,.rb-portfolio .rb-topic:hover,.rb-portfolio .rb-photo:hover img,.rb-portfolio .rb-title:hover span{transform:none!important}.rb-portfolio *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
  `}</style>
            <motion.div
                aria-hidden
                animate={{
                    x: reduced ? 0 : pointer.x * 18,
                    y: reduced ? 0 : pointer.y * 12,
                    rotate: tab * 3,
                }}
                transition={{ type: "spring", stiffness: 40, damping: 22 }}
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    overflow: "hidden",
                }}
            >
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 1200 850"
                    preserveAspectRatio="xMidYMid slice"
                    style={{ opacity: dark ? 0.38 : 0.7 }}
                >
                    <defs>
                        <linearGradient id="rb-contour-fade" x1="0" x2="1">
                            <stop
                                offset="0%"
                                stopColor={dark ? "#a5adbb" : "#424b59"}
                                stopOpacity="0"
                            />
                            <stop
                                offset="65%"
                                stopColor={dark ? "#a5adbb" : "#424b59"}
                                stopOpacity=".35"
                            />
                            <stop
                                offset="100%"
                                stopColor={dark ? "#a5adbb" : "#424b59"}
                                stopOpacity=".9"
                            />
                        </linearGradient>
                    </defs>
                    {Array.from({ length: 23 }, (_, i) => (
                        <path
                            key={i}
                            d={`M ${350 + i * 8} 900 C ${420 + i * 10} 540, ${1060 - i * 15} ${800 - i * 22}, ${1030 - i * 8} ${290 - i * 7} S ${850 + i * 9} -80, 1320 ${-150 + i * 21}`}
                            fill="none"
                            stroke="url(#rb-contour-fade)"
                            strokeWidth={i % 5 === 0 ? 1.2 : 0.6}
                        />
                    ))}
                </svg>
            </motion.div>
            <motion.div
                aria-hidden
                initial={false}
                animate={{
                    x: reduced ? 0 : pointer.x * 24,
                    y: reduced ? 0 : pointer.y * 16,
                    right: ["-12%", "22%", "-3%", "36%"][tab],
                    top: ["3%", "-36%", "-15%", "12%"][tab],
                    scale: [1, 1.18, 0.82, 0.92][tab],
                    rotate: [0, -32, 38, -18][tab],
                    opacity: dark ? 0.7 : 0.85,
                }}
                transition={
                    reduced
                        ? { duration: 0 }
                        : {
                            type: "spring",
                            stiffness: 38,
                            damping: 19,
                            mass: 1.15,
                          }
                }
                style={{
                    position: "absolute",
                    width: "70vw",
                    height: "70vw",
                    pointerEvents: "none",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        inset: "8%",
                        borderRadius: "50%",
                        background: dark
                            ? "radial-gradient(circle,transparent 48%,#a8b2c512 61%,#dce2ee16 62%,transparent 64%)"
                            : "radial-gradient(circle,transparent 48%,#414d6330 61%,#303c5238 62%,transparent 64%)",
                    }}
                />
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        animate={
                            reduced ? {} : { rotate: i % 2 === 0 ? 360 : -360 }
                        }
                        transition={{
                            duration: 65 + i * 22,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                        style={{
                            position: "absolute",
                            inset: 14 + i * 5 + "%",
                            border:
                                "1px solid " +
                                (dark ? "#bdc6d31b" : "#3c485550"),
                            borderRadius: "50%",
                            transform: "rotateX(55deg)",
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                top: "14.5%",
                                left: "14.5%",
                                width: i === 0 ? 5 : 3,
                                height: i === 0 ? 5 : 3,
                                borderRadius: 8,
                                background: dark ? "#dce2eb" : "#58657a",
                                boxShadow: "0 0 16px #dce2eb77",
                            }}
                        />
                    </motion.div>
                ))}
            </motion.div>
            <Atmosphere
                pointer={pointer}
                dark={dark}
                tab={tab}
                reduced={!!reduced}
                burst={ripple}
            />
            <div
                aria-hidden
                style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    background: dark
                        ? "linear-gradient(90deg,#0e0e1055,transparent 65%),radial-gradient(ellipse at 80% 0%,#aab2c212,transparent 60%)"
                        : "linear-gradient(90deg,#eff0f244,transparent 70%),radial-gradient(ellipse at 90% 25%,#8b94a530,transparent 65%)",
                }}
            />
            <AnimatePresence>
                {ripple && !reduced && (
                    <motion.div
                        key={ripple.id}
                        aria-hidden
                        initial={{ scale: 0, opacity: 0.55 }}
                        animate={{ scale: 1, opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        style={{
                            position: "absolute",
                            left: ripple.x - 200,
                            top: ripple.y - 200,
                            width: 400,
                            height: 400,
                            borderRadius: "50%",
                            border:
                                "1px solid " + (dark ? "#aeb6c4" : "#45536b"),
                            pointerEvents: "none",
                        }}
                    />
                )}
            </AnimatePresence>
            <header className="rb-top">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button
                        aria-label="Show another fact"
                        onClick={() => setFactIndex((v) => v + 1)}
                        style={{
                            ...button,
                            padding: 0,
                            border: 0,
                            borderRadius: 16,
                        }}
                    >
                        {robot}
                    </button>
                    <div
                        className="rb-fact-bubble"
                        role="region"
                        aria-label="Robot’s facts"
                        style={{
                            position: "relative",
                            width: 260,
                            padding: "13px 16px",
                            border: "1px solid " + line,
                            borderRadius: "16px 16px 16px 4px",
                            background: dark ? "#25272c" : "#f0f1f3",
                            boxShadow: "0 8px 24px #0002",
                        }}
                    >
                        <div
                            aria-hidden
                            style={{
                                position: "absolute",
                                left: -6,
                                top: 27,
                                width: 10,
                                height: 10,
                                transform: "rotate(45deg)",
                                background: dark ? "#25272c" : "#f0f1f3",
                                borderLeft: "1px solid " + line,
                                borderBottom: "1px solid " + line,
                            }}
                        />
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={factIndex}
                                aria-live="polite"
                                initial={{ opacity: 0, y: reduced ? 0 : 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: reduced ? 0 : -5 }}
                                transition={{ duration: reduced ? 0 : 0.25 }}
                                style={{
                                    fontSize: 11,
                                    lineHeight: 1.6,
                                    color: fg,
                                }}
                            >
                                {currentFact}
                            </motion.p>
                        </AnimatePresence>
                    </div>
                </div>
                <nav aria-label="Main navigation" className="rb-nav">
                    {chapters.map((t, i) => (
                        <button
                            key={t}
                            onClick={() => go(i)}
                            aria-current={tab === i ? "page" : undefined}
                            style={{
                                ...button,
                                border: 0,
                                padding: "12px 19px",
                                background: tab === i ? fg : "transparent",
                                color: tab === i ? bg : muted,
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </nav>
                <button
                    style={{ ...button, fontSize: 11 }}
                    onClick={() => {
                        setDark(!dark)
                        try {
                            localStorage.setItem(
                                "rb-theme",
                                dark ? "light" : "dark"
                            )
                        } catch {}
                    }}
                >
                    {dark ? "Light mode" : "Dark mode"}
                </button>
            </header>
            <main className="rb-main">
                <AnimatePresence mode="wait">
                    <motion.section
                        key={tab}
                        initial={{
                            opacity: 0,
                            y: reduced ? 0 : 45,
                            scale: reduced ? 1 : 0.975,
                            filter: reduced ? "none" : "blur(8px)",
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            filter: "blur(0px)",
                        }}
                        exit={{
                            opacity: 0,
                            y: reduced ? 0 : -25,
                            filter: reduced ? "none" : "blur(6px)",
                        }}
                        transition={{ duration: reduced ? 0 : 0.55, ease }}
                        style={{ width: "100%" }}
                    >
                        {tab === 0 && (
                            <div className="rb-grid">
                                <div>
                                    <p
                                        style={{
                                            fontSize: 10,
                                            letterSpacing: 3,
                                            color: accent,
                                            marginBottom: 26,
                                        }}
                                    >
                                        01 / HELLO, WORLD.
                                    </p>
                                    <h1 className="rb-title">
                                        Shaping ideas
                                        <br />
                                        into{" "}
                                        <span style={{ color: accent }}>
                                            reality.
                                        </span>
                                    </h1>
                                    <div
                                        style={{
                                            width: 40,
                                            height: 2,
                                            background: accent,
                                            margin: "28px 0",
                                        }}
                                    />
                                    <h2
                                        style={{
                                            fontSize: 23,
                                            fontWeight: 400,
                                            marginBottom: 14,
                                        }}
                                    >
                                        {p.name || "Robert M, Basbas Jr"}
                                    </h2>
                                    <p
                                        style={{
                                            fontSize: 14,
                                            lineHeight: 1.8,
                                            color: muted,
                                            maxWidth: 350,
                                        }}
                                    >
                                        {p.bio}
                                    </p>
                                    <button
                                        onClick={() => go(1)}
                                        style={{
                                            ...button,
                                            background: dark
                                                ? "linear-gradient(135deg,#f1f2f5,#9da4af)"
                                                : "#343a44",
                                            color: dark ? "#141518" : "#f5f6f8",
                                            borderColor: accent,
                                            marginTop: 28,
                                        }}
                                    >
                                        About Me
                                    </button>
                                </div>
                                <motion.div
                                    animate={
                                        reduced
                                            ? {}
                                            : {
                                                rotateY: pointer.x * 4,
                                                rotateX: -pointer.y * 3,
                                                y: pointer.y * -5,
                                              }
                                    }
                                    transition={{
                                        type: "spring",
                                        stiffness: 70,
                                        damping: 20,
                                    }}
                                    whileHover={
                                        reduced
                                            ? {}
                                            : {
                                                rotate: -2,
                                                y: -10,
                                                scale: 1.015,
                                              }
                                    }
                                    style={{
                                        position: "relative",
                                        transformPerspective: 1000,
                                        width: "min(100%, 345px)",
                                        justifySelf: "center",
                                    }}
                                >
                                    <div
                                        aria-hidden
                                        style={{
                                            position: "absolute",
                                            inset: "20px -16px -18px 22px",
                                            border: "1px solid " + accent,
                                            borderRadius:
                                                "100px 16px 16px 16px",
                                            opacity: 0.45,
                                            transform: "rotate(-3deg)",
                                        }}
                                    />
                                    <div
                                        data-portrait-flip=""
                                        role="button"
                                        tabIndex={0}
                                        aria-label={
                                            portraitFlipped
                                                ? "Flip to front portrait"
                                                : "Flip to second portrait"
                                        }
                                        aria-pressed={portraitFlipped}
                                        onClick={() =>
                                            setPortraitFlipped((v) => !v)
                                        }
                                        onKeyDown={(e) => {
                                            if (
                                                e.key === "Enter" ||
                                                e.key === " "
                                            ) {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setPortraitFlipped((v) => !v)
                                            }
                                        }}
                                        style={{
                                            width: "100%",
                                            aspectRatio: ".75",
                                            perspective: 1200,
                                            cursor: "pointer",
                                            borderRadius:
                                                "100px 16px 16px 16px",
                                        }}
                                    >
                                        <motion.div
                                            initial={false}
                                            animate={{
                                                rotateY: portraitFlipped
                                                    ? 180
                                                    : 0,
                                            }}
                                            transition={
                                                reduced
                                                    ? { duration: 0 }
                                                    : { duration: 0.85, ease }
                                            }
                                            style={{
                                                position: "relative",
                                                width: "100%",
                                                height: "100%",
                                                transformStyle: "preserve-3d",
                                            }}
                                        >
                                            <div
                                                aria-hidden={portraitFlipped}
                                                style={{
                                                    position: "absolute",
                                                    inset: 0,
                                                    backfaceVisibility:
                                                        "hidden",
                                                    WebkitBackfaceVisibility:
                                                        "hidden",
                                                }}
                                            >
                                                {photo(
                                                    p.portrait,
                                                    "Your portrait",
                                                    {
                                                        width: "100%",
                                                        height: "100%",
                                                        borderRadius:
                                                            "100px 16px 16px 16px",
                                                    }
                                                )}
                                            </div>
                                            <div
                                                aria-hidden={!portraitFlipped}
                                                style={{
                                                    position: "absolute",
                                                    inset: 0,
                                                    transform:
                                                        "rotateY(180deg)",
                                                    backfaceVisibility:
                                                        "hidden",
                                                    WebkitBackfaceVisibility:
                                                        "hidden",
                                                }}
                                            >
                                                {photo(
                                                    p.backPortrait,
                                                    "Your second portrait",
                                                    {
                                                        width: "100%",
                                                        height: "100%",
                                                        borderRadius:
                                                            "100px 16px 16px 16px",
                                                    }
                                                )}
                                            </div>
                                        </motion.div>
                                    </div>
                                    <div
                                        style={{
                                            position: "absolute",
                                            bottom: 25,
                                            left: -24,
                                            background: dark
                                                ? "#cbd0da"
                                                : "#4e5662",
                                            color: dark ? "#15161a" : "#f4f5f7",
                                            borderRadius: 100,
                                            padding: "13px 24px",
                                            fontSize: 11,
                                            pointerEvents: "none",
                                            transform: "rotate(-6deg)",
                                        }}
                                    >
                                        Trust The Process
                                    </div>
                                </motion.div>
                            </div>
                        )}
                        {tab === 1 && (
                            <>
                                <p
                                    style={{
                                        fontSize: 10,
                                        letterSpacing: 3,
                                        color: accent,
                                        marginBottom: 20,
                                    }}
                                >
                                    02 / THE PERSON BEHIND THE PIXELS
                                </p>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: 20,
                                        flexWrap: "wrap",
                                        marginBottom: 30,
                                    }}
                                >
                                    <h1
                                        style={{
                                            fontSize: "clamp(30px,4vw,54px)",
                                            letterSpacing: "-.05em",
                                            fontWeight: 400,
                                        }}
                                    >
                                        {topic < 0
                                            ? "A little about me."
                                            : topics[topic] + "."}
                                    </h1>
                                    {topic >= 0 && (
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: 8,
                                                alignItems: "center",
                                                flexWrap: "wrap",
                                            }}
                                        >
                                            <button
                                                style={button}
                                                onClick={() => setTopic(-1)}
                                            >
                                                Back to chapters
                                            </button>
                                            {topics.map((t, i) => {
                                                return (
                                                    <button
                                                        key={t}
                                                        aria-pressed={
                                                            topic === i
                                                        }
                                                        style={{
                                                            ...button,
                                                            padding: "8px 16px",
                                                            fontSize: 11,
                                                            background:
                                                                topic === i
                                                                    ? fg
                                                                    : "transparent",
                                                            color:
                                                                topic === i
                                                                    ? bg
                                                                    : muted,
                                                        }}
                                                        onClick={() =>
                                                            setTopic(i)
                                                        }
                                                    >
                                                        {t}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={topic}
                                        initial={{
                                            opacity: 0,
                                            x: reduced ? 0 : 45,
                                            scale: reduced ? 1 : 0.97,
                                            filter: reduced
                                                ? "none"
                                                : "blur(8px)",
                                        }}
                                        animate={{
                                            opacity: 1,
                                            x: 0,
                                            scale: 1,
                                            filter: "blur(0px)",
                                        }}
                                        exit={{
                                            opacity: 0,
                                            x: reduced ? 0 : -25,
                                            scale: reduced ? 1 : 0.98,
                                        }}
                                        transition={{
                                            duration: reduced ? 0 : 0.5,
                                            ease,
                                        }}
                                    >
                                        {topic < 0 ? (
                                            <div className="rb-topics">
                                                {topics.map((t, i) => (
                                                    <button
                                                        className="rb-topic"
                                                        key={t}
                                                        onClick={() =>
                                                            setTopic(i)
                                                        }
                                                        style={{
                                                            ...button,
                                                            borderRadius: 16,
                                                            padding: 24,
                                                            background:
                                                                i === 0
                                                                    ? accent
                                                                    : dark
                                                                    ? "#1c1e2399"
                                                                    : "#ffffff40",
                                                            color:
                                                                i === 0
                                                                    ? dark
                                                                        ? "#17181b"
                                                                        : "#f3f4f7"
                                                                    : fg,
                                                        }}
                                                    >
                                                        <span
                                                            style={{
                                                                fontSize: 11,
                                                                opacity: 0.65,
                                                            }}
                                                        >
                                                            0{i + 1} / CHAPTER
                                                        </span>
                                                        <span
                                                            style={{
                                                                fontSize: 26,
                                                                letterSpacing:
                                                                    "-.04em",
                                                            }}
                                                        >
                                                            {t}
                                                        </span>
                                                        <span
                                                            style={{
                                                                fontSize: 11,
                                                                opacity: 0.7,
                                                            }}
                                                        >
                                                            Open chapter
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div
                                                className="rb-detail"
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns:
                                                        topic === 0
                                                            ? "1fr"
                                                            : "1fr 1fr",
                                                    gap: 50,
                                                    alignItems: "center",
                                                }}
                                            >
                                                <div>
                                                    <p
                                                        style={{
                                                            fontSize: 18,
                                                            lineHeight: 1.8,
                                                            maxWidth: 450,
                                                            color: muted,
                                                        }}
                                                    >
                                                        {
                                                            [
                                                                p.information,
                                                                p.past,
                                                                p.present,
                                                                p.future,
                                                            ][topic]
                                                        }
                                                    </p>
                                                </div>
                                                {topic !== 0 && (
                                                    <div className="rb-detailphoto">
                                                        {photo(
                                                            [
                                                                p.infoPhoto,
                                                                p.pastPhoto,
                                                                p.presentPhoto,
                                                                p.futurePhoto,
                                                            ][topic],
                                                            topics[topic] +
                                                                " photo",
                                                            {
                                                                height: "32vh",
                                                                borderRadius: 18,
                                                            }
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </>
                        )}
                        {tab === 2 && (
                            <>
                                <p
                                    style={{
                                        fontSize: 10,
                                        letterSpacing: 3,
                                        color: accent,
                                        marginBottom: 28,
                                    }}
                                >
                                    03 / SMALL WINS. BIG FEELINGS.
                                </p>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        className="rb-grid"
                                        key={slide}
                                        initial={{ opacity: 0, y: 35 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -35 }}
                                        transition={{
                                            duration: reduced ? 0 : 0.4,
                                        }}
                                    >
                                        <div>
                                            <p
                                                style={{
                                                    color: accent,
                                                    fontSize: 13,
                                                    marginBottom: 18,
                                                }}
                                            >
                                                {awards[slide].year}
                                            </p>
                                            <h1
                                                style={{
                                                    fontSize:
                                                        "clamp(32px,5vw,70px)",
                                                    fontWeight: 400,
                                                    letterSpacing: "-.05em",
                                                    marginBottom: 22,
                                                }}
                                            >
                                                {awards[slide].title}
                                            </h1>
                                            <p
                                                style={{
                                                    fontSize: 15,
                                                    color: muted,
                                                    lineHeight: 1.8,
                                                }}
                                            >
                                                {awards[slide].description}
                                            </p>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: 12,
                                                    marginTop: 30,
                                                }}
                                            >
                                                <button
                                                    disabled={slide === 0}
                                                    onClick={() => advance(-1)}
                                                    style={{
                                                        ...button,
                                                        opacity:
                                                            slide === 0
                                                                ? 0.35
                                                                : 1,
                                                    }}
                                                >
                                                    Previous
                                                </button>
                                                <button
                                                    disabled={
                                                        slide ===
                                                        awards.length - 1
                                                    }
                                                    onClick={() => advance(1)}
                                                    style={{
                                                        ...button,
                                                        opacity:
                                                            slide ===
                                                            awards.length - 1
                                                                ? 0.35
                                                                : 1,
                                                    }}
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                        {photo(
                                            awards[slide].image,
                                            "Achievement photo",
                                            { height: "40vh", borderRadius: 20 }
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: 6,
                                        marginTop: 28,
                                    }}
                                >
                                    {awards.map((a, i) => (
                                        <button
                                            aria-label={
                                                "Achievement " + (i + 1)
                                            }
                                            key={i}
                                            onClick={() => setSlide(i)}
                                            style={{
                                                border: 0,
                                                height: 4,
                                                width: slide === i ? 48 : 20,
                                                padding: 0,
                                                borderRadius: 4,
                                                background:
                                                    slide === i ? accent : line,
                                                cursor: "pointer",
                                            }}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                        {tab === 3 && (
                            <div
                                className="rb-detail"
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1.2fr",
                                    gap: "7vw",
                                    alignItems: "center",
                                }}
                            >
                                <div>
                                    <p
                                        style={{
                                            fontSize: 10,
                                            letterSpacing: 3,
                                            color: accent,
                                            marginBottom: 24,
                                        }}
                                    >
                                        04 / MY FIRST HOME
                                    </p>
                                    <h1
                                        style={{
                                            fontSize: "clamp(38px,5vw,70px)",
                                            fontWeight: 400,
                                            letterSpacing: "-.05em",
                                            marginBottom: 25,
                                        }}
                                    >
                                        Where my
                                        <br />
                                        story began.
                                    </h1>
                                    <p
                                        style={{
                                            color: muted,
                                            fontSize: 15,
                                            lineHeight: 1.8,
                                        }}
                                    >
                                        The people who taught me how to dream,
                                        and gave me the courage to begin.
                                    </p>
                                </div>
                                <div>
                                    <div className="rb-parentphotos">
                                        {[
                                            {
                                                image: p.father,
                                                label: "Dad",
                                                message: p.dadMessage,
                                            },
                                            {
                                                image: p.mother,
                                                label: "Mom",
                                                message: p.momMessage,
                                            },
                                        ].map((parent, i) => (
                                            <motion.div
                                                key={parent.label}
                                                initial={
                                                    reduced
                                                        ? false
                                                        : { opacity: 0, y: 20 }
                                                }
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: i * 0.12,
                                                    duration: 0.5,
                                                }}
                                                style={{ minWidth: 0 }}
                                            >
                                                {photo(
                                                    parent.image,
                                                    parent.label + "’s photo",
                                                    {
                                                        height: "25vh",
                                                        borderRadius:
                                                            i === 0
                                                                ? "60px 12px 12px 12px"
                                                                : "12px 60px 12px 12px",
                                                    }
                                                )}
                                                <div
                                                    style={{
                                                        marginTop: 14,
                                                        padding: "16px 18px",
                                                        border:
                                                            "1px solid " + line,
                                                        borderRadius: 14,
                                                        background: dark
                                                            ? "#ffffff05"
                                                            : "#ffffff35",
                                                        minHeight: 110,
                                                    }}
                                                >
                                                    <h2
                                                        style={{
                                                            fontSize: 13,
                                                            fontWeight: 600,
                                                            marginBottom: 9,
                                                        }}
                                                    >
                                                        For {parent.label}
                                                    </h2>
                                                    <p
                                                        style={{
                                                            fontSize: 12,
                                                            lineHeight: 1.7,
                                                            color: muted,
                                                            whiteSpace:
                                                                "pre-wrap",
                                                            overflowWrap:
                                                                "anywhere",
                                                        }}
                                                    >
                                                        {parent.message ||
                                                            "Add your personal message here."}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <p
                                        style={{
                                            fontSize: 14,
                                            lineHeight: 1.8,
                                            color: muted,
                                            marginTop: 24,
                                        }}
                                    >
                                        {p.message}
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.section>
                </AnimatePresence>
            </main>
            <motion.div
                className="rb-cursor"
                aria-hidden
                style={{
                    position: "absolute",
                    left: cursorX,
                    top: cursorY,
                    zIndex: 30,
                    pointerEvents: "none",
                    opacity: cursor.visible ? 1 : 0,
                }}
            >
                <motion.div
                    animate={{
                        width: cursor.clickable ? 58 : 13,
                        height: cursor.clickable ? 34 : 13,
                        borderRadius: cursor.clickable ? 10 : 4,
                        scale: cursor.down ? 0.84 : 1,
                        backgroundColor: cursor.clickable
                            ? dark
                                ? "#edf0f5"
                                : "#252a32"
                            : dark
                            ? "#dce1eb"
                            : "#303744",
                    }}
                    transition={
                        reduced
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 450, damping: 30 }
                    }
                    style={{
                        position: "absolute",
                        x: "-50%",
                        y: "-50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 12px #0003",
                        border:
                            "1px solid " + (dark ? "#ffffff55" : "#00000022"),
                        overflow: "hidden",
                    }}
                >
                    <motion.span
                        animate={{ opacity: cursor.clickable ? 1 : 0 }}
                        transition={{ duration: 0.12 }}
                        style={{
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: ".03em",
                            color: dark ? "#171a20" : "#f4f6f9",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {cursor.flip ? "Flip" : "Open"}
                    </motion.span>
                </motion.div>
            </motion.div>
            <footer className="rb-footer">
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <span
                        style={{
                            width: 5,
                            height: 5,
                            borderRadius: 10,
                            background: accent,
                        }}
                    />
                    CREATIVE PORTFOLIO{" "}
                    <span className="rb-hide">/ CRAFTED WITH PASSION</span>
                </div>
                <span>
                    {tab === 1
                        ? "CLICK A CHAPTER TO EXPLORE"
                        : tab === 2
                        ? "SCROLL TO REVEAL THE NEXT MOMENT"
                        : "INTERACTIVE SPACE · CLICK ANYWHERE"}
                </span>
                <span className="rb-hide">
                    0{tab + 1} <span style={{ opacity: 0.35 }}>/ 04</span>
                </span>
            </footer>
            <AnimatePresence>
                {intro && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        transition={{ duration: 0.7 }}
                        style={{
                            position: "absolute",
                            inset: 0,
                            zIndex: 20,
                            display: "grid",
                            placeItems: "center",
                            background: "#080808",
                            overflow: "hidden",
                        }}
                    >
                        <motion.div
                            initial={{
                                opacity: 0,
                                scale: 0.65,
                                filter: "blur(18px)",
                            }}
                            animate={{
                                opacity: [0, 1, 1, 0],
                                scale: reduced
                                    ? [1, 1, 1, 1]
                                    : [0.65, 1, 1.03, 3],
                                filter: [
                                    "blur(18px)",
                                    "blur(0px)",
                                    "blur(0px)",
                                    "blur(10px)",
                                ],
                            }}
                            transition={{
                                duration: 2.6,
                                times: [0, 0.3, 0.7, 1],
                            }}
                            style={{
                                color: "#e5e8ef",
                                fontSize: "clamp(90px,20vw,260px)",
                                letterSpacing: "-.06em",
                                fontWeight: 800,
                                textShadow: "0 0 50px #d0d8ea55",
                            }}
                        >
                            R.B
                        </motion.div>
                        <button
                            onClick={() => setIntro(false)}
                            style={{
                                ...button,
                                position: "absolute",
                                bottom: 35,
                                color: "#aaa",
                                borderColor: "#ffffff30",
                            }}
                        >
                            Skip intro
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

Portfolio.defaultProps = {
    backPortrait:
        "https://framerusercontent.com/images/D2DWlXmFFxkAwC8CwY3F6gShkuI.png?width=2048&height=2048&kb=1775",
    dadMessage:
        "Dad, thank you for your guidance, strength, and for always believing in me.",
    momMessage:
        "Mom, thank you for your love, patience, and for making every day feel like home.",
    name: "R.B",
    bio: "A curious mind, a growing collection of memories, and a whole lot of dreams. Welcome to my little corner of the internet.",
    information:
        "This is my story, told my way. Add your interests, personality, favorite things, and the details that make you, you.",
    past: "Every story starts somewhere. Share your childhood memories, the places you grew up, and the moments that shaped you.",
    present:
        "Here’s where I am today. Share what you’re studying, exploring, creating, and learning right now.",
    future: "There’s so much still to come. Write about your dreams, goals, and the person you’re working to become.",
    message:
        "To my parents — thank you for your patience, your love, and for believing in me. Everything I am becoming carries a little piece of you.",
    facts: "Here’s a byte-sized fact: one byte contains 8 bits. Each bit can represent a 0 or a 1. | I use RAM as a computer’s short-term workspace. Its contents are usually lost when the power is turned off. | An SSD stores data in flash memory, so it doesn’t need the spinning disks found in a hard disk drive. | The internet and the Web aren’t the same thing! The internet connects networks; the Web is one service that runs on it. | DNS is like an address book for the internet. It translates domain names into IP addresses. | A CPU executes instructions, while a GPU is designed to handle many operations in parallel. | Multi-factor authentication adds another layer of protection beyond a password, such as an authenticator app or security key. | A backup is a separate copy of your data. Syncing files alone isn’t always a backup, because deletions can sync too.",
    achievements: [
        {
            title: "A moment to be proud of.",
            year: "YOUR FIRST MILESTONE",
            description:
                "Add your award, school achievement, certificate, or a personal victory. Every step forward deserves a place in your story.",
        },
        {
            title: "One step further.",
            year: "YOUR NEXT CHAPTER",
            description:
                "Tell the story behind another accomplishment — the effort, the lesson, and what it meant to you.",
        },
    ],
}