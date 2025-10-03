import { setupWorker, rest } from 'msw';

// Mock data based on your CSV files
const mockCategories = [
    {
        pk: 'CATEGORY#1',
        name: 'Breakfast',
        description: 'Start your day right',
    },
    { pk: 'CATEGORY#2', name: 'Tacos', description: 'Authentic Mexican tacos' },
    {
        pk: 'CATEGORY#3',
        name: 'Burritos',
        description: 'Hearty burrito options',
    },
    { pk: 'CATEGORY#4', name: 'Nachos', description: 'Loaded nacho dishes' },
    {
        pk: 'CATEGORY#5',
        name: 'Salads',
        description: 'Fresh and healthy options',
    },
    {
        pk: 'CATEGORY#6',
        name: 'Quesadillas',
        description: 'Cheesy quesadilla delights',
    },
    {
        pk: 'CATEGORY#7',
        name: 'Tostadas',
        description: 'Crispy tostada options',
    },
    { pk: 'CATEGORY#8', name: 'Sides', description: 'Perfect accompaniments' },
    { pk: 'CATEGORY#9', name: 'Extras', description: 'Additional menu items' },
    { pk: 'CATEGORY#10', name: 'Chips-n-Stuff', description: 'Chips and dips' },
    {
        pk: 'CATEGORY#11',
        name: 'Dinners',
        description: 'Complete dinner plates',
    },
    { pk: 'CATEGORY#12', name: 'Family', description: 'Family-sized portions' },
    { pk: 'CATEGORY#13', name: 'Desserts', description: 'Sweet endings' },
    { pk: 'CATEGORY#14', name: 'Drinks', description: 'Refreshing beverages' },
];

