# Town page hero photos: credits

Every hero photo on the /qhht/{town} pages. Only freely licensed photos (public domain, CC0, CC BY, CC BY-SA, Unsplash or Pexels license). All four below are CC BY-SA from Wikimedia Commons, so each page shows a credit line linking to the source. The photos are cropped and compressed (`scripts/build-area-heroes.mjs`); the Port St. Lucie photo is also cropped on the right to leave out a church steeple.

| Town | Place | Source | Photographer | License |
|---|---|---|---|---|
| Port St. Lucie, FL | Lake Tradition, Tradition Village Center | [Lake_Tradition_in_Port_St_Lucie_FL_looking_north_from_south_shore.jpeg](https://commons.wikimedia.org/wiki/File:Lake_Tradition_in_Port_St_Lucie_FL_looking_north_from_south_shore.jpeg) | Dough4872 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Jupiter, FL | Jupiter Inlet Lighthouse on the Loxahatchee River at Jupiter Inlet | [Jupiter_Inlet_Lighthouse_and_Museum_-_waterfront_view.jpg](https://commons.wikimedia.org/wiki/File:Jupiter_Inlet_Lighthouse_and_Museum_-_waterfront_view.jpg) | Lea Shanley | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| Jensen Beach, FL | Indian Riverside Park | [Indian_Riverside_Park_(Jensen_Beach,_Florida).jpg](https://commons.wikimedia.org/wiki/File:Indian_Riverside_Park_(Jensen_Beach,_Florida).jpg) | Tamanoeconomico | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| Hobe Sound, FL | Loxahatchee River, Jonathan Dickinson State Park | [Hobe_Sound_FL_Jonathan_Dickinson_SP_Loxahatchee05.jpg](https://commons.wikimedia.org/wiki/File:Hobe_Sound_FL_Jonathan_Dickinson_SP_Loxahatchee05.jpg) | Ebyabe | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |

**Palm City:** no photo. No properly licensed photo of a recognizable Palm City place was found on Wikimedia Commons, Unsplash or Pexels (October 2026), so its page has no hero photo.

To add or replace one: download the original, record it here, run `node scripts/build-area-heroes.mjs <slug> <original> [position]`, then set `hero` (alt, position, credit, creditUrl) in `src/data/areas/<slug>.ts`.
