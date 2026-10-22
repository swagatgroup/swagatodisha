// Redesign photography lives in src/assets/images/redesign/ (see Redesign/IMAGE_BRIEF.md).
// Files are discovered at build time, so a slot whose photo hasn't been added yet
// renders its gradient placeholder without requesting a missing file.
const files = import.meta.glob('../../assets/images/redesign/*.{webp,avif,jpg,jpeg,png}', {
    eager: true,
    query: '?url',
    import: 'default',
})

const byName = Object.fromEntries(
    Object.entries(files).map(([path, url]) => [path.split('/').pop().replace(/\.[^.]+$/, ''), url])
)

// redesignImage('hero-desktop') -> hashed asset URL, or null until the file exists
export const redesignImage = (name) => byName[name] || null
