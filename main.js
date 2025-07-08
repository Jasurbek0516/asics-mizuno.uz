// Sample product data
const products = [
    {
        id: 1,
        name: "ASICS GEL-NIMBUS 25",
        category: "shoes",
        price: 1599000,
        oldPrice: 1899000,
        sizes: [41, 42, 43, 44, 45],
        colors: ["Black", "Blue", "White"],
        description: "Professional yugurish poyabzali. Yuqori sifatli GEL texnologiyasi",
        features: [
            "GEL amortizatsiya",
            "Yengil va mustahkam",
            "Havoni o'tkazuvchi material",
            "Anatomik dizayn"
        ],
        rating: 4.8,
        reviewCount: 124,
        inStock: true,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        additionalImages: [
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?view=2",
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?view=3",
            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?view=4"
        ]
    },
    {
        id: 2,
        name: "ASICS Professional Forma",
        category: "uniforms",
        price: 299000,
        oldPrice: 399000,
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Blue", "Red", "Black"],
        description: "Professional futbol formasi. Terni shimuvchi maxsus material",
        features: [
            "Yengil material",
            "Tez quriydigan",
            "UV himoyasi",
            "Elastik"
        ],
        rating: 4.6,
        reviewCount: 89,
        inStock: true,
        image: "https://images.unsplash.com/photo-1580087433295-ab2600c1030e",
        additionalImages: [
            "https://images.unsplash.com/photo-1580087433295-ab2600c1030e?view=2",
            "https://images.unsplash.com/photo-1580087433295-ab2600c1030e?view=3"
        ]
    },
    // Add more products here
];

// Phone number formatting and validation
const phonePatterns = {
    '998': { // O'zbekiston
        maxLength: 9,
        example: '901234567'
    },
    '7': { // Qozog'iston, Rossiya
        maxLength: 10,
        example: '9012345678'
    },
    '996': { // Qirg'iziston
        maxLength: 9,
        example: '700123456'
    },
    '992': { // Tojikiston
        maxLength: 9,
        example: '900123456'
    },
    '993': { // Turkmaniston
        maxLength: 8,
        example: '65123456'
    },
    '374': { // Armaniston
        maxLength: 8,
        example: '77123456'
    },
    '375': { // Belarus
        maxLength: 9,
        example: '291234567'
    },
    '373': { // Moldova
        maxLength: 8,
        example: '22123456'
    },
    '380': { // Ukraina
        maxLength: 9,
        example: '501234567'
    }
};

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    displayProducts('all');
    setupFilterButtons();
    setupReviewModal();

    // Add cart count element
    const cartButton = document.querySelector('.fa-shopping-cart').parentElement;
    const cartCount = document.createElement('span');
    cartCount.id = 'cart-count';
    cartCount.className = 'absolute -top-2 -right-2 bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center hidden';
    cartButton.style.position = 'relative';
    cartButton.appendChild(cartCount);

    // Add click handler for cart button
    cartButton.addEventListener('click', displayCartModal);

    // Handle image loading errors
    function handleImageError(img) {
        img.onerror = null; // Prevent infinite loop
        img.src = 'placeholder.jpg'; // Default placeholder image
    }

    // Add error handling to all images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', () => handleImageError(img));
    });

    // Handle hash-based filtering
    handleHashChange();

    // Initialize lazy loading
    initLazyLoading();

    // Setup country and region selection
    const countrySelect = document.getElementById('country');
    const regionSelect = document.getElementById('region');

    countrySelect.addEventListener('change', () => {
        // Hide all optgroups
        Array.from(regionSelect.getElementsByTagName('optgroup')).forEach(group => {
            group.style.display = 'none';
        });

        // Show selected country's optgroup
        const selectedCountry = countrySelect.value;
        const countryLabels = {
            'uz': "O'zbekiston",
            'kz': "Qozog'iston",
            'kg': "Qirg'iziston",
            'tj': "Tojikiston",
            'tm': "Turkmaniston"
        };

        const optgroup = regionSelect.querySelector(`optgroup[label="${countryLabels[selectedCountry]}"]`);
        if (optgroup) {
            optgroup.style.display = '';
            // Select first option of the group
            if (optgroup.children.length > 0) {
                regionSelect.value = optgroup.children[0].value;
            }
        }
    });

    // Setup phone code selection and input
    const phoneCodeSelect = document.getElementById('phoneCode');
    const selectedCodeElement = document.getElementById('selectedCode');
    const phoneInput = document.getElementById('phone');
    const phoneExample = document.getElementById('phoneExample');

    // Setup phone input validation
    phoneInput.addEventListener('input', (e) => {
        // Remove any non-digit characters
        e.target.value = e.target.value.replace(/[^0-9]/g, '');

        // Limit to max length for selected country
        const code = phoneCodeSelect.value;
        if (e.target.value.length > phonePatterns[code].maxLength) {
            e.target.value = e.target.value.slice(0, phonePatterns[code].maxLength);
        }
    });

    phoneCodeSelect.addEventListener('change', () => {
        const code = phoneCodeSelect.value;
        selectedCodeElement.textContent = '+' + code;
        phoneInput.maxLength = phonePatterns[code].maxLength;
        phoneExample.textContent = phonePatterns[code].example;
        phoneInput.value = ''; // Clear input when code changes
    });

    // Setup order form submission
    const orderForm = document.getElementById('order-form');
    orderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const phoneCode = phoneCodeSelect.value;
        const phoneNumber = phoneInput.value;

        // Validate phone number
        if (phoneNumber.length !== phonePatterns[phoneCode].maxLength) {
            showNotification(`Telefon raqamni to'g'ri kiriting! ${phonePatterns[phoneCode].maxLength} ta raqam bo'lishi kerak.`, true);
            return;
        }

        // Get form data
        const formData = {
            fullname: document.getElementById('fullname').value,
            phone: '+' + phoneCode + phoneNumber,
            address: {
                country: document.getElementById('country').options[document.getElementById('country').selectedIndex].text,
                region: document.getElementById('region').options[document.getElementById('region').selectedIndex].text,
                district: document.getElementById('district').value,
                fullAddress: document.getElementById('address').value
            },
            items: cartItems,
            total: cartItems.reduce((sum, item) => sum + item.price, 0)
        };

        // Here you would typically send this data to your backend
        console.log('Order submitted:', formData);

        // Show success message
        showNotification('Buyurtmangiz qabul qilindi! Tez orada siz bilan bog\'lanamiz.');

        // Clear cart
        cartItems = [];
        updateCartIcon();

        // Close form and reset
        closeOrderForm();
        orderForm.reset();

        // Reset region select visibility
        Array.from(regionSelect.getElementsByTagName('optgroup')).forEach(group => {
            group.style.display = group.label === "O'zbekiston" ? '' : 'none';
        });
    });

    // Initialize region select with Uzbekistan regions visible
    countrySelect.value = 'uz';
    countrySelect.dispatchEvent(new Event('change'));
});

