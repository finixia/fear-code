import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
import Notification from '../components/Notification'
import { useNotification } from '../hooks/useNotification'

const Home = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const { notifications, showNotification, removeNotification } = useNotification()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      showNotification('Failed to load products', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactForm)
      })

      const data = await response.json()

      if (response.ok) {
        showNotification(data.message)
        setContactForm({ name: '', email: '', message: '' })
      } else {
        showNotification(data.error, 'error')
      }
    } catch (error) {
      showNotification('Failed to send message', 'error')
    }
  }

  const supplements = products.filter(p => p.category === 'supplements')
  const apparel = products.filter(p => p.category === 'apparel')

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="hero-gradient text-black py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            FEAR
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Inspired by Gods, Built for Mortals
          </p>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Unleash your inner strength with our premium supplements and gear. 
            Every product is crafted to help you conquer your limits and achieve greatness.
          </p>
          <button 
            onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
            className="bg-black text-yellow-500 px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-800 transition duration-300"
          >
            Shop Now
          </button>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="loading-spinner w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading products...</p>
            </div>
          ) : (
            <>
              {/* Supplements */}
              <div className="mb-16">
                <h2 className="text-4xl font-bold text-center mb-12">Premium Supplements</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {supplements.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>

              {/* Apparel */}
              <div className="mb-16">
                <h2 className="text-4xl font-bold text-center mb-12">Premium Apparel</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {apparel.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="bg-gray-100 dark:bg-gray-800 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8">About FEAR</h2>
            <p className="text-lg mb-6">
              FEAR represents the pinnacle of fitness excellence. Our brand is built on the foundation 
              of pushing boundaries, breaking limits, and achieving the impossible.
            </p>
            <p className="text-lg mb-6">
              Every supplement is meticulously crafted with premium ingredients, backed by science, 
              and tested by athletes who demand nothing but the best.
            </p>
            <p className="text-lg">
              Join the FEAR family and transform your potential into power.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Get In Touch</h2>
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  rows="4"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-yellow-500 text-black py-3 rounded-lg font-bold hover:bg-yellow-400 transition duration-300"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <img 
            src="/assets/fear1.png" 
            alt="Fear Logo" 
            className="h-16 mx-auto mb-6"
          />
          <p className="text-gray-400 mb-4">
            © 2025 FEAR Store. All rights reserved.
          </p>
          <p className="text-gray-400">
            Inspired by Gods, Built for Mortals
          </p>
        </div>
      </footer>

      {/* Notifications */}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  )
}

export default Home