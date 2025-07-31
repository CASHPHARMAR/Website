// ===== COMPLETE SINGLE-FILE E-COMMERCE APPLICATION =====
// This file contains all frontend and backend code for a modern e-commerce website
// Features: Product catalog, detailed views, shopping cart, checkout, email notifications

// ===== REACT IMPORTS =====
import React, { useState, useEffect, createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ===== ICON IMPORTS =====
import { 
  ShoppingCart, 
  Star, 
  Plus, 
  Minus,
  Trash2,
  Search,
  Filter,
  CreditCard,
  Package,
  Shield,
  Truck,
  Heart,
  Share,
  Eye,
  Users,
  TrendingUp,
  DollarSign,
  Check,
  Mail,
  Phone,
  MapPin
} from "lucide-react";

// ===== DATA SCHEMAS =====
const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.string(),
  imageUrl: z.string(),
  category: z.string(),
  stock: z.number(),
  features: z.array(z.string()),
  specifications: z.record(z.string()),
  rating: z.string(),
  reviewCount: z.number(),
  isActive: z.boolean(),
  createdAt: z.date(),
});

const reviewSchema = z.object({
  id: z.string(),
  productId: z.string(),
  customerId: z.string(),
  rating: z.number(),
  title: z.string(),
  comment: z.string(),
  isVerified: z.boolean(),
  createdAt: z.date(),
});

const cartSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  productId: z.string(),
  quantity: z.number(),
  createdAt: z.date(),
});

const checkoutFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "ZIP code is required"),
  country: z.string().min(2, "Country is required"),
});

// ===== TYPE DEFINITIONS =====
type Product = z.infer<typeof productSchema>;
type Review = z.infer<typeof reviewSchema>;
type Cart = z.infer<typeof cartSchema>;

interface ProductWithReviews extends Product {
  reviews?: Review[];
}

interface CartItemWithProduct extends Cart {
  product?: Product;
}

// ===== MOCK DATA STORE =====
class ECommerceStore {
  private products: Map<string, Product> = new Map();
  private reviews: Map<string, Review> = new Map();
  private cart: Map<string, Cart> = new Map();
  private orders: Map<string, any> = new Map();

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    const sampleProducts: Product[] = [
      {
        id: "product-1",
        name: "Premium Wireless Headphones",
        description: "Experience crystal-clear audio with our premium wireless headphones featuring active noise cancellation and 30-hour battery life.",
        price: "299.99",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop",
        category: "Electronics",
        stock: 25,
        features: [
          "Active Noise Cancellation",
          "30-Hour Battery Life",
          "Bluetooth 5.0",
          "Quick Charge Technology",
          "Comfortable Over-Ear Design",
          "Built-in Microphone"
        ],
        specifications: {
          "Driver Size": "40mm",
          "Frequency Response": "20Hz - 20kHz",
          "Weight": "280g",
          "Connectivity": "Bluetooth 5.0, 3.5mm Jack",
          "Battery": "1200mAh Lithium-ion",
          "Charging Time": "2 hours",
          "Warranty": "2 years"
        },
        rating: "4.8",
        reviewCount: 124,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "product-2",
        name: "Smart Fitness Watch",
        description: "Track your health and fitness goals with this advanced smartwatch featuring heart rate monitoring, GPS, and sleep tracking.",
        price: "199.99",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop",
        category: "Wearables",
        stock: 18,
        features: [
          "Heart Rate Monitor",
          "Built-in GPS",
          "Sleep Tracking",
          "Water Resistant (50m)",
          "7-Day Battery Life",
          "Multiple Sport Modes"
        ],
        specifications: {
          "Display": "1.4-inch AMOLED",
          "Battery Life": "7 days",
          "Water Resistance": "5ATM",
          "Connectivity": "Bluetooth 5.0, Wi-Fi",
          "Sensors": "Heart Rate, GPS, Accelerometer, Gyroscope",
          "Compatibility": "iOS 12.0+, Android 6.0+"
        },
        rating: "4.6",
        reviewCount: 89,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "product-3",
        name: "Ergonomic Office Chair",
        description: "Enhance your workspace comfort with this premium ergonomic office chair featuring lumbar support and adjustable height.",
        price: "449.99",
        imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop",
        category: "Furniture",
        stock: 12,
        features: [
          "Lumbar Support",
          "Adjustable Height",
          "360° Swivel",
          "Breathable Mesh Back",
          "Memory Foam Seat",
          "Armrest Adjustment"
        ],
        specifications: {
          "Material": "Mesh and Memory Foam",
          "Weight Capacity": "300 lbs",
          "Seat Height": "17-21 inches",
          "Dimensions": "26 x 26 x 40-44 inches",
          "Assembly": "Required",
          "Warranty": "5 years"
        },
        rating: "4.7",
        reviewCount: 56,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "product-4",
        name: "Wireless Gaming Mouse",
        description: "High-precision wireless gaming mouse with customizable RGB lighting and 16000 DPI sensor for competitive gaming.",
        price: "89.99",
        imageUrl: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=400&fit=crop",
        category: "Electronics",
        stock: 35,
        features: [
          "16000 DPI Sensor",
          "Wireless Connection",
          "RGB Lighting",
          "Programmable Buttons",
          "50-Hour Battery",
          "Ultra-Light Design"
        ],
        specifications: {
          "DPI": "Up to 16000",
          "Polling Rate": "1000Hz",
          "Battery Life": "50 hours",
          "Weight": "85g",
          "Connectivity": "2.4GHz Wireless",
          "Compatible": "Windows, Mac, Linux"
        },
        rating: "4.5",
        reviewCount: 203,
        isActive: true,
        createdAt: new Date(),
      }
    ];

