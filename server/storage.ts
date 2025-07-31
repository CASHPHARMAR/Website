import { 
  type Product, 
  type InsertProduct, 
  type Customer, 
  type InsertCustomer,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Review,
  type InsertReview,
  type Cart,
  type InsertCart
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Product methods
  getProduct(id: string): Promise<Product | undefined>;
  getProducts(category?: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Customer methods
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | undefined>;
  
  // Order methods
  getOrder(id: string): Promise<Order | undefined>;
  getOrdersByCustomer(customerId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  
  // Order Items methods
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Review methods
  getProductReviews(productId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, updates: Partial<Review>): Promise<Review | undefined>;
  
  // Cart methods
  getCartItems(sessionId: string): Promise<Cart[]>;
  addToCart(cartItem: InsertCart): Promise<Cart>;
  updateCartItem(id: string, quantity: number): Promise<Cart | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(sessionId: string): Promise<void>;
  
  // Statistics methods
  getOrderStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    topProducts: Product[];
  }>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product> = new Map();
  private customers: Map<string, Customer> = new Map();
  private orders: Map<string, Order> = new Map();
  private orderItems: Map<string, OrderItem> = new Map();
  private reviews: Map<string, Review> = new Map();
  private cart: Map<string, Cart> = new Map();

  constructor() {
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample products
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
      }
    ];

    sampleProducts.forEach(product => this.products.set(product.id, product));

    // Create sample customer
    const customer: Customer = {
      id: "customer-1",
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "+1-555-0123",
      address: {
        street: "123 Main Street",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA"
      },
      createdAt: new Date(),
    };
    this.customers.set(customer.id, customer);

    // Create sample reviews
    const sampleReviews: Review[] = [
      {
        id: "review-1",
        productId: "product-1",
        customerId: customer.id,
        rating: 5,
        title: "Amazing sound quality!",
        comment: "These headphones exceeded my expectations. The noise cancellation is fantastic and the battery life is exactly as advertised.",
        isVerified: true,
        createdAt: new Date(),
      },
      {
        id: "review-2",
        productId: "product-2",
        customerId: customer.id,
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
  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProducts(category?: string): Promise<Product[]> {
    const products = Array.from(this.products.values()).filter(p => p.isActive);
    if (category) {
      return products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    return products;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(p => p.isActive)
      .sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating))
      .slice(0, 6);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(p => 
      p.isActive && (
        p.name.toLowerCase().includes(lowQuery) ||
        p.description.toLowerCase().includes(lowQuery) ||
        p.category.toLowerCase().includes(lowQuery)
      )
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      createdAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Customer methods
  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(c => c.email === email);
  }

  async createCustomer(insertCustomer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = {
      ...insertCustomer,
      id,
      createdAt: new Date(),
    };
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer | undefined> {
    const customer = this.customers.get(id);
    if (!customer) return undefined;
    
    const updatedCustomer = { ...customer, ...updates };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }

  // Order methods
  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrdersByCustomer(customerId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(o => o.customerId === customerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      ...insertOrder,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status, updatedAt: new Date() };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order Items methods
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    const orderItem: OrderItem = {
      ...insertOrderItem,
      id,
      createdAt: new Date(),
    };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  // Review methods
  async getProductReviews(productId: string): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(r => r.productId === productId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = randomUUID();
    const review: Review = {
      ...insertReview,
      id,
      createdAt: new Date(),
    };
    this.reviews.set(id, review);
    return review;
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;
    
    const updatedReview = { ...review, ...updates };
    this.reviews.set(id, updatedReview);
    return updatedReview;
  }

  // Cart methods
  async getCartItems(sessionId: string): Promise<Cart[]> {
    return Array.from(this.cart.values()).filter(item => item.sessionId === sessionId);
  }

  async addToCart(insertCart: InsertCart): Promise<Cart> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cart.values()).find(
      item => item.sessionId === insertCart.sessionId && item.productId === insertCart.productId
    );

    if (existingItem) {
      // Update quantity
      existingItem.quantity += insertCart.quantity;
      this.cart.set(existingItem.id, existingItem);
      return existingItem;
    } else {
      // Add new item
      const id = randomUUID();
      const cartItem: Cart = {
        ...insertCart,
        id,
        createdAt: new Date(),
      };
      this.cart.set(id, cartItem);
      return cartItem;
    }
  }

  async updateCartItem(id: string, quantity: number): Promise<Cart | undefined> {
    const cartItem = this.cart.get(id);
    if (!cartItem) return undefined;
    
    if (quantity <= 0) {
      this.cart.delete(id);
      return undefined;
    }
    
    const updatedItem = { ...cartItem, quantity };
    this.cart.set(id, updatedItem);
    return updatedItem;
  }

  async removeFromCart(id: string): Promise<boolean> {
    return this.cart.delete(id);
  }

  async clearCart(sessionId: string): Promise<void> {
    const cartItems = await this.getCartItems(sessionId);
    cartItems.forEach(item => this.cart.delete(item.id));
  }

  // Statistics methods
  async getOrderStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    topProducts: Product[];
  }> {
    const orders = Array.from(this.orders.values());
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Get top products (simplified - in real app would analyze order items)
    const topProducts = Array.from(this.products.values())
      .filter(p => p.isActive)
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 5);

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      topProducts,
    };
  }
}

export const storage = new MemStorage();
