import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { useCart } from '../context/CartContext'
import { formatPrice, productImage } from '../utils/product'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart()

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-card__image-wrap">
        <img
          src={productImage(product.image_url)}
          alt={product.name}
          className="product-card__image"
        />
      </Link>
      <div className="product-card__body">
        <Link to={`/product/${product.id}`}>
          <h3 className="product-card__title">{product.name}</h3>
        </Link>
        <span className="product-card__price">{formatPrice(product.price)} ₽</span>
        <div className="product-card__footer">
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
