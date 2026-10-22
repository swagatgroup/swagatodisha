import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import {
    LuArrowUpRight,
    LuBellRing,
    LuCalendarDays,
    LuCompass,
    LuFileMinus,
    LuInbox,
    LuMail,
    LuMap,
    LuMapPin,
    LuMenu,
    LuPhone,
    LuPlus,
    LuSend,
} from 'react-icons/lu'
import { Container, Section, SectionHeader } from './Layout'
import Button from './Button'
import Card from './Card'
import Badge from './Badge'
import Icon from './Icon'
import { Input, Select, Textarea } from './Field'
import Tabs from './Tabs'
import AccordionItem from './Accordion'
import { EmptyState, LoadingList, Skeleton } from './Feedback'
import Modal from './Modal'
import SmartImage from './SmartImage'
import { DotField, PointerDoodle } from './Decor'

// Dev-only visual check of every primitive (route /_design, excluded from production builds)
const SWATCHES = [
    'black', 'glass', 'glass-rim', 'surface-muted', 'surface-pill', 'border-dark', 'border-light', 'dot', 'watermark',
    'badge-blue', 'badge-lavender', 'badge-peach', 'text-muted', 'placeholder', 'focus',
]
const GRAYS = [25, 50, 100, 200, 300, 400, 500, 600, 700, 750, 800, 850, 900]
const TYPE = [
    ['display-xl', 'font-sw-display text-sw-display-xl font-extrabold'],
    ['display', 'text-sw-display font-bold'],
    ['display-alt', 'font-sw-display text-sw-display-alt font-bold'],
    ['h2', 'text-sw-h2 font-bold'],
    ['subtitle', 'text-sw-subtitle'],
    ['h3', 'text-sw-h3 font-semibold'],
    ['body-lg', 'text-sw-body-lg'],
    ['body', 'text-sw-body'],
    ['label', 'text-sw-label font-medium'],
    ['small', 'text-sw-small font-semibold'],
    ['tile', 'font-sw-display text-sw-tile'],
    ['caption', 'text-sw-caption'],
]

const Block = ({ title, children }) => (
    <div className="border-t border-sw-border-light py-10">
        <h3 className="mb-6 text-sw-h3 font-bold">{title}</h3>
        {children}
    </div>
)

