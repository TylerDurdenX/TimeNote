import "leaflet";
import "leaflet.heat";

declare module "leaflet" {
  interface Layer {
    heatLayer: typeof import("leaflet.heat");
  }
}
