// App configuration
export const APP_CONFIG = {
    name: 'Swagat Group of Institutions',
    description: 'Education • Innovation • Revolution',
    version: '1.0.0',
    author: 'Swagat Odisha'
}

// Navigation items
export const NAV_ITEMS = [
    { name: 'Home', href: '#hero', icon: 'fa-house-chimney' },
    { name: 'About Us', href: '#about-us', icon: 'fa-circle-info' },
    { name: 'Institutions', href: '#', icon: 'fa-building-columns', hasDropdown: true },
    { name: 'Milestone', href: '#', icon: 'fa-flag', hasDropdown: true },
    { name: 'Gallery', href: '#', icon: 'fa-folder-open' },
    { name: 'Contact Us', href: '#', icon: 'fa-phone', hasDropdown: true },
    { name: 'Login', href: 'https://swagatodisha.com/app/login.php', icon: 'fa-user' }
]

// Social links
export const SOCIAL_LINKS = {
    phone: '+91 6670356176',
    email: 'contact@swagatodisha.com',
    facebook: 'https://www.facebook.com/Swagat-Group-of-Institutions-108863395171576',
    twitter: 'https://twitter.com/SwagatOdisha',
    instagram: 'https://instagram.com/Swagat_Odisha',
    youtube: 'https://youtube.com/channel/UCQ5GY_dOSPmyhOeUkq61R1w',
    linkedin: 'https://Linkedin.com/in/SwagatOdisha'
}

// Institution types
export const INSTITUTION_TYPES = [
    {
        id: 1,
        name: 'School',
        icon: 'fa-school',
        color: 'rgb(124, 24, 24)',
        institutions: ['Swagat Public School Sinapali']
    },
    {
        id: 2,
        name: 'Higher Secondary School',
        icon: 'fa-book',
        color: 'rgb(76, 13, 91)',
        institutions: ['BBOSE', 'NIOS', 'Central Sanskrit University']
    },
    {
        id: 3,
        name: 'Degree College',
        icon: 'fa-graduation-cap',
        color: 'rgb(49, 86, 155)',
        institutions: ['Capital University', 'YBN University', 'MATS University', 'J.S. University']
    },
    {
        id: 4,
        name: 'Management School',
        icon: 'fa-user-tie',
        color: 'rgb(18, 99, 62)',
        institutions: ['Capital University', 'YBN University', 'MATS University', 'J.S. University']
    },
    {
        id: 5,
        name: 'Engineering College',
        icon: 'fa-code',
        color: 'rgb(147, 147, 37)',
        institutions: ['Capital University', 'YBN University', 'MATS University', 'J.S. University']
    },
    {
        id: 6,
        name: 'Polytechnic',
        icon: 'fa-screwdriver-wrench',
        color: 'rgb(47, 97, 11)',
        institutions: ['Capital University', 'YBN University', 'MATS University', 'J.S. University']
    },
    {
        id: 7,
        name: 'B.Ed. College',
        icon: 'fa-person-chalkboard',
        color: 'rgb(101, 105, 101)',
        institutions: ['Acharya Nagarjuna University', 'Andhra University', 'MATS University', 'Rayalaseema University']
    },
    {
        id: 8,
        name: 'Computer Academy',
        icon: 'fa-display',
        color: 'rgb(12, 5, 74)',
        institutions: ['RCTI', 'NCTI']
    }
]

// Quick links
export const QUICK_LINKS = [
    {
        id: 1,
        name: 'Time Tables',
        icon: '/img/2072763.png',
        color: 'rgb(253 237 50)',
        href: '#'
    },
    {
        id: 2,
        name: 'Careers',
        icon: '/img/scholarship.png',
        color: 'rgb(255, 202, 79)',
        href: '#'
    },
    {
        id: 3,
        name: 'News Letters',
        icon: '/img/information.png',
        color: 'rgb(109, 197, 74)',
        href: '#'
    },
    {
        id: 4,
        name: 'Results',
        icon: '/img/results.png',
        color: 'rgb(52 48 146)',
        href: '#'
    }
]

// Management team
export const MANAGEMENT_TEAM = [
    {
        id: 1,
        name: 'Mr. R.K. Meher',
        position: 'Chairman',
        image: '/img/chairman.jpg'
    },
    {
        id: 2,
        name: 'Mr. Gangadhar Meher',
        position: 'Trustee',
        image: '/img/mnt 005.jpg'
    },
    {
        id: 3,
        name: 'Mr. Sameer Meher',
        position: 'Trustee',
        image: '/img/mnt 006.jpg'
    },
    {
        id: 4,
        name: 'Mrs. Manjula Meher',
        position: 'Principal',
        image: '/img/mnt 003.jpg'
    },
    {
        id: 5,
        name: 'Mr. Sushanta Bhoi',
        position: 'Managing Director',
        image: '/img/mnt 002.jpg'
    },
    {
        id: 6,
        name: 'Mr. Lorem ipsum',
        position: 'Marketing Director',
        image: '/img/mnt 004.jpg'
    }
]

// Carousel images
export const CAROUSEL_IMAGES = [
    '/img/slider001 SO.jpeg',
    '/img/slider002 SO.jpeg',
    '/img/slider003 SO.jpeg',
    '/img/slider004 SO.jpeg'
]

// Chairman message
export const CHAIRMAN_MESSAGE = {
    name: 'Mr. R.K. Meher',
    position: 'Chairman',
    image: '/img/chairman.jpg',
    message: `"There were various obstacles to make the empire of Swagat group of Institutions stand. However the real challenge was in giving shape to it and maintaining quality services. But with the consistent efforts of our team, now it is possible to bring a revolution. The overwhelming response of students, parents and well-wishers is the only way to judge our progress throughout the years. I would like to thank all for your immense love and support".`
}

// Video section
export const VIDEO_SECTION = {
    title: 'A Glance of Swagat',
    description: 'This is a virtual tour to the Swagat Group of Institutions. It shows the standard of infrastructure and quality atmosphere that we provide to our students. We aim to bring about a revolution in the field of education by encouraging the youth to frame innovative ideas and to be a part of this revolutionary journey.',
    locations: ['Bhawanipatna', 'Sinapali'],
    videoUrl: 'https://videos.pond5.com/aerial-drone-shot-elementary-school-footage-079427446_main_xxl.mp4'
}

// Milestone
export const MILESTONE = {
    year: '2021',
    title: 'Building from Scratch #1 (Sinapali Public School)',
    image: '/img/Milestone 001.jpg',
    description: 'Swagat Group at early phase'
}

// Location
export const LOCATION = {
    address: 'Rrr, Naktiguda, Bhawanipatna, Odisha 766001',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3751.430049734715!2d83.151755749193!3d19.906274586551355!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a24e934ac5f21a3%3A0x163989ed75231f8d!2sswagat%20institute!5e0!3m2!1sen!2sin!4v1653113592392!5m2!1sen!2sin'
}
