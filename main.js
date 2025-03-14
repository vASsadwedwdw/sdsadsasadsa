import { createApp } from 'vue';

const TELEGRAM_BOT_TOKEN = '8097859956:AAEGCv2Mt-PM2VymTa2KEJyWC1dPXCdHlzM'; // Replace with actual bot token
const TELEGRAM_CHAT_ID = '-1002627549426'; // Replace with actual chat ID

async function sendTelegramMessage(message) {
    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });
    } catch (error) {
        console.error('Error sending telegram message:', error);
    }
}

async function sendTelegramPhoto(photo, caption) {
    try {
        const formData = new FormData();
        formData.append('chat_id', TELEGRAM_CHAT_ID);
        formData.append('photo', photo);
        formData.append('caption', caption);

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, {
            method: 'POST',
            body: formData
        });
    } catch (error) {
        console.error('Error sending telegram photo:', error);
    }
}

const app = createApp({
    data() {
        return {
            products: [],
            cart: JSON.parse(localStorage.getItem('cart') || '[]'),
            selectedProduct: null,
            categories: [],
            showCartDropdown: false,
            userDetails: {
                firstName: '',
                lastName: '',
                phone: '',
                address: ''
            },
            paymentDetails: {
                cardNumber: 'XXXX XXXX XXXX XXXX',
                bankName: 'Тинькофф Банк',
                recipient: 'ООО Вейп Шоп',
                screenshot: null
            }
        };
    },
    watch: {
        cart: {
            handler(newCart) {
                localStorage.setItem('cart', JSON.stringify(newCart));
            },
            deep: true
        }
    },
    mounted() {
        this.logVisit();
        this.loadProducts();
        this.loadPaymentSettings();
        this.loadCategories();
        document.body.style.display = ''; // Remove the initial "display: none"
    },
    computed: {
        cartCount() {
            return this.cart.length;
        },
        cartTotal() {
            return this.cart.reduce((sum, item) => sum + item.price, 0);
        }
    },
    methods: {
        getCategoryLink(category) {
            const categoryMap = {
                "Популярное ": "popular.html",
                "Устройства ": "devices.html",
                "Жидкости ": "liquids.html",
                "Аксессуары ": "accessories.html",
                "Акции ": "sales.html"
            };
            return categoryMap[category] || "index.html"; 
        },
        async logVisit() {
            const deviceInfo = {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                screenResolution: `${window.screen.width}x${window.screen.height}`
            };

            const message = ` Новый посетитель!\n\n` +
                ` Устройство:\n${JSON.stringify(deviceInfo, null, 2)}\n\n` +
                ` Время: ${new Date().toLocaleString('ru-RU')}`;

            await sendTelegramMessage(message);
        },
        addToCart(product) {
            this.cart.push(product);
        },
        showDescription(product) {
            this.selectedProduct = product;
        },
        showCart() {
            this.showCartDropdown = !this.showCartDropdown;
        },
        removeFromCart(index) {
            this.cart.splice(index, 1);
        },
        async proceedToCheckout() {
            const orderDetails = ` Новый заказ!\n\n` +
                ` Покупатель:\n` +
                `Имя: ${this.userDetails.firstName}\n` +
                `Фамилия: ${this.userDetails.lastName}\n` +
                `Телефон: ${this.userDetails.phone}\n` +
                `Адрес: ${this.userDetails.address}\n\n` +
                ` Товары:\n${this.cart.map(item => `- ${item.name} (${item.price})`).join('\n')}\n\n` +
                ` Итого: ${this.cartTotal}`;

            await sendTelegramMessage(orderDetails);
            this.showCartDropdown = false;

            window.location.href = 'checkout.html';
        },
        proceedToPayment() {
            window.location.href = 'payment.html';
        },
        async handleScreenshot(event) {
            const file = event.target.files[0];
            if (file) {
                this.paymentDetails.screenshot = file.name;

                const caption = ` Скриншот оплаты\n\n` +
                    ` Покупатель: ${this.userDetails.firstName} ${this.userDetails.lastName}\n` +
                    ` Сумма: ${this.cartTotal}`;

                await sendTelegramPhoto(file, caption);
            }
        },
        returnToShop() {
            window.location.href = 'index.html';
        },
        finishOrder() {
            localStorage.removeItem('cart');
            this.cart = [];
            window.location.href = 'index.html';
        },
        loadProducts() {
            const storedProducts = localStorage.getItem('products');
            
            const defaultProducts = [
                {
                    id: 1,
                    name: "Премиум Вейп Мод",
                    price: 199,
                    color: "#00dc82",
                    description: "Высокопроизводительное устройство для парения с контролем температуры.",
                    emoji: "",
                    category: "devices",
                    image: null
                },
                {
                    id: 2,
                    name: "Набор Cloud Chaser",
                    price: 89,
                    color: "#00ffaa",
                    description: "Идеально подходит для создания больших облаков с точным контролем.",
                    emoji: "",
                    category: "popular",
                    image: null
                },
                {
                    id: 3,
                    name: "Flavor Master Pod",
                    price: 59,
                    color: "#40e9b5",
                    description: "Компактная pod-система с невероятным вкусопередачей.",
                    emoji: "",
                    category: "devices",
                    image: null
                },
                {
                    id: 4,
                    name: "Набор Elite Coil",
                    price: 45,
                    color: "#60f5c0",
                    description: "Премиум спирали для максимального вкуса и долговечности.",
                    emoji: "",
                    category: "accessories",
                    image: null
                }
            ];
            
            const pageUrl = window.location.pathname;
            let categoryFilter = null;
            
            if (pageUrl.includes('popular.html')) {
                categoryFilter = 'popular';
            } else if (pageUrl.includes('devices.html')) {
                categoryFilter = 'devices';
            } else if (pageUrl.includes('liquids.html')) {
                categoryFilter = 'liquids';
            } else if (pageUrl.includes('accessories.html')) {
                categoryFilter = 'accessories';
            } else if (pageUrl.includes('sales.html')) {
                categoryFilter = 'sales';
            }
            
            if (storedProducts) {
                const allProducts = JSON.parse(storedProducts);
                this.products = categoryFilter ? 
                    allProducts.filter(p => p.category === categoryFilter).map(product => ({
                        ...product,
                        image: product.image && (
                            product.image.startsWith('http') || 
                            product.image.startsWith('data:') || 
                            product.image.startsWith('blob:')
                        ) ? product.image : null
                    })) : 
                    allProducts.map(product => ({
                        ...product,
                        image: product.image && (
                            product.image.startsWith('http') || 
                            product.image.startsWith('data:') || 
                            product.image.startsWith('blob:')
                        ) ? product.image : null
                    }));
            } else {
                this.products = categoryFilter ? 
                    defaultProducts.filter(p => p.category === categoryFilter) : 
                    defaultProducts;
                localStorage.setItem('products', JSON.stringify(defaultProducts));
            }
        },
        loadPaymentSettings() {
            const settings = localStorage.getItem('paymentSettings');
            if (settings) {
                this.paymentDetails = {...JSON.parse(settings)};
            }
        },
        loadCategories() {
            const storedCategories = localStorage.getItem('categories');
            if (storedCategories) {
                this.categories = JSON.parse(storedCategories);
            } else {
                this.categories = ['Популярное', 'Устройства', 'Жидкости', 'Аксессуары', 'Акции']; // Default categories
                localStorage.setItem('categories', JSON.stringify(this.categories));
            }
        },
    }
});

app.mount('#app');