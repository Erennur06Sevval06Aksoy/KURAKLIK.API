const express = require('express');
const router = express.Router();
const pool = require('../db');
// SELECT ile hem extent_wkt hem de geom GeoJSON döndür
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT id, name, extent_wkt, ST_AsGeoJSON(geom)::json as geom_geojson,
             ST_AsGeoJSON(ST_GeomFromText(extent_wkt))::json as extent_geojson
      FROM locations
      WHERE extent_wkt IS NOT NULL
    `);
        // Her satırı GeoJSON Feature'e çevirebiliriz:
        const features = result.rows.map(r => ({
            id: r.id,
            name: r.name,
            extent_wkt: r.extent_wkt,
            geojson: r.geom_geojson, // bu zaten GeoJSON geometry (object)
            extent_geojson: r.extent_geojson // extent_wkt'yi GeoJSON'a çevirdik
        }));
        res.json(features);
        console.log('Locations data:', features.length, 'records');
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

// Sadece extent_wkt verilerini GeoJSON formatında döndüren endpoint
router.get('/extents', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT id, name, extent_wkt, 
             ST_AsGeoJSON(ST_GeomFromText(extent_wkt))::json as extent_geojson
      FROM locations
      WHERE extent_wkt IS NOT NULL AND extent_wkt != ''
    `);
        
        const features = result.rows.map(r => ({
            type: "Feature",
            properties: {
                id: r.id,
                name: r.name,
                extent_wkt: r.extent_wkt
            },
            geometry: r.extent_geojson
        }));
        
        const geojson = {
            type: "FeatureCollection",
            features: features
        };
        
        res.json(geojson);
        console.log('Extents data:', features.length, 'records');
    } catch (err) {
        console.error('Extents endpoint error:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

module.exports = router;