    sampleProducts.forEach(product => this.products.set(product.id, product));

    const sampleReviews: Review[] = [
      {
        id: "review-1",
        productId: "product-1",
        customerId: "customer-1",
        rating: 5,
        title: "Amazing sound quality!",
        comment: "These headphones exceeded my expectations. The noise cancellation is fantastic and the battery life is exactly as advertised.",
        isVerified: true,
        createdAt: new Date(),
      },
      {
        id: "review-2",
        productId: "product-2",
        customerId: "customer-1",
        rating: 4,
        title: "Great fitness companion",
        comment: "Love the GPS tracking and heart rate monitor. Battery life is impressive. Only wish the screen was a bit larger.",
        isVerified: true,
        createdAt: new Date(),
      }
    ];

    sampleReviews.forEach(review => this.reviews.set(review.id, review));
  }

  // Product methods
  getProducts(category?: string, search?: string): Product[] {
    let products = Array.from(this.products.values()).filter(p => p.isActive);
    
    if (category && category !== "all") {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    
    if (search) {
      const lowQuery = search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(lowQuery) ||
        p.description.toLowerCase().includes(lowQuery) ||
        p.category.toLowerCase().includes(lowQuery)
      );
    }
    
    return products;
  }

  getFeaturedProducts(): Product[] {
    return Array.from(this.products.values())
      .filter(p => p.isActive)
      .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
      .slice(0, 6);
  }

  getProduct(id: string): ProductWithReviews | undefined {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const reviews = Array.from(this.reviews.values())
      .filter(r => r.productId === id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return { ...product, reviews };
  }

  // Cart methods
  getCartItems(sessionId: string): CartItemWithProduct[] {
    const cartItems = Array.from(this.cart.values()).filter(item => item.sessionId === sessionId);
    
    return cartItems.map(item => ({
      ...item,
      product: this.products.get(item.productId)
    }));
  }

  addToCart(sessionId: string, productId: string, quantity: number): Cart {
    const existingItem = Array.from(this.cart.values()).find(
      item => item.sessionId === sessionId && item.productId === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      this.cart.set(existingItem.id, existingItem);
      return existingItem;
    } else {
      const id = `cart-${Date.now()}-${Math.random()}`;
      const cartItem: Cart = {
        id,
        sessionId,
        productId,
        quantity,
        createdAt: new Date(),
      };
      this.cart.set(id, cartItem);
      return cartItem;
    }
  }

  updateCartItem(id: string, quantity: number): Cart | null {
    const cartItem = this.cart.get(id);
    if (!cartItem) return null;
    
    if (quantity <= 0) {
      this.cart.delete(id);
      return null;
    }
    
    cartItem.quantity = quantity;
    this.cart.set(id, cartItem);
    return cartItem;
  }

  removeFromCart(id: string): boolean {
    return this.cart.delete(id);
  }

  clearCart(sessionId: string): void {
    const cartItems = this.getCartItems(sessionId);
    cartItems.forEach(item => this.cart.delete(item.id));
  }

  // Order method with email notification
  createOrder(orderData: any, customerData: any, orderItems: any[], sessionId: string): any {
    const orderId = `order-${Date.now()}`;
    const order = {
      id: orderId,
      ...orderData,
      customerId: `customer-${Date.now()}`,
      createdAt: new Date(),
    };
    
    this.orders.set(orderId, order);
    this.clearCart(sessionId);
    
    // Send email notification (mock)
    this.sendOrderNotification({
      id: orderId,
      customerName: customerData.name,
      total: orderData.total,
      items: orderItems.length
    });
    
    return order;
  }

  private sendOrderNotification(orderData: any) {
    console.log(`📧 ORDER NOTIFICATION: New order #${orderData.id} received!`);
    console.log(`Customer: ${orderData.customerName}`);
    console.log(`Total: $${orderData.total}`);
    console.log(`Items: ${orderData.items} item(s)`);
    console.log(`📧 Email notification sent to store owner!`);
  }
}

