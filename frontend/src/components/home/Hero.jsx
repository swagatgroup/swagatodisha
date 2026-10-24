import { LuArrowDown, LuPhone } from 'react-icons/lu'
import { CONTACT_INFO } from '../../utils/constants'
import Badge from '../site/Badge'
import Button from '../site/Button'
import SmartImage from '../site/SmartImage'
import { redesignImage } from '../site/redesignImages'

const BENEFITS = [
    { label: 'Affordable fees', tone: 'blue' },
    { label: 'Support from admission to completion', tone: 'lavender' },
    { label: 'Study from anywhere in Odisha', tone: 'peach' },
]

// Homepage hero: full-bleed photo, AIDA copy, call + explore CTAs
const Hero = () => {
    const scrollToCourses = () => {
        document.getElementById('institutions')?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <section id="home" aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-sw-ink text-sw-white">
            <SmartImage
                src={redesignImage('hero-desktop')}
                mobileSrc={redesignImage('hero-mobile')}
                alt=""
                width={2880}
                height={2048}
                priority
                placeholder="night"
                className="absolute inset-0 -z-20"
            />
            {/* Keeps the copy readable over any photo */}
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_50%_45%,rgb(var(--sw-black)/0.65)_0%,rgb(var(--sw-black)/0.25)_70%,rgb(var(--sw-black)/0.55)_100%)]" />
            <div aria-hidden="true" className="sw-deco-navy absolute inset-0 -z-10" />

            <div className="sw-container flex min-h-[640px] flex-col items-center justify-center pb-16 pt-[calc(var(--sw-header-h)+3rem)] text-center md:min-h-[760px] lg:min-h-[min(100svh,1024px)] lg:pb-24">
                <Badge tone="dark" className="mb-5">Distance education for Odisha</Badge>

                <h1 id="hero-title" className="text-sw-display font-bold">
                    Your degree,
                    <span
                        aria-hidden="true"
                        className="mx-2 inline-block h-[0.7em] w-[1.4em] translate-y-[0.06em] overflow-hidden rounded-sw-pill align-baseline md:mx-3"
                    >
                        <SmartImage as="span" src={redesignImage('hero-pill')} alt="" width={360} height={180} priority placeholder="dusk" className="h-full w-full" />
                    </span>
                    <br />
                    start to finish.
                </h1>

                <p className="mt-5 max-w-2xl text-sw-subtitle text-sw-white/85">
                    Affordable distance courses for students across Odisha, with real support from the day you enrol to the day you complete your course.
                </p>

                <ul aria-label="Why students choose Swagat" className="mt-6 flex flex-wrap justify-center gap-2">
                    {BENEFITS.map((benefit) => (
                        <li key={benefit.label}>
                            <Badge tone={benefit.tone}>{benefit.label}</Badge>
                        </li>
                    ))}
                </ul>

                <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:mt-10">
                    <Button variant="frost" size="lg" href={`tel:${CONTACT_INFO.phone}`} iconRight={LuPhone}>
                        Let&apos;s book a call
                    </Button>
                    <Button variant="glass" size="lg" onClick={scrollToCourses} iconRight={LuArrowDown}>
                        Explore courses
                    </Button>
                </div>
            </div>
        </section>
    )
}

export default Hero
