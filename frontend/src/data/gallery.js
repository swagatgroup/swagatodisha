// Gallery categories and campuses, shared by the public gallery, the school pages and the admin upload tab.
// `value` must match the category enum in backend/models/Gallery.js.
export const GALLERY_CATEGORIES = [
    { value: 'Campus', label: 'Campus' },
    { value: 'Classroom', label: 'Classroom' },
    { value: 'Activities', label: 'Activities' },
    { value: 'Celebrations', label: 'Celebrations' },
    { value: 'Events', label: 'Events' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Students', label: 'Students' },
    { value: 'Teachers', label: 'Teachers' },
    { value: 'Achievements', label: 'Achievements' },
    { value: 'Infrastructure', label: 'Infrastructure' },
    { value: 'Laboratory', label: 'Laboratory' },
    { value: 'Library', label: 'Library' },
    { value: 'General', label: 'General' },
]

// The three school names are what the school pages look up, so keep them exactly as written here.
export const SCHOOL_CAMPUS = {
    sargiguda: 'Swagat Public School, Sargiguda',
    ghantiguda: 'Swagat Public School, Ghantiguda',
    lakhna: 'Swagat Public School, Lakhna',
}

export const GALLERY_CAMPUSES = [
    { value: '', label: 'Swagat Group (all campuses)' },
    { value: SCHOOL_CAMPUS.sargiguda, label: SCHOOL_CAMPUS.sargiguda },
    { value: SCHOOL_CAMPUS.ghantiguda, label: SCHOOL_CAMPUS.ghantiguda },
    { value: SCHOOL_CAMPUS.lakhna, label: SCHOOL_CAMPUS.lakhna },
    { value: 'Sargiguda Campus', label: 'Sargiguda Campus (Main)' },
    { value: 'Kantabanji Campus', label: 'Kantabanji Campus' },
    { value: 'Bangomunda Campus', label: 'Bangomunda Campus' },
    { value: 'Titilagarh Campus', label: 'Titilagarh Campus' },
    { value: 'Sinapali Campus', label: 'Sinapali Campus' },
    { value: 'Bhawanipatna Campus', label: 'Bhawanipatna Campus' },
    { value: 'Ghantiguda Campus', label: 'Ghantiguda Campus' },
]

// Public API record -> what the gallery components render
export const toGalleryPhoto = (item) => ({
    id: item._id,
    src: item.imageUrl,
    thumb: item.thumbnailUrl || item.imageUrl,
    title: item.title || '',
    description: item.description || '',
    alt: item.alt || item.title || 'Photo',
    category: item.category || 'General',
    campus: item.campus || '',
    width: item.dimensions?.width || null,
    height: item.dimensions?.height || null,
    featured: !!item.isFeatured,
})
