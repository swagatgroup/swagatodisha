import React from 'react'

export default function CloudWave() {
    return (
        <div className="relative w-full h-64 overflow-visible">
            {/* SVG Cloud Shapes - Multiple layered cloud waves */}
            <svg
                className="absolute bottom-12 left-0 w-full h-full"
                viewBox="0 0 1440 320"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
            >
                {/* First Cloud Layer - Large, soft cloud waves (Back) */}
                <path
                    fill="#1e40af"
                    fillOpacity="0.7"
                    d="M0,200 Q180,150 360,180 Q540,210 720,170 Q900,130 1080,160 Q1260,190 1440,150 L1440,320 L0,320 Z"
                />

                {/* Second Cloud Layer - Medium cloud waves (Middle) */}
                <path
                    fill="#3b82f6"
                    fillOpacity="0.6"
                    d="M0,220 Q200,180 400,200 Q600,220 800,190 Q1000,160 1200,180 Q1400,200 1440,180 L1440,320 L0,320 Z"
                />

                {/* Third Cloud Layer - Smaller, detailed cloud waves (Front) */}
                <path
                    fill="#60a5fa"
                    fillOpacity="0.8"
                    d="M0,240 Q150,200 300,220 Q450,240 600,210 Q750,180 900,200 Q1050,220 1200,200 Q1350,180 1440,200 L1440,320 L0,320 Z"
                />

                {/* Fourth Cloud Layer - Small, detailed cloud formations */}
                <path
                    fill="#93c5fd"
                    fillOpacity="0.9"
                    d="M0,260 Q120,230 240,250 Q360,270 480,240 Q600,210 720,230 Q840,250 960,230 Q1080,210 1200,230 Q1320,250 1440,230 L1440,320 L0,320 Z"
                />

                {/* Top Cloud Layer - Floating cloud details */}
                <path
                    fill="#dbeafe"
                    fillOpacity="0.7"
                    d="M0,280 Q100,250 200,270 Q300,290 400,260 Q500,230 600,250 Q700,270 800,250 Q900,230 1000,250 Q1100,270 1200,250 Q1300,230 1400,250 L1440,240 L1440,320 L0,320 Z"
                />

                {/* Additional floating cloud elements for depth */}
                {/* <circle cx="200" cy="180" r="40" fill="#3b82f6" fillOpacity="0.4" />
                <circle cx="600" cy="160" r="35" fill="#60a5fa" fillOpacity="0.5" />
                <circle cx="1000" cy="190" r="45" fill="#93c5fd" fillOpacity="0.6" />
                <circle cx="1200" cy="170" r="30" fill="#dbeafe" fillOpacity="0.7" /> */}
            </svg>
        </div>
    )
}