const mockMenuItems = [
    {
        pk: 'ITEM#1',
        categoryId: 1,
        name: 'breakfast taco',
        description:
            'A soft 6in tortilla, your choice of filling (egg and sausage or chorizo), and shredded cheese | add fresh cut potatoes or bacon for $0.50 or both for $0.99',
        price: 3.5,
        vegetarian: false,
        active: true,
    },
    {
        pk: 'ITEM#2',
        categoryId: 1,
        name: 'breakfast burrito',
        description:
            'A soft 10in tortilla, your choice of filling (egg and sausage or chorizo), and shredded cheese | add fresh cut potatoes or bacon for $0.50 or both for $0.99',
        price: 5.5,
        vegetarian: false,
        active: true,
    },
    {
        pk: 'ITEM#3',
        categoryId: 1,
        name: 'breakfast bowl',
        description:
            'A bowl of your choice of filling (egg and sausage or chorizo), and shredded cheese | add fresh cut potatoes or bacon for $0.50 or both for $0.99',
        price: 5.5,
        vegetarian: false,
        active: true,
    },
    {
        pk: 'ITEM#4',
        categoryId: 1,
        name: 'side of bacon',
        description: 'A cup of fresh cooked bacon',
        price: 2.0,
        vegetarian: false,
        active: true,
    },
    {
        pk: 'ITEM#5',
        categoryId: 1,
        name: 'side of potato',
        description: 'A cup of fresh cut potatoes',
        price: 2.0,
        vegetarian: true,
        active: true,
    },
    {
        pk: 'ITEM#6',
        categoryId: 2,
        name: 'taco',
        description:
            'A crispy shell, ground beef, lettuce, and shredded cheese',
        price: 2.39,
        vegetarian: false,
        active: true,
    },
    {
        pk: 'ITEM#7',
        categoryId: 2,
        name: 'supreme taco',
        description:
            'A crispy shell, ground beef, lettuce, tomatoes, sour cream, and shredded cheese',
        price: 2.99,
        vegetarian: false,
        active: true,
    },
    {
        pk: 'ITEM#8',
        categoryId: 2,
        name: 'soft taco',
        description:
            'A soft tortilla, ground beef, lettuce, and shredded cheese',
        price: 2.79,
        vegetarian: false,
        active: true,
    },
    {
        pk: 'ITEM#9',
        categoryId: 2,
        name: 'soft taco supreme',
        description:
            'A soft tortilla, ground beef, lettuce, tomatoes, sour cream, and shredded cheese',
        price: 2.99,
        vegetarian: false,
        active: true,
    },
    {
        pk: 'ITEM#10',
        categoryId: 2,
        name: 'fajita soft taco',
        description:
            'Marinated fajitas (chicken or steak), sauteed bell peppers and onions, and shredded cheese',
        price: 3.99,
        vegetarian: false,
        active: true,
    },
    {
        pk: 'ITEM#11',
        categoryId: 2,
        name: 'taco delite',
        description:
            'A crispy shell wrapped in a flour tortilla with beans, ground beef, lettuce, and shredded cheese',
        price: 3.29,
        vegetarian: false,
        active: true,
    },
    {
        pk: 'ITEM#12',
        categoryId: 2,
        name: 'taco delite supreme',
        description:
            'A crispy shell wrapped in a flour tortilla with beans, ground beef, lettuce, tomatoes, sour cream, and shredded cheese',
        price: 3.99,
        vegetarian: false,
        active: true,
    },
    {
        pk: 'ITEM#13',
        categoryId: 2,
        name: 'taco delite w/ queso',
        description:
            'A crispy shell wrapped in a flour tortilla with beans and queso, ground beef, lettuce, and shredded cheese',
        price: 3.99,
        vegetarian: false,
        active: true,
    },
    {
        pk: 'ITEM#14',
        categoryId: 2,
        name: 'taco delite w/ guac',
        description:
            'A crispy shell wrapped in a flour tortilla with beans and guac made from scratch, ground beef, lettuce, and shredded cheese',
        price: 3.99,
        vegetarian: false,
        active: true,
    },
    {
        pk: 'ITEM#15',
        categoryId: 3,
        name: 'bean burrito',
        description:
            'A 10in flour tortilla, homemade beans, our special burrito sauce, and shredded cheese',
        price: 3.09,
        vegetarian: true,
        active: true,
    },
    {
        pk: 'ITEM#16',
        categoryId: 3,
        name: 'meat burrito',
        description:
            'A 10in flour tortilla, ground beef, our special burrito sauce, and shredded cheese',
        price: 5.99,
        vegetarian: false,
        active: true,
    },
    {
        pk: 'ITEM#17',
        categoryId: 3,
        name: 'combo burrito',
        description:
            'A 10in flour tortilla, homemade beans, ground beef, our special burrito sauce, and shredded cheese',
        price: 6.75,
        vegetarian: false,
        active: true,
    },
    {
        pk: 'ITEM#18',
        categoryId: 3,
        name: 'super burrito',
        description:
            'A 10in flour tortilla, homemade beans, ground beef, our special burrito sauce, lettuce, tomatoes, sour cream, and shredded cheese',
        price: 7.99,
        vegetarian: false,
        active: true,
    },
    {
        pk: 'ITEM#19',
        categoryId: 3,
        name: 'fajita burrito',
        description:
            'A 10in flour tortilla, Marinated fajitas (chicken or steak), sauteed bell peppers and onions, and shredded cheese',
        price: 7.99,
        vegetarian: false,
        active: true,
    },
    {
        pk: 'ITEM#20',
        categoryId: 3,
        name: 'melt burrito',
        description:
            'A 10in flour tortilla, homemade beans, ground beef, our special burrito sauce, smothered in queso, and topped with lettuce, tomatoes, sour cream',
        price: 9.99,
        vegetarian: false,
        active: true,
    },
];

// Create MSW worker
export const worker = setupWorker(
    // Mock categories endpoint
    rest.get('/prod/categories', (req, res, ctx) => {
        return res(
            ctx.delay(500), // Simulate network delay
            ctx.status(200),
            ctx.json(mockCategories)
        );
    }),

    // Mock menu items endpoint
    rest.get('/prod/menu-items', (req, res, ctx) => {
        return res(
            ctx.delay(800), // Simulate network delay
            ctx.status(200),
            ctx.json(mockMenuItems)
        );
    }),

    // Mock menu items by category endpoint
    rest.get('/prod/menu-items-by-category', (req, res, ctx) => {
        const categoryId = req.url.searchParams.get('categoryId');
        const filteredItems = mockMenuItems.filter(
            item => item.categoryId === parseInt(categoryId)
        );

        return res(
            ctx.delay(600), // Simulate network delay
            ctx.status(200),
            ctx.json(filteredItems)
        );
    }),

    // Mock search endpoint
    rest.get('/prod/search', (req, res, ctx) => {
        const query = req.url.searchParams.get('query').toLowerCase();
        const searchResults = mockMenuItems.filter(
            item =>
                item.name.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
        );

        return res(
            ctx.delay(400), // Simulate network delay
            ctx.status(200),
            ctx.json(searchResults)
        );
    })
);

// Start the worker
worker.start({
    onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
});

console.info('🔶 Mock server running - API calls will be intercepted');
