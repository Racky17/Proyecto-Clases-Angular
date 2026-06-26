// Configuración de entorno — DESARROLLO (local).
// Esta es la que usa `ng serve` (npm start) gracias a fileReplacements.
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  // API key pública de OpenWeatherMap usada por el servicio de clima.
  weatherApiKey: '0fdc75ec0c0272291d0492e31159b6d4',
  // ⬇️ RELLENAR: API key de Google Maps JavaScript API.
  googleMapsApiKey: 'AIzaSyBYliU5BwCZIxPjCABfMy-3kIGHN5rPZyQ',
  // ⬇️ RELLENAR: OAuth Client ID de Google (para "Login con Google").
  googleClientId: '930384574426-dh3urq7l2h4ldnk4djhmiqg7ccfbvc40.apps.googleusercontent.com',
};
