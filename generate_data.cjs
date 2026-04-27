const fs = require('fs');

const products = [
  "Fresh White Cabbage", "Fresh Button Mushrooms", "Fresh Butternut", "Fresh Red Onions", 
  "Healthy Breakfast Pack", "Fresh Spinach", "Courgette", "Fresh Terere", "Alika Potatoes", 
  "Fresh White Sweet Potatoes", "Fresh Cassava", "Carrots", "Fresh White Onions", 
  "Fresh Baby Carrots", "Fresh Hard Lettuce", "Fresh French Beans", "Savoy Cabbage", 
  "Fresh Eggplant", "Soft Maize", "Fresh Managu", "Fresh Dhania", "Coco Yam", 
  "Fresh Soft Lettuce", "Fresh Kunde", "Fresh White Potatoes", "Shelled Minji 500g", 
  "Fresh Red Sweet Potatoes", "Soft Beans", "Mbaazi", "Fresh Beetroots", "Fresh Pumpkin", 
  "Karera", "Dry Beans", "English Cucumber", "Sukuma Wiki", "Fresh Bean Sprout", 
  "Fresh Romaine 5pcs", "Fresh Matoke", "Fresh Arrow Roots", "Fresh Baby Potatoes", 
  "Fresh Cauliflower", "Mrenda", "Fresh Kanzira", "Flat Italian Parsley", 
  "Fresh Oyster Mushrooms", "Fresh Red Banana", "Fresh Red Tomatoes", "Fresh Plantain", 
  "Fresh Kahurura", "Fresh Cherry Tomatoes", "Fresh Leeks", "Fresh Broccoli", 
  "Fresh Spring Onions", "Fresh Tarragon", "Fresh Yellow Pepper", "Fresh Green Pepper", 
  "Fresh Baby Corn", "Fresh Okra", "Fresh Celery", "Fresh Sweet Corn", "Fresh Red Pepper", 
  "Fresh Green Chilli", "Fresh Stir Fry Mix", "Brussel Sprouts", "Fresh Manitou Matoke 1 Dozen", 
  "Fresh Ravaiya", "Baby Spinach", "Maize on Cob", "Fresh Drumsticks", "Fresh Imported Garlic", 
  "Fresh Manitou Potatoes", "Fresh Red Cabbage", "Tindora", "Fresh Apple Mango",
  "5pcs Nyoro Banana", "Fresh Avocado", "Sweet Passion", "Fresh Pawpaw", 
  "Fresh Fruits Office Pack", "Guava", "Passion Royal", "Red Apple", 
  "Pink Lady Apple", "Yellow Lime", "Fresh Imported Grapefruit",
  "Shredded Veggies", "Shredded Cabbage Pack", "Shredded Spinach", "Shredded Sageti", "Shredded Managu", 
  "Fresh Sageti Bunch", "Fresh Golf Potatoes", "Fresh Spices", "Fresh Oregano", "Fresh Curry Leaves", 
  "Fresh Scotch Bonnet / Habanero", "Fresh Dill", "Whole Cinnamon India", "Weekly Vegetable Bundles", 
  "Easy Veggie Pack", "Fresh Kienyeji Mboga Weekly Pack", "Fresh Spicy Pack", "Mt Kenya Milk", 
  "Mt Kenya Milk 200ml", "Brookside Dairy Milk 200ml", "Brookside Dairy Milk 500ml", "Afia Juice Ginger 500gms", 
  "Lemonade", "Predator Energy Drink", "Minute Maid 400ml", "Royal Cling Film Wrap", "Notebook", 
  "Dubai Towel", "Matchbox", "Toothpick", "Sunlight Washing Powder", "Omo Washing Powder", 
  "Softcare Sanitary Pads", "Softcare Diapers", "Mkombero Diapers", "Arimis 90ml", "Arimis 200ml", 
  "Coconut Oil", "American Dark Soy Sauce", "Baking Powder", "Blue Band", "Himalayan Salt", "Sugar", 
  "Jamula Packet", "Plain Bread Stick", "Sweet Toast", "Gluten Free Pizza Base", "Weetabix", 
  "Golden Porridge", "Indomie", "Menengai Bar Soap", "Chamomile Powder", "Chamomile Whole", "Epsom Salt", 
  "Seamoss Powder", "Red Maca Powder", "Shredded Coconut", "Dry Whole Cashew Nuts 100gms", 
  "Pistachio Nuts 100gms", "Dry Dates 250gms", "Roasted White Pumpkin Seed", "Tamarind Packet", 
  "Fresh Black Grapes"
];

