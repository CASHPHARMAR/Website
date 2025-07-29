# ModernStore - E-commerce Website

A modern, full-featured e-commerce website built with HTML, CSS, JavaScript, and PHP with MySQL backend.

## 🚀 Features

### Frontend Features
- **Modern UI/UX**: Clean, responsive design with CSS Grid and Flexbox
- **Interactive Components**: Product cards with hover effects, image galleries
- **Real-time Search**: Instant product search with autocomplete
- **Shopping Cart**: Add/remove items, quantity controls, persistent storage
- **Wishlist System**: Save favorite products for later
- **Product Filters**: Filter by category, price range, rating
- **Mobile Responsive**: Optimized for all device sizes
- **Smooth Animations**: CSS transitions and keyframe animations

### Backend Features
- **User Authentication**: Registration, login, session management
- **Product Management**: CRUD operations for products and categories
- **Shopping Cart API**: Server-side cart synchronization
- **Search Engine**: Advanced product search with relevance ranking
- **Database Design**: Normalized MySQL schema with relationships
- **Security**: SQL injection prevention, password hashing, CSRF protection
- **File Upload**: Secure image upload for products

### Modern Technologies
- **CSS Variables**: For consistent theming
- **ES6+ JavaScript**: Classes, async/await, modules
- **AJAX/Fetch API**: Seamless user experience without page reloads
- **Local Storage**: Client-side data persistence
- **PDO**: Secure database operations
- **Responsive Design**: Mobile-first approach

## 📁 Project Structure

```
ecommerce-website/
├── index.html              # Homepage
├── products.html           # Products listing page
├── cart.html              # Shopping cart page
├── login.html             # User login page
├── register.html          # User registration page
├── checkout.html          # Checkout process page
├── css/
│   └── style.css          # Main stylesheet
├── js/
│   └── main.js            # JavaScript functionality
├── php/
│   ├── config.php         # Database configuration
│   ├── auth.php           # Authentication handlers
│   ├── cart.php           # Cart management
│   ├── get-products.php   # Product API endpoint
│   ├── get-categories.php # Categories API endpoint
│   ├── get-product.php    # Single product API
│   ├── search.php         # Search functionality
│   └── newsletter.php     # Newsletter subscription
├── database/
│   └── schema.sql         # Database schema
├── uploads/               # Product images directory
├── images/                # Static images
└── admin/                 # Admin panel (optional)
```

## 🛠 Installation & Setup

### Prerequisites
- Web server (Apache/Nginx)
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Git (optional)

### Local Development Setup

#### 1. Clone or Download
```bash
git clone https://github.com/yourusername/modernstore.git
cd modernstore
```

#### 2. Database Setup
1. Create a MySQL database:
```sql
CREATE DATABASE ecommerce_db;
```

2. Import the schema:
```bash
mysql -u your_username -p ecommerce_db < database/schema.sql
```

3. Update database configuration in `php/config.php`:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
define('DB_NAME', 'ecommerce_db');
```

#### 3. Web Server Configuration

**For Apache:**
- Place files in your web server's document root (e.g., `/var/www/html/` or `htdocs/`)
- Ensure `.htaccess` is enabled for URL rewriting

**For XAMPP/WAMP:**
- Copy project to `htdocs/modernstore/`
- Access via `http://localhost/modernstore/`

**For built-in PHP server:**
```bash
php -S localhost:8000
```

#### 4. File Permissions
```bash
chmod 755 uploads/
chmod 644 php/*.php
```

### Production Deployment

#### 1. Upload Files
- Upload all files to your web hosting account
- Ensure PHP and MySQL are available

#### 2. Configure Database
- Update `php/config.php` with production database credentials
- Import `database/schema.sql` to production database

#### 3. Security Configuration
- Change default admin password
- Set secure file permissions
- Enable HTTPS
- Update SITE_URL in config.php

## 🔧 Configuration

### Database Configuration (`php/config.php`)
```php
// Database settings
define('DB_HOST', 'localhost');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
define('DB_NAME', 'ecommerce_db');

// Site settings
define('SITE_URL', 'https://yoursite.com/');
define('UPLOAD_PATH', 'uploads/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
```

### CSS Customization
Update CSS variables in `css/style.css`:
```css
:root {
    --primary-color: #3b82f6;    /* Main brand color */
    --secondary-color: #64748b;   /* Secondary color */
    --success-color: #10b981;     /* Success messages */
    --danger-color: #ef4444;      /* Error messages */
    --warning-color: #f59e0b;     /* Warning messages */
}
```

## 📊 Database Schema

### Core Tables
- **users**: Customer and admin accounts
- **categories**: Product categories
- **products**: Product catalog
- **cart**: Shopping cart items
- **orders**: Order history
- **order_items**: Order line items
- **wishlist**: Saved products
- **reviews**: Product reviews

### Sample Data
The schema includes sample data:
- 4 product categories
- 5 sample products
- 1 admin user (admin@ecommerce.com / admin123)

## 🎨 Customization

### Adding New Products
1. Use the admin interface (if implemented)
2. Or directly insert into database:
```sql
INSERT INTO products (name, description, price, category_id, image, features) 
VALUES ('Product Name', 'Description', 99.99, 1, 'image.jpg', '["feature1", "feature2"]');
```

### Styling Customization
- Modify CSS variables for colors and spacing
- Update typography in the CSS file
- Add custom animations or effects
- Customize responsive breakpoints

### Functionality Extensions
- Add payment gateway integration
- Implement order tracking
- Add product reviews and ratings
- Create admin dashboard
- Add email notifications

## 🔒 Security Features

- **SQL Injection Protection**: PDO prepared statements
- **Password Security**: bcrypt hashing
- **CSRF Protection**: Token validation
- **XSS Prevention**: Input sanitization
- **File Upload Security**: Type and size validation
- **Session Management**: Secure session handling

## 📱 Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Performance Features

- **Lazy Loading**: Images loaded on scroll
- **Debounced Search**: Optimized search requests
- **Local Storage**: Reduced server requests
- **Efficient Queries**: Optimized database operations
- **CSS Grid**: Modern layout without framework overhead

## 🛡 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Product browsing and search
- [ ] Add/remove cart items
- [ ] Wishlist functionality
- [ ] Responsive design on mobile
- [ ] Form validation
- [ ] Error handling

### Test Accounts
- **Admin**: admin@ecommerce.com / admin123
- **Customer**: Register new account via registration form

## 📞 Support & Documentation

### Common Issues

**Database Connection Error:**
- Check database credentials in `php/config.php`
- Verify MySQL service is running
- Ensure database exists

**Images Not Loading:**
- Check file permissions on `uploads/` folder
- Verify image paths in database
- Ensure images are uploaded to correct directory

**JavaScript Errors:**
- Check browser console for errors
- Verify all JS files are loaded
- Check for JavaScript conflicts

### API Endpoints
- `GET /php/get-products.php` - Fetch products
- `GET /php/get-categories.php` - Fetch categories
- `GET /php/search.php?q=query` - Search products
- `POST /php/auth.php` - Authentication
- `POST /php/cart.php` - Cart operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Font Awesome for icons
- Google Fonts for typography
- Modern CSS techniques and best practices
- Community feedback and contributions

---

**ModernStore** - Building the future of e-commerce, one pixel at a time. 🛒✨