const DesignPreview = () => {
    const [tab, setTab] = useState('all')
    const [modalOpen, setModalOpen] = useState(false)

    return (
        <main className="pb-24">
            <Helmet>
                <title>Design system preview</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>

            <Section tone="dark">
                <Container>
                    <SectionHeader tone="dark" as="h1" title="Swagat design system" subtitle="Every primitive and variant, for checking against the Figma." />
                </Container>
            </Section>

            <Container>
                <Block title="Colour">
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                        {SWATCHES.map((name) => (
                            <div key={name}>
                                <div className="h-14 rounded-sw-sm ring-1 ring-sw-border-light" style={{ background: `rgb(var(--sw-${name}))` }} />
                                <p className="mt-1 text-sw-caption">{name}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex overflow-hidden rounded-sw-sm ring-1 ring-sw-border-light">
                        {GRAYS.map((g) => (
                            <div key={g} className="h-12 flex-1" style={{ background: `rgb(var(--sw-gray-${g}))` }} title={`gray-${g}`} />
                        ))}
                    </div>
                </Block>

                <Block title="Typography">
                    <div className="space-y-4 overflow-hidden">
                        {TYPE.map(([name, classes]) => (
                            <div key={name} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
                                <code className="w-32 shrink-0 text-sw-caption text-sw-text-muted">{name}</code>
                                <p className={classes}>
                                    {name === 'display-xl' ? 'Swagat' : 'Your degree, start to finish.'}
                                </p>
                            </div>
                        ))}
                    </div>
                </Block>

                <Block title="Buttons">
                    <div className="flex flex-wrap items-center gap-3">
                        <Button>Primary</Button>
                        <Button variant="light" iconRight={LuSend}>See all resources</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button loading>Sending</Button>
                        <Button disabled>Disabled</Button>
                        <Button size="sm">Small</Button>
                        <Button size="lg">Large</Button>
                        <Button shape="rounded" variant="primary">Send</Button>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-sw-md bg-sw-black p-6">
                        <Button variant="glass">Home</Button>
                        <Button variant="glass" iconRight={LuMapPin}>Get Direction</Button>
                        <Button variant="frost" iconRight={LuPhone}>Let&apos;s book a call</Button>
                        <Button variant="inverse">Inverse</Button>
                        <Button variant="glass" disabled>Disabled</Button>
                    </div>
                </Block>

                <Block title="Badges">
                    <div className="flex flex-wrap gap-2">
                        {['blue', 'lavender', 'peach', 'neutral', 'success', 'warning', 'error', 'info'].map((t) => (
                            <Badge key={t} tone={t}>{t}</Badge>
                        ))}
                        <span className="rounded-sw-sm bg-sw-black p-2"><Badge tone="dark">dark</Badge></span>
                    </div>
                </Block>

                <Block title="Icons (Lucide)">
                    <div className="flex flex-wrap items-center gap-5">
                        {[LuCalendarDays, LuCompass, LuBellRing, LuFileMinus].map((g, i) => <Icon key={i} icon={g} size="xl" strokeWidth={1.5} />)}
                        {[LuArrowUpRight, LuPlus, LuMenu].map((g, i) => <Icon key={i} icon={g} size="lg" strokeWidth={2.75} />)}
                        {[LuSend, LuMapPin, LuMap, LuPhone, LuMail].map((g, i) => <Icon key={i} icon={g} size="md" />)}
                    </div>
                </Block>

                <Block title="Cards">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="p-4" interactive>
                            <div className="sw-pane sw-pane-career aspect-square rounded-sw-sm" />
                            <div className="mt-3 flex items-end justify-between">
                                <p className="sw-text-gradient font-sw-display text-sw-tile">Career<br />Roadmap</p>
                                <Icon icon={LuArrowUpRight} size="lg" strokeWidth={2.75} className="text-sw-gray-300" />
                            </div>
                        </Card>
                        <Card variant="outline" className="p-4">
                            <Badge tone="blue">Strategic Locations</Badge>
                            <p className="mt-3 text-sw-body-lg">Outline card with offset shadow.</p>
                        </Card>
                        <Card variant="panel" className="p-6">
                            <p className="font-semibold">Panel</p>
                            <p className="mt-2">Light grey surface for forms.</p>
                        </Card>
                    </div>
                </Block>

                <Block title="Form fields">
                    <Card variant="panel" className="grid gap-4 p-6 md:grid-cols-2">
                        <Input label="Name" hideLabel placeholder="Name*" required />
                        <Input label="Email" placeholder="Email" hint="We'll reply to this address." />
                        <Input label="Phone" placeholder="Phone Number" error="Enter a 10-digit number" />
                        <Select label="Category" defaultValue="a">
                            <option value="a">Option A</option>
                            <option value="b">Option B</option>
                        </Select>
                        <Textarea label="Message" hideLabel placeholder="Message" className="md:col-span-2" />
                        <Input label="Disabled" disabled placeholder="Disabled" />
                        <Button shape="rounded" fullWidth className="self-end">Send</Button>
                    </Card>
                </Block>

                <Block title="Tabs">
                    <Tabs
                        label="Gallery categories"
                        value={tab}
                        onChange={setTab}
                        items={[{ id: 'all', label: 'All' }, { id: 'campus', label: 'Campus' }, { id: 'events', label: 'Events' }]}
                    />
                    <p className="mt-3 text-sw-text-muted">Selected: {tab}</p>
                </Block>

                <Block title="Accordion">
                    <AccordionItem title={<span className="font-semibold">Engineering</span>} defaultOpen>
                        <p>Panel content.</p>
                    </AccordionItem>
                    <AccordionItem title={<span className="font-semibold">Medical</span>}>
                        <p>Panel content.</p>
                    </AccordionItem>
                </Block>

                <Block title="Loading, empty, modal">
                    <div className="grid gap-6 md:grid-cols-3">
                        <LoadingList rows={3} />
                        <Card variant="dark"><LoadingList rows={2} tone="dark" className="p-4" /></Card>
                        <Card variant="soft"><EmptyState icon={LuInbox} title="No documents yet" description="New notices will appear here as soon as they're published." /></Card>
                    </div>
                    <div className="mt-6 flex gap-3">
                        <Skeleton className="h-10 w-40" />
                        <Button onClick={() => setModalOpen(true)}>Open modal</Button>
                    </div>
                    <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="School" description="Primary & Secondary Education" size="md">
                        <p>Modal body. Esc, the close button and the backdrop all close it; focus is trapped.</p>
                    </Modal>
                </Block>

                <Block title="Image slots, panes and decoration">
                    <div className="grid gap-4 md:grid-cols-4">
                        {['night', 'dusk', 'paper', 'map'].map((p) => (
                            <SmartImage key={p} src={null} placeholder={p} className="aspect-[4/3] rounded-sw-sm" />
                        ))}
                        {['timetable', 'career', 'notice', 'result'].map((p) => (
                            <div key={p} className={`sw-pane sw-pane-${p} aspect-square rounded-sw-sm`} />
                        ))}
                    </div>
                    <div className="relative mt-6 h-64 overflow-hidden rounded-sw-md ring-1 ring-sw-border-light">
                        <DotField className="inset-0" />
                        <PointerDoodle className="absolute right-6 top-6 h-12 w-12" />
                    </div>
                </Block>
            </Container>
        </main>
    )
}

export default DesignPreview