// Display products based on category
function displayProducts(category) {
    const productsGrid = document.getElementById('products-grid');
    productsGrid.innerHTML = '';

    const filteredProducts = category === 'all'
        ? products
        : products.filter(product => {
            if (category === 'accessories') {
                return product.category === 'accessories' || product.category === 'socks';
            }
            return product.category === category;
        });

    filteredProducts.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create product card element with enhanced features and lazy loading
function createProductCard(product) {
    const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

    const card = document.createElement('div');
    card.className = 'bg-gray-700 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group';

    card.innerHTML = `
        <div class="relative group cursor-pointer" onclick="openImagePreview('${product.image}')">
            <img 
                src="placeholder.jpg"
                data-src="${product.image}" 
                alt="${product.name}" 
                class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105 lazy"
            >
            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300">
            </div>
            ${discount > 0 ? `
                <div class="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                    -${discount}%
                </div>
            ` : ''}
            ${!product.inStock ? `
                <div class="absolute top-4 left-4 bg-gray-800 text-white px-3 py-1 rounded-full text-sm">
                    Tugadi
                </div>
            ` : ''}
            <div class="absolute bottom-4 right-4 flex space-x-2">
                ${product.additionalImages.map((img, index) => `
                    <div class="w-12 h-12 rounded-md overflow-hidden cursor-pointer hover:scale-110 transition-transform duration-300"
                         onclick="event.stopPropagation(); openImagePreview('${img}')">
                        <img 
                            src="placeholder.jpg"
                            data-src="${img}" 
                            alt="Additional view ${index + 1}" 
                            class="w-full h-full object-cover lazy"
                        >
                    </div>
                `).join('')}
            </div>
        </div>
        <div class="p-6">
            <div class="flex justify-between items-start mb-2">
                <h3 class="text-xl font-semibold text-gray-100 group-hover:text-blue-400 transition-colors duration-300">
                    ${product.name}
                </h3>
                <div class="flex items-center">
                    <div class="flex items-center mr-2">
                        ${Array(5).fill('').map((_, i) => `
                            <i class="fas fa-star text-${i < Math.floor(product.rating) ? 'yellow' : 'gray'}-400 text-sm"></i>
                        `).join('')}
                    </div>
                    <span class="text-gray-400 text-sm">(${product.reviewCount})</span>
                </div>
            </div>
            <p class="text-gray-300 mb-4">${product.description}</p>
            <div class="mb-4">
                <div class="flex flex-wrap gap-2 mb-2">
                    ${product.features.map(feature => `
                        <span class="bg-gray-600 text-gray-300 px-2 py-1 rounded-full text-xs">
                            ${feature}
                        </span>
                    `).join('')}
                </div>
            </div>
            <div class="flex flex-wrap gap-2 mb-4">
                <div class="flex items-center space-x-2">
                    <span class="text-gray-400 text-sm">O'lcham:</span>
                    <div class="flex flex-wrap gap-1">
                        ${product.sizes.map(size => `
                            <button class="size-btn px-2 py-1 border border-gray-600 rounded-md text-sm text-gray-300 hover:border-blue-400 hover:text-blue-400 transition-colors">
                                ${size}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="flex justify-between items-center">
                <div class="flex flex-col">
                    ${product.oldPrice ? `
                        <span class="text-gray-400 line-through text-sm">${formatPrice(product.oldPrice)} so'm</span>
                    ` : ''}
                    <span class="text-2xl font-bold text-blue-400">${formatPrice(product.price)} so'm</span>
                </div>
                <div class="flex space-x-2">
                    <button onclick="openReviewModal(${product.id})" class="text-gray-300 hover:text-blue-400 transition-colors">
                        <i class="fas fa-comment"></i>
                    </button>
                    ${product.inStock ? `
                        <button onclick="event.stopPropagation(); addToCart(${product.id})" 
                                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2">
                            <i class="fas fa-shopping-cart text-sm"></i>
                            <span>Savatga</span>
                        </button>
                    ` : `
                        <button class="bg-gray-600 text-gray-400 px-4 py-2 rounded-lg cursor-not-allowed">
                            Tugadi
                        </button>
                    `}
                </div>
            </div>
        </div>
    `;

    // Add size selection functionality
    const sizeButtons = card.querySelectorAll('.size-btn');
    sizeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            sizeButtons.forEach(b => b.classList.remove('border-blue-400', 'text-blue-400'));
            btn.classList.add('border-blue-400', 'text-blue-400');
            product.selectedSize = btn.textContent.trim();
        });
    });

    // Initialize lazy loading for this card's images
    initLazyLoading(card);

    return card;
}

// Lazy loading functionality
function initLazyLoading(container = document) {
    const lazyImages = container.querySelectorAll('img.lazy');

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}

// Setup filter buttons
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => {
                btn.classList.remove('active', 'bg-blue-600', 'text-white');
                btn.classList.add('bg-gray-200', 'text-gray-700');
            });

            // Add active class to clicked button
            button.classList.remove('bg-gray-200', 'text-gray-700');
            button.classList.add('active', 'bg-blue-600', 'text-white');

            // Filter products
            const category = button.getAttribute('data-category');
            displayProducts(category);
        });
    });
}

// Review modal functions
function openReviewModal(productId) {
    const modal = document.getElementById('review-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.setAttribute('data-product-id', productId);
}

function closeReviewModal() {
    const modal = document.getElementById('review-modal');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
}

function setupReviewModal() {
    // Handle star rating
    const stars = document.querySelectorAll('[data-rating]');
    let selectedRating = 0;

    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.getAttribute('data-rating'));
            updateStars();
        });

        star.addEventListener('mouseover', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            highlightStars(rating);
        });

        star.addEventListener('mouseout', () => {
            highlightStars(selectedRating);
        });
    });

    // Handle form submission
    const form = document.getElementById('review-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const productId = document.getElementById('review-modal').getAttribute('data-product-id');
        const name = document.getElementById('name').value;
        const comment = document.getElementById('comment').value;

        // Here you would typically send this data to your backend
        console.log('Review submitted:', { productId, name, rating: selectedRating, comment });

        // Reset form and close modal
        form.reset();
        selectedRating = 0;
        updateStars();
        closeReviewModal();
    });
}

// Helper functions
function highlightStars(rating) {
    const stars = document.querySelectorAll('[data-rating]');
    stars.forEach(star => {
        const starRating = parseInt(star.getAttribute('data-rating'));
        if (starRating <= rating) {
            star.classList.remove('text-gray-300');
            star.classList.add('text-yellow-400');
        } else {
            star.classList.remove('text-yellow-400');
            star.classList.add('text-gray-300');
        }
    });
}

function updateStars() {
    highlightStars(selectedRating);
}

function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// Cart functionality
let cartItems = [];

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        if (!product.selectedSize && product.sizes.length > 0) {
            showNotification('Iltimos, o\'lchamni tanlang!', true);
            return;
        }

        const cartItem = {
            ...product,
            cartId: Date.now(),
            size: product.selectedSize
        };

        cartItems.push(cartItem);
        updateCartIcon();
        showNotification('Mahsulot savatga qo\'shildi');
    }
}

function removeFromCart(index) {
    cartItems.splice(index, 1);
    updateCartIcon();
    displayCartModal(); // Refresh cart modal
}

function updateCartIcon() {
    const cartCount = document.getElementById('cart-count');
    if (cartItems.length > 0) {
        cartCount.textContent = cartItems.length;
        cartCount.classList.remove('hidden');
    } else {
        cartCount.classList.add('hidden');
    }
}

function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${isError ? 'bg-red-500' : 'bg-green-500'} text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function displayCartModal() {
    const modal = document.getElementById('cart-modal');
    const cartContent = document.getElementById('cart-content');
    const totalElement = document.getElementById('cart-total');

    cartContent.innerHTML = '';
    let total = 0;

    if (cartItems.length === 0) {
        cartContent.innerHTML = '<p class="text-gray-400 text-center py-4">Savat bo\'sh</p>';
    } else {
        cartItems.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'flex items-center justify-between p-4 border-b border-gray-700';
            itemElement.innerHTML = `
                <div class="flex items-center space-x-4">
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded">
                    <div>
                        <h3 class="text-gray-200 font-medium">${item.name}</h3>
                        <p class="text-gray-400">${formatPrice(item.price)} so'm</p>
                    </div>
                </div>
                <button onclick="removeFromCart(${index})" class="text-gray-400 hover:text-red-500 transition-colors">
                    <i class="fas fa-times text-xl"></i>
                </button>
            `;
            cartContent.appendChild(itemElement);
            total += item.price;
        });
    }

    totalElement.textContent = `Jami: ${formatPrice(total)} so'm`;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeCartModal() {
    const modal = document.getElementById('cart-modal');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
}

// Image preview functionality
function openImagePreview(imageUrl) {
    const modal = document.getElementById('image-preview-modal');
    const previewImage = document.getElementById('preview-image');

    previewImage.src = imageUrl;
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    // Close on clicking outside the image
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeImagePreview();
        }
    });

    // Add keyboard support for closing
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeImagePreview();
        }
    });
}

