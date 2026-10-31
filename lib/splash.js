/**
 * AEGIS boot animation — a standalone splash plugin for DeepSeek Harness.
 *
 * Self-contained: styles, markup, canvas backdrop, WebAudio cues and speech
 * are all created here. The host only appends this script to the page body.
 * It does not depend on any theme package and carries no theme code.
 */
(() => {
  'use strict'

  const ID = 'deepseek-boot'

  const CFG = Object.assign({
    name: 'DEEPSEEK CORE',
    subtitle: 'AEGIS TERMINAL · 2026',
    welcome: 'ADMINISTRATOR',
    passcode: 'show me the money',
    theme: 'holo',
    voice: true,
  }, globalThis.__AEGIS_BOOT__ || {}, (() => {
    try {
      const raw = globalThis.localStorage?.getItem('aegis-boot:config')
      const parsed = raw ? JSON.parse(raw) : null
      return parsed !== null && typeof parsed === 'object' ? parsed : {}
    } catch (_) { return {} }
  })())

  // Colour schemes are pure CSS overrides on top of the holographic base.
  const PALETTES = {
    umbrella: `
#${ID}{background:radial-gradient(125% 95% at 50% 40%,#1a0507 0%,#080304 56%,#050102 100%);color:#f2d8d5}
#${ID} .ub-glow{background:radial-gradient(circle,rgba(255,60,70,.22),rgba(255,60,70,.06) 42%,transparent 68%)}
#${ID} .ub-grid{background-image:linear-gradient(rgba(255,80,80,.16) 1px,transparent 1px),linear-gradient(90deg,rgba(255,80,80,.16) 1px,transparent 1px)}
#${ID} .ub-title{color:#ffeceb;text-shadow:0 0 28px rgba(255,70,90,.6)}
#${ID} .ub-sub{color:#a06a6f}
#${ID} .ub-panel,#${ID} .ub-hud{border-color:rgba(255,70,90,.22);background:rgba(26,8,10,.55)}
#${ID} .ub-line{color:#f2d8d5}
#${ID} .ub-line i{color:#a06266}
#${ID} .ub-line strong{color:#fff2f0}
#${ID} .ub-cmd-prompt,#${ID} .ub-cmd-hint.is-good{color:#ff8e99}
#${ID} .ub-cmd-input{color:#fff2f0;caret-color:#ff8e99}
#${ID} .ub-progress i{background:linear-gradient(90deg,#7a0c14,#ff8e99)}
#${ID} .ub-hud-hd{color:#ff9aa4}
#${ID} .ub-hud-row b{color:#ffeceb}
#${ID} .ub-hud-row b.ok{color:#ff8e99}
#${ID} .ub-bars i{background:linear-gradient(180deg,#ff6b7a,rgba(255,60,80,.12))}
#${ID} .ub-glyphs{filter:hue-rotate(-150deg) saturate(1.15)}
#${ID} .ub-shield-body{stroke:#ffd0d0}
#ubShieldFill stop:nth-child(1){stop-color:#ffd6d6}
#ubShieldFill stop:nth-child(2){stop-color:#c8102e}
#ubShieldFill stop:nth-child(3){stop-color:#3d0710}
`,
    white: `
#${ID}{background:radial-gradient(125% 95% at 50% 40%,#faf7f2 0%,#f0ece5 60%,#e8e2d9 100%);color:#3a2a28}
#${ID} .ub-glow{background:radial-gradient(circle,rgba(200,16,46,.1),transparent 70%)}
#${ID} .ub-grid{background-image:linear-gradient(rgba(200,16,46,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(200,16,46,.1) 1px,transparent 1px)}
#${ID} .ub-title{color:#1d1315;text-shadow:0 0 18px rgba(200,16,46,.22)}
#${ID} .ub-sub{color:#8a6b66}
#${ID} .ub-panel,#${ID} .ub-hud{border-color:rgba(200,16,46,.22);background:rgba(255,255,255,.62)}
#${ID} .ub-line{color:#3a2a28}
#${ID} .ub-line i{color:#a08a86}
#${ID} .ub-line strong{color:#1a0f11}
#${ID} .ub-cmd-input{color:#1a0f11;caret-color:#c8102e}
#${ID} .ub-cmd-prompt,#${ID} .ub-cmd-hint.is-good{color:#c8102e}
#${ID} .ub-progress i{background:linear-gradient(90deg,#c8102e,#ff8e99)}
#${ID} .ub-hud-hd{color:#c8102e}
#${ID} .ub-hud-row b{color:#1a0f11}
#${ID} .ub-hud-row b.ok{color:#c8102e}
#${ID} .ub-bars i{background:linear-gradient(180deg,#c8102e,rgba(200,16,46,.12))}
#${ID} .ub-glyphs{filter:invert(1) hue-rotate(180deg);opacity:.35}
#${ID} .ub-welcome{background:radial-gradient(ellipse at 50% 50%,rgba(250,247,242,.97),rgba(232,226,217,.99) 70%)}
#${ID} .ub-welcome-name{color:#1a0f11;text-shadow:none}
#${ID} .ub-welcome-line{color:#c8102e}
#${ID} .ub-welcome-sub{color:#8a6b66}
#${ID} .ub-foot{color:#8a6b66}
#${ID} .ub-user{color:#8a6b66}
#${ID} .ub-user b{color:#1a0f11}
#${ID} .ub-cmd-hint{color:#8a6b66}
#${ID} .ub-sound{color:#8a6b66}
#${ID} .ub-sound.is-off{color:#b9a8a2}
#${ID} .ub-hud-code{color:#a08a86}
#${ID} .ub-progress{background:rgba(200,16,46,.14)}
#${ID} .ub-shield-body{stroke:#c8102e}
#ubShieldFill stop:nth-child(1){stop-color:#ffffff}
#ubShieldFill stop:nth-child(2){stop-color:#e8b4b8}
#ubShieldFill stop:nth-child(3){stop-color:#9c2333}
`,
  }

  const doc = document
  if (!doc.body || doc.getElementById(ID)) return

  const cfg = Object.assign(
    { enabled: true, skippable: true, replayOnReload: false, duration: 12000 },
    globalThis.__AEGIS_BOOT__ || {},
  )
  if (cfg.enabled === false) return

  const PLAYED_KEY = 'deepseek-boot:played'
  if (!cfg.replayOnReload) {
    try {
      if (sessionStorage.getItem(PLAYED_KEY)) return
      sessionStorage.setItem(PLAYED_KEY, String(Date.now()))
    } catch (_) { /* storage blocked: play every time */ }
  }

  const matches = (query) => {
    try { return matchMedia(query).matches } catch (_) { return false }
  }
  const reduced = matches('(prefers-reduced-motion: reduce)')

  const PASSCODE = String(CFG.passcode || 'show me the money').trim().toLowerCase()

  // ---------------------------------------------------------------- styling

  const style = doc.createElement('style')
  style.textContent = `
#${ID}{position:fixed;inset:0;z-index:2147483647;background:radial-gradient(125% 95% at 50% 40%,#0a1622 0%,#050810 56%,#03050a 100%);color:#dbe7f3;font-family:"Segoe UI",system-ui,-apple-system,"Microsoft YaHei",sans-serif;overflow:hidden;cursor:default;user-select:none;-webkit-user-select:none}
#${ID} *{box-sizing:border-box}
#${ID} .ub-bg{position:absolute;inset:0;overflow:hidden;pointer-events:none}
#${ID} .ub-glow{position:absolute;left:50%;top:38%;width:820px;height:820px;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(86,196,255,.22),rgba(86,196,255,.06) 42%,transparent 68%);animation:ub-breathe 7.5s ease-in-out infinite}
#${ID} .ub-grid{position:absolute;left:-25%;right:-25%;bottom:-12%;height:64%;background-image:linear-gradient(rgba(96,196,255,.16) 1px,transparent 1px),linear-gradient(90deg,rgba(96,196,255,.16) 1px,transparent 1px);background-size:72px 72px;transform:perspective(430px) rotateX(66deg);transform-origin:50% 100%;mask-image:linear-gradient(180deg,transparent,#000 42%,#000 74%,transparent)}
#${ID} .ub-particles{position:absolute;inset:0}
#${ID} .ub-particles i{position:absolute;width:2px;height:2px;border-radius:50%;background:#a8ecff;box-shadow:0 0 8px rgba(120,220,255,.95);opacity:.6;animation:ub-drift linear infinite}
#${ID} .ub-stage{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;padding:4vh 5vw;opacity:0;transition:opacity .45s ease}
#${ID}.is-booted .ub-stage{opacity:1}
#${ID} .ub-shieldbox{position:relative;width:178px;height:192px;display:grid;place-items:center}
#${ID} .ub-shield-svg{width:100%;height:100%;overflow:visible;filter:drop-shadow(0 0 24px rgba(90,190,255,.5)) drop-shadow(0 0 70px rgba(60,140,220,.25))}
#${ID} .ub-shield-body{fill:url(#ubShieldFill);stroke:#dff6ff;stroke-width:3.5;stroke-linejoin:round;animation:ub-shield-in .9s cubic-bezier(.2,.85,.25,1) both}
#${ID} .ub-shield-inner{fill:none;stroke:rgba(220,246,255,.5);stroke-width:1.6;stroke-linejoin:round;opacity:0;animation:ub-fade-in 1s ease .4s both}
#${ID} .ub-check{fill:none;stroke:#f2fdff;stroke-width:10;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:130;stroke-dashoffset:130;animation:ub-draw 1s ease .55s forwards;filter:drop-shadow(0 0 12px rgba(150,235,255,.9))}
@keyframes ub-shield-in{0%{opacity:0;transform:scale(.86) translateY(8px)}100%{opacity:1;transform:scale(1) translateY(0)}}
@keyframes ub-fade-in{from{opacity:0}to{opacity:1}}
@keyframes ub-draw{to{stroke-dashoffset:0}}
#${ID} .ub-title{margin-top:10px;font-size:31px;font-weight:300;letter-spacing:.52em;color:#edf8ff;text-shadow:0 0 28px rgba(126,216,255,.6)}
#${ID} .ub-sub{font-size:9.5px;letter-spacing:.56em;color:#63809a;text-transform:uppercase}
#${ID} .ub-panel{width:min(780px,88vw);min-height:160px;margin-top:6px;padding:20px 24px;border:1px solid rgba(126,216,255,.16);border-radius:14px;background:rgba(11,19,29,.52);backdrop-filter:blur(14px);box-shadow:0 34px 90px -46px rgba(0,0,0,.95),inset 0 1px 0 rgba(200,240,255,.07);transition:border-color .35s ease,box-shadow .35s ease}
#${ID} .ub-lines{font-family:"SF Mono",Menlo,Consolas,monospace;font-size:12px;line-height:1.95;color:#b6ccdf;letter-spacing:.04em}
#${ID} .ub-line{opacity:0;white-space:pre-wrap}
#${ID} .ub-line.is-on{opacity:1}
#${ID} .ub-line i{color:#5f7f99;font-style:normal}
#${ID} .ub-line strong{color:#eaf8ff;font-weight:500}
#${ID} .ub-cmd{display:none;align-items:center;gap:12px;margin-top:16px;padding-top:14px;border-top:1px solid rgba(126,216,255,.14)}
#${ID}.is-command .ub-cmd{display:flex}
#${ID} .ub-cmd-prompt{color:#8fe8ff;font-size:14px;text-shadow:0 0 12px rgba(126,216,255,.8)}
#${ID} .ub-cmd-input{flex:1;min-width:0;background:transparent;border:0;outline:none;color:#f2fbff;font-family:"SF Mono",Menlo,Consolas,monospace;font-size:14px;letter-spacing:.1em;caret-color:#8fe8ff;-webkit-user-select:text;user-select:text}
#${ID} .ub-cmd-input::placeholder{color:#4d6478;font-size:11.5px;letter-spacing:.18em}
#${ID} .ub-cmd-hint{margin-top:10px;font-size:10px;letter-spacing:.22em;color:#5f7f99;min-height:14px}
#${ID} .ub-cmd-hint.is-bad{color:#ff6b7f}
#${ID} .ub-cmd-hint.is-good{color:#9ff0ff}
#${ID} .ub-progress{width:min(780px,88vw);height:2px;border-radius:2px;background:rgba(126,216,255,.12);overflow:hidden}
#${ID} .ub-progress i{display:block;height:100%;width:0;background:linear-gradient(90deg,#2f7fa8,#9ff0ff);box-shadow:0 0 14px rgba(126,216,255,.75);transition:width .6s ease}
#${ID} .ub-row{display:flex;align-items:stretch;gap:20px;width:min(1040px,92vw)}
#${ID} .ub-panel{flex:1 1 auto;min-width:0;min-height:158px;margin-top:0;padding:20px 24px;border:1px solid rgba(126,216,255,.16);border-radius:14px;background:rgba(11,19,29,.52);backdrop-filter:blur(14px);box-shadow:0 34px 90px -46px rgba(0,0,0,.95),inset 0 1px 0 rgba(200,240,255,.07);transition:border-color .35s ease,box-shadow .35s ease}
#${ID} .ub-hud{flex:0 0 218px;display:flex;flex-direction:column;gap:9px;padding:18px 20px;border:1px solid rgba(126,216,255,.16);border-radius:14px;background:rgba(11,19,29,.52);backdrop-filter:blur(14px);font-size:9px;letter-spacing:.2em;color:#5f7f99}
#${ID} .ub-hud-hd{color:#9fe8ff;letter-spacing:.26em;font-size:9px}
#${ID} .ub-bars{display:flex;align-items:flex-end;gap:3px;height:46px;margin:2px 0 6px}
#${ID} .ub-bars i{flex:1;height:20%;background:linear-gradient(180deg,#9ff0ff,rgba(120,220,255,.12));animation:ub-bar 1.6s ease-in-out infinite}
#${ID} .ub-hud-row{display:flex;justify-content:space-between;gap:8px;white-space:nowrap}
#${ID} .ub-hud-row b{color:#e6f6ff;font-weight:500}
#${ID} .ub-hud-row b.ok{color:#8fe8ff}
#${ID} .ub-hud-rot{display:flex;justify-content:center;margin:2px 0 0}
#${ID} .ub-hud-rot svg{width:70px;height:70px;transform-box:view-box;transform-origin:40px 40px;animation:ub-rot 16s linear infinite}
#${ID} .ub-hud-code{color:#40566a;margin-top:auto}
@keyframes ub-bar{0%,100%{height:18%}50%{height:92%}}
#${ID} .ub-stagescan{position:absolute;left:0;right:0;height:1px;z-index:3;pointer-events:none;background:linear-gradient(90deg,transparent,rgba(160,240,255,.55),transparent);box-shadow:0 0 22px rgba(120,220,255,.45);animation:ub-stagescan 7.5s linear infinite}
@keyframes ub-stagescan{0%{top:-2%;opacity:0}8%{opacity:.85}92%{opacity:.85}100%{top:102%;opacity:0}}
#${ID} .ub-panel{position:relative;overflow:hidden}
#${ID} .ub-fx{position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(115deg,rgba(126,216,255,.06) 0 2px,transparent 2px 9px);animation:ub-fx 5.5s linear infinite}
@keyframes ub-fx{to{background-position:90px 0}}
#${ID} .ub-panel-scan{position:absolute;left:0;right:0;height:1px;pointer-events:none;background:linear-gradient(90deg,transparent,rgba(160,240,255,.8),transparent);box-shadow:0 0 16px rgba(120,220,255,.6);animation:ub-panel-scan 4.6s ease-in-out infinite}
@keyframes ub-panel-scan{0%{top:-2%;opacity:0}14%{opacity:.9}86%{opacity:.9}100%{top:102%;opacity:0}}
#${ID} .ub-hud-rot{position:relative}
#${ID} .ub-radar{position:absolute;left:50%;top:50%;width:64px;height:64px;margin:-32px;border-radius:50%;pointer-events:none;background:conic-gradient(from 0deg,rgba(150,235,255,.42),transparent 70deg);mask:radial-gradient(closest-side,#000 97%,transparent 100%);animation:ub-rot 3.4s linear infinite}
#${ID} .ub-ticker{width:min(1040px,92vw);overflow:hidden;white-space:nowrap;font-size:8px;letter-spacing:.32em;color:#3f5f75;mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
#${ID} .ub-ticker-run{display:flex;gap:90px;width:max-content;animation:ub-ticker 34s linear infinite}
@keyframes ub-ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
#${ID} .ub-user{display:none;align-items:center;gap:14px;margin-top:16px;padding-top:12px;border-top:1px solid rgba(126,216,255,.12);font-size:9.5px;letter-spacing:.26em;color:#5f7f99}
#${ID}.is-command .ub-user{display:flex}
#${ID} .ub-user b{color:#e6f6ff;font-weight:500;letter-spacing:.3em}
#${ID}.is-verifying .ub-panel{border-color:rgba(159,240,255,.5);animation:ub-verify-pulse 1.2s ease-in-out infinite}
@keyframes ub-verify-pulse{0%,100%{box-shadow:0 0 0 1px rgba(159,240,255,.1),0 34px 90px -46px rgba(0,0,0,.95)}50%{box-shadow:0 0 0 2px rgba(159,240,255,.3),0 34px 90px -46px rgba(0,0,0,.95)}}
#${ID} .ub-glyphs{position:absolute;inset:0;width:100%;height:100%;opacity:.55;pointer-events:none;mask-image:radial-gradient(ellipse at 50% 46%,#000 26%,rgba(0,0,0,.4) 68%,transparent 92%)}
#${ID} .ub-orbitring{position:absolute;left:50%;top:50%;width:230px;height:230px;margin:-115px 0 0 -115px;overflow:visible;pointer-events:none;animation:ub-rot 22s linear infinite}
#${ID} .ub-orbitring .ub-ring-a2{fill:none;stroke:rgba(150,232,255,.45);stroke-width:1.2;stroke-dasharray:3 12}
#${ID} .ub-orbitring .ub-ring-b2{fill:none;stroke:rgba(150,232,255,.22);stroke-width:1;stroke-dasharray:52 200;animation:ub-rot-rev 30s linear infinite;transform-box:view-box;transform-origin:100px 100px}
@keyframes ub-rot-rev{to{transform:rotate(-360deg)}}
#${ID} .ub-lines{display:flex;flex-direction:column;justify-content:flex-end;max-height:172px;overflow:hidden}
#${ID} .ub-line.is-live{animation:ub-line-in .34s ease both}
@keyframes ub-line-in{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
#${ID} .ub-foot{position:absolute;left:0;right:0;bottom:22px;display:flex;justify-content:space-between;padding:0 34px;font-size:9px;letter-spacing:.3em;color:#40566a;pointer-events:none;z-index:7}
#${ID} .ub-sound{pointer-events:auto;cursor:pointer;color:#6f95b0}
#${ID} .ub-sound.is-off{color:#40566a}
#${ID}.is-shake .ub-panel{animation:ub-shake .34s ease}
#${ID}.is-warn .ub-panel{border-color:rgba(255,80,104,.55);box-shadow:0 0 0 1px rgba(255,80,104,.2),0 34px 90px -46px rgba(0,0,0,.95)}
#${ID} .ub-alarm{position:absolute;inset:0;z-index:8;display:grid;place-items:center;opacity:0;pointer-events:none;background:radial-gradient(ellipse at 50% 50%,rgba(255,40,66,.2),rgba(30,2,8,.9) 66%,#0a0004)}
#${ID} .ub-alarm:before{content:"";position:absolute;inset:0;box-shadow:inset 0 0 120px 30px rgba(255,40,66,.55)}
#${ID}.is-alarm .ub-alarm{animation:ub-alarm 2.4s ease-out}
#${ID} .ub-alarm-in{text-align:center}
#${ID} .ub-alarm-t{font-size:34px;font-weight:300;letter-spacing:.42em;color:#fff;text-shadow:0 0 30px rgba(255,60,90,.9)}
#${ID} .ub-alarm-s{margin-top:16px;font-size:11px;letter-spacing:.36em;color:#ffb0bc}
#${ID} .ub-flash{position:absolute;inset:0;z-index:7;pointer-events:none;background:#f4fbff;opacity:0;mix-blend-mode:screen}
#${ID}.is-flash .ub-flash{animation:ub-flash .62s ease-out}
@keyframes ub-flash{0%{opacity:.92}100%{opacity:0}}
#${ID} .ub-welcome{position:absolute;inset:0;z-index:9;display:grid;place-items:center;opacity:0;pointer-events:none;transition:opacity .6s ease;background:radial-gradient(ellipse at 50% 50%,rgba(8,22,34,.972),rgba(3,6,10,.994) 70%)}
#${ID}.is-welcome .ub-welcome{opacity:1}
#${ID}.is-welcome .ub-stage{opacity:.08;transition:opacity .6s ease}
#${ID} .ub-welcome-in{text-align:center;animation:ub-rise .95s cubic-bezier(.2,.85,.25,1) both}
#${ID} .ub-welcome-line{font-size:11px;letter-spacing:.62em;color:#8fe8ff}
#${ID} .ub-welcome-name{margin-top:18px;font-size:46px;font-weight:200;letter-spacing:.28em;color:#f4fcff;text-shadow:0 0 40px rgba(126,216,255,.65)}
#${ID} .ub-welcome-sub{margin-top:22px;font-size:10px;letter-spacing:.34em;color:#6f95b0}
#${ID} .ub-welcome-time{color:#a8e9ff}
#${ID}.is-off{animation:ub-crt-off .8s cubic-bezier(.7,0,.3,1) forwards;transform-origin:50% 50%}
@keyframes ub-crt-off{0%,28%{transform:scale(1,1);filter:brightness(1)}52%{transform:scale(1.02,.05);filter:brightness(2.6)}74%{transform:scale(.6,.013);filter:brightness(3.4)}100%{transform:scale(0,.004);filter:brightness(0);opacity:0}}
@keyframes ub-breathe{0%,100%{opacity:.75;transform:translate(-50%,-50%) scale(.97)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.04)}}
@keyframes ub-drift{0%{transform:translate3d(0,0,0);opacity:0}12%{opacity:.7}88%{opacity:.6}100%{transform:translate3d(0,-140px,0);opacity:0}}
@keyframes ub-rot{to{transform:rotate(360deg)}}
@keyframes ub-nebula-spin{to{transform:rotate(360deg)}}
@keyframes ub-core-pulse{0%,100%{transform:scale(.97);opacity:.92}50%{transform:scale(1.04);opacity:1}}
@keyframes ub-sheen{0%,100%{opacity:.1;transform:translate(-6px,0)}50%{opacity:.5;transform:translate(6px,0)}}
@keyframes ub-rise{0%{opacity:0;transform:translateY(22px)}100%{opacity:1;transform:translateY(0)}}
@keyframes ub-alarm{0%{opacity:.95}9%{opacity:.28}18%{opacity:.95}27%{opacity:.28}36%{opacity:.95}45%{opacity:.3}54%{opacity:.9}76%{opacity:.9}100%{opacity:0}}
@keyframes ub-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}60%{transform:translateX(6px)}}
@media (max-width:760px){#${ID} .ub-title{font-size:20px}#${ID} .ub-panel{padding:16px 18px}}
`

  if (PALETTES[CFG.theme]) style.textContent += PALETTES[CFG.theme]

  const root = doc.createElement('div')
  root.id = ID
  root.innerHTML = `
  <canvas class="ub-glyphs" aria-hidden="true"></canvas>
  <div class="ub-bg"><div class="ub-glow"></div><div class="ub-grid"></div><div class="ub-particles"></div></div>
  <div class="ub-stage">
    <div class="ub-shieldbox">
      <svg class="ub-orbitring" viewBox="0 0 200 200" aria-hidden="true"><circle class="ub-ring-a2" cx="100" cy="100" r="96"></circle><circle class="ub-ring-b2" cx="100" cy="100" r="104"></circle></svg>
      <svg class="ub-shield-svg" viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <linearGradient id="ubShieldFill" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stop-color="#e4edf6"></stop>
            <stop offset="46%" stop-color="#8aa4bd"></stop>
            <stop offset="100%" stop-color="#2b3d52"></stop>
          </linearGradient>
        </defs>
        <path class="ub-shield-body" d="M100 10L172 36L172 104C172 146 140 176 100 192C60 176 28 146 28 104L28 36Z"></path>
        <path class="ub-check" pathLength="130" d="M64 100L88 126L138 72"></path>
      </svg>
    </div>
    <div class="ub-title"></div>
    <div class="ub-sub"></div>
    <div class="ub-row">
      <div class="ub-panel">
        <div class="ub-lines"></div>
        <div class="ub-user"><span>USER</span><b>COMMANDER</b></div>
        <form class="ub-cmd" autocomplete="off">
          <span class="ub-cmd-prompt">PASSCODE</span>
          <input class="ub-cmd-input" type="text" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="输入口令后回车" />
        </form>
        <div class="ub-cmd-hint"></div>
      </div>
      <aside class="ub-hud">
        <div class="ub-hud-hd">AEGIS // DIAGNOSTICS</div>
        <div class="ub-bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <div class="ub-hud-row"><span>SECURITY</span><b>LEVEL 4</b></div>
        <div class="ub-hud-row"><span>CONTAINMENT</span><b class="ok">NOMINAL</b></div>
        <div class="ub-hud-row"><span>NEURAL LINK</span><b class="ok ub-hud-link">98%</b></div>
        <div class="ub-hud-row"><span>CORE TEMP</span><b class="ub-hud-temp">36.4°C</b></div>
        <div class="ub-hud-rot">
          <span class="ub-radar"></span>
          <svg viewBox="0 0 80 80" aria-hidden="true">
            <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(140,225,255,.28)" stroke-width="1" stroke-dasharray="4 6"></circle>
            <circle cx="40" cy="40" r="22" fill="none" stroke="rgba(140,225,255,.65)" stroke-width="2" stroke-dasharray="26 12"></circle>
          </svg>
        </div>
        <div class="ub-hud-code">AEGIS-01 / DS-7742</div>
      </aside>
    </div>
    <div class="ub-progress"><i></i></div>
  </div>
  <div class="ub-flash"></div>
  <div class="ub-alarm">
    <div class="ub-alarm-in">
      <div class="ub-alarm-t">ACCESS DENIED</div>
      <div class="ub-alarm-s">INTRUSION COUNTERMEASURES ACTIVE</div>
    </div>
  </div>
  <div class="ub-welcome">
    <div class="ub-welcome-in">
      <div class="ub-welcome-line">WELCOME BACK</div>
      <div class="ub-welcome-name"></div>
      <div class="ub-welcome-sub">AEGIS 已就绪 · 系统时间 <span class="ub-welcome-time"></span></div>
    </div>
  </div>
  <div class="ub-foot"><span>DEEPSEEK CORE // AEGIS v2.9</span><span class="ub-sound">♪ SOUND ON</span></div>`

  // Deterministic particle field.
  const particleHost = root.querySelector('.ub-particles')
  for (let i = 0; i < 26; i += 1) {
    const dot = doc.createElement('i')
    const seed = (i * 7919) % 100
    const seed2 = (i * 104729) % 100
    dot.style.left = seed + '%'
    dot.style.top = 32 + (seed2 % 62) + '%'
    dot.style.animationDuration = (9 + (i % 7) * 2.4).toFixed(1) + 's'
    dot.style.animationDelay = (-(i % 11) * 1.3).toFixed(1) + 's'
    dot.style.opacity = (0.25 + (i % 5) * 0.14).toFixed(2)
    particleHost.appendChild(dot)
  }

  // ----------------------------------------------------------------- sound

  const sound = (() => {
    let ctx = null
    let master = null
    let hum = null
    let muted = false

    const ensure = () => {
      if (muted) return null
      if (ctx === null) {
        const AC = globalThis.AudioContext || globalThis.webkitAudioContext
        if (typeof AC !== 'function') return null
        try { ctx = new AC() } catch (_) { return null }
        master = ctx.createGain()
        master.gain.value = 0.5
        master.connect(ctx.destination)
      }
      if (ctx.state === 'suspended') ctx.resume().catch(() => {})
      return ctx
    }
    const now = () => (ctx === null ? 0 : ctx.currentTime)

    const tone = (freq, duration, options = {}) => {
      const ac = ensure()
      if (ac === null) return
      const type = options.type || 'sine'
      const gain = options.gain === undefined ? 0.1 : options.gain
      const from = options.from === undefined ? freq * 0.92 : options.from
      const at = now() + (options.delay || 0)
      const osc = ac.createOscillator()
      const env = ac.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(from, at)
      osc.frequency.exponentialRampToValueAtTime(Math.max(freq, 20), at + duration * 0.85)
      env.gain.setValueAtTime(0.0001, at)
      env.gain.exponentialRampToValueAtTime(gain, at + 0.02)
      env.gain.exponentialRampToValueAtTime(0.0001, at + duration)
      osc.connect(env)
      env.connect(master)
      osc.start(at)
      osc.stop(at + duration + 0.05)
    }

    const noise = (duration = 0.18, gain = 0.08, filterHz = 1800) => {
      const ac = ensure()
      if (ac === null) return
      const frames = Math.max(1, Math.floor(ac.sampleRate * duration))
      const buffer = ac.createBuffer(1, frames, ac.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < frames; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
      const src = ac.createBufferSource()
      src.buffer = buffer
      const filter = ac.createBiquadFilter()
      filter.type = 'bandpass'
      filter.frequency.value = filterHz
      const env = ac.createGain()
      env.gain.value = gain
      src.connect(filter)
      filter.connect(env)
      env.connect(master)
      src.start()
    }

    const startHum = () => {
      const ac = ensure()
      if (ac === null || hum !== null) return
      hum = ac.createGain()
      hum.gain.value = 0.0001
      hum.connect(master)
      hum.gain.exponentialRampToValueAtTime(0.018, now() + 1.4)
      const low = ac.createOscillator()
      low.type = 'sine'
      low.frequency.value = 54
      const high = ac.createOscillator()
      high.type = 'triangle'
      high.frequency.value = 162
      const filter = ac.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 320
      low.connect(filter)
      high.connect(filter)
      filter.connect(hum)
      low.start()
      high.start()
      hum.oscillators = [low, high]
    }

    const stopHum = (fade = 0.5) => {
      if (hum === null) return
      try {
        hum.gain.cancelScheduledValues(now())
        hum.gain.setTargetAtTime(0.0001, now(), fade / 3)
        ;(hum.oscillators || []).forEach((osc) => osc.stop(now() + fade + 0.15))
      } catch (_) { /* already stopped */ }
      hum = null
    }

    /** Umbrella style two-tone klaxon: alternating high/low pulses. */
    const siren = () => {
      const ac = ensure()
      if (ac === null) return
      const t = now()
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      const filter = ac.createBiquadFilter()
      osc.type = 'square'
      filter.type = 'lowpass'
      filter.frequency.value = 1900
      for (let i = 0; i < 8; i += 1) {
        osc.frequency.setValueAtTime(i % 2 === 0 ? 520 : 790, t + 0.02 + i * 0.26)
      }
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.075, t + 0.05)
      gain.gain.setValueAtTime(0.075, t + 2.0)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.3)
      osc.connect(filter)
      filter.connect(gain)
      gain.connect(master)
      osc.start(t)
      osc.stop(t + 2.35)
      tone(62, 0.55, { type: 'sine', gain: 0.09, from: 118 })
      noise(0.45, 0.04, 720)
    }

    /** Short low buzz for a soft rejection — no siren. */
    const buzz = () => {
      tone(150, 0.28, { type: 'triangle', gain: 0.05, from: 235 })
      noise(0.16, 0.025, 520)
    }

    const powerDown = () => {
      tone(110, 0.7, { type: 'sine', gain: 0.1, from: 380 })
      noise(0.4, 0.04, 900)
    }

    const toggle = () => {
      muted = !muted
      if (muted) {
        stopHum(0.2)
        voice.cancelAll()
      }
      return !muted
    }

    const contextState = () => (ctx === null ? 'none' : ctx.state)

    return {
      ensure, tone, noise, startHum, stopHum, siren, powerDown, toggle, buzz,
      isMuted: () => muted,
      contextState,
    }
  })()

  // ----------------------------------------------------------------- voice

  const voice = (() => {
    const synth = globalThis.speechSynthesis
    const Utter = globalThis.SpeechSynthesisUtterance
    const PREFERRED = [/natural/i, /online \(natural\)/i, /zira/i, /sonia/i, /hazel/i, /aria/i, /jenny/i, /samantha/i, /susan/i, /libby/i, /google uk english female/i]
    let voices = []
    let ready = false
    let spoke = false
    let queue = []
    let playing = false
    let flushTimer = 0

    const pickVoice = () => {
      if (voices.length === 0) return null
      for (const pattern of PREFERRED) {
        const hit = voices.find((v) => pattern.test(v.name))
        if (hit) return hit
      }
      const english = voices.filter((v) => v.lang && v.lang.toLowerCase().indexOf('en') === 0)
      return english.find((v) => /female|woman|girl/i.test(v.name)) || english[0] || null
    }

    const build = (item) => {
      const u = new Utter(item.text)
      u.lang = 'en-US'
      u.pitch = item.options.pitch === undefined ? 1.45 : item.options.pitch
      u.rate = item.options.rate === undefined ? 0.95 : item.options.rate
      u.volume = item.options.volume === undefined ? 1 : item.options.volume
      const chosen = pickVoice()
      if (chosen) u.voice = chosen
      return u
    }

    // One line at a time. A watchdog covers engines that never fire `end`,
    // and a single retry covers a first utterance that the platform drops
    // while the renderer is still warming up.
    const pump = () => {
      if (playing || queue.length === 0) return
      if (!synth || typeof Utter !== 'function' || sound.isMuted()) { queue = []; return }
      if (!doc.getElementById(ID)) { queue = []; return }
      const item = queue.shift()
      let done = false
      let retried = false
      const watchdog = setTimeout(() => finish(), 1500 + item.text.length * 110)

      const finish = () => {
        if (done) return
        done = true
        clearTimeout(watchdog)
        playing = false
        setTimeout(pump, 140)
      }

      const start = () => {
        if (done) return
        const utterance = build(item)
        utterance.onend = finish
        utterance.onerror = () => {
          if (!retried) {
            retried = true
            setTimeout(start, 220)
            return
          }
          finish()
        }
        playing = true
        spoke = true
        try {
          synth.speak(utterance)
        } catch (_) {
          finish()
          return
        }
        // No retry here: a finished line also reports speaking === false, so
        // retrying on that signal replayed the cue a second time.
      }

      start()
    }

    const refresh = () => {
      if (!synth || typeof synth.getVoices !== 'function') return
      try { voices = synth.getVoices() || [] } catch (_) { voices = [] }
      if (voices.length > 0) {
        ready = true
        if (flushTimer) { clearTimeout(flushTimer); flushTimer = 0 }
        pump()
      }
    }
    refresh()
    if (synth && typeof synth.addEventListener === 'function') synth.addEventListener('voiceschanged', refresh)

    const say = (text, options = {}) => {
      if (!CFG.voice || !synth || typeof Utter !== 'function' || sound.isMuted()) return false
      queue.push({ text, options })
      if (ready) pump()
      else if (!flushTimer) {
        flushTimer = setTimeout(() => {
          flushTimer = 0
          ready = true
          pump()
        }, 1200)
      }
      return true
    }

    const cancelAll = () => {
      queue = []
      playing = false
      try { synth.cancel() } catch (_) { /* ignore */ }
    }

    return { say, cancelAll, hasSpoken: () => spoke }
  })()

  // ------------------------------------------------------------- timeline

  const linesEl = root.querySelector('.ub-lines')
  const form = root.querySelector('.ub-cmd')
  const input = root.querySelector('.ub-cmd-input')
  const hintEl = root.querySelector('.ub-cmd-hint')
  const soundBtn = root.querySelector('.ub-sound')
  const bar = root.querySelector('.ub-progress i')

  let hudTimer = 0
  const startHud = () => {
    root.querySelectorAll('.ub-bars i').forEach((el, index) => {
      el.style.animationDelay = (index * 0.13).toFixed(2) + 's'
      el.style.animationDuration = (1.2 + (index % 4) * 0.24).toFixed(2) + 's'
    })
    const tempEl = root.querySelector('.ub-hud-temp')
    const linkEl = root.querySelector('.ub-hud-link')
    let temp = 36.4
    let link = 98
    hudTimer = setInterval(() => {
      if (destroyed) return
      temp = Math.min(38.2, Math.max(35.6, temp + (Math.random() - 0.5) * 0.3))
      link = Math.min(99.6, Math.max(96.2, link + (Math.random() - 0.5) * 0.9))
      if (tempEl) tempEl.textContent = temp.toFixed(1) + '°C'
      if (linkEl) linkEl.textContent = link.toFixed(0) + '%'
    }, 1500)
    timers.push(hudTimer)
  }


  const timers = []
  let destroyed = false
  let leaving = false
  let granted = false
  let stage = 'boot'
  let attempts = 0
  let greeted = false

  const later = (fn, ms) => {
    timers.push(setTimeout(() => { if (!destroyed) fn() }, ms))
  }
  const setBar = (value) => { if (bar) bar.style.width = value + '%' }

  const BOOT_LINES = [
    ['DEEPSEEK CORE MAINFRAME BIOS', ' v4.12', 22],
    ['COPYRIGHT (C) 2026 DEEPSEEK', ' ALL RIGHTS RESERVED', 14],
    ['MEMORY TEST', ' 262144K READY', 12],
    ['NEURAL CORE', ' READY', 14],
    ['CONTAINMENT FIELD', ' NOMINAL', 14],
    ['SATELLITE UPLINK', ' ESTABLISHED', 14],
    ['AEGIS DAEMON', ' AWAITING COMMAND', 18],
  ]

  const typeLine = (label, tail, prefix, speed) => {
    const line = doc.createElement('div')
    line.className = 'ub-line'
    const labelEl = doc.createElement('span')
    labelEl.textContent = label
    const dots = doc.createElement('i')
    dots.textContent = ' ' + '.'.repeat(Math.max(4, 32 - label.length)) + ' '
    const tailEl = doc.createElement('strong')
    const prefixEl = doc.createElement('span')
    prefixEl.textContent = prefix
    line.append(prefixEl, labelEl, dots, tailEl)
    linesEl.append(line)
    line.classList.add('is-on')
    let index = 0
    const tick = () => {
      if (destroyed) return
      index += 1
      tailEl.textContent = tail.slice(0, index)
      if (index % 3 === 1) sound.tone(1180 + Math.random() * 240, 0.02, { type: 'sine', gain: 0.02 })
      if (index < tail.length) later(tick, speed)
    }
    later(tick, 60)
    return line
  }

  const greet = () => {
    if (greeted) return
    greeted = true
    voice.say('Mainframe online.', { rate: 0.95 })
  }


  // Rolling console: after the boot log settles the left panel keeps writing
  // new lines with fresh values, scrolling older ones out of the top.
  const rnd = (n) => Math.floor(Math.random() * n)
  const hex = (n) => Array.from({ length: n }, () => '0123456789ABCDEF'[rnd(16)]).join('')
  const pad2 = (n) => String(n).padStart(2, '0')
  const LIVE_SOURCES = [
    () => ['UPLINK PACKET', ' #' + rnd(99999) + ' · ' + (18 + rnd(84)) + 'ms'],
    () => ['SECTOR SCAN', ' ' + hex(4) + ' · ' + (rnd(4) === 0 ? 'REVIEW' : 'CLEAN')],
    () => ['NEURAL CACHE', ' ' + (58 + rnd(41)) + '% · SYNC'],
    () => ['MEMORY BANK', ' ' + (260096 + rnd(4096)) + 'K FREE'],
    () => ['AES KEY ROTATE', ' ' + hex(6) + ' · OK'],
    () => ['NODE 04 HEARTBEAT', ' ' + pad2(rnd(60)) + 's · STABLE'],
    () => ['LOG SEGMENT', ' ' + hex(8) + ' · WRITTEN'],
    () => ['THREAT SWEEP', ' ' + rnd(4) + ' SIGNATURES · ' + (rnd(3) === 0 ? 'LOW' : 'NONE')],
    () => ['BIOMETRIC POLL', ' ' + (90 + rnd(10)) + '% · READY'],
    () => ['QUANTUM LINK', ' ' + hex(2) + ':' + hex(2) + ' · LOCKED'],
  ]
  let liveTimer = 0

  const pushLiveLine = () => {
    if (destroyed) return
    const [label, tail] = LIVE_SOURCES[rnd(LIVE_SOURCES.length)]()
    const line = doc.createElement('div')
    line.className = 'ub-line is-on is-live'
    const labelEl = doc.createElement('span')
    labelEl.textContent = label
    const dots = doc.createElement('i')
    dots.textContent = ' ' + '.'.repeat(Math.max(4, 30 - label.length)) + ' '
    const tailEl = doc.createElement('strong')
    tailEl.textContent = tail
    line.append(labelEl, dots, tailEl)
    linesEl.append(line)
    while (linesEl.children.length > 7) linesEl.firstElementChild.remove()
  }

  const startLiveLog = () => {
    if (liveTimer) return
    pushLiveLine()
    liveTimer = setInterval(pushLiveLine, 760)
    timers.push(liveTimer)
  }

  const openCommand = () => {
    if (stage === 'granted' || destroyed) return
    stage = 'login'
    root.classList.add('is-command')
    setBar(58)
    hintEl.className = 'ub-cmd-hint'
    hintEl.textContent = 'SECURITY CLEARANCE REQUIRED · 输入口令后回车'
    voice.say('Awaiting credentials.', { rate: 0.95 })
    startLiveLog()
    input.disabled = false
    try { input.focus() } catch (_) { /* focus refused */ }
  }

  const verify = () => {
    if (stage !== 'login' || destroyed) return
    stage = 'verify'
    input.blur()
    root.classList.add('is-verifying')
    hintEl.className = 'ub-cmd-hint is-good'
    hintEl.textContent = 'VERIFYING ACCESS…'
    sound.tone(880, 0.12, { type: 'sine', gain: 0.05 })
    let step = 0
    const tick = () => {
      if (destroyed || stage !== 'verify') return
      step += 1
      setBar(58 + Math.min(40, step * 2.4))
      if (step % 5 === 0) sound.tone(1180 + step * 24, 0.03, { type: 'sine', gain: 0.02 })
      if (step < 17) later(tick, 95)
      else grant()
    }
    later(tick, 95)
  }

  const leave = (delay = 0) => {
    if (destroyed || leaving) return
    if (delay > 0) { later(() => leave(0), delay); return }
    leaving = true
    timers.forEach(clearTimeout)
    if (enteredFullscreen && doc.fullscreenElement && typeof doc.exitFullscreen === 'function') {
      try { doc.exitFullscreen() } catch (_) { /* ignore */ }
      enteredFullscreen = false
    }
    clearInterval(hudTimer)
    clearInterval(glyphTimer)
    clearInterval(liveTimer)
    globalThis.removeEventListener('resize', paintGlyphs)
    voice.cancelAll()
    root.classList.add('is-off')
    sound.stopHum(0.3)
    sound.powerDown()
    later(() => {
      destroyed = true
      timers.forEach(clearTimeout)
      unbind()
      root.remove()
      style.remove()
    }, 850)
  }

  const grant = () => {
    if (granted || destroyed || leaving) return
    granted = true
    stage = 'granted'
    input.blur()
    root.classList.remove('is-command', 'is-verifying')
    setBar(100)
    sound.stopHum(0.4)
    ;[[660, 0], [880, 80], [1100, 170], [1320, 280]].forEach(([freq, delay]) => {
      sound.tone(freq, 0.6, { type: 'sine', gain: 0.07, delay: delay / 1000 })
    })
    hintEl.className = 'ub-cmd-hint is-good'
    hintEl.textContent = 'COMMAND ACCEPTED · ' + PASSCODE.toUpperCase()
    typeLine('AEGIS', ' ACCESS GRANTED', ' ', 14)
    const stamp = root.querySelector('.ub-welcome-time')
    if (stamp) stamp.textContent = new Date().toLocaleString('zh-CN', { hour12: false })
    root.classList.add('is-flash')
    voice.say('Welcome back, administrator.', { rate: 0.95 })
    later(() => {
      root.classList.add('is-welcome')
      sound.tone(1760, 0.16, { type: 'sine', gain: 0.05 })
      sound.tone(1320, 0.5, { type: 'sine', gain: 0.04 })
      voice.say('Access granted. All systems nominal.', { rate: 0.95 })
    }, 900)
    later(() => leave(0), 6500)
  }

  const deny = () => {
    if (destroyed || leaving || stage === 'granted') return
    attempts += 1
    input.value = ''
    if (attempts < 2) {
      stage = 'warn'
      sound.buzz()
      voice.say('Access denied. Invalid passcode.', { rate: 0.95 })
      hintEl.className = 'ub-cmd-hint is-bad'
      hintEl.textContent = 'ACCESS DENIED · 口令不对，再试一次'
      root.classList.add('is-shake', 'is-warn')
      later(() => {
        root.classList.remove('is-shake', 'is-warn')
        if (destroyed || granted) return
        stage = 'login'
        try { input.focus() } catch (_) { /* focus refused */ }
      }, 900)
      return
    }
    stage = 'alarm'
    voice.cancelAll()
    sound.siren()
    voice.say('Intruder alert. Security has been notified.', { rate: 0.95 })
    root.classList.add('is-alarm')
    hintEl.className = 'ub-cmd-hint is-bad'
    hintEl.textContent = 'ACCESS DENIED · 指令错误（第 ' + attempts + ' 次）'
    input.blur()
    later(() => {
      root.classList.remove('is-alarm')
      if (destroyed || granted) return
      stage = 'login'
      hintEl.textContent = 'HINT: ' + PASSCODE.toUpperCase()
      try { input.focus() } catch (_) { /* focus refused */ }
    }, 2500)
  }

  const evaluate = () => {
    if ((stage !== 'login' && stage !== 'command') || destroyed) return
    const raw = input.value.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.!?]+$/, '')
    if (raw === 'help') {
      hintEl.className = 'ub-cmd-hint'
      hintEl.textContent = 'AEGIS: 口令是一句经典作弊码，三个单词。'
      input.value = ''
      return
    }
    if (raw === PASSCODE) { verify(); return }
    deny()
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    evaluate()
  })

  const bindInteraction = () => {
    const onKeyDown = (event) => {
      if (destroyed || leaving) return
      if (event.key === 'Escape') { event.preventDefault(); leave(); return }
      unlockAudio()
      if (event.target === input) return
    }
    const onPointerDown = (event) => {
      if (destroyed || leaving) return
      unlockAudio()
      if (event.target === soundBtn || event.target === input) return
      if (stage === 'command') { try { input.focus() } catch (_) { /* focus refused */ } }
    }
    globalThis.addEventListener('keydown', onKeyDown, true)
    globalThis.addEventListener('pointerdown', onPointerDown, true)
    return () => {
      globalThis.removeEventListener('keydown', onKeyDown, true)
      globalThis.removeEventListener('pointerdown', onPointerDown, true)
    }
  }

  /** The platform may hold audio until a gesture; unlock on the first one. */
  const unlockAudio = () => {
    sound.ensure()
    goFullscreen()
    // The ambience belongs to the boot/login phase only; restarting it here
    // used to bring the hum back after a successful login.
    if (stage === 'boot' || stage === 'login') sound.startHum()
    if (!voice.hasSpoken()) greet()
  }

  let unbind = () => {}
  input.disabled = true

  let enteredFullscreen = false
  const goFullscreen = () => {
    const el = doc.documentElement
    if (!el || typeof el.requestFullscreen !== 'function' || doc.fullscreenElement) return
    try {
      const attempt = el.requestFullscreen({ navigationUI: 'hide' })
      if (attempt && typeof attempt.then === 'function') {
        attempt.then(() => { enteredFullscreen = true }).catch(() => { /* refused */ })
      }
    } catch (_) { /* refused */ }
  }
  doc.addEventListener('fullscreenchange', () => {
    if (doc.fullscreenElement) enteredFullscreen = true
  })
  goFullscreen()

  // ---------------------------------------------------------- glyph field
  const glyphCanvas = root.querySelector('.ub-glyphs')
  const glyphCtx = glyphCanvas ? glyphCanvas.getContext('2d') : null
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*<>/[]{}'
  const GLYPH_STEP = 24
  let glyphTimer = 0
  let glyphGrid = []

  const paintGlyphs = () => {
    if (!glyphCtx) return
    const ratio = Math.min(2, globalThis.devicePixelRatio || 1)
    const width = globalThis.innerWidth
    const height = globalThis.innerHeight
    glyphCanvas.width = Math.floor(width * ratio)
    glyphCanvas.height = Math.floor(height * ratio)
    glyphCanvas.style.width = width + 'px'
    glyphCanvas.style.height = height + 'px'
    glyphCtx.setTransform(ratio, 0, 0, ratio, 0, 0)
    const cols = Math.ceil(width / GLYPH_STEP)
    const rows = Math.ceil(height / GLYPH_STEP)
    glyphGrid = []
    glyphCtx.clearRect(0, 0, width, height)
    glyphCtx.font = '11px "SF Mono", Menlo, Consolas, monospace'
    glyphCtx.textBaseline = 'middle'
    for (let y = 0; y < rows; y += 1) {
      const row = []
      for (let x = 0; x < cols; x += 1) {
        const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        row.push(ch)
        glyphCtx.fillStyle = Math.random() > 0.85 ? 'rgba(150,232,255,.42)' : 'rgba(96,150,190,.15)'
        glyphCtx.fillText(ch, x * GLYPH_STEP + 6, y * GLYPH_STEP + 8)
      }
      glyphGrid.push(row)
    }
  }

  const mutateGlyphs = () => {
    if (!glyphCtx || glyphGrid.length === 0) return
    for (let i = 0; i < 26; i += 1) {
      const y = Math.floor(Math.random() * glyphGrid.length)
      const row = glyphGrid[y]
      const x = Math.floor(Math.random() * row.length)
      const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      row[x] = ch
      glyphCtx.clearRect(x * GLYPH_STEP, y * GLYPH_STEP, GLYPH_STEP, GLYPH_STEP)
      glyphCtx.fillStyle = Math.random() > 0.72 ? 'rgba(160,238,255,.5)' : 'rgba(96,150,190,.16)'
      glyphCtx.fillText(ch, x * GLYPH_STEP + 6, y * GLYPH_STEP + 8)
    }
  }

  doc.body.append(style, root)
  const titleEl = root.querySelector('.ub-title')
  const subEl = root.querySelector('.ub-sub')
  const welcomeEl = root.querySelector('.ub-welcome-name')
  if (titleEl) titleEl.textContent = CFG.name
  if (subEl) subEl.textContent = CFG.subtitle
  if (welcomeEl) welcomeEl.textContent = CFG.welcome
  paintGlyphs()
  glyphTimer = setInterval(mutateGlyphs, 120)
  globalThis.addEventListener('resize', paintGlyphs)
  const boot = () => {
    root.classList.add('is-booted')
    setBar(8)
    startHud()
    sound.ensure()
    sound.startHum()
    later(greet, 520)
    later(() => voice.say('Security system engaged.', { rate: 0.95 }), 2800)
    let at = 160
    BOOT_LINES.forEach(([label, tail, step], index) => {
      const mark = Math.min(56, 8 + index * 7)
      later(() => {
        typeLine(label, tail, index === 0 ? '>' : ' ', step)
        setBar(mark)
      }, at)
      at += Math.max(480, label.length * 9 + tail.length * 20 + 220)
    })
    later(() => {
      sound.tone(72, 0.8, { type: 'sine', gain: 0.1, from: 40 })
      sound.tone(1180, 0.9, { type: 'sine', gain: 0.05, from: 720 })
    }, at)
    later(openCommand, at + 1400)
  }

  if (reduced) {
    root.classList.add('is-booted')
    setBar(62)
    later(() => leave(0), 1200)
  } else {
    unbind = bindInteraction()
    // Paint first, then start on the next frame so the overlay is on screen
    // before the first heavy style work.
    requestAnimationFrame(boot)
    later(() => { if (!granted) leave(0) }, 120000)
  }
})()
