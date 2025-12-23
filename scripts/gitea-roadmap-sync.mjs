#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import colors from 'colors/safe.js'

const { bold, cyan, dim, green, red, yellow } = colors

async function loadDotEnvIfPresent(
  dotenvPath = path.join(process.cwd(), '.env')
) {
  try {
    const content = await fs.readFile(dotenvPath, 'utf8')
    const lines = content.split(/\r?\n/)
    for (const rawLine of lines) {
      const line = rawLine.trim()
      if (!line || line.startsWith('#')) continue

      const eq = line.indexOf('=')
      if (eq === -1) continue

      const key = line.slice(0, eq).trim()
      if (!key) continue

      // Only load the keys we care about, to avoid surprising behavior.
      if (
        key !== 'GITEA_REPO_URL' &&
        key !== 'GITEA_TOKEN' &&
        key !== 'ROADMAP_PATH'
      )
        continue

      // Don't overwrite existing env.
      if (key === 'GITEA_REPO_URL' && process.env.GITEA_REPO_URL !== undefined)
        continue
      if (key === 'GITEA_TOKEN' && process.env.GITEA_TOKEN !== undefined)
        continue
      if (key === 'ROADMAP_PATH' && process.env.ROADMAP_PATH !== undefined)
        continue

      let value = line.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (key === 'GITEA_REPO_URL') process.env.GITEA_REPO_URL = value
      if (key === 'GITEA_TOKEN') process.env.GITEA_TOKEN = value
      if (key === 'ROADMAP_PATH') process.env.ROADMAP_PATH = value
    }
  } catch (err) {
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      err.code === 'ENOENT'
    )
      return
    throw err
  }
}

function parseArgs(argv) {
  const args = {
    repoUrl: process.env.GITEA_REPO_URL,
    token: process.env.GITEA_TOKEN,
    dryRun: false,
    closeDone: false,
    roadmapPath: process.env.ROADMAP_PATH ?? 'ROADMAP.md',
  }

  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === '--') continue
    if (a === '--repo' || a === '--repo-url') {
      args.repoUrl = argv[i + 1]
      i += 1
      continue
    }
    if (a === '--token') {
      args.token = argv[i + 1]
      i += 1
      continue
    }
    if (a === '--dry-run') {
      args.dryRun = true
      continue
    }
    if (a === '--close-done') {
      args.closeDone = true
      continue
    }
    if (a === '--roadmap' || a === '--roadmap-path') {
      args.roadmapPath = argv[i + 1]
      i += 1
      continue
    }
    if (a === '--help' || a === '-h') {
      args.help = true
      continue
    }

    throw new Error(`Unknown arg: ${a}`)
  }

  return args
}

function normalizeRepoUrl(raw) {
  if (!raw) return null
  const withScheme =
    raw.startsWith('http://') || raw.startsWith('https://')
      ? raw
      : `https://${raw}`
  const url = new URL(withScheme)
  // Allow users to paste either the repo URL or the host root.
  // Expected repo URL: https://host/{owner}/{repo}
  const parts = url.pathname.split('/').filter(Boolean)
  if (parts.length < 2) {
    throw new Error(
      `Repo URL must include owner/repo, got: ${url.toString()} (expected https://host/{owner}/{repo})`
    )
  }

  const owner = parts[0]
  const repo = parts[1]
  const apiBase = `${url.protocol}//${url.host}/api/v1`
  return {
    apiBase,
    owner,
    repo,
    repoWebUrl: `${url.protocol}//${url.host}/${owner}/${repo}`,
  }
}

