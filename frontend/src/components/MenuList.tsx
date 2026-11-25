/** Props for {@link MenuList}. */
export interface MenuListProps {
  items: string[]
  onAdd: (name: string) => void
}

/**
 * Shows the menu with an "Add" button per dish.
 *
 * Args:
 *   props: Menu items and the handler called when a dish is added.
 */
export function MenuList({ items, onAdd }: MenuListProps) {
  return (
    <section className="panel" aria-labelledby="menu-heading">
      <h2 id="menu-heading">Menu</h2>
      <ul className="menu-list">
        {items.map((name) => (
          <li key={name}>
            <span>{name}</span>
            <button type="button" onClick={() => onAdd(name)} aria-label={`Add ${name}`}>
              Add
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
