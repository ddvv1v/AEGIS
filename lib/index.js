import { readFileSync } from 'node:fs'

let z
try {
  z = (await import('@deepseek-ai/schemastery')).default
} catch (_) {
  z = undefined
}

export const name = 'aegis-boot'

export const Config = z ? z.object({
  name: z.string().default('DEEPSEEK CORE').description('主标题'),
  subtitle: z.string().default('AEGIS TERMINAL · 2026').description('副标题'),
  welcome: z.string().default('ADMINISTRATOR').description('欢迎页称呼'),
  passcode: z.string().default('show me the money').description('登录口令'),
  theme: z.union(['holo', 'umbrella', 'white']).default('holo').description('配色：全息蓝 / 红黑 / 白红'),
  voice: z.boolean().default(true).description('语音播报'),
}) : undefined

const DEFAULTS = {
  name: 'DEEPSEEK CORE',
  subtitle: 'AEGIS TERMINAL · 2026',
  welcome: 'ADMINISTRATOR',
  passcode: 'show me the money',
  theme: 'holo',
  voice: true,
}

const THEMES = ['holo', 'umbrella', 'white']

const unwrap = (value) => (value !== null && typeof value === 'object' && typeof value.get === 'function' ? value.get() : value)

/** Normalize whatever the loader hands us into a plain, safe config object. */
function resolveConfig(config) {
  const resolved = { ...DEFAULTS }
  for (const key of Object.keys(DEFAULTS)) {
    const value = unwrap(config?.[key])
    if (typeof value === 'string' && value.trim()) resolved[key] = value.trim().slice(0, 80)
    else if (typeof value === 'boolean') resolved[key] = value
  }
  if (!THEMES.includes(resolved.theme)) resolved.theme = DEFAULTS.theme
  return resolved
}

export function apply(ctx, config) {
  let script = ''
  try {
    script = readFileSync(new URL('./splash.js', import.meta.url), 'utf8')
  } catch (error) {
    try {
      ctx.logger?.('aegis-boot')?.warn?.(`AEGIS boot disabled, splash source missing: ${error.message}`)
    } catch (_) { /* logger optional */ }
    return
  }

  ctx.on('webserver/index-inject', (table) => {
    const resolved = resolveConfig(config)
    // Paint dark before anything else so the window never flashes white while
    // the splash script is still being parsed.
    table.push({
      kind: 'style',
      text: [
        'html,body{background:#050810!important}',
        '[data-dsh-boot]{background:#050810!important}',
        '[data-dsh-boot]{color:#9fd8ff!important}',
        '[data-dsh-boot] *{color:#9fd8ff!important;text-shadow:0 0 18px rgba(126,216,255,.35)!important}',
        '[data-dsh-boot-spinner]{filter:hue-rotate(165deg) brightness(1.25) saturate(1.2)!important}',
      ].join(''),
    })
    table.push({
      kind: 'script',
      placement: 'body',
      text: `globalThis.__AEGIS_BOOT__=${JSON.stringify(resolved)};\n${script}`,
    })
  })
}
