import { photos, type PhotoId } from '../data/media'
import { cx } from './kit'

/** Adresse d'un fichier de public/assets/, valable en local, sur GitHub Pages et dans l'aperçu. */
export const asset = (path: string) => `${import.meta.env.BASE_URL}assets/${path}`

/**
 * Logo AGORA, extrait du fichier original (REF-01) : aucun tracé redessiné.
 * - symbol : l'arche seule ;
 * - row : arche + mot « AGORA » en ligne (en-têtes) ;
 * - stacked : arche au-dessus du mot (rail, hero mobile), comme sur REF-14.
 * `tone` force la version du mot ; par défaut elle suit le thème clair/sombre.
 */
export function BrandLogo({ variant = 'row', tone = 'auto', className }: { variant?: 'symbol' | 'row' | 'stacked'; tone?: 'auto' | 'navy' | 'white'; className?: string }) {
  const symbol = <img src={asset('brand/agora-symbole.png')} alt="" width={413} height={394} className={variant === 'stacked' ? 'h-11 w-auto' : variant === 'row' ? 'h-7 w-auto' : cx('w-auto', className)} />
  if (variant === 'symbol') return symbol
  const word = (file: string, show: string) => (
    <img src={asset(`brand/${file}`)} alt="" width={795} height={124} className={cx(variant === 'stacked' ? 'h-[1.15rem]' : 'h-[0.95rem]', 'w-auto', show)} />
  )
  return (
    <span className={cx('inline-flex items-center', variant === 'stacked' ? 'flex-col gap-1.5' : 'gap-2.5', className)}>
      {symbol}
      {tone !== 'white' && word('agora-mot-bleu.png', tone === 'auto' ? 'theme-light' : '')}
      {tone !== 'navy' && word('agora-mot-blanc.png', tone === 'auto' ? 'theme-dark' : '')}
      <span className="sr-only">AGORA</span>
    </span>
  )
}

export type ReferenceIconName = 'agora' | 'charte' | 'debats' | 'le-projet' | 'sources'

/**
 * Icône originale de la charte (REF-04 à REF-08), affichée telle quelle.
 * Son tracé bleu nuit exige un fond clair : en thème sombre, elle repose sur une pastille claire.
 */
export function ReferenceIcon({ name, size = 'md', className }: { name: ReferenceIconName; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const box = { sm: 'size-10 rounded-xl p-1', md: 'size-12 rounded-2xl p-1', lg: 'size-14 rounded-2xl p-1' }[size]
  return (
    <span className={cx('icon-tile grid shrink-0 place-items-center', box, className)}>
      <img src={asset(`icons/${name}.png`)} alt="" width={256} height={256} className="size-full object-contain" />
    </span>
  )
}

/**
 * Photographie éditoriale. Toujours décorative : l'information est portée par le texte voisin,
 * d'où alt="". Jamais utilisée sur un bulletin de vote.
 */
export function EditorialImage({ photo, className, position = 'center', eager }: { photo: PhotoId; className?: string; position?: string; eager?: boolean }) {
  return (
    <img
      src={asset(`photos/${photos[photo].file}`)}
      alt=""
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={cx('bg-surface2 object-cover', className)}
      style={{ objectPosition: position }}
    />
  )
}
