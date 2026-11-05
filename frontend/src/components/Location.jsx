import { useState } from 'react'
import { LuBus, LuCar, LuChevronRight, LuMail, LuPhone, LuTrainFront } from 'react-icons/lu'
import { CONTACT_INFO } from '../utils/constants'
import { Container, SectionHeader } from './site/Layout'
import Badge from './site/Badge'
import Card from './site/Card'
import Icon from './site/Icon'
import { cx } from './site/cx'
import { DotField, PointerDoodle } from './site/Decor'

const MAP_EMBED_URL = 'https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8'

// `mapQuery` is what the map searches for. Pins found from a place name are approximate.
const LOCATIONS = [
    { name: 'Kantabanji', address: 'Kantabanji, Balangir, Odisha', mapQuery: 'Kantabanji, Balangir, Odisha' },
    { name: 'Bangomunda', address: 'At/PO - Bangomunda, Dist - Balangir, Odisha, Pin-767040', mapQuery: 'Bangomunda, Balangir, Odisha 767040' },
    { name: 'Titilagarh', address: 'Titilagarh, Balangir, Odisha', mapQuery: 'Titilagarh, Balangir, Odisha' },
    { name: 'Sinapali', address: 'Sinapali, Nuapada, Odisha', mapQuery: 'Sinapali, Nuapada, Odisha' },
    { name: 'Bhawanipatna', address: 'Bhawanipatna, Kalahandi, Odisha', mapQuery: 'Bhawanipatna, Kalahandi, Odisha' },
    { name: 'Ghantiguda', address: 'Ghantiguda, PO - Chalna, PS - Sinapali, Nuapada, Odisha, Pin-766108', mapQuery: '20.099885,82.677498' },
    { name: 'Sargiguda', isMain: true, address: 'Sargiguda, PO - Sargul, PS - Kantabanji, Balangir, Odisha, Pin-767039', mapQuery: 'Sargiguda, Kantabanji, Balangir, Odisha 767039' },
]
const MAIN_CAMPUS = LOCATIONS.findIndex((location) => location.isMain)

const REASONS = [
    { title: 'Strategic Locations', tone: 'blue', text: 'Located in Sargiguda, Kantabanji, Bangomunda, Titilagarh, Sinapali, Bhawanipatna and Ghantiguda with easy access to major transportation routes' },
    { title: 'Modern Infrastructure', tone: 'lavender', text: 'State-of-the-art facilities with the latest technology and amenities' },
    { title: 'Safe Environment', tone: 'peach', text: 'Secure campus with 24/7 security and a peaceful learning environment' },
]

// `mainCampus` holds the known travel details, which exist for Sargiguda only
const VISIT_OPTIONS = [
    { title: 'By Bus', mainCampus: 'Kantabanji Bus Stand - 15 minutes drive', icon: LuBus, travelMode: 'transit' },
    { title: 'By Car', mainCampus: 'NH 26 via Kantabanji - Easy access', icon: LuCar, travelMode: 'driving' },
    { title: 'By Train', mainCampus: 'Kantabanji Station - 20 minutes drive', icon: LuTrainFront, travelMode: 'transit' },
]

