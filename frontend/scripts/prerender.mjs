// Runs after `vite build`: writes static HTML for each public route (dist/<route>/index.html) with that
// page's title, description, canonical and structured data, plus llms-full.txt from the course data.
// If anything here fails, the build still succeeds and the site works as a normal single-page app.
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { build } from 'vite'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')
const ssrOut = resolve(root, 'dist-ssr')

const headFrom = (helmet) => helmet
    ? [helmet.title, helmet.meta, helmet.link, helmet.script].map((part) => part.toString()).filter(Boolean).join('\n  ')
    : ''

const coursesOf = (program) => (program.subCategories?.length ? program.subCategories : [program])

const llmsFull = ({ INSTITUTIONS, HOME_FAQS, COURSE_FAQS, SITE_URL }, base) => {
    const lines = [base.trimEnd(), '', '## All courses (duration, total fee where listed)', `Full list with fee details: ${SITE_URL}/courses`, '']
    for (const inst of INSTITUTIONS) {
        lines.push(`### ${inst.name}: ${inst.subtitle}`, inst.description)
        for (const program of inst.programs) {
            const sub = program.subCategories?.length
            if (sub) lines.push(`- ${program.name}${program.type ? ` (${program.type})` : ''}:`)
            for (const course of coursesOf(program)) {
                const fee = course.feeStructure?.totalProgramFee || course.feeStructure?.totalFee
                const bits = [course.duration || (!sub && course.type), fee && `total fee ${fee}`].filter(Boolean).join(', ')
                lines.push(`${sub ? '  ' : ''}- ${course.name}${bits ? ` (${bits})` : ''}${course.details ? `: ${course.details}` : ''}`)
            }
        }
        lines.push('')
    }
    const seen = new Set()
    lines.push('## Questions and answers')
    for (const item of [...HOME_FAQS, ...COURSE_FAQS]) {
        if (seen.has(item.q)) continue
        seen.add(item.q)
        lines.push(`- ${item.q} ${item.a}`)
    }
    return `${lines.join('\n')}\n`
}

// SPA shell for every other path (dashboards, sign-in, unknown URLs): the plain build output, so those
// pages never flash the prerendered homepage. Written first, so it exists even if prerendering fails.
copyFileSync(resolve(dist, 'index.html'), resolve(dist, 'app.html'))

try {
    // Dependencies are bundled (noExternal) so CommonJS packages work the same as in the browser build
    await build({ root, logLevel: 'warn', ssr: { noExternal: true }, build: { ssr: 'src/entry-server.jsx', outDir: ssrOut, emptyOutDir: true } })
    const server = await import(pathToFileURL(resolve(ssrOut, 'entry-server.js')).href)
    const template = readFileSync(resolve(dist, 'app.html'), 'utf8')
    if (!template.includes('<div id="root"></div>')) throw new Error('dist/index.html is not a fresh vite build; run `npm run build`')
    const SEO_BLOCK = /<!--seo:start[\s\S]*?<!--seo:end-->/

    let written = 0
    for (const route of server.PRERENDER_ROUTES) {
        try {
            const { html, helmet, errors } = await server.render(route)
            if (errors.length) throw errors[0]
            let page = template.replace('<div id="root"></div>', `<div id="root">${html}</div>`)
            const head = headFrom(helmet)
            if (head) page = page.replace(SEO_BLOCK, head)
            // The opening book loader is for the homepage only
            if (route !== '/') page = page.replace(/<div id="sw-loader"[\s\S]*?<\/div>\n/, '')
            const file = route === '/' ? resolve(dist, 'index.html') : resolve(dist, `.${route}`, 'index.html')
            mkdirSync(dirname(file), { recursive: true })
            writeFileSync(file, page)
            written += 1
        } catch (error) {
            console.warn(`[prerender] ${route} skipped: ${error?.message || error}`)
        }
    }
    console.log(`[prerender] wrote ${written}/${server.PRERENDER_ROUTES.length} pages`)

    const llmsBase = readFileSync(resolve(root, 'public', 'llms.txt'), 'utf8')
    writeFileSync(resolve(dist, 'llms-full.txt'), llmsFull(server, llmsBase))
    console.log('[prerender] wrote llms-full.txt')
} catch (error) {
    console.warn(`[prerender] skipped, the site will render in the browser only: ${error?.stack || error}`)
} finally {
    rmSync(ssrOut, { recursive: true, force: true })
}
