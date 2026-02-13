const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const products = [
    // Desserts
    { name: 'Desert seasonal apricot delight', price: 230, category: 'Desserts' },
    { name: 'Seasonal apple brownie butter', price: 289, category: 'Desserts' },
    { name: 'Turkish Desert mallei gulae', price: 299, category: 'Desserts' },
    { name: 'Dora cakes', price: 199, category: 'Desserts' },
    { name: 'Brownie with ice cream', price: 199, category: 'Desserts' },
    { name: 'Cheesecake (Classic)', price: 259, category: 'Desserts' },
    { name: 'Lemon cheesecake', price: 279, category: 'Desserts' },
    { name: 'Normal cheesecake', price: 250, category: 'Desserts' },
    { name: 'Pistachio cheesecake', price: 319, category: 'Desserts' },
    { name: 'Chocolate cheese cheesecake', price: 319, category: 'Desserts' },
    { name: 'French croissant', price: 99, category: 'Desserts' },
    { name: 'Twister doughnut', price: 139, category: 'Desserts' },
    { name: 'Sweet kimchi erquette', price: 139, category: 'Desserts' },
    { name: 'Churros', price: 149, category: 'Desserts' },
    { name: 'Bombolone Nutella', price: 169, category: 'Desserts' },
    { name: 'Ice cream Chocolate bite', price: 99, category: 'Desserts' },
    { name: 'Ice cream Original vanilla', price: 99, category: 'Desserts' },
    { name: 'Ice cream Banana', price: 99, category: 'Desserts' },
    { name: 'Ice cream Coconut', price: 99, category: 'Desserts' },
    { name: 'Ice cream Pistachio', price: 99, category: 'Desserts' },

    // Snacks
    { name: 'New York best bagel', price: 59, category: 'Snacks' },
    { name: 'Perfect sourdough bread', price: 189, category: 'Snacks' },
    { name: 'Truffle fries', price: 189, category: 'Snacks' },
    { name: 'Fries', price: 150, category: 'Snacks' },
    { name: 'Halloumi', price: 199, category: 'Snacks' },

    // Meals
    { name: 'Power brunch (Chicken, beans, sausage)', price: 289, category: 'Meals' },
    { name: 'Vegetarian brunch', price: 299, category: 'Meals' },
    { name: 'Halloumi salad', price: 289, category: 'Meals' },
    { name: 'Granola bowl', price: 299, category: 'Meals' },
    { name: 'Chicken and cheese sandwich', price: 199, category: 'Meals' },
    { name: 'Italian pizza Special', price: 599, category: 'Meals' },
    { name: 'Pepperoni pizza', price: 499, category: 'Meals' },
    { name: 'Olive Pizza', price: 399, category: 'Meals' },
    { name: 'Margarita pizza', price: 299, category: 'Meals' },
    { name: 'Garlic Pizza', price: 399, category: 'Meals' },

    // Beverages
    { name: 'Green Tea', price: 100, category: 'Beverages' },
    { name: 'Mint Tea', price: 100, category: 'Beverages' },
    { name: 'Lemon and ginger Tea', price: 69, category: 'Beverages' },
    { name: 'Normal tea', price: 39, category: 'Beverages' },
    { name: 'Espresso', price: 129, category: 'Beverages' },
    { name: 'Americano', price: 189, category: 'Beverages' },
    { name: 'Flat white', price: 129, category: 'Beverages' },
    { name: 'Cappuccino', price: 129, category: 'Beverages' },
    { name: 'Latte mocha', price: 139, category: 'Beverages' },
    { name: 'Hot chocolate', price: 169, category: 'Beverages' },
    { name: 'Hot chocolate deluxe', price: 179, category: 'Beverages' },
    { name: 'Pepsi', price: 49, category: 'Beverages' },
    { name: '7-Up', price: 49, category: 'Beverages' },
    { name: 'Camper cola', price: 49, category: 'Beverages' },
    { name: 'Thumbs up', price: 49, category: 'Beverages' }
];

async function main() {
    console.log('🌱 Starting cafeteria product seeding...');

    // Optional: Clear existing products if you want a clean slate
    // await prisma.cafeteriaProduct.deleteMany({});

    for (const product of products) {
        await prisma.cafeteriaProduct.create({
            data: {
                name: product.name,
                category: product.category,
                price: product.price,
                description: `Delicious ${product.name} prepared fresh daily.`,
                images: ['/placeholder-product.png'], // Dummy image
                isAvailable: true,
                stock: 50, // Dummy stock
                gstRate: 5 // Default GST 5% for food/beverages usually
            }
        });
    }

    console.log(`✅ Seeded ${products.length} products successfully.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
