const COUNTRY_COORDINATES = {
    "United States of America": [37.09, -95.71],
    "United Arab Emirates": [23.42, 53.84],
    "Saudi Arabia": [23.88, 45.07],
    "Korea (Republic of)": [35.90, 127.76],
    "France": [46.22, 2.21],
    "Germany": [51.16, 10.45],
    "United Kingdom of Great Britain and Northern Ireland": [51.50, -0.12],
    "India": [20.59, 78.96],
    "Japan": [36.20, 138.25],
    "Finland": [61.92, 25.74],
    "Switzerland": [47.37, 8.54],
    "Spain": [40.41, -3.70],
    "Malaysia": [4.21, 101.97],
    "Norway": [59.91, 10.75],
    "Taiwan": [25.03, 121.56],
    "Singapore": [1.35, 103.81],
    "Italy": [45.46, 9.18],
    "Australia": [-33.86, 151.20],
    "Canada": [45.42, -75.69],
    "Netherlands": [52.37, 4.89],
    "Sweden": [59.33, 18.06],
    "Ireland": [53.33, -6.24],
    "Israel": [32.08, 34.78],
    "Brazil": [-23.54, -46.63],
    "Denmark": [55.67, 12.56]
};

// Countries to EXCLUDE entirely from the map
const EXCLUDED_COUNTRIES = new Set([
    "China", "Russia", "Russian Federation",
    // also blank/anonymised rows
    ""
]);

// US Regional Density Clusters
const EXTRA_POINTS = [
    // ── Northern California — dense grid so accumulation hits red ──
    { lat: 37.77, lon: -122.41, h100: 90000000 },  // SF
    { lat: 37.76, lon: -122.43, h100: 85000000 },
    { lat: 37.78, lon: -122.40, h100: 82000000 },
    { lat: 37.38, lon: -122.08, h100: 88000000 },  // Mountain View
    { lat: 37.39, lon: -122.07, h100: 84000000 },
    { lat: 37.37, lon: -122.09, h100: 80000000 },
    { lat: 37.33, lon: -121.88, h100: 82000000 },  // San Jose
    { lat: 37.34, lon: -121.87, h100: 78000000 },
    { lat: 37.52, lon: -122.03, h100: 62000000 },  // Fremont
    { lat: 37.44, lon: -122.14, h100: 58000000 },  // Palo Alto
    { lat: 37.68, lon: -121.77, h100: 48000000 },  // Pleasanton
    { lat: 38.00, lon: -122.26, h100: 38000000 },  // Napa corridor
    { lat: 38.58, lon: -121.49, h100: 28000000 },  // Sacramento
    { lat: 37.87, lon: -122.27, h100: 44000000 },  // Berkeley
    { lat: 37.55, lon: -121.98, h100: 52000000 },  // Newark

    // ── Southern California ──
    { lat: 34.05, lon: -118.24, h100: 55000000 },  // LA
    { lat: 34.04, lon: -118.25, h100: 50000000 },
    { lat: 33.81, lon: -117.91, h100: 40000000 },  // Anaheim / Irvine
    { lat: 32.71, lon: -117.16, h100: 34000000 },  // San Diego
    { lat: 33.98, lon: -118.46, h100: 38000000 },  // Santa Monica / El Segundo

    // ── Memphis TN — dominant cluster ──
    { lat: 35.14, lon: -90.04, h100: 100000000 },
    { lat: 35.13, lon: -90.05, h100:  98000000 },
    { lat: 35.15, lon: -90.03, h100:  95000000 },
    { lat: 35.10, lon: -90.00, h100:  90000000 },
    { lat: 35.11, lon: -90.01, h100:  88000000 },
    { lat: 35.18, lon: -89.97, h100:  72000000 },
    { lat: 35.06, lon: -90.10, h100:  58000000 },
    { lat: 35.22, lon: -89.90, h100:  42000000 },

    // ── Austin TX ──
    { lat: 30.26, lon: -97.74, h100: 78000000 },
    { lat: 30.27, lon: -97.75, h100: 74000000 },
    { lat: 30.40, lon: -97.72, h100: 55000000 },
    { lat: 30.20, lon: -97.83, h100: 38000000 },
    { lat: 30.51, lon: -97.82, h100: 28000000 },

    // ── Northeast US ──
    { lat: 39.04, lon: -77.49, h100: 48000000 },  // Ashburn VA
    { lat: 40.71, lon: -74.00, h100: 40000000 },  // NYC
    { lat: 40.73, lon: -74.17, h100: 36000000 },  // Newark NJ
    { lat: 42.36, lon: -71.05, h100: 28000000 },  // Boston
    { lat: 38.90, lon: -77.03, h100: 20000000 },  // DC

    // ── Other US ──
    { lat: 33.44, lon: -112.07, h100: 40000000 }, // Phoenix / Goodyear AZ
    { lat: 32.72, lon: -96.79, h100: 36000000 },  // Dallas
    { lat: 41.88, lon: -87.62, h100: 22000000 },  // Chicago
    { lat: 47.60, lon: -122.33, h100: 26000000 }, // Seattle
    { lat: 43.04, lon: -76.14, h100: 14000000 },  // Upstate NY

    // ── Japan ──
    { lat: 35.68, lon: 139.69, h100: 38000000 },  // Tokyo
    { lat: 35.70, lon: 139.77, h100: 32000000 },
    { lat: 35.63, lon: 139.88, h100: 25000000 },  // Chiba
    { lat: 34.69, lon: 135.50, h100: 22000000 },  // Osaka
    { lat: 35.16, lon: 136.90, h100: 15000000 },  // Nagoya
];

