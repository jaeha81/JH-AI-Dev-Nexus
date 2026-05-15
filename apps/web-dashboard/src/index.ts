import { createPreviewServerConfig, startPreviewServer } from "./preview-server.js";

const config = createPreviewServerConfig();
startPreviewServer(config);

console.log(`JH Dev Nexus dashboard preview: http://${config.host}:${config.port}`);
