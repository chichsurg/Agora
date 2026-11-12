// Photographies embarquées dans public/assets/photos/.
// Toutes proviennent de Wikimedia Commons, sous licence libre. Elles ont été recadrées et
// redimensionnées. Toute nouvelle photo doit être ajoutée ici avec son auteur et sa licence.

export interface Photo {
  file: string
  /** Ce que montre la photo, pour les crédits. */
  subject: string
  author: string
  license: string
  licenseUrl: string
  source: string
}

const commons = (name: string) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(name.replace(/ /g, '_'))}`

export const photos = {
  invalides: {
    file: 'invalides-dome.jpg',
    subject: 'Dôme des Invalides, Paris, en fin de journée',
    author: 'Jebulon',
    license: 'CC0 1.0 (domaine public)',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/deed.fr',
    source: commons('Dôme Saint Louis des Invalides soir.jpg'),
  },
  assemblee: {
    file: 'assemblee-nationale.jpg',
    subject: "Façade de l'Assemblée nationale, Paris",
    author: 'BirchLog',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/deed.fr',
    source: commons('Facade Assemblée Nationale.jpg'),
  },
  luxembourg: {
    file: 'palais-du-luxembourg.jpg',
    subject: 'Palais du Luxembourg, siège du Sénat, Paris',
    author: 'Benh',
    license: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/deed.fr',
    source: commons('Palais Luxembourg Sunset Edit.JPG'),
  },
  soufflot: {
    file: 'rue-soufflot.jpg',
    subject: 'La rue Soufflot vue depuis la place du Panthéon, Paris',
    author: 'Nicolas Torquet',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/deed.fr',
    source: commons('View of Paris from the Panthéon place.jpg'),
  },
} satisfies Record<string, Photo>

export type PhotoId = keyof typeof photos
