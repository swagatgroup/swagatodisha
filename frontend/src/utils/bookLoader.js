// Global "book" loading overlay state.
// Requests made through utils/api.js and showLoading() in utils/sweetAlert.js drive it.
// It only appears when something is actually slow (SHOW_DELAY) and stays until the work is done.

const SHOW_DELAY = 350 // fast actions never flash the overlay
const MIN_VISIBLE = 500 // once shown, stay long enough to read as intentional

let pending = 0 // tracked API requests in flight
let manual = false // showLoading() ... closeLoading()
let visible = false
let shownAt = 0
let showTimer = null
let hideTimer = null
const listeners = new Set()

const emit = () => listeners.forEach((listener) => listener())
const busy = () => pending > 0 || manual

const update = (delay = SHOW_DELAY) => {
    if (busy()) {
        clearTimeout(hideTimer)
        hideTimer = null
        if (visible || showTimer) return
        showTimer = setTimeout(() => {
            showTimer = null
            if (!busy()) return
            visible = true
            shownAt = Date.now()
            emit()
        }, delay)
        return
    }
    clearTimeout(showTimer)
    showTimer = null
    if (!visible || hideTimer) return
    hideTimer = setTimeout(() => {
        hideTimer = null
        if (busy()) return
        visible = false
        emit()
    }, Math.max(0, MIN_VISIBLE - (Date.now() - shownAt)))
}

export const requestStarted = () => {
    pending += 1
    update()
}

export const requestFinished = () => {
    pending = Math.max(0, pending - 1)
    update()
}

// Explicit loading (showLoading in sweetAlert.js): shown straight away
export const setManualLoading = (on) => {
    manual = on
    update(0)
}

export const subscribeBookLoader = (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
}

export const isBookLoaderVisible = () => visible

// Any SweetAlert popup (success, error, confirm) ends an explicit loading state, so a caller
// that shows a result without calling closeLoading() never leaves the overlay stuck.
if (typeof window !== 'undefined' && typeof MutationObserver !== 'undefined') {
    const watch = () => {
        new MutationObserver((mutations) => {
            if (!manual) return
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.classList?.contains('swal2-container')) {
                        setManualLoading(false)
                        return
                    }
                }
            }
        }).observe(document.body, { childList: true })
    }
    if (document.body) watch()
    else document.addEventListener('DOMContentLoaded', watch, { once: true })
}

// Public marketing pages load their content with skeletons, so only actions (POST/PUT/PATCH/DELETE)
// show the overlay there. Dashboards and sign-in pages also show it for slow data loads.
const APP_PATHS = /^\/(dashboard|login|login-portal|register|reset-password)/
export const shouldTrackRequest = (config) => {
    if (!config || config.silent) return false
    const method = (config.method || 'get').toLowerCase()
    if (method !== 'get') return true
    return APP_PATHS.test(window.location.pathname)
}
