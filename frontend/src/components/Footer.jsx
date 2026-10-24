import {useState} from 'react';
import Swal from 'sweetalert2'
import { Link } from 'react-router-dom'
import { LuLoaderCircle } from 'react-icons/lu'
import { DESIGNER_CREDIT } from './site/siteConfig'
import Icon from './site/Icon'

const Footer = () => {
    const currentYear = new Date().getFullYear()
    const [newsletterEmail, setNewsletterEmail] = useState('')
    const [isSubscribing, setIsSubscribing] = useState(false)

    const footerData = {
        quickLinks: [
            { name: "About Us", url: "/about" },
            { name: "Programs", url: "/#institutions" },
            { name: "Admissions", url: "/register" },
            { name: "Gallery", url: "/gallery" },
            { name: "Contact", url: "/contact" }
        ],
        // Each opens that institution's programs on the homepage
        programs: [
            { name: "School Education", url: "/?institution=school#institutions" },
            { name: "Higher Secondary", url: "/?institution=higher-secondary#institutions" },
            { name: "Degree College", url: "/?institution=degree-college#institutions" },
            { name: "Engineering", url: "/?institution=engineering#institutions" },
            { name: "Management", url: "/?institution=management-school#institutions" }
        ],
        support: [
            { name: "Student Portal", url: "/login/student" },
            { name: "Parent Portal", url: "/login-portal" },
            { name: "Career Guidance", url: "/?explore=career#explore" }
        ]
    }

    const validateNewsletterEmail = (email) => {
        if (!email.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Email Required',
                text: 'Please enter your email address',
                confirmButtonColor: 'rgb(var(--sw-black))'
            })
            return false
        }
        if (!email.includes('@')) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Email',
                text: 'Please enter a valid email address',
                confirmButtonColor: 'rgb(var(--sw-black))'
            })
            return false
        }
        return true
    }

    const handleNewsletterSubmit = async (e) => {
        e.preventDefault()

        if (!validateNewsletterEmail(newsletterEmail)) return

        setIsSubscribing(true)

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    access_key: '9ec47c5e-26a9-46b3-8845-210426d38985', // Replace with your actual access key
                    subject: 'Newsletter Subscription - Swagat Group of Institutions',
                    email: newsletterEmail,
                    message: `New newsletter subscription from: ${newsletterEmail}`,
                    from_name: 'Newsletter Subscriber',
                    replyto: newsletterEmail
                })
            })

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Successfully Subscribed!',
                    text: 'Thank you for subscribing to our newsletter. You will receive updates about our latest news, events, and educational insights!',
                    confirmButtonColor: 'rgb(var(--sw-black))',
                    confirmButtonText: 'Great!'
                })

                // Reset form
                setNewsletterEmail('')
            } else {
                throw new Error('Failed to subscribe')
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong! Please try again later.',
                confirmButtonColor: 'rgb(var(--sw-black))'
            })
        } finally {
            setIsSubscribing(false)
        }
    }

    const columns = [
        { title: 'Our Programs', links: footerData.programs },
        { title: 'Quick Links', links: footerData.quickLinks },
        { title: 'Support', links: footerData.support },
    ]

    const linkClass = 'sw-tap inline-flex min-h-11 items-center text-sw-body-lg text-sw-white transition-colors duration-sw-fast hover:text-sw-text-on-dark-secondary hover:underline underline-offset-4 lg:min-h-0'

    return (
        <footer className="sw-deco-navy relative overflow-hidden bg-sw-black text-sw-text-on-dark">
            <div className="sw-container-wide pt-16 lg:pt-20">
                <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4 lg:gap-x-8">
                    {columns.map((column) => (
                        <nav key={column.title} aria-label={column.title}>
                            <h2 className="mb-4 text-sw-h2 font-bold lg:mb-5">{column.title}</h2>
                            <ul className="space-y-0 lg:space-y-1">
                                {column.links.map((link, index) => (
                                    <li key={index}>
                                        <Link to={link.url} className={linkClass}>
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}

                    {/* Stay Updated (newsletter) */}
                    <div className="col-span-2 lg:col-span-1">
                        <h2 className="mb-4 text-sw-h2 font-bold lg:mb-5">Stay Updated</h2>
                        <p className="mb-5 text-sw-body text-sw-text-on-dark-secondary">
                            Subscribe to our newsletter for the latest updates, events, and educational insights.
                        </p>
                        <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                            <label htmlFor="footer-newsletter-email" className="sr-only">Email address</label>
                            <input
                                id="footer-newsletter-email"
                                type="email"
                                value={newsletterEmail}
                                onChange={(e) => setNewsletterEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="block min-h-11 w-full rounded-sw-sm bg-sw-white/10 px-4 text-sw-body text-sw-white ring-1 ring-inset ring-sw-white/20 placeholder:text-sw-text-on-dark-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-sw-focus"
                            />
                            <button
                                type="submit"
                                disabled={isSubscribing}
                                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-sw-sm bg-sw-white px-4 text-sw-label font-semibold text-sw-black transition-colors duration-sw-fast hover:bg-sw-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubscribing ? (
                                    <>
                                        <Icon icon={LuLoaderCircle} size="xs" className="animate-spin" />
                                        Subscribing...
                                    </>
                                ) : (
                                    'Subscribe'
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-14 flex flex-col items-center gap-3 border-t border-sw-white/10 pt-8 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-x-6 text-sw-caption text-sw-text-on-dark-secondary">
                        <Link to="/privacy-policy" className="inline-flex min-h-11 items-center hover:text-sw-white">Privacy Policy</Link>
                        <Link to="/terms-and-conditions" className="inline-flex min-h-11 items-center hover:text-sw-white">Terms of Service</Link>
                    </div>
                    <p className="text-sw-caption text-sw-white">
                        © {currentYear} Swagat Odisha. All rights reserved.
                    </p>
                    <a
                        href={DESIGNER_CREDIT.url}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex min-h-11 items-center text-sw-caption text-sw-text-on-dark-muted transition-colors duration-sw-fast hover:text-sw-text-on-dark-secondary"
                    >
                        {DESIGNER_CREDIT.label}
                    </a>
                </div>
            </div>

            {/* Brand watermark, clipped by the bottom edge like the Figma */}
            <div aria-hidden="true" className="mt-6 flex h-[0.62em] select-none justify-center overflow-hidden font-sw-display text-sw-display-xl font-extrabold leading-none text-sw-watermark">
                <span className="sw-decor-text shrink-0 whitespace-nowrap" data-text="Swagat Odisha" />
            </div>
        </footer>
    )
}

export default Footer