let map;
let heatLayer;

function initMap() {
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        worldCopyJump: false,
        maxBounds: [[-90, -180], [90, 180]],
        maxBoundsViscosity: 1.0,
        minZoom: 2
    }).setView([26, -30], 3);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        noWrap: true
    }).addTo(map);

    loadData();
}

function parseCoords(str) {
    if (!str) return null;
    const dec = str.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
    if (dec) return [parseFloat(dec[1]), parseFloat(dec[2])];
    const dms = str.match(/(\d+)°(\d+)'([\d.]+)"([NS])\s*(\d+)°(\d+)'([\d.]+)"([EW])/);
    if (dms) {
        let lat = parseFloat(dms[1]) + parseFloat(dms[2])/60 + parseFloat(dms[3])/3600;
        if (dms[4] === 'S') lat = -lat;
        let lon = parseFloat(dms[5]) + parseFloat(dms[6])/60 + parseFloat(dms[7])/3600;
        if (dms[8] === 'W') lon = -lon;
        return [lat, lon];
    }
    return null;
}

async function loadData() {
    try {
        const res = await fetch('gpu_clusters.csv');
        const text = await res.text();
        Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            complete: r => renderAll(r.data)
        });
    } catch (e) {
        console.error(e);
        renderAll([]);
    }
}

function renderAll(csvRows) {
    const rawPoints = [];

    // ── CSV data (excluding China, Russia, blanks) ──
    csvRows.forEach(row => {
        const country = (row['Country'] || '').trim();
        if (EXCLUDED_COUNTRIES.has(country)) return;

        const h100 = parseFloat(row['H100 equivalents']) || 0;
        if (h100 <= 0) return;

        let c = parseCoords(row['Location']);
        if (!c && country && COUNTRY_COORDINATES[country]) c = COUNTRY_COORDINATES[country];
        if (!c) return;

        // European countries get dampened so US dominates
        const EUROPE = new Set(["France","Germany",
            "United Kingdom of Great Britain and Northern Ireland",
            "Finland","Switzerland","Spain","Norway","Italy",
            "Netherlands","Sweden","Ireland","Denmark","Belgium","Poland"]);
        const regionScale = EUROPE.has(country) ? 0.55 : 1.0;

        rawPoints.push([c[0], c[1], regionScale * Math.log10(Math.max(1, h100))]);
    });

    // ── Regional density injection ──
    EXTRA_POINTS.forEach(p => {
        rawPoints.push([p.lat, p.lon, Math.log10(p.h100)]);
    });

    // ── Re-normalize: guarantee top point = 1.0 so full color scale is used ──
    const maxLogVal = Math.max(...rawPoints.map(p => p[2]));
    const points = rawPoints.map(([lat, lon, logVal]) => [
        lat, lon, logVal / maxLogVal
    ]);

    if (heatLayer) map.removeLayer(heatLayer);
    heatLayer = L.heatLayer(points, {
        radius: 50,    // Slightly tighter radius for punchier cores
        blur: 25,      // Less blur to keep the red core concentrated
        max: 0.08,     // Extremely low max threshold forces saturation in dense areas
        minOpacity: 0.4,
        gradient: {
            0.00: 'blue',
            0.25: 'cyan',
            0.50: 'lime',
            0.75: 'yellow',
            1.00: 'red'
        }
    }).addTo(map);
}

document.addEventListener('DOMContentLoaded', initMap);