function getCategory(name) {
  const lower = name.toLowerCase();
  
  if (lower.includes('spice') || lower.includes('oregano') || lower.includes('curry leaf') || lower.includes('curry leaves') || lower.includes('habanero') || lower.includes('dill') || lower.includes('cinnamon')) {
    return 'Spices';
  }
  if (lower.includes('milk')) {
    return 'Dairy';
  }
  if (lower.includes('juice') || lower.includes('lemonade') || lower.includes('drink') || lower.includes('minute maid')) {
    return 'Beverages';
  }
  if (lower.includes('bread') || lower.includes('toast') || lower.includes('pizza base')) {
    return 'Bakery';
  }
  if (lower.includes('diaper') || lower.includes('pad') || lower.includes('arimis')) {
    return 'Hygiene';
  }
  if (lower.includes('wrap') || lower.includes('notebook') || lower.includes('towel') || lower.includes('matchbox') || lower.includes('toothpick') || lower.includes('washing powder') || lower.includes('bar soap')) {
    return 'Household';
  }
  if (lower.includes('oil') || lower.includes('soy sauce') || lower.includes('baking powder') || lower.includes('blue band') || lower.includes('salt') || lower.includes('sugar') || lower.includes('jamula')) {
    return 'Cooking Essentials';
  }
  if (lower.includes('weetabix') || lower.includes('porridge') || lower.includes('indomie') || lower.includes('breakfast')) {
    return 'Breakfast';
  }
  if (lower.includes('chamomile') || lower.includes('epsom salt') || lower.includes('seamoss') || lower.includes('maca')) {
    return 'Wellness';
  }
  if (lower.includes('nut') || lower.includes('cashew') || lower.includes('pistachio') || lower.includes('date') || lower.includes('pumpkin seed') || lower.includes('tamarind') || lower.includes('coconut')) {
    return 'Snacks';
  }
  if (lower.includes('banana') || lower.includes('mango') || lower.includes('matoke') || lower.includes('plantain') || lower.includes('avocado') || lower.includes('passion') || lower.includes('pawpaw') || lower.includes('fruit') || lower.includes('guava') || lower.includes('apple') || lower.includes('lime') || lower.includes('grapefruit') || lower.includes('grapes')) {
    return 'Fruits';
  }
  if (lower.includes('maize') || lower.includes('beans') || lower.includes('mbaazi') || lower.includes('minji')) {
    return 'Grains';
  }
  if (lower.includes('bundle') || lower.includes('pack')) {
     return 'Grocery Packs';
  }
  return 'Vegetables';
}

function getPrice(name) {
  const lower = name.toLowerCase();
  let base = 100;
  if (lower.includes('mushroom')) base = 350;
  else if (lower.includes('garlic')) base = 250;
  else if (lower.includes('apple mango')) base = 80;
  else if (lower.includes('pink lady apple')) base = 550;
  else if (lower.includes('red apple')) base = 450;
  else if (lower.includes('grapefruit')) base = 300;
  else if (lower.includes('office pack')) base = 850;
  else if (lower.includes('avocado')) base = 40;
  else if (lower.includes('pawpaw')) base = 120;
  else if (lower.includes('passion')) base = 150;
  else if (lower.includes('pack') || lower.includes('bundle')) base = 450;
  else if (lower.includes('beans') && lower.includes('dry')) base = 180;
  else if (lower.includes('spinach') || lower.includes('sukuma')) base = 50;
  else if (lower.includes('cabbage')) base = 80;
  else if (lower.includes('arimis 200')) base = 180;
  else if (lower.includes('arimis 90')) base = 90;
  else if (lower.includes('blue band')) base = 250;
  else if (lower.includes('coconut oil')) base = 600;
  else if (lower.includes('diaper')) base = 950;
  else if (lower.includes('weetabix')) base = 480;
  else if (lower.includes('milk 500')) base = 65;
  else if (lower.includes('milk 200')) base = 35;
  else if (lower.includes('juice')) base = 160;
  else if (lower.includes('washing powder')) base = 240;
  else if (lower.includes('cashew') || lower.includes('pistachio')) base = 800;
  
  return base + Math.floor(Math.random() * 50);
}

