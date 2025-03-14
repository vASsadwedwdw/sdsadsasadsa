import { createApp } from 'vue';

const app = createApp({
    data() {
        return {
            currentTab: 'products',
            allProducts: [],
            isEditing: false,
            editingIndex: -1,
            newProduct: {
                name: '',
                price: 0,
                emoji: '',
                image: '',
                description: '',
                category: 'popular',
                id: Date.now(),
                imageFile: null
            },
            paymentSettings: {
                bankName: '',
                cardNumber: '',
                recipient: ''
            },
            categories: [],
            newCategory: ''
        };
    },
    mounted() {
        this.loadProducts();
        this.loadPaymentSettings();
        this.loadCategories();
        document.body.style.display = ''; // Remove the initial "display: none"
    },
    methods: {
        loadCategories() {
            const storedCategories = localStorage.getItem('categories');
            if (storedCategories) {
                this.categories = JSON.parse(storedCategories);
            } else {
                this.categories = ['Популярное', 'Устройства', 'Жидкости', 'Аксессуары', 'Акции']; // Default categories
                this.saveCategories();
            }
        },
        addCategory() {
            if (this.newCategory) {
                this.categories.push(this.newCategory);
                this.saveCategories();
                this.newCategory = '';
            }
        },
        deleteCategory(index) {
            if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
                this.categories.splice(index, 1);
                this.saveCategories();
                //update products
                this.allProducts.forEach(product => {
                    product.category = 'popular';
                });
                this.saveProductsToStorage();
            }
        },
        saveCategories() {
            localStorage.setItem('categories', JSON.stringify(this.categories));
        },
        getCategoryValue(categoryName) {
            const categoryMap = {
                'Популярное': 'popular',
                'Устройства': 'devices',
                'Жидкости': 'liquids',
                'Аксессуары': 'accessories',
                'Акции': 'sales'
            };
            return categoryMap[categoryName] || 'popular';
        },
        loadProducts() {
            const storedProducts = localStorage.getItem('products');
            if (storedProducts) {
                this.allProducts = JSON.parse(storedProducts);
            }
        },
        loadPaymentSettings() {
            const settings = localStorage.getItem('paymentSettings');
            if (settings) {
                this.paymentSettings = JSON.parse(settings);
            }
        },
        editProduct(index) {
            this.isEditing = true;
            this.editingIndex = index;
            this.newProduct = {...this.allProducts[index]};
        },
        deleteProduct(index) {
            if (confirm('Вы уверены, что хотите удалить этот товар?')) {
                this.allProducts.splice(index, 1);
                this.saveProductsToStorage();
            }
        },
        cancelEdit() {
            this.isEditing = false;
            this.editingIndex = -1;
            this.resetNewProduct();
        },
        async saveProduct() {
            if (!this.newProduct.name || !this.newProduct.price) {
                alert('Пожалуйста, заполните обязательные поля');
                return;
            }

            if (this.newProduct.imageFile) {
              this.newProduct.image = URL.createObjectURL(this.newProduct.imageFile);
            }

            if (this.isEditing) {
                this.allProducts[this.editingIndex] = {...this.newProduct};
                this.isEditing = false;
                this.editingIndex = -1;
            } else {
                // Give it a unique ID
                this.newProduct.id = Date.now();
                this.allProducts.push({...this.newProduct});
            }
            
            this.saveProductsToStorage();
            this.resetNewProduct();
        },
        resetNewProduct() {
            this.newProduct = {
                name: '',
                price: 0,
                emoji: '',
                image: '',
                description: '',
                category: 'popular',
                id: Date.now(),
                imageFile: null
            };
        },
        saveProductsToStorage() {
            localStorage.setItem('products', JSON.stringify(this.allProducts));
        },
        savePaymentSettings() {
            localStorage.setItem('paymentSettings', JSON.stringify(this.paymentSettings));
            alert('Настройки оплаты сохранены');
        },
        handleImageUpload(event) {
            const file = event.target.files[0];
            this.newProduct.imageFile = file;
            this.newProduct.image = URL.createObjectURL(file); // Create a temporary URL for preview
        }
    }
});

app.mount('#app');