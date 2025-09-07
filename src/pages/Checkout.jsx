import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../hooks/useNotification'
import Notification from '../components/Notification'

const Checkout = () => {
  const navigate = useNavigate()
  const { items, getTotal, clearCart } = useCart()
  const { user, login, register, isAuthenticated } = useAuth()
  const { notifications, showNotification, removeNotification } = useNotification()
  
  const [activeTab, setActiveTab] = useState('login')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' })
  const [shippingForm, setShippingForm] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      const nameParts = user.name.split(' ')
      setShippingForm(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || ''
      }))
    }
  }, [user])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await login(loginForm.email, loginForm.password)
    
    if (result.success) {
      showNotification('Login successful!')
    } else {
      showNotification(result.error, 'error')
    }
    
    setLoading(false)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await register(registerForm.name, registerForm.email, registerForm.password)
    
    if (result.success) {
      showNotification('Registration successful!')
    } else {
      showNotification(result.error, 'error')
    }
    
    setLoading(false)
  }

  const handleOrder = async (e) => {
    e.preventDefault()
    
    if (items.length === 0) {
      showNotification('Your cart is empty!', 'error')
      return
    }

    setLoading(true)

    const orderData = {
      items,
      shippingAddress: shippingForm,
      total: getTotal()
    }

    try {
      const token = localStorage.getItem('fearToken')
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      })

      const data = await response.json()

      if (response.ok) {
        showNotification('Order placed successfully!')
        clearCart()
        setTimeout(() => {
          navigate('/?order=success')
        }, 2000)
      } else {
        showNotification(data.error, 'error')
      }
    } catch (error) {
      showNotification('Order failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-yellow-600 dark:text-yellow-400">Order Summary</h2>
              
              {items.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold">{item.name}</h4>
                          <p className="text-gray-600 dark:text-gray-400">₹{item.price} × {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-yellow-600 dark:text-yellow-400">₹{getTotal()}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Checkout Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              {!isAuthenticated ? (
                <>
                  <h2 className="text-2xl font-bold mb-6 text-yellow-600 dark:text-yellow-400">Account</h2>
                  
                  {/* Auth Tabs */}
                  <div className="flex space-x-4 mb-6">
                    <button
                      onClick={() => setActiveTab('login')}
                      className={`px-4 py-2 rounded-lg font-bold ${
                        activeTab === 'login'
                          ? 'bg-yellow-500 text-black'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setActiveTab('register')}
                      className={`px-4 py-2 rounded-lg font-bold ${
                        activeTab === 'register'
                          ? 'bg-yellow-500 text-black'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Register
                    </button>
                  </div>

                  {/* Login Form */}
                  {activeTab === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Password</label>
                        <input
                          type="password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-yellow-500 text-black py-3 rounded-lg font-bold hover:bg-yellow-400 transition duration-300 disabled:opacity-50"
                      >
                        {loading ? 'Logging in...' : 'Login'}
                      </button>
                    </form>
                  )}

                  {/* Register Form */}
                  {activeTab === 'register' && (
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <input
                          type="text"
                          value={registerForm.name}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Password</label>
                        <input
                          type="password"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-yellow-500 text-black py-3 rounded-lg font-bold hover:bg-yellow-400 transition duration-300 disabled:opacity-50"
                      >
                        {loading ? 'Registering...' : 'Register'}
                      </button>
                    </form>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold mb-6 text-yellow-600 dark:text-yellow-400">Shipping Information</h2>
                  
                  <form onSubmit={handleOrder} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name</label>
                        <input
                          type="text"
                          value={shippingForm.firstName}
                          onChange={(e) => setShippingForm(prev => ({ ...prev, firstName: e.target.value }))}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name</label>
                        <input
                          type="text"
                          value={shippingForm.lastName}
                          onChange={(e) => setShippingForm(prev => ({ ...prev, lastName: e.target.value }))}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Address</label>
                      <input
                        type="text"
                        value={shippingForm.address}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">City</label>
                        <input
                          type="text"
                          value={shippingForm.city}
                          onChange={(e) => setShippingForm(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">State</label>
                        <input
                          type="text"
                          value={shippingForm.state}
                          onChange={(e) => setShippingForm(prev => ({ ...prev, state: e.target.value }))}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">PIN Code</label>
                        <input
                          type="text"
                          value={shippingForm.pincode}
                          onChange={(e) => setShippingForm(prev => ({ ...prev, pincode: e.target.value }))}
                          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={shippingForm.phone}
                        onChange={(e) => setShippingForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading || items.length === 0}
                      className="w-full bg-yellow-500 text-black py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition duration-300 uppercase disabled:opacity-50"
                    >
                      {loading ? 'Placing Order...' : 'Place Order'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

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

export default Checkout