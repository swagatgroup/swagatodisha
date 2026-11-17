// Build-time prerender entry (scripts/prerender.mjs): renders a public route to static HTML,
// so search engines and AI crawlers that don't run JavaScript still read the full page.
import { Buffer } from 'node:buffer'
import { Writable } from 'node:stream'
import { renderToPipeableStream } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App'

export { INSTITUTIONS } from './data/institutions'
export { HOME_FAQS, COURSE_FAQS } from './data/faqs'
export { ROUTE_SEO, PRERENDER_ROUTES, SITE_URL } from './seo/routes'

export const render = (url) => new Promise((resolve, reject) => {
    const helmetContext = {}
    const errors = []
    const stream = renderToPipeableStream(
        <App RouterComponent={StaticRouter} routerProps={{ location: url }} helmetContext={helmetContext} />,
        {
            onAllReady() {
                const chunks = []
                const sink = new Writable({
                    write(chunk, _encoding, done) {
                        chunks.push(Buffer.from(chunk))
                        done()
                    },
                    final(done) {
                        resolve({ html: Buffer.concat(chunks).toString('utf8'), helmet: helmetContext.helmet, errors })
                        done()
                    },
                })
                stream.pipe(sink)
            },
            onShellError: reject,
            onError(error) {
                errors.push(error)
            },
        }
    )
})
