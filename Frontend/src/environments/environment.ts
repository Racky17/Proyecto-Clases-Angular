// Configuración de entorno — PRODUCCIÓN (despliegue en el servidor).
// Esta es la que usa `ng build` (y por lo tanto el contenedor Docker).
// apiUrl apunta al backend publicado en el servidor de la universidad.
export const environment = {
  production: true,
  apiUrl: 'http://pacheco.chillan.ubiobio.cl:8076',
  // API key pública de OpenWeatherMap usada por el servicio de clima.
  weatherApiKey: '0fdc75ec0c0272291d0492e31159b6d4',
  // ⬇️ RELLENAR: API key de Google Maps JavaScript API.
  googleMapsApiKey: 'AIzaSyBYliU5BwCZIxPjCABfMy-3kIGHN5rPZyQ',
  // ⬇️ RELLENAR: OAuth Client ID de Google (para "Login con Google").
  googleClientId: '930384574426-dh3urq7l2h4ldnk4djhmiqg7ccfbvc40.apps.googleusercontent.com',
};
