import { LuBus, LuCar, LuMail, LuMapPin, LuPhone, LuTrainFront } from 'react-icons/lu'
import { CONTACT_INFO } from '../utils/constants'
import { Container, SectionHeader } from './site/Layout'
import Badge from './site/Badge'
import Card from './site/Card'
import Icon from './site/Icon'
import { DotField, PointerDoodle } from './site/Decor'

const Location = () => {
    // `mapQuery` is what the map searches for. Pins found from a place name are approximate.
    const locationData = [
        {
            name: "Swagat Group of Institutions - Sargiguda",
            detail: "Includes Swagat Public School, Sargiguda",
            address: "Sargiguda, PO - Sargul, PS - Kantabanji, Balangir, Odisha, Pin-767039",
            mapQuery: "Sargiguda, Kantabanji, Balangir, Odisha 767039"
        },
        {
            name: "Swagat Group of Institutions - Ghantiguda",
            detail: "Includes Swagat Public School, Ghantiguda",
            address: "Ghantiguda, PO - Chalna, PS - Sinapali, Nuapada, Odisha, Pin-766108",
            mapQuery: "20.099885,82.677498"
        },
        {
            name: "Swagat Public School, Lakhna",
            address: "Lakhna, Nuapada, Odisha - 766108",
            mapQuery: "Lakhna, Nuapada, Odisha"
        },
        {
            name: "Swagat City Office, Bangomunda",
            address: "At/PO - Bangomunda, Dist - Balangir, Odisha, Pin-767040",
            mapQuery: "Bangomunda, Balangir, Odisha 767040"
        },
        {
            name: "Swagat Institute, Kantabanji",
            address: "Kantabanji, Balangir, Odisha",
            mapQuery: "Kantabanji, Balangir, Odisha"
        },
        {
            name: "Swagat Institute, Titilagarh",
            address: "Titilagarh, Balangir, Odisha",
            mapQuery: "Titilagarh, Balangir, Odisha"
        }
    ]

    const reasons = [
        { title: "Strategic Locations", tone: "blue", text: "Located in Sargiguda, Kantabanji and Ghantiguda, Sinapali with easy access to major transportation routes" },
        { title: "Modern Infrastructure", tone: "lavender", text: "State-of-the-art facilities with the latest technology and amenities" },
        { title: "Safe Environment", tone: "peach", text: "Secure campus with 24/7 security and a peaceful learning environment" },
    ]

    const visitOptions = [
        { title: "By Bus", text: "Kantabanji Bus Stand - 15 minutes drive", icon: LuBus },
        { title: "By Car", text: "NH 26 via Kantabanji - Easy access", icon: LuCar },
        { title: "By Train", text: "Kantabanji Station - 20 minutes drive", icon: LuTrainFront },
    ]

    return (
        <section id="location" aria-labelledby="campuses-title" className="relative w-full overflow-hidden bg-sw-white">
            {/* Our Campuses */}
            <div className="sw-section relative">
                <DotField className="inset-x-0 top-24 h-[480px]" />
                <Container className="relative">
                    <SectionHeader id="campuses-title" title="Our Campuses" subtitle="Inspiring spaces across Odisha." />

                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:gap-5">
                        {locationData.map((location) => (
                            <li key={location.name} className="flex flex-col rounded-sw-md bg-sw-black p-2 text-sw-text-on-dark sm:p-3">
                                <div className="sw-ph-map relative aspect-[16/10] overflow-hidden rounded-sw-sm min-[900px]:aspect-[2/1]">
                                    <iframe
                                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(location.mapQuery)}&zoom=13&maptype=roadmap`}
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
                                <h3 className="mt-2 text-sw-small font-semibold leading-tight text-sw-white sm:text-sw-label">{location.name}</h3>
                                {location.detail && <p className="mt-0.5 hidden text-sw-caption text-sw-text-on-dark-muted sm:block">{location.detail}</p>}
                                <p className="mb-2 mt-1 text-sw-caption text-sw-text-on-dark-secondary">{location.address}</p>
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.mapQuery)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Get directions to ${location.name}`}
                                    className="mt-auto inline-flex min-h-11 items-center justify-center gap-1.5 rounded-sw-pill bg-sw-glass/90 px-3 text-sw-small font-semibold text-sw-white ring-1 ring-inset ring-sw-white/10 transition-colors duration-sw-fast hover:bg-sw-glass-hover"
                                >
                                    Get Directions
                                    <Icon icon={LuMapPin} size="xs" className="hidden sm:block" />
                                </a>
                            </li>
                        ))}
                    </ul>

                    <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sw-body">
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
                <Container className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
                    <div>
                        <h2 className="relative inline-block pr-14 font-sw-display text-sw-display-alt font-bold">
                            Why Choose Our Location
                            <PointerDoodle className="absolute -bottom-2 right-0 h-10 w-10 lg:h-14 lg:w-14" />
                        </h2>

                        {/* Timeline */}
                        <ol className="relative ml-3 mt-8 space-y-8 border-l-[3px] border-sw-black pb-2 pl-10 pt-6 lg:ml-6 lg:mt-10 lg:space-y-12 lg:pt-16">
                            {reasons.map((reason, index) => (
                                <li key={reason.title} className="relative">
                                    <span aria-hidden="true" className="absolute -left-10 top-1/2 h-[3px] w-9 bg-sw-black" />
                                    <Card variant="outline" className="p-3 lg:max-w-[36rem] lg:p-4">
                                        <Badge tone={reason.tone} as="h3">{reason.title}</Badge>
                                        <p className="mt-3 text-sw-body-lg">{reason.text}</p>
                                    </Card>
                                    {index === reasons.length - 1 && (
                                        <PointerDoodle className="absolute -bottom-4 right-2 hidden h-10 w-10 lg:block" />
                                    )}
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Plan Your Visit */}
                    <div className="lg:pt-24">
                        <Card variant="panel" className="p-6 lg:p-8">
                            <h3 className="mb-5 text-sw-h3 font-bold">Plan Your Visit</h3>
                            <ul className="space-y-3">
                                {visitOptions.map((option) => (
                                    <li key={option.title} className="flex items-center gap-4 rounded-sw-sm bg-sw-white p-4 shadow-sw-input">
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sw-pill bg-sw-black text-sw-white">
                                            <Icon icon={option.icon} size="sm" />
                                        </span>
                                        <span>
                                            <span className="block font-bold">{option.title}</span>
                                            <span className="block text-sw-small font-normal text-sw-text-secondary">{option.text}</span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                </Container>
            </div>
        </section>
    )
}

export default Location
