import {useState, useEffect} from 'react';
import {
    RiBuildingLine,
    RiCalendarLine,
    RiGraduationCapLine,
    RiHeartLine,
    RiImageFill,
    RiSchoolLine,
    RiTeamLine,
} from '@remixicon/react';
import { LuImage, LuLoaderCircle, LuZoomIn } from 'react-icons/lu'
import PageHero from './site/PageHero'
import { Container, Section } from './site/Layout'
import Button from './site/Button'
import Icon from './site/Icon'
import Modal from './site/Modal'
import Tabs from './site/Tabs'
import { EmptyState } from './site/Feedback'

const Gallery = () => {
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [selectedImage, setSelectedImage] = useState(null)
    const [galleryImages, setGalleryImages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await fetch(`${API_URL}/api/gallery/public?limit=100`);
                const json = await res.json();
                if (json.success) {
                    // Map backend schema to frontend schema
                    const mapped = json.data.map(img => ({
                        id: img._id,
                        src: img.imageUrl,
                        alt: img.title || 'Gallery Image',
                        category: img.category ? img.category.toLowerCase() : 'campus',
                        title: img.title || ''
                    }));
                    setGalleryImages(mapped);
                }
            } catch (err) {
                console.error('Error fetching gallery:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchGallery();
    }, []);

    const categories = [
        { id: 'all', name: 'All Photos', icon: RiImageFill },
        { id: 'campus', name: 'Campus Life', icon: RiSchoolLine },
        { id: 'events', name: 'Events', icon: RiCalendarLine },
        { id: 'students', name: 'Students', icon: RiGraduationCapLine },
        { id: 'faculty', name: 'Faculty', icon: RiTeamLine },
        { id: 'infrastructure', name: 'Infrastructure', icon: RiBuildingLine }
    ]

    

    const filteredImages = selectedCategory === 'all'
        ? galleryImages
        : galleryImages.filter(image => image.category === selectedCategory)

    const openLightbox = (image) => {
        setSelectedImage(image)
    }

    const closeLightbox = () => {
        setSelectedImage(null)
    }

    const stats = [
        { icon: RiImageFill, value: `${galleryImages.length}+`, label: 'Total Photos' },
        { icon: RiSchoolLine, value: '6', label: 'Categories' },
        { icon: RiCalendarLine, value: '365', label: 'Days of Memories' },
        { icon: RiHeartLine, value: '100%', label: 'Quality Content' },
    ]

    const hero = (
        <PageHero
            title="Our Gallery"
            intro="Explore the vibrant life at Swagat Group of Institutions through our comprehensive photo gallery. From campus views to student activities, discover what makes our institution special."
        />
    )

    if (loading) return (
        <div>
            {hero}
            <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-live="polite">
                <Icon icon={LuLoaderCircle} size="lg" className="animate-spin" />
                <span className="sr-only">Loading gallery</span>
            </div>
        </div>
    );
    return (
        <div>
            {/* Hero Section */}
            {hero}

            {/* Category Filter */}
            <Section className="pb-0">
                <Container>
                    <Tabs
                        label="Gallery categories"
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        className="justify-center"
                        items={categories.map((category) => {
                            const CategoryIcon = category.icon
                            return { id: category.id, label: category.name, panelId: 'gallery-grid', icon: <CategoryIcon size={18} aria-hidden="true" /> }
                        })}
                    />
                </Container>
            </Section>

            {/* Gallery Grid */}
            <Section id="gallery-grid" role="tabpanel" aria-labelledby={`tab-${selectedCategory}`}>
                <Container>
                    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredImages.map((image) => (
                            <li key={image.id}>
                                <button
                                    type="button"
                                    className="group relative block w-full overflow-hidden rounded-sw-md bg-sw-black p-2 text-left"
                                    onClick={() => openLightbox(image)}
                                >
                                    <span className="block aspect-square overflow-hidden rounded-sw-sm">
                                        <img
                                            src={image.src}
                                            alt={image.alt}
                                            loading="lazy"
                                            decoding="async"
                                            className="h-full w-full object-cover transition-transform duration-sw-slow motion-safe:group-hover:scale-105"
                                        />
                                    </span>
                                    <span className="flex items-center justify-between gap-3 px-2 pb-1 pt-3 text-sw-white">
                                        <span className="min-w-0">
                                            <span className="block truncate font-semibold">{image.title}</span>
                                            <span className="block text-sw-small font-normal capitalize text-sw-text-on-dark-muted">{image.category}</span>
                                        </span>
                                        <Icon icon={LuZoomIn} size="sm" className="shrink-0" />
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>

                    {filteredImages.length === 0 && (
                        <EmptyState
                            icon={LuImage}
                            title="No Images Found"
                            description="Try selecting a different category or check back later."
                        />
                    )}
                </Container>
            </Section>

            {/* Statistics Section */}
            <Section tone="muted">
                <Container>
                    <ul className="grid grid-cols-2 gap-6 md:grid-cols-4">
                        {stats.map((stat) => {
                            const StatIcon = stat.icon
                            return (
                                <li key={stat.label} className="text-center">
                                    <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-sw-md bg-sw-black text-sw-white">
                                        <StatIcon size={24} aria-hidden="true" />
                                    </span>
                                    <p className="text-sw-h2 font-bold">{stat.value}</p>
                                    <p className="text-sw-body text-sw-text-secondary">{stat.label}</p>
                                </li>
                            )
                        })}
                    </ul>
                </Container>
            </Section>

            {/* CTA Section */}
            <Section tone="dark">
                <Container className="text-center">
                    <h2 className="text-sw-display font-bold">Experience Our Campus Life</h2>
                    <p className="mx-auto mb-8 mt-4 max-w-3xl text-sw-subtitle text-sw-text-on-dark-secondary">
                        See is believing! Browse through our gallery to get a real feel of the vibrant atmosphere
                        and world-class facilities at Swagat Group of Institutions.
                    </p>
                    <div className="flex flex-col justify-center gap-3 sm:flex-row">
                        <Button variant="inverse" size="lg" to="/contact">Schedule a Visit</Button>
                        <Button variant="glass" size="lg" to="/contact">Contact Us</Button>
                    </div>
                </Container>
            </Section>

            {/* Lightbox Modal */}
            <Modal
                open={!!selectedImage}
                onClose={closeLightbox}
                tone="dark"
                size="xl"
                title={selectedImage?.title || selectedImage?.alt}
                description={selectedImage?.category}
                bodyClassName="flex items-center justify-center"
            >
                {selectedImage && (
                    <img
                        src={selectedImage.src}
                        alt={selectedImage.alt}
                        className="h-auto max-h-[70vh] w-full rounded-sw-sm object-contain"
                    />
                )}
            </Modal>
        </div>
    )
}

export default Gallery
