/// <reference types="vite/client" />

// Allow importing CSS files as side effects from node_modules
declare module "leaflet/dist/leaflet.css" {
  const content: string;
  export default content;
}