const directionsUrl = (location, travelMode) =>
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.mapQuery)}${travelMode ? `&travelmode=${travelMode}` : ''}`

const Location = () => {
    const [visitIndex, setVisitIndex] = useState(MAIN_CAMPUS)
    const visitLocation = LOCATIONS[visitIndex]

    return (
        <section id="location" aria-labelledby="campuses-title" className="relative w-full overflow-hidden bg-sw-white">
            {/* Our Campuses: four across, with the main campus taking two of the four */}
            <div className="sw-section relative">
                <DotField className="inset-x-0 top-16 h-[360px]" />
                <Container className="relative">
                    <SectionHeader id="campuses-title" title="Our Campuses" subtitle="Inspiring spaces across Odisha." />

                    <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                        {LOCATIONS.map((location) => (
                            <li
                                key={location.name}
                                className={cx(
                                    'flex flex-col rounded-sw-md bg-sw-black p-2 text-sw-text-on-dark sm:p-3',
                                    location.isMain && 'col-span-2 gap-3 ring-2 ring-sw-glass-rim md:flex-row'
                                )}
                            >
                                <div className={cx('sw-ph-map relative overflow-hidden rounded-sw-sm', location.isMain ? 'aspect-[2/1] md:aspect-auto md:min-h-full md:flex-[3]' : 'aspect-[16/10] md:aspect-[2/1]')}>
                                    <iframe
                                        src={`${MAP_EMBED_URL}&q=${encodeURIComponent(location.mapQuery)}&zoom=13&maptype=roadmap`}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title={`${location.name} location`}
                                        className="absolute inset-0 grayscale-[35%]"
                                    ></iframe>
                                </div>
                                <div className={cx('flex flex-1 flex-col', location.isMain && 'md:flex-[2]')}>
                                    <h3 className={cx('flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold leading-tight text-sw-white', location.isMain ? 'text-sw-h3' : 'mt-2 text-sw-label')}>
                                        {location.name}
                                        {location.isMain && <Badge tone="peach">Main Campus</Badge>}
                                    </h3>
                                    <p className="mb-2 mt-1 text-sw-caption text-sw-text-on-dark-secondary">{location.address}</p>
                                    <a
                                        href={directionsUrl(location)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`Get directions to ${location.name}`}
                                        className="mt-auto inline-flex min-h-10 items-center justify-center gap-1.5 rounded-sw-pill bg-sw-glass/90 px-2 text-sw-small font-semibold text-sw-white ring-1 ring-inset ring-sw-white/10 transition-colors duration-sw-fast hover:bg-sw-glass-hover"
                                    >
                                        Get Directions
                                    </a>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sw-body">
                        <li className="flex items-center gap-2">
                            <Icon icon={LuPhone} size="sm" className="shrink-0" />
                            <a href={`tel:${CONTACT_INFO.phone}`} className="underline-offset-4 hover:underline">{CONTACT_INFO.phone}</a>
                        </li>
                        <li className="flex items-center gap-2">
                            <Icon icon={LuMail} size="sm" className="shrink-0" />
                            <a href={`mailto:${CONTACT_INFO.email}`} className="break-all underline-offset-4 hover:underline">{CONTACT_INFO.email}</a>
                        </li>
                    </ul>
                </Container>
            </div>

            {/* Why choose + Plan your visit */}
            <div className="pb-sw-section">
                <Container className="grid grid-cols-1 gap-8 min-[900px]:grid-cols-2 min-[900px]:gap-10">
                    <div>
                        <h2 className="relative inline-block pr-12 font-sw-display text-sw-h2 font-bold">
                            Why Choose Our Location
                            <PointerDoodle className="absolute -bottom-1 right-0 h-9 w-9" />
                        </h2>

                        <ol className="mt-4 space-y-3">
                            {REASONS.map((reason) => (
                                <li key={reason.title}>
                                    <Card variant="outline" className="p-3">
                                        <Badge tone={reason.tone} as="h3">{reason.title}</Badge>
                                        <p className="mt-2 text-sw-body">{reason.text}</p>
                                    </Card>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Plan Your Visit: pick a campus, then open its route */}
                    <Card variant="panel" className="p-4">
                        <h3 className="mb-3 text-sw-h3 font-bold">Plan Your Visit</h3>
                        <ul className="mb-3 flex flex-wrap gap-2" aria-label="Choose a campus">
                            {LOCATIONS.map((location, index) => (
                                <li key={location.name}>
                                    <button
                                        type="button"
                                        onClick={() => setVisitIndex(index)}
                                        aria-pressed={index === visitIndex}
                                        className={cx(
                                            'min-h-9 rounded-sw-pill px-3 text-sw-small font-semibold ring-1 ring-inset transition-colors duration-sw-fast',
                                            index === visitIndex ? 'bg-sw-black text-sw-white ring-sw-black' : 'bg-sw-white text-sw-text ring-sw-border-light hover:bg-sw-gray-50'
                                        )}
                                    >
                                        {location.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <ul className="space-y-2">
                            {VISIT_OPTIONS.map((option) => (
                                <li key={option.title}>
                                    <a
                                        href={directionsUrl(visitLocation, option.travelMode)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`${option.title} to ${visitLocation.name}: open route in Google Maps`}
                                        className="flex items-center gap-3 rounded-sw-sm bg-sw-white p-2.5 shadow-sw-input transition-shadow duration-sw-fast hover:shadow-sw-soft"
                                    >
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sw-pill bg-sw-black text-sw-white">
                                            <Icon icon={option.icon} size="sm" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block font-bold">{option.title}</span>
                                            <span className="block text-sw-small font-normal text-sw-text-secondary">
                                                {visitLocation.isMain ? option.mainCampus : `Route to ${visitLocation.name} on Google Maps`}
                                            </span>
                                        </span>
                                        <Icon icon={LuChevronRight} size="sm" className="shrink-0" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </Container>
            </div>
        </section>
    )
}

export default Location
