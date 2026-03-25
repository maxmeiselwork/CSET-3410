import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import re

# Extended Country Centroids
COUNTRY_COORDINATES = {
    "United States of America": (37.0902, -95.7129),
    "China": (35.8617, 104.1954),
    "United Arab Emirates": (23.4241, 53.8478),
    "Saudi Arabia": (23.8859, 45.0792),
    "Korea (Republic of)": (35.9078, 127.7669),
    "France": (46.2276, 2.2137),
    "Germany": (51.1657, 10.4515),
    "United Kingdom of Great Britain and Northern Ireland": (55.3781, -3.4360),
    "India": (20.5937, 78.9629),
    "Japan": (36.2048, 138.2529),
    "Finland": (61.9241, 25.7482),
    "Switzerland": (46.8182, 8.2275),
    "Spain": (40.4637, -3.7492),
    "Malaysia": (4.2105, 101.9758),
    "Norway": (60.4720, 8.4689),
    "Taiwan": (23.6978, 120.9605),
    "Singapore": (1.3521, 103.8198),
    "Italy": (41.8719, 12.5674),
    # ... more in the JS version, can be expanded here too
}

def parse_coords(val):
    if not isinstance(val, str): return None
    
    # DMS format
    dms = re.search(r'(\d+)°(\d+)\'([\d.]+)"([NS])\s*(\d+)°(\d+)\'([\d.]+)"([EW])', val)
    if dms:
        lat = float(dms.group(1)) + float(dms.group(2))/60 + float(dms.group(3))/3600
        if dms.group(4) == 'S': lat = -lat
        lon = float(dms.group(5)) + float(dms.group(6))/60 + float(dms.group(7))/3600
        if dms.group(8) == 'W': lon = -lon
        return lat, lon
        
    # Decimal format
    dec = re.search(r'(-?\d+\.\d+),\s*(-?\d+\.\d+)', val)
    if dec:
        return float(dec.group(1)), float(dec.group(2))
    
    return None

def generate_heatmap():
    df = pd.read_csv('gpu_clusters.csv')
    
    points = []
    max_h100 = df['H100 equivalents'].max() or 1
    
    for _, row in df.iterrows():
        h100 = row['H100 equivalents']
        if pd.isna(h100): h100 = 1
        
        coords = parse_coords(row['Location'])
        if not coords:
            country = row['Country']
            if country in COUNTRY_COORDINATES:
                coords = COUNTRY_COORDINATES[country]
        
        if coords:
            # intensity = log10(h100)
            intensity = np.log10(max(1, h100))
            points.append({'lat': coords[0], 'lon': coords[1], 'intensity': intensity})
            
    pdf = pd.DataFrame(points)
    
    plt.figure(figsize=(20, 10), facecolor='#0c0c0e')
    ax = plt.axes()
    ax.set_facecolor('#0c0c0e')
    
    # Scatter as heatmap points
    # Using a high transparency and specific colormap
    sc = plt.scatter(pdf['lon'], pdf['lat'], 
                    c=pdf['intensity'], 
                    s=pdf['intensity']**2 * 10, 
                    alpha=0.4, 
                    cmap='viridis',
                    edgecolors='none')
    
    plt.colorbar(sc, label='Log10(H100 equivalents)')
    plt.title('Global GPU Cluster Heatmap', color='white', pad=20)
    plt.xlabel('Longitude', color='white')
    plt.ylabel('Latitude', color='white')
    
    # Hide spines
    for spine in ax.spines.values():
        spine.set_visible(False)
    
    # Grid
    plt.grid(color='#333333', linestyle='--', linewidth=0.5, alpha=0.3)
    
    # World map outline (optional, would need geopandas)
    # For now, let's just use the points.
    
    plt.savefig('gpu_heatmap.png', dpi=300, bbox_inches='tight', facecolor='#0c0c0e')
    print("Generated gpu_heatmap.png")

if __name__ == "__main__":
    generate_heatmap()
