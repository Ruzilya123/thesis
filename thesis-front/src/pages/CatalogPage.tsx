import { useEffect, useState } from 'react'
import { api } from '../api/client'
import ProductCard from '../components/ProductCard'
import type { Category, FilterOption, Product } from '../types'

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [roasts, setRoasts] = useState<FilterOption[]>([])
  const [grinds, setGrinds] = useState<FilterOption[]>([])
  const [category, setCategory] = useState('')
  const [roast, setRoast] = useState('')
  const [grind, setGrind] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getCategories(), api.getRoasts(), api.getGrinds()]).then(
      ([cats, r, g]) => {
        setCategories(cats)
        setRoasts(r)
        setGrinds(g)
      },
    )
  }, [])

  useEffect(() => {
    const params: Record<string, string> = {}
    if (category) params.category = category
    if (roast) params.roast = roast
    if (grind) params.grind = grind
    if (search) params.search = search
    setLoading(true)
    api
      .getProducts(params)
      .then((data) => setProducts(data.results || (data as unknown as Product[])))
      .finally(() => setLoading(false))
  }, [category, roast, grind, search])

  return (
    <div className="container catalog">
      <section className="hero">
        <h1>Интернет-магазин Double B</h1>
        <p>Спешелти-кофе с собственной обжарки — зерно, молотый, дрипы и аксессуары</p>
        <input
          type="search"
          className="search-input"
          placeholder="Поиск по каталогу..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      <div className="catalog__layout">
        <aside className="filters">
          <h2>Фильтры</h2>
          <label>
            Категория
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Все</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Обжарка
            <select value={roast} onChange={(e) => setRoast(e.target.value)}>
              <option value="">Все</option>
              {roasts.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Помол
            <select value={grind} onChange={(e) => setGrind(e.target.value)}>
              <option value="">Все</option>
              {grinds.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn btn--ghost btn--full"
            onClick={() => {
              setCategory('')
              setRoast('')
              setGrind('')
              setSearch('')
            }}
          >
            Сбросить
          </button>
        </aside>

        <section className="catalog__grid">
          {loading ? (
            <p className="muted">Загрузка...</p>
          ) : products.length === 0 ? (
            <p className="muted">Товары не найдены</p>
          ) : (
            products.map((p) => <ProductCard key={p.id} product={p} />)
          )}
        </section>
      </div>
    </div>
  )
}
