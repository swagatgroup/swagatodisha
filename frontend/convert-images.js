import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function convertImages() {
    try {
        // Convert Facebook/LinkedIn OG image
        await sharp('public/open graphic facebook-linkedin.webp')
            .resize(1200, 630, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 90 })
            .toFile('public/og-image.jpg');
        
        console.log('✅ Created og-image.jpg (1200x630px)');

        // Convert Twitter/X OG image
        await sharp('public/open graphic twitter-x.webp')
            .resize(1200, 600, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 90 })
            .toFile('public/twitter-card.jpg');
        
        console.log('✅ Created twitter-card.jpg (1200x600px)');

        // Create favicon.ico from existing favicon.png
        await sharp('public/favicon.png')
            .resize(32, 32, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .png()
            .toBuffer()
            .then(buffer => {
                // For now, we'll create a 32x32 PNG and rename it to .ico
                // Most modern browsers support PNG favicons
                fs.writeFileSync('public/favicon.ico', buffer);
            });
        
        console.log('✅ Created favicon.ico (32x32px)');

        console.log('\n🎉 All social sharing images created successfully!');
        
    } catch (error) {
        console.error('❌ Error converting images:', error);
    }
}

convertImages(); 