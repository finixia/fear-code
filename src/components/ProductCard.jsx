import React from 'react'
import { useCart } from '../context/CartContext'
import { useNotification } from '../hooks/useNotification'

const ProductCard = ({ product }) => {
  const { addItem } = useCart()
  const { showNotification } = useNotification()

  const handleAddToCart = () => {
    addItem(product)
    showNotification(`${product.name} added to cart!`)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden card-hover">
      <img 
        src={product.image} 
        alt={product.name}
        className="w-full h-64 object-cover"
      />
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{product.name}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
          {product.description}
        </p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            ₹{product.price}
          </span>
          <button
            onClick={handleAddToCart}
            className="bg-yellow-500 text-black px-6 py-2 rounded-lg hover:bg-yellow-400 transition duration-300 font-bold"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard