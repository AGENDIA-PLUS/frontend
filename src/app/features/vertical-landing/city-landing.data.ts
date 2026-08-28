export interface CityConfig {
  slug: string;
  name: string;
  displayName: string;
}

// Ciudades españolas con mayor volumen de búsqueda para negocios de
// servicios locales (barberías, peluquerías, etc.). Añadir una ciudad nueva
// es solo una entrada aquí — la ruta y el componente ya son genéricos.
export const CITY_CONFIGS: Record<string, CityConfig> = {
  madrid: { slug: 'madrid', name: 'Madrid', displayName: 'Madrid' },
  barcelona: { slug: 'barcelona', name: 'Barcelona', displayName: 'Barcelona' },
  valencia: { slug: 'valencia', name: 'Valencia', displayName: 'Valencia' },
  sevilla: { slug: 'sevilla', name: 'Sevilla', displayName: 'Sevilla' },
  zaragoza: { slug: 'zaragoza', name: 'Zaragoza', displayName: 'Zaragoza' },
  malaga: { slug: 'malaga', name: 'Málaga', displayName: 'Málaga' },
  murcia: { slug: 'murcia', name: 'Murcia', displayName: 'Murcia' },
  palma: { slug: 'palma', name: 'Palma de Mallorca', displayName: 'Palma de Mallorca' },
  bilbao: { slug: 'bilbao', name: 'Bilbao', displayName: 'Bilbao' },
  alicante: { slug: 'alicante', name: 'Alicante', displayName: 'Alicante' },
  cordoba: { slug: 'cordoba', name: 'Córdoba', displayName: 'Córdoba' },
  valladolid: { slug: 'valladolid', name: 'Valladolid', displayName: 'Valladolid' },
  vigo: { slug: 'vigo', name: 'Vigo', displayName: 'Vigo' },
  gijon: { slug: 'gijon', name: 'Gijón', displayName: 'Gijón' },
  granada: { slug: 'granada', name: 'Granada', displayName: 'Granada' },
};

export const CITY_SLUGS = Object.keys(CITY_CONFIGS);