// ===== GLOBAL STORE INSTANCE =====
const store = new ECommerceStore();

// ===== QUERY CLIENT =====
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// ===== TOAST CONTEXT =====
const ToastContext = createContext<{
  showToast: (message: string, type?: 'success' | 'error') => void;
}>({
  showToast: () => {},
});

// ===== TOAST PROVIDER =====
const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' }>>([]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-2 rounded-lg shadow-lg text-white ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const useToast = () => useContext(ToastContext);

// ===== UI COMPONENTS =====

// Button Component
const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary', 
  size = 'md',
  className = '',
  type = 'button'
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit';
}) => {
  const baseClasses = "font-medium rounded-lg transition-all duration-200 flex items-center justify-center";
  
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:bg-gray-100",
    outline: "border border-gray-300 hover:bg-gray-50 text-gray-700 disabled:text-gray-400",
    ghost: "hover:bg-gray-100 text-gray-600 disabled:text-gray-400"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
};

// Input Component
const Input = ({ 
  placeholder, 
  value, 
  onChange, 
  type = 'text',
  className = '',
  required = false
}: {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  className?: string;
  required?: boolean;
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${className}`}
  />
);

// Card Component
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
    {children}
  </div>
);

// Badge Component
const Badge = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${className}`}>
    {children}
  </span>
);

// Modal Component
const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  size = 'md'
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
        {title && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Form Components
const FormField = ({ 
  label, 
  error, 
  children 
}: { 
  label: string; 
  error?: string; 
  children: React.ReactNode 
}) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs">{error}</p>}
  </div>
);

