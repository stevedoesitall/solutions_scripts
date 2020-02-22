const inventory = [
    { title: "Harry Potter", price: 10 },
    { title : "Eloquent JS", price: 15 }
  ];
  
//Pre-ES6

function create_book_shop(inventory) {
    return {
        inventory: inventory,
        inventory_value: function() {
            return this.inventory.reduce((total, book) => {
            return total + book.price;
            }, 0);
        },
        price_for_title: function(title) {
            return this.inventory.find(book => {
            return (book.title == title)
        }).price;
        }
    }
};

//ES6 and on

function create_book_shop(inventory) {
    return {
        inventory,
        inventory_value() {
            return this.inventory.reduce((total, book) => {
            return total + book.price;
            }, 0);
        },
        price_for_title(title) {
            return this.inventory.find(book => {
            return (book.title == title)
        }).price;
        }
    }
};
  


  const book_shop = create_book_shop(inventory);
  
  book_shop.inventory_value();
  book_shop.price_for_title("Harry Potter")