async function giteaRequest({ apiBase, token, method, pathname, query, body }) {
  const url = new URL(`${apiBase}${pathname}`)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null) continue
      url.searchParams.set(k, String(v))
    }
  }

  const res = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `token ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  if (!res.ok) {
    throw new Error(
      `Gitea API ${method} ${url.toString()} failed: ${res.status} ${res.statusText}\n${text}`
    )
  }

  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function listAllIssues({ apiBase, owner, repo, token, state = 'all' }) {
  const issues = []
  const limit = 50

  for (let page = 1; page <= 20; page += 1) {
    const pageItems = await giteaRequest({
      apiBase,
      token,
      method: 'GET',
      pathname: `/repos/${owner}/${repo}/issues`,
      query: {
        state,
        page,
        limit,
      },
    })

    if (!Array.isArray(pageItems) || pageItems.length === 0) break
    issues.push(...pageItems)
    if (pageItems.length < limit) break
  }

  return issues
}

async function listAllLabels({ apiBase, owner, repo, token }) {
  const labels = []
  const limit = 50

  for (let page = 1; page <= 20; page += 1) {
    const pageItems = await giteaRequest({
      apiBase,
      token,
      method: 'GET',
      pathname: `/repos/${owner}/${repo}/labels`,
      query: { page, limit },
    })

    if (!Array.isArray(pageItems) || pageItems.length === 0) break
    labels.push(...pageItems)
    if (pageItems.length < limit) break
  }

  return labels
}

async function ensureLabels({ apiBase, owner, repo, token, labelNames }) {
  const existing = await listAllLabels({ apiBase, owner, repo, token })
  const existingByName = new Map(
    existing.map((l) => [String(l.name).toLowerCase(), l])
  )

  const ensured = []
  for (const name of labelNames) {
    const key = name.toLowerCase()
    const found = existingByName.get(key)
    if (found) {
      ensured.push(found)
      continue
    }

    const created = await giteaRequest({
      apiBase,
      token,
      method: 'POST',
      pathname: `/repos/${owner}/${repo}/labels`,
      body: {
        name,
        // A sensible default blue; can be changed later in UI.
        color: '#1d76db',
      },
    })
    ensured.push(created)
  }

  return ensured
}

function extractRoadmapTopLevelItems(markdown) {
  const lines = markdown.split(/\r?\n/)

  /** @type {{section: string, title: string, checked: boolean}[]} */
  const items = []

  let section = null
  for (const line of lines) {
    const h2 = line.match(/^##\s+(.*)\s*$/)
    if (h2) {
      section = h2[1].trim()
      continue
    }

    const m = line.match(/^\s*-\s*\[( |x)\]\s+(.*)\s*$/i)
    if (!m) continue

    const checked = m[1].toLowerCase() === 'x'
    const title = m[2].trim()

    // Only track top-level items.
    const isTopLevel = /^-\s*\[/.test(line)
    if (!isTopLevel) continue
    if (!section) continue

    items.push({ section, title, checked })
  }

  return items
}

function isRoadmapManagedIssue(issue) {
  const labels = Array.isArray(issue?.labels) ? issue.labels : []
  const hasRoadmapLabel = labels.some(
    (l) => String(l?.name ?? '').toLowerCase() === 'roadmap'
  )
  const body = typeof issue?.body === 'string' ? issue.body : ''
  const hasRoadmapMarker = body.includes('Created from ROADMAP.md')
  return hasRoadmapLabel || hasRoadmapMarker
}

function labelsForSection(section) {
  const base = ['roadmap']
  const norm = section.toLowerCase()
  if (norm === 'features') return [...base, 'type:feature']
  if (norm === 'dx') return [...base, 'type:dx']
  if (norm === 'potential') return [...base, 'stage:potential', 'type:feature']
  return base
}

async function main() {
  await loadDotEnvIfPresent()
  const args = parseArgs(process.argv)

  if (args.help) {
    process.stdout.write(
      `\nSync unchecked top-level items in ROADMAP.md to Gitea issues.\n\n`
    )
    process.stdout.write(
      `Usage (recommended):\n  GITEA_TOKEN=*** node scripts/gitea-roadmap-sync.mjs --repo https://host/owner/repo [--dry-run] [--close-done]\n\n`
    )
    process.stdout.write(
      `Alternatively (override token via arg):\n  node scripts/gitea-roadmap-sync.mjs --repo https://host/owner/repo --token <token> [--dry-run] [--close-done]\n\n`
    )
    process.stdout.write(
      `Options:\n  --close-done   Close open issues for checked items (only if they are roadmap-managed)\n\n`
    )
    process.stdout.write(
      `Env vars:\n  GITEA_REPO_URL, GITEA_TOKEN, ROADMAP_PATH\n\n`
    )
    process.exit(0)
  }

  const roadmapAbs = path.isAbsolute(args.roadmapPath)
    ? args.roadmapPath
    : path.join(process.cwd(), args.roadmapPath)

  const roadmap = await fs.readFile(roadmapAbs, 'utf8')
  const items = extractRoadmapTopLevelItems(roadmap).filter(
    (t) =>
      t.section === 'Features' ||
      t.section === 'DX' ||
      t.section === 'Potential'
  )

  const openTodos = items.filter((t) => !t.checked)
  const doneTodos = items.filter((t) => t.checked)

  if (openTodos.length === 0 && doneTodos.length === 0) {
    process.stdout.write(
      'No top-level TODOs found in ROADMAP (Features/DX/Potential). Nothing to do.\n'
    )
    return
  }

  if (args.dryRun) {
    process.stdout.write(`${cyan(bold('DRY RUN'))} ${dim('(no API calls)')}:\n`)
    if (openTodos.length > 0) {
      process.stdout.write(`${dim('Would create (if missing):')}\n`)
      for (const todo of openTodos) {
        const labels = labelsForSection(todo.section)
        process.stdout.write(`- ${todo.title} [labels: ${labels.join(', ')}]\n`)
      }
    }
    if (doneTodos.length > 0) {
      process.stdout.write(
        `${dim(
          `Would ensure issues exist for checked items${args.closeDone ? ' and close them' : ''} (to close via commits, use 'Fixes: #<issue-number>' or 'Closes #<issue-number>'):`
        )}\n`
      )
      for (const todo of doneTodos) {
        process.stdout.write(`- ${todo.title}\n`)
      }
    }
    return
  }

  if (!args.repoUrl)
    throw new Error('Missing repo URL. Provide --repo or set GITEA_REPO_URL.')
  if (!args.token)
    throw new Error('Missing token. Provide --token or set GITEA_TOKEN.')

  const repoInfo = normalizeRepoUrl(args.repoUrl)
  if (!repoInfo) throw new Error('Failed to parse repo URL.')

  const desiredLabelNames = new Set()
  for (const todo of [...openTodos, ...doneTodos]) {
    for (const name of labelsForSection(todo.section))
      desiredLabelNames.add(name)
  }

  await ensureLabels({
    apiBase: repoInfo.apiBase,
    owner: repoInfo.owner,
    repo: repoInfo.repo,
    token: args.token,
    labelNames: Array.from(desiredLabelNames),
  })

  const allLabels = await listAllLabels({
    apiBase: repoInfo.apiBase,
    owner: repoInfo.owner,
    repo: repoInfo.repo,
    token: args.token,
  })
  const labelIdByName = new Map(
    allLabels.map((l) => [String(l.name).toLowerCase(), l.id])
  )

  const existingIssues = await listAllIssues({
    apiBase: repoInfo.apiBase,
    owner: repoInfo.owner,
    repo: repoInfo.repo,
    token: args.token,
    state: 'all',
  })

  const existingByTitle = new Map(
    existingIssues.map((iss) => [String(iss.title).trim().toLowerCase(), iss])
  )

  for (const todo of openTodos) {
    const normalizedTitle = todo.title.trim()
    const key = normalizedTitle.toLowerCase()
    const existing = existingByTitle.get(key)

    if (existing) {
      const state = String(existing.state ?? '').toLowerCase()
      if (state === 'closed' && isRoadmapManagedIssue(existing)) {
        const pathname = `/repos/${repoInfo.owner}/${repoInfo.repo}/issues/${existing.number}`
        const reopened = await giteaRequest({
          apiBase: repoInfo.apiBase,
          token: args.token,
          method: 'PATCH',
          pathname,
          body: { state: 'open' },
        })
        const number = reopened?.number ?? existing.number
        process.stdout.write(
          `${green(bold('REOPENED'))} ${normalizedTitle} ${dim(`(#${number})`)}\n`
        )
      } else {
        process.stdout.write(
          `${yellow(bold('SKIP'))} ${dim('exists:')} ${normalizedTitle} ${dim(`(#${existing.number})`)}\n`
        )
      }
      continue
    }

    const labels = labelsForSection(todo.section)
    const labelIds = labels
      .map((name) => labelIdByName.get(name.toLowerCase()))
      .filter((id) => typeof id === 'number')

    if (labelIds.length !== labels.length) {
      const missing = labels.filter(
        (name) => !labelIdByName.has(name.toLowerCase())
      )
      throw new Error(`Missing label IDs for: ${missing.join(', ')}`)
    }

    const body = [
      `Created from ROADMAP.md (${todo.section}).`,
      '',
      'Checklist:',
      `- [ ] ${normalizedTitle}`,
    ].join('\n')

    if (args.dryRun) {
      process.stdout.write(
        `DRY RUN create issue: ${normalizedTitle} [labels: ${labels.join(', ')}]\n`
      )
      continue
    }

    const created = await giteaRequest({
      apiBase: repoInfo.apiBase,
      token: args.token,
      method: 'POST',
      pathname: `/repos/${repoInfo.owner}/${repoInfo.repo}/issues`,
      body: {
        title: normalizedTitle,
        body,
        labels: labelIds,
      },
    })

    process.stdout.write(
      `${green(bold('CREATED'))} ${normalizedTitle} ${dim(`(#${created.number})`)} ${dim(`${repoInfo.repoWebUrl}/issues/${created.number}`)}\n`
    )

    // Keep in-memory view consistent for later steps in this run.
    existingByTitle.set(key, created)
  }

  for (const todo of doneTodos) {
    const normalizedTitle = todo.title.trim()
    const key = normalizedTitle.toLowerCase()
    const existing = existingByTitle.get(key)

    const closeIfRequested = async (issue) => {
      if (!args.closeDone) return

      const state = String(issue?.state ?? '').toLowerCase()
      if (state === 'closed') {
        process.stdout.write(
          `${green(bold('OK'))} ${dim('already closed:')} ${normalizedTitle} ${dim(`(#${issue.number})`)}\n`
        )
        return
      }

      if (!isRoadmapManagedIssue(issue)) {
        process.stdout.write(
          `${yellow(bold('SKIP'))} ${dim('not roadmap-managed:')} ${normalizedTitle} ${dim(`(#${issue.number})`)}\n`
        )
        return
      }

      const pathname = `/repos/${repoInfo.owner}/${repoInfo.repo}/issues/${issue.number}`
      const closed = await giteaRequest({
        apiBase: repoInfo.apiBase,
        token: args.token,
        method: 'PATCH',
        pathname,
        body: { state: 'closed' },
      })
      const number = closed?.number ?? issue.number
      process.stdout.write(
        `${green(bold('CLOSED'))} ${normalizedTitle} ${dim(`(#${number})`)}\n`
      )
    }

    if (!existing) {
      // Create the issue so the roadmap has a matching resolved issue.
      const labels = labelsForSection(todo.section)
      const labelIds = labels
        .map((name) => labelIdByName.get(name.toLowerCase()))
        .filter((id) => typeof id === 'number')

      if (labelIds.length !== labels.length) {
        const missing = labels.filter(
          (name) => !labelIdByName.has(name.toLowerCase())
        )
        throw new Error(`Missing label IDs for: ${missing.join(', ')}`)
      }

      const body = [
        `Created from ROADMAP.md (${todo.section}).`,
        '',
        'Checklist:',
        `- [x] ${normalizedTitle}`,
        '',
        'Note: To record completion in Gitea with a proper linked resolution, include',
        "a commit message keyword like 'Fixes: #<issue-number>' (or 'Closes #<issue-number>') in the commit that",
        'implements this item (see Gitea docs for automatically linked references).',
      ].join('\n')

      const created = await giteaRequest({
        apiBase: repoInfo.apiBase,
        token: args.token,
        method: 'POST',
        pathname: `/repos/${repoInfo.owner}/${repoInfo.repo}/issues`,
        body: {
          title: normalizedTitle,
          body,
          labels: labelIds,
        },
      })

      process.stdout.write(
        `${green(bold('CREATED'))} ${normalizedTitle} ${dim(`(#${created.number})`)} ${dim(`${repoInfo.repoWebUrl}/issues/${created.number}`)}\n`
      )

      existingByTitle.set(key, created)

      await closeIfRequested(created)
      continue
    }

    await closeIfRequested(existing)
  }
}

try {
  await main()
} catch (err) {
  const message = err instanceof Error ? err.message : String(err)
  process.stderr.write(`${red(bold('ERROR'))} ${message}\n`)
  if (err instanceof Error && err.stack) {
    process.stderr.write(`${dim(err.stack)}\n`)
  }
  process.exitCode = 1
}