const Select = ({ 
  value, 
  onChange, 
  options, 
  placeholder 
}: { 
  value: string; 
  onChange: (value: string) => void; 
  options: { value: string; label: string }[];
  placeholder?: string;
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

// ===== MAIN COMPONENTS =====

// Product Card Component
const ProductCard = ({ product, onViewDetails, onAddToCart }: {
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart: (productId: string) => void;
}) => (
  <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
    <div className="relative">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        onClick={() => onViewDetails(product)}
      />
      <div className="absolute top-2 right-2 space-y-2">
        <Badge className="bg-emerald-600 text-white">
          {product.category}
        </Badge>
        {parseFloat(product.rating) >= 4.5 && (
          <Badge className="bg-amber-500 text-white">
            <Star className="w-3 h-3 mr-1" />
            Top Rated
          </Badge>
        )}
      </div>
    </div>
    
    <div className="p-4">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
          <Heart className="w-4 h-4" />
        </Button>
      </div>
      
      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
        {product.description}
      </p>
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-xs text-gray-500">({product.reviewCount})</span>
        </div>
        <span className="text-xs text-gray-500">{product.stock} in stock</span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-emerald-600">
          ${parseFloat(product.price).toFixed(2)}
        </span>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(product)}
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            onClick={() => onAddToCart(product.id)}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </div>
  </Card>
);

// Product Detail Modal
const ProductDetailModal = ({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart 
}: {
  product: ProductWithReviews | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (productId: string) => void;
}) => {
  if (!product) return null;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product.name} size="xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg"
          />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <span className="text-3xl font-bold text-emerald-600">
              ${parseFloat(product.price).toFixed(2)}
            </span>
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{product.rating}</span>
              <span className="text-gray-500">({product.reviewCount} reviews)</span>
            </div>
          </div>
          
          <p className="text-gray-600">{product.description}</p>
          
          <div>
            <h4 className="font-semibold mb-2">Key Features:</h4>
            <ul className="space-y-1">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Specifications:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600">{key}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button
              onClick={() => onAddToCart(product.id)}
              disabled={product.stock === 0}
              className="flex-1"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
            <Button variant="outline">
              <Share className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Reviews */}
          {product.reviews && product.reviews.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Customer Reviews</h4>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {product.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-3 last:border-b-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.rating 
                                ? "fill-amber-400 text-amber-400" 
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium text-sm">{review.title}</span>
                    </div>
                    <p className="text-sm text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

// Shopping Cart Modal
const CartModal = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout 
}: {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItemWithProduct[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}) => {
  const cartTotal = cartItems.reduce((sum, item) => 
    sum + (parseFloat(item.product?.price || "0") * item.quantity), 0
  );
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Shopping Cart (${cartItemCount} items)`} size="lg">
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
              <img
                src={item.product?.imageUrl}
                alt={item.product?.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <h4 className="font-medium">{item.product?.name}</h4>
                <p className="text-sm text-gray-600">
                  ${parseFloat(item.product?.price || "0").toFixed(2)} each
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-8 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveItem(item.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Your cart is empty</p>
          </div>
        )}
      </div>
      
      {cartItems.length > 0 && (
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-2xl font-bold text-emerald-600">
              ${cartTotal.toFixed(2)}
            </span>
          </div>
          <Button onClick={onCheckout} className="w-full" size="lg">
            <CreditCard className="w-4 h-4 mr-2" />
            Proceed to Checkout
          </Button>
        </div>
      )}
    </Modal>
  );
};

// Checkout Modal
const CheckoutModal = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  onSubmitOrder 
}: {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItemWithProduct[];
  onSubmitOrder: (formData: any) => void;
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const cartTotal = cartItems.reduce((sum, item) => 
    sum + (parseFloat(item.product?.price || "0") * item.quantity), 0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    
    if (!formData.name || formData.name.length < 2) newErrors.name = "Name must be at least 2 characters";
    if (!formData.email || !formData.email.includes('@')) newErrors.email = "Please enter a valid email";
    if (!formData.phone || formData.phone.length < 10) newErrors.phone = "Please enter a valid phone number";
    if (!formData.street || formData.street.length < 5) newErrors.street = "Street address is required";
    if (!formData.city || formData.city.length < 2) newErrors.city = "City is required";
    if (!formData.state || formData.state.length < 2) newErrors.state = "State is required";
    if (!formData.zipCode || formData.zipCode.length < 5) newErrors.zipCode = "ZIP code is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmitOrder(formData);
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Checkout" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Full Name" error={errors.name}>
            <Input
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </FormField>
          
          <FormField label="Email" error={errors.email}>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="Enter your email"
              required
            />
          </FormField>
          
          <FormField label="Phone" error={errors.phone}>
            <Input
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </FormField>
          
          <FormField label="Street Address" error={errors.street}>
            <Input
              value={formData.street}
              onChange={(e) => updateField('street', e.target.value)}
              placeholder="Enter street address"
              required
            />
          </FormField>
          
          <FormField label="City" error={errors.city}>
            <Input
              value={formData.city}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="Enter city"
              required
            />
          </FormField>
          
          <FormField label="State" error={errors.state}>
            <Input
              value={formData.state}
              onChange={(e) => updateField('state', e.target.value)}
              placeholder="Enter state"
              required
            />
          </FormField>
          
          <FormField label="ZIP Code" error={errors.zipCode}>
            <Input
              value={formData.zipCode}
              onChange={(e) => updateField('zipCode', e.target.value)}
              placeholder="Enter ZIP code"
              required
            />
          </FormField>
          
          <FormField label="Country">
            <Select
              value={formData.country}
              onChange={(value) => updateField('country', value)}
              options={[
                { value: 'USA', label: 'United States' },
                { value: 'CA', label: 'Canada' },
                { value: 'UK', label: 'United Kingdom' }
              ]}
            />
          </FormField>
        </div>
        
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping:</span>
            <span className="text-green-600">FREE</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
        </div>
        
        <Button type="submit" className="w-full" size="lg">
          Place Order
        </Button>
      </form>
    </Modal>
  );
};

// Main E-Commerce App Component
const ECommerceApp = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductWithReviews | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const { showToast } = useToast();

  // Fetch data using React Query
  const { data: products = [] } = useQuery({
    queryKey: ['products', activeCategory, searchQuery],
    queryFn: () => Promise.resolve(store.getProducts(activeCategory, searchQuery)),
    staleTime: 1000 * 60 * 5,
  });

  const { data: featuredProducts = [] } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => Promise.resolve(store.getFeaturedProducts()),
    staleTime: 1000 * 60 * 5,
  });

  const { data: cartItems = [], refetch: refetchCart } = useQuery({
    queryKey: ['cart', sessionId],
    queryFn: () => Promise.resolve(store.getCartItems(sessionId)),
    staleTime: 1000 * 30,
  });

  // Calculate cart totals
  const cartTotal = cartItems.reduce((sum, item) => 
    sum + (parseFloat(item.product?.price || "0") * item.quantity), 0
  );
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Handlers
  const handleViewDetails = async (product: Product) => {
    const productWithReviews = store.getProduct(product.id);
    setSelectedProduct(productWithReviews || null);
  };

  const handleAddToCart = (productId: string) => {
    store.addToCart(sessionId, productId, 1);
    refetchCart();
    showToast("Added to cart!", "success");
  };

  const handleUpdateCartQuantity = (id: string, quantity: number) => {
    store.updateCartItem(id, quantity);
    refetchCart();
  };

  const handleRemoveFromCart = (id: string) => {
    store.removeFromCart(id);
    refetchCart();
    showToast("Item removed", "success");
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleSubmitOrder = (formData: any) => {
    const orderItems = cartItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.product?.price || "0"
    }));

    const order = store.createOrder(
      {
        total: cartTotal.toFixed(2),
        status: "pending",
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        billingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        }
      },
      formData,
      orderItems,
      sessionId
    );

    refetchCart();
    setIsCheckoutOpen(false);
    showToast(`Order #${order.id} placed successfully! Email notification sent.`, "success");
  };

  const categories = ["all", "Electronics", "Wearables", "Furniture"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Package className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">TechStore</h1>
            </div>
            
            {/* Search */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Cart */}
            <Button
              variant="outline"
              onClick={() => setIsCartOpen(true)}
              className="relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">
              Premium Tech Products with Fast Shipping
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Get email notifications for every order and enjoy detailed product information
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Secure Checkout</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5" />
                <span>Free Shipping</span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Categories</h3>
          <div className="flex space-x-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "primary" : "outline"}
                onClick={() => setActiveCategory(category)}
                className="capitalize"
              >
                {category === "all" ? "All Products" : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Featured Products
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.slice(0, 3).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={handleViewDetails}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Products */}
        <div>
          <h3 className="text-xl font-semibold mb-4">
            {searchQuery ? `Search Results for "${searchQuery}"` : 
             activeCategory === "all" ? "All Products" : activeCategory}
          </h3>
          
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetails={handleViewDetails}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your search or category filter.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onSubmitOrder={handleSubmitOrder}
      />
    </div>
  );
};

// Root App Component with Providers
export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ECommerceApp />
      </ToastProvider>
    </QueryClientProvider>
  );
}
