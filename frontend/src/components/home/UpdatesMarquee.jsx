import { useEffect, useState } from 'react'
import { LuBellRing } from 'react-icons/lu'
import api from '../../utils/api'
import Icon from '../site/Icon'

// Same window as the bell badges on the Explore tiles
const RECENT_DAYS = 60
const TYPE_LABELS = { timetable: 'Time Table', notification: 'Exam Notification', update: 'Update', result: 'Result' }

const uploadedAt = (doc) => new Date(doc.publishDate || doc.createdAt).getTime()

// Scrolling strip of everything uploaded in the last 60 days. Renders nothing when there is none.
const UpdatesMarquee = () => {
    const [items, setItems] = useState([])

    useEffect(() => {
        let cancelled = false
        api.get('/api/admin/quick-access/public')
            .then((response) => {
                if (cancelled || !response.data.success) return
                const now = Date.now()
                const recent = (response.data.data || [])
                    .filter((doc) => {
                        const age = now - uploadedAt(doc)
                        return doc.isActive && TYPE_LABELS[doc.type] && age >= 0 && age <= RECENT_DAYS * 24 * 60 * 60 * 1000
                    })
                    .sort((a, b) => uploadedAt(b) - uploadedAt(a))
                setItems(recent)
            })
            .catch(() => {})
        return () => {
            cancelled = true
        }
    }, [])

    if (items.length === 0) return null

    const group = (hidden) => (
        <ul className="sw-marquee-group" aria-hidden={hidden || undefined}>
            {items.map((doc) => (
                <li key={doc._id || doc.title} className="flex shrink-0 items-center px-5 lg:px-8">
                    <a
                        href={doc.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        tabIndex={hidden ? -1 : undefined}
                        className="flex items-center gap-2 whitespace-nowrap py-3 text-sw-small font-semibold text-sw-white underline-offset-4 hover:underline"
                    >
                        <span className="rounded-sw-pill bg-sw-white/10 px-2 py-0.5 text-sw-caption font-normal text-sw-text-on-dark-secondary">
                            {TYPE_LABELS[doc.type]}
                        </span>
                        {doc.title}
                    </a>
                </li>
            ))}
        </ul>
    )

    return (
        <section aria-label="Latest updates" className="relative z-10 flex items-stretch border-y border-sw-white/10 bg-sw-black text-sw-white">
            <p className="flex shrink-0 items-center gap-2 bg-[rgb(var(--sw-accent-garnet))] px-3 text-sw-small font-bold sm:px-5">
                <Icon icon={LuBellRing} size="sm" className="sw-bell-shake" />
                <span>New</span>
            </p>
            <div className="sw-marquee min-w-0 flex-1" style={{ '--sw-marquee-duration': `${Math.max(20, items.length * 9)}s` }}>
                {group(false)}
                {group(true)}
            </div>
        </section>
    )
}

export default UpdatesMarquee
