;(() => {
  // AEGIS boot — client half.
  // Registers a settings section so the boot can be configured from the DSH
  // settings page. Values are stored in localStorage; the boot script runs in
  // the same origin and reads them on start-up.
  function makeFactory() {
    return (require) => {
      const module = { exports: {} }
      const react = require('react')
      const { useState } = react
      const h = react.createElement

      const name = 'aegis-boot'
      const inject = ['slots']
      const STORAGE_KEY = 'aegis-boot:config'
      const DEFAULTS = {
        name: 'DEEPSEEK CORE',
        subtitle: 'AEGIS TERMINAL · 2026',
        welcome: 'ADMINISTRATOR',
        passcode: 'show me the money',
        theme: 'holo',
        voice: true,
      }
      const THEMES = [['holo', '全息蓝'], ['umbrella', '红黑 · 安布雷拉'], ['white', '白红']]
      const FIELDS = [
        ['name', '主标题', 'DEEPSEEK CORE'],
        ['subtitle', '副标题', 'AEGIS TERMINAL · 2026'],
        ['welcome', '欢迎称呼', 'ADMINISTRATOR'],
        ['passcode', '登录口令', 'show me the money'],
      ]

      const readStored = () => {
        try {
          const raw = globalThis.localStorage?.getItem(STORAGE_KEY)
          const parsed = raw ? JSON.parse(raw) : {}
          return parsed && typeof parsed === 'object' ? parsed : {}
        } catch (_) {
          return {}
        }
      }

      const box = {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '14px 16px',
        border: '1px solid var(--dsw-alias-border-l2)',
        borderRadius: '12px',
        color: 'var(--dsw-alias-label-primary)',
        fontSize: '13px',
        lineHeight: '20px',
      }
      const row = { display: 'flex', alignItems: 'center', gap: '12px' }
      const label = { width: '92px', flex: 'none', color: 'var(--dsw-alias-label-secondary)', fontSize: '12px' }
      const input = {
        flex: '1 1 auto',
        minWidth: '0',
        height: '28px',
        padding: '0 10px',
        borderRadius: '8px',
        border: '1px solid var(--dsw-alias-border-l2)',
        background: 'var(--dsw-alias-bg-layer-1)',
        color: 'var(--dsw-alias-label-primary)',
        fontSize: '13px',
        outline: 'none',
      }
      const btn = {
        padding: '4px 14px',
        borderRadius: '8px',
        border: '1px solid var(--dsw-alias-border-l2)',
        background: 'transparent',
        color: 'var(--dsw-alias-label-primary)',
        fontSize: '12px',
        cursor: 'pointer',
      }
      const primary = Object.assign({}, btn, {
        border: '1px solid var(--dsw-alias-button-info-fill)',
        background: 'var(--dsw-alias-button-info-fill)',
        color: '#fff',
      })

      function AegisSettings() {
        const [cfg, setCfg] = useState(() => Object.assign({}, DEFAULTS, readStored()))
        const [saved, setSaved] = useState(false)
        const update = (key, value) => {
          setCfg((prev) => Object.assign({}, prev, { [key]: value }))
          setSaved(false)
        }
        const save = () => {
          try {
            globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(cfg))
          } catch (_) { /* storage blocked */ }
          setSaved(true)
        }
        const reset = () => {
          try {
            globalThis.localStorage?.removeItem(STORAGE_KEY)
          } catch (_) { /* storage blocked */ }
          setCfg(Object.assign({}, DEFAULTS))
          setSaved(true)
        }
        return h('div', { style: box },
          h('div', { style: { fontSize: '15px', fontWeight: 500 } }, 'AEGIS 开屏设置'),
          FIELDS.map(([key, text, placeholder]) => h('div', { key, style: row },
            h('span', { style: label }, text),
            h('input', {
              style: input,
              value: cfg[key] ?? '',
              placeholder,
              onChange: (event) => update(key, event.target.value),
            }),
          )),
          h('div', { style: row },
            h('span', { style: label }, '配色'),
            h('div', { style: { display: 'flex', gap: '8px' } },
              THEMES.map(([value, text]) => h('button', {
                key: value,
                style: Object.assign({}, btn, cfg.theme === value ? primary : {}),
                onClick: () => update('theme', value),
              }, text)),
            ),
          ),
          h('div', { style: row },
            h('span', { style: label }, '语音播报'),
            h('label', { style: { display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' } },
              h('input', {
                type: 'checkbox',
                checked: cfg.voice !== false,
                onChange: (event) => update('voice', event.target.checked),
              }),
              h('span', null, cfg.voice !== false ? '开启' : '关闭'),
            ),
          ),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
            h('button', { style: primary, onClick: save }, '保存'),
            h('button', { style: btn, onClick: reset }, '恢复默认'),
            saved ? h('span', { style: { fontSize: '12px', color: 'var(--dsw-alias-label-tertiary)' } }, '已保存，重启 DSH 或刷新页面后生效') : null,
          ),
        )
      }

      function apply(ctx) {
        ctx.slots.inject('settings.section', function* () {
          yield ctx.slots.register({
            name: 'settings.section',
            id: 'aegis-boot-config',
            order: 40,
            label: () => 'AEGIS 开屏',
          }, AegisSettings)
        })
      }

      module.exports = { apply, inject, name }
      return module.exports
    }
  }

  try { console.info('[aegis-boot] client loaded') } catch (_) {}
  globalThis.__ModuleLoader__.load({ id: 'aegis-boot', factory: makeFactory() })
})()
