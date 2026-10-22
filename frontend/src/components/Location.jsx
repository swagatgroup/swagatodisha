import { LuBus, LuCar, LuMail, LuMap, LuMapPin, LuPhone, LuTrainFront } from 'react-icons/lu'
import { Container, SectionHeader } from './site/Layout'
import Badge from './site/Badge'
import Card from './site/Card'
import Icon from './site/Icon'
import { DotField, PointerDoodle } from './site/Decor'

const Location = () => {
    const locationData = [
        {
            name: "Swagat Group of Institutions - Sargiguda",
            address: "Sargiguda, PO - Sargul, PS - Kantabanji, Balangir, Odisha, Pin-767039",
            phone: "+91 7855959544",
            email: "contact@swagatodisha.com",
            coordinates: { lat: 20.099885, lng: 82.677498 }
        },
        {
            name: "Swagat Group of Institutions - Ghantiguda",
            address: "Ghantiguda, PO - Chalna, PS - Sinapali, Nuapada, Odisha, Pin-766108",
            phone: "+91 7855959544",
            email: "contact@swagatodisha.com",
            coordinates: { lat: 20.099885, lng: 82.677498 }
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
                <DotField className="inset-x-0 top-24 h-[640px]" />
                <Container className="relative">
                    <SectionHeader id="campuses-title" title="Our Campuses" subtitle="Inspiring spaces across Odisha." />

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-[108px]">
                        {locationData.map((location, index) => (
                            <article
                                key={index}
                                className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] items-start gap-4 md:block md:rounded-sw-md md:bg-sw-black md:p-4 md:text-sw-text-on-dark"
                            >
                                {/* Map card (on mobile the details sit beside it, as in the Figma) */}
                                <div className="rounded-sw-md bg-sw-black p-2 md:rounded-none md:bg-transparent md:p-0">
                                    <div className="sw-ph-map relative aspect-[410/388] overflow-hidden rounded-sw-sm">
                                        <iframe
                                            src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${location.coordinates.lat},${location.coordinates.lng}&zoom=15&maptype=roadmap`}
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            allowFullScreen=""
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            title={`${location.name} Location`}
                                            className="absolute inset-0 grayscale-[35%]"
                                        ></iframe>
                                        <h3 className="pointer-events-none absolute inset-x-0 top-0 hidden bg-gradient-to-b from-sw-black/70 to-transparent p-4 pb-10 text-sw-h3 font-semibold text-sw-white md:block">
                                            {location.name}
                                        </h3>
                                    </div>
                                    <div className="mt-2 flex justify-center md:mt-4">
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${location.coordinates.lat},${location.coordinates.lng}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-sw-pill bg-sw-glass/90 px-3 text-sw-small font-semibold text-sw-white ring-1 ring-inset ring-sw-white/10 transition-colors duration-sw-fast hover:bg-sw-glass-hover md:px-5 md:text-sw-label md:font-medium"
                                        >
                                            Get Directions
                                            <Icon icon={LuMapPin} size="sm" className="hidden md:block" />
                                        </a>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="md:mt-5 md:px-1">
                                    <h3 className="mb-3 text-sw-label font-semibold md:hidden">{location.name}</h3>
                                    <ul className="space-y-3 text-sw-body">
                                        <li className="flex items-start gap-3">
                                            <Icon icon={LuMap} size="sm" className="mt-0.5 shrink-0" />
                                            <span className="min-w-0 break-words">{location.address}</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <Icon icon={LuPhone} size="sm" className="shrink-0" />
                                            <span>{location.phone}</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <Icon icon={LuMail} size="sm" className="mt-0.5 shrink-0" />
                                            <span className="min-w-0 break-all">{location.email}</span>
                                        </li>
                                    </ul>
                                </div>
                            </article>
                        ))}
                    </div>
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
