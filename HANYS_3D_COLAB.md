# Hanys 3D — one-click GPU pipeline

1. Open this file's `scripts/triposr_colab.py` in Google Colab with a GPU runtime.
2. Run the script.
3. It downloads the real Hanys JPG from the Shopify CDN, clones the official MIT TripoSR repository, installs its dependencies and generates a textured 3D mesh.
4. The generated model is written under `/content/hanys-3d/output/`.

TripoSR's official repository documents roughly 6GB VRAM for one image and supports `--bake-texture` for textured output.

After generation, copy the resulting `.obj`/texture assets into `public/models/hanys/` or convert the mesh to GLB, then the website can load it with Three.js/React Three Fiber.

Source: https://github.com/VAST-AI-Research/TripoSR