const images = [
  'https://images.unsplash.com/photo-1598170845058-28564e528b80?auto=format&fit=crop&q=80&w=400', // carrots [0]
  'https://images.unsplash.com/photo-1518977672816-227ae13dc3b0?auto=format&fit=crop&q=80&w=400', // potatoes [1]
  'https://images.unsplash.com/photo-1592924357228-91a547b99c72?auto=format&fit=crop&q=80&w=400', // tomatoes [2]
  'https://images.unsplash.com/photo-1515024164103-95856b3eec68?auto=format&fit=crop&q=80&w=400', // onions [3]
  'https://images.unsplash.com/photo-1576045057995-c4c1f2025ed7?auto=format&fit=crop&q=80&w=400', // spinach [4]
  'https://images.unsplash.com/photo-1528825871115-3580a53856b3?auto=format&fit=crop&q=80&w=400', // bananas [5]
  'https://images.unsplash.com/photo-1530836369250-bc42426bf764?auto=format&fit=crop&q=80&w=400', // cabbage [6]
  'https://images.unsplash.com/photo-1543362906-acfc16c675e9?auto=format&fit=crop&q=80&w=400', // mushrooms [7]
  'https://images.unsplash.com/photo-1601493700631-2b1619b6c6b3?auto=format&fit=crop&q=80&w=400', // mango [8]
  'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=400', // avocado [9]
  'https://images.unsplash.com/photo-1526462615413-d1df52b414da?auto=format&fit=crop&q=80&w=400', // passion [10]
  'https://images.unsplash.com/photo-1513282592548-bd9facb0b2e3?auto=format&fit=crop&q=80&w=400', // pawpaw [11]
  'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=400', // apple [12]
  'https://images.unsplash.com/photo-1536511132684-25bfbf8a7ea3?auto=format&fit=crop&q=80&w=400', // guava [13]
  'https://images.unsplash.com/photo-1556910110-a5a63dfd393c?auto=format&fit=crop&q=80&w=400', // lime [14]
  'https://images.unsplash.com/photo-1558234320-038289f666f7?auto=format&fit=crop&q=80&w=400', // grapefruit [15]
  'https://images.unsplash.com/photo-1610397962076-02407a169a5b?auto=format&fit=crop&q=80&w=400', // fruit pack [16]
  'https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?auto=format&fit=crop&q=80&w=400', // spices/herbs [17]
  'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=400', // milk [18]
  'https://images.unsplash.com/photo-1600271886742-f049cd451b69?auto=format&fit=crop&q=80&w=400', // juice/beverage [19]
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=400', // hygiene/household [20]
  'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400', // cooking oil [21]
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400', // bread/bakery [22]
  'https://images.unsplash.com/photo-1521997888043-aa9c827744f8?auto=format&fit=crop&q=80&w=400', // breakfast/cereal [23]
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=400', // wellness/powder [24]
  'https://images.unsplash.com/photo-1599598425947-3300262b660f?auto=format&fit=crop&q=80&w=400' // grapes [25]
];

