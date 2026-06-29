import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import ProductCard from '../components/ProductCard'
import { CATEGORY_TABS } from '../utils/product'
import type { Category, FilterOption, Product } from '../types'

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [roasts, setRoasts] = useState<FilterOption[]>([])
  const [grinds, setGrinds] = useState<FilterOption[]>([])
  const [loading, setLoading] = useState(true)

  const activeTab = searchParams.get('tab') || 'beans'
  const roastFilter = searchParams.get('roast') || ''
  const grindFilter = searchParams.get('grind') || ''
  const search = searchParams.get('search') || ''

  const categoryIds = useMemo(() => {
    const tab = CATEGORY_TABS.find((t) => t.key === activeTab)
    if (!tab) return []
    return categories.filter((c) => tab.categories.includes(c.name)).map((c) => c.id)
  }, [activeTab, categories])

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
    if (categories.length === 0) return
    const params: Record<string, string> = {}
    if (roastFilter) params.roast = roastFilter
    if (grindFilter) params.grind = grindFilter
    if (search) params.search = search

    setLoading(true)
    const requests = categoryIds.length
      ? categoryIds.map((id) => api.getProducts({ ...params, category: String(id) }))
      : [api.getProducts(params)]

    Promise.all(requests)
      .then((responses) => {
        const merged = responses.flatMap((data) => data.results || [])
        const unique = Array.from(new Map(merged.map((p) => [p.id, p])).values())
        setProducts(unique)
      })
      .finally(() => setLoading(false))
  }, [categoryIds, roastFilter, grindFilter, search, categories.length])

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    setSearchParams(params)
  }

  const toggleFilter = (key: 'roast' | 'grind', id: string) => {
    const current = searchParams.get(key) || ''
    setParam(key, current === id ? '' : id)
  }

  const setTab = (key: string) => setParam('tab', key)

  return (
    <div className="container catalog">
      <div className="category-tabs">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`category-tab${activeTab === tab.key ? ' category-tab--active' : ''}`}
            onClick={() => setTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="catalog__layout">
        <aside className="filters">
          <h2>Фильтры</h2>
          <div className="filter-group">
            <h3>Обжарка</h3>
            {roasts.map((r) => (
              <label key={r.id} className="filter-check">
                <input
                  type="checkbox"
                  checked={roastFilter === String(r.id)}
                  onChange={() => toggleFilter('roast', String(r.id))}
                />
                {r.name}
              </label>
            ))}
          </div>
          <div className="filter-group">
            <h3>Помол</h3>
            {grinds.map((g) => (
              <label key={g.id} className="filter-check">
                <input
                  type="checkbox"
                  checked={grindFilter === String(g.id)}
                  onChange={() => toggleFilter('grind', String(g.id))}
                />
                {g.name}
              </label>
            ))}
          </div>
          <button
            type="button"
            className="btn btn--ghost btn--full"
            onClick={() => {
              const params = new URLSearchParams()
              if (activeTab) params.set('tab', activeTab)
              if (search) params.set('search', search)
              setSearchParams(params)
            }}
          >
            Сбросить фильтры
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