function closeImagePreview() {
    const modal = document.getElementById('image-preview-modal');
    modal.classList.remove('flex');
    modal.classList.add('hidden');
}

// Mobile menu functionality
function toggleMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu.style.display === 'block') {
        mobileMenu.style.display = 'none';
    } else {
        mobileMenu.style.display = 'block';
    }
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuButton = document.querySelector('.mobile-menu-button');

    if (!mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
        mobileMenu.classList.remove('active');
    }
});

// Handle hash-based filtering
function handleHashChange() {
    const hash = window.location.hash.slice(1); // Remove the # symbol
    if (hash) {
        const filterButton = document.querySelector(`[data-category="${hash}"]`);
        if (filterButton) {
            filterButton.click();
        }
    }
}

// Initialize hash-based filtering
window.addEventListener('hashchange', handleHashChange);

// Order form functionality
function openOrderForm() {
    // Check if cart is empty
    if (cartItems.length === 0) {
        showNotification('Savatingiz bo\'sh! Iltimos, avval mahsulot tanlang.', true);
        return;
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + item.price, 0);

    // Update total in order form
    document.getElementById('order-total').textContent = formatPrice(total) + " so'm";

    // Hide cart modal and show order form
    closeCartModal();
    const orderFormModal = document.getElementById('order-form-modal');
    orderFormModal.classList.remove('hidden');
    orderFormModal.classList.add('flex');
}

function closeOrderForm() {
    const orderFormModal = document.getElementById('order-form-modal');
    orderFormModal.classList.remove('flex');
    orderFormModal.classList.add('hidden');
}

// Contact form submission
document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            // Here you would typically send the data to your server
            // For now, we'll just show a success message
            alert('Xabaringiz muvaffaqiyatli yuborildi!');
            contactForm.reset();
        });
    }
}); 
