# Midnight Brew — M2 Q2

Theo Paulo Castinar · EMC111L.A224

A small café made entirely with Three.js geometry. This is a different room from my Module 1 bedroom scene. No 3D models are imported.

## Requirements shown in the scene

| Type | Examples |
| --- | --- |
| Materials | `MeshStandardMaterial` (floor, walls, wood), `MeshPhongMaterial` (metal), `MeshPhysicalMaterial` (glass), `MeshBasicMaterial` (sign and bulbs) |
| Lights | `AmbientLight`, `DirectionalLight`, `SpotLight`, `PointLight` |
| Textures | Four separate `CanvasTexture` maps: checker tile, brick, wood grain, and chair fabric |

The camera fills the browser window. Drag to rotate and scroll to zoom.

## Run in Codespaces

Run `python3 -m http.server 8000` in the terminal, then open the forwarded port 8000. Three.js loads from a CDN, so internet access is needed.
