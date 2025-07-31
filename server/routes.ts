import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertCustomerSchema, insertOrderSchema, insertOrderItemSchema, insertReviewSchema, insertCartSchema } from "@shared/schema";
import { z } from "zod";

// Mock email notification function
const sendOrderNotification = async (orderData: any) => {
  console.log(`📧 ORDER NOTIFICATION: New order #${orderData.id} received!`);
  console.log(`Customer: ${orderData.customerName}`);
  console.log(`Total: $${orderData.total}`);
  console.log(`Items: ${orderData.items} item(s)`);
  console.log(`📧 Email notification sent to store owner!`);
  // In a real app, this would integrate with an email service like SendGrid, Mailgun, etc.
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all products or filter by category
  app.get("/api/products", async (req, res) => {
    try {
      const { category, search } = req.query;
      let products;
      
      if (search) {
        products = await storage.searchProducts(search as string);
      } else {
        products = await storage.getProducts(category as string);
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to get products" });
    }
  });

  // Get featured products
  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to get featured products" });
    }
  });

  // Get specific product with reviews
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const reviews = await storage.getProductReviews(req.params.id);
      res.json({ ...product, reviews });
    } catch (error) {
      res.status(500).json({ message: "Failed to get product" });
    }
  });

  // Get cart items
  app.get("/api/cart/:sessionId", async (req, res) => {
    try {
      const cartItems = await storage.getCartItems(req.params.sessionId);
      
      // Enrich cart items with product details
      const enrichedCart = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      
      res.json(enrichedCart);
    } catch (error) {
      res.status(500).json({ message: "Failed to get cart items" });
    }
  });

  // Add item to cart
  app.post("/api/cart", async (req, res) => {
    try {
      const cartData = insertCartSchema.parse(req.body);
      const cartItem = await storage.addToCart(cartData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid cart data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  // Update cart item quantity
  app.patch("/api/cart/:id", async (req, res) => {
    try {
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(req.params.id, quantity);
      res.json(cartItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  // Remove item from cart
  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const deleted = await storage.removeFromCart(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove cart item" });
    }
  });

  // Create order (checkout)
  app.post("/api/orders", async (req, res) => {
    try {
      const { customerData, orderData, orderItems } = req.body;
      
      // Create or get customer
      let customer = await storage.getCustomerByEmail(customerData.email);
      if (!customer) {
        customer = await storage.createCustomer(customerData);
      }

      // Create order
      const order = await storage.createOrder({
        ...orderData,
        customerId: customer.id
      });

      // Create order items
      for (const item of orderItems) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        });
      }

      // Clear cart
      if (req.body.sessionId) {
        await storage.clearCart(req.body.sessionId);
      }

      // Send email notification
      await sendOrderNotification({
        id: order.id,
        customerName: customer.name,
        total: order.total,
        items: orderItems.length
      });

      res.status(201).json(order);
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  // Get order details
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const orderItems = await storage.getOrderItems(req.params.id);
      const customer = await storage.getCustomer(order.customerId);
      
      res.json({
        ...order,
        orderItems,
        customer
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get order" });
    }
  });

  // Add product review
  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Get store statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getOrderStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to get statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
