import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { useCart } from '../context/CartContext'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart()

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-card__image-wrap">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400'}
          alt={product.name}
          className="product-card__image"
        />
      </Link>
      <div className="product-card__body">
        <span className="product-card__category">{product.category_name}</span>
        <Link to={`/product/${product.id}`}>
          <h3 className="product-card__title">{product.name}</h3>
        </Link>
        <p className="product-card__desc">{product.flavor_profile}</p>
        <div className="product-card__footer">
          <span className="product-card__price">{parseFloat(product.price).toLocaleString('ru-RU')} ₽</span>
          <button
            type="button"
            className="btn btn--primary btn--sm"
            disabled={product.stock === 0}
            onClick={() => addItem(product)}
          >
            {product.stock === 0 ? 'Нет в наличии' : 'В корзину'}
          </button>
        </div>
      </div>
    </article>
  )
}