function getImage(name) {
  const lower = name.toLowerCase();
  
  if (lower.includes('carrot')) return images[0];
  if (lower.includes('potato')) return images[1];
  if (lower.includes('tomato')) return images[2];
  if (lower.includes('onion')) return images[3];
  if (lower.includes('spinach') || lower.includes('sukuma') || lower.includes('terere') || lower.includes('managu')) return images[4];
  if (lower.includes('banana') || lower.includes('matoke') || lower.includes('plantain')) return images[5];
  if (lower.includes('cabbage')) return images[6];
  if (lower.includes('mushroom')) return images[7];
  if (lower.includes('mango')) return images[8];
  if (lower.includes('avocado')) return images[9];
  if (lower.includes('passion')) return images[10];
  if (lower.includes('pawpaw')) return images[11];
  if (lower.includes('apple') && !lower.includes('mango')) return images[12];
  if (lower.includes('guava')) return images[13];
  if (lower.includes('lime')) return images[14];
  if (lower.includes('grapefruit')) return images[15];
  if (lower.includes('grapes')) return images[25];
  if (lower.includes('office') || lower.includes('pack') || lower.includes('bundle')) return images[16];
  if (lower.includes('spice') || lower.includes('herb') || lower.includes('oregano') || lower.includes('curry') || lower.includes('habanero') || lower.includes('dill') || lower.includes('cinnamon')) return images[17];
  if (lower.includes('milk')) return images[18];
  if (lower.includes('juice') || lower.includes('drink') || lower.includes('lemonade') || lower.includes('maid')) return images[19];
  if (lower.includes('pad') || lower.includes('diaper') || lower.includes('arimis') || lower.includes('soap') || lower.includes('powder') || lower.includes('towel') || lower.includes('wrap')) return images[20];
  if (lower.includes('oil') || lower.includes('sauce')) return images[21];
  if (lower.includes('bread') || lower.includes('toast') || lower.includes('pizza')) return images[22];
  if (lower.includes('weetabix') || lower.includes('porridge') || lower.includes('breakfast')) return images[23];
  if (lower.includes('powder') || lower.includes('salt') || lower.includes('seamoss') || lower.includes('maca')) return images[24];
  
  return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400';
}

const descriptionTemplate = (name, category) => {
  if (category === 'Vegetables' || category === 'Fruits' || category === 'Spices') {
    return `Freshly sourced farm-quality ${name}. Ideal for your daily healthy recipes. Packed with nutrients and delivered fresh from local Kenyan farms.`;
  }
  if (category === 'Grocery Packs') {
    return `Convenient and affordable ${name}. Packed fresh and ready for your healthy kitchen, delivering a mix of local farm goodness.`;
  }
  if (category === 'Household' || category === 'Hygiene') {
    return `Essential ${name} for your home. High-quality, trusted brand to keep your household clean, organized, and running smoothly.`;
  }
  if (category === 'Dairy' || category === 'Beverages') {
    return `Refreshing ${name}. Ensure you always have your favorite drinks and dairy products stocked at home.`;
  }
  return `Premium quality ${name}. A staple for your pantry, carefully packaged and delivered straight to your door for maximum convenience.`;
};

const generatedProducts = products.map((name, index) => {
  const category = getCategory(name);
  return {
    id: `p${index + 100}`,
    name,
    category,
    price: getPrice(name),
    description: descriptionTemplate(name, category),
    image: getImage(name),
    stock: 20 + Math.floor(Math.random() * 80),
    vendorId: 'v1'
  };
});

const tsContent = `export const initialProducts = ${JSON.stringify(generatedProducts, null, 2)};\n`;
fs.writeFileSync('src/product_data.ts', tsContent);

// Also generate Django fixture
const djangoFixture = generatedProducts.map((p, i) => ({
  model: "products.product",
  pk: i + 1,
  fields: {
    vendor: 1, // assumes vendor with id 1 exists
    name: p.name,
    description: p.description,
    category_name: p.category, // We handle get_or_create logic in seed_products.py
    price: p.price,
    stock_quantity: p.stock,
    availability_status: "in_stock",
    image: "" // let it use default if blank
  }
}));
fs.mkdirSync('django_backend/products/fixtures', { recursive: true });
fs.writeFileSync('django_backend/products/fixtures/products.json', JSON.stringify(djangoFixture, null, 2));

console.log('Generated product data.');
