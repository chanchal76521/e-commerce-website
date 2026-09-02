/* =========================================
   FOODIE FOOD DELIVERY APP
========================================= */


/* =========================================
   API
========================================= */

const API_URL = "https://dummyjson.com/recipes?limit=0";


/* =========================================
   GLOBAL VARIABLES
========================================= */

let foods = [];

let cart = JSON.parse(
    localStorage.getItem("foodieCart")
) || [];

let selectedCategory = "all";


/* =========================================
   DOM ELEMENTS
========================================= */

const foodContainer =
    document.getElementById("foodContainer");

const loader =
    document.getElementById("loader");

const noResult =
    document.getElementById("noResult");

const searchInput =
    document.getElementById("searchInput");

const sortSelect =
    document.getElementById("sortSelect");

const cartCount =
    document.getElementById("cartCount");

const cartBody =
    document.getElementById("cartBody");

const cartTotal =
    document.getElementById("cartTotal");

const cartSidebar =
    document.getElementById("cartSidebar");

const cartOverlay =
    document.getElementById("cartOverlay");


/* =========================================
   LOAD FOOD FROM API
========================================= */

async function loadFoods() {

    try {

        loader.classList.remove("d-none");

        const response =
            await fetch(API_URL);

        if (!response.ok) {
            throw new Error("API Error");
        }

        const data =
            await response.json();

        foods = data.recipes;

        renderFoods(foods);

    } catch (error) {

        console.error(error);

        foodContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-wifi-off fs-1 text-danger"></i>
                <h4 class="mt-3">
                    Unable to load food
                </h4>
                <p>
                    Please check your internet connection.
                </p>
            </div>
        `;

    } finally {

        loader.classList.add("d-none");

    }

}


/* =========================================
   RENDER FOOD CARDS
========================================= */

function renderFoods(data) {

    foodContainer.innerHTML = "";

    if (data.length === 0) {

        noResult.classList.remove("d-none");

        return;

    }

    noResult.classList.add("d-none");


    data.forEach(food => {

        const price =
            getFoodPrice(food);

        const card = document.createElement("div");

        card.className =
            "col-sm-6 col-lg-4 col-xl-3";


        card.innerHTML = `

            <div class="food-card">

                <div class="food-img-wrapper">

                    <img
                        src="${food.image}"
                        alt="${food.name}"
                        class="food-img"
                    >

                    <span class="food-badge">
                        ${food.cuisine || "Popular"}
                    </span>

                    <button
                        class="favorite-btn"
                        onclick="toggleFavorite(this)"
                    >
                        <i class="bi bi-heart"></i>
                    </button>

                </div>


                <div class="food-content">

                    <h5 class="food-title">
                        ${food.name}
                    </h5>

                    <p class="food-description">
                        ${food.ingredients
                            .slice(0, 2)
                            .join(", ")}
                    </p>


                    <div class="food-meta">

                        <span class="rating">
                            <i class="bi bi-star-fill"></i>
                            ${food.rating?.toFixed(1) || "4.5"}
                        </span>

                        <span class="time">
                            <i class="bi bi-clock"></i>
                            ${food.prepTimeMinutes || 20} min
                        </span>

                    </div>


                    <div class="food-bottom">

                        <span class="food-price">
                            ₹${price}
                        </span>

                        <button
                            class="add-btn"
                            onclick="addToCart(${food.id})"
                            title="Add to cart"
                        >
                            <i class="bi bi-plus-lg"></i>
                        </button>

                    </div>

                    <button
                        class="btn btn-sm btn-outline-danger w-100 mt-3"
                        onclick="showFoodDetails(${food.id})"
                    >
                        View Details
                    </button>

                </div>

            </div>

        `;

        foodContainer.appendChild(card);

    });

}


/* =========================================
   FOOD PRICE
========================================= */

function getFoodPrice(food) {

    /*
       Demo pricing.

       API recipe data doesn't represent
       actual restaurant prices, so we
       create a frontend demo price.
    */

    const basePrice =
        149 + (food.id % 8) * 30;

    return basePrice;

}


/* =========================================
   SEARCH
========================================= */

searchInput.addEventListener(
    "input",
    applyFilters
);


function searchFromHero() {

    const value =
        document.getElementById("heroSearch").value;

    searchInput.value = value;

    document
        .getElementById("foods")
        .scrollIntoView({
            behavior: "smooth"
        });

    applyFilters();

}


/* =========================================
   FILTER + SORT
========================================= */

function applyFilters() {

    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    let result =
        foods.filter(food => {

            const matchesSearch =
                food.name
                    .toLowerCase()
                    .includes(search)
                ||
                food.tags?.some(tag =>
                    tag.toLowerCase().includes(search)
                );


            let matchesCategory = true;

            if (selectedCategory !== "all") {

                matchesCategory =
                    food.tags?.some(
                        tag =>
                            tag.toLowerCase()
                            === selectedCategory.toLowerCase()
                    );

            }


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    const sort =
        sortSelect.value;


    if (sort === "rating") {

        result.sort(
            (a, b) =>
                (b.rating || 0) -
                (a.rating || 0)
        );

    }


    if (sort === "name") {

        result.sort(
            (a, b) =>
                a.name.localeCompare(b.name)
        );

    }


    renderFoods(result);

}


/* =========================================
   SORT EVENT
========================================= */

sortSelect.addEventListener(
    "change",
    applyFilters
);


/* =========================================
   CATEGORY FILTER
========================================= */

function filterCategory(category) {

    selectedCategory = category;

    document
        .getElementById("foods")
        .scrollIntoView({
            behavior: "smooth"
        });

    applyFilters();

}


/* =========================================
   ADD TO CART
========================================= */

function addToCart(id) {

    const food =
        foods.find(item => item.id === id);

    if (!food) return;


    const existing =
        cart.find(item => item.id === id);


    if (existing) {

        existing.quantity++;

    } else {

        cart.push({

            id: food.id,

            name: food.name,

            image: food.image,

            price: getFoodPrice(food),

            quantity: 1

        });

    }


    saveCart();

    updateCartUI();

    showToast(
        `${food.name} added to cart`
    );

}


/* =========================================
   REMOVE FROM CART
========================================= */

function removeFromCart(id) {

    cart =
        cart.filter(item => item.id !== id);

    saveCart();

    updateCartUI();

}


/* =========================================
   CHANGE QUANTITY
========================================= */

function changeQuantity(id, change) {

    const item =
        cart.find(item => item.id === id);

    if (!item) return;


    item.quantity += change;


    if (item.quantity <= 0) {

        removeFromCart(id);

        return;

    }


    saveCart();

    updateCartUI();

}


/* =========================================
   SAVE CART
========================================= */

function saveCart() {

    localStorage.setItem(
        "foodieCart",
        JSON.stringify(cart)
    );

}


/* =========================================
   UPDATE CART UI
========================================= */

function updateCartUI() {

    const totalItems =
        cart.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );


    cartCount.textContent =
        totalItems;


    document.getElementById(
        "cartItemsText"
    ).textContent =
        `${totalItems} item${totalItems !== 1 ? "s" : ""}`;


    if (cart.length === 0) {

        cartBody.innerHTML = `

            <div class="empty-cart">

                <i class="bi bi-bag-x"></i>

                <h5 class="mt-3">
                    Your cart is empty
                </h5>

                <p>
                    Add some delicious food!
                </p>

            </div>

        `;

        cartTotal.textContent =
            "₹0";

        return;

    }


    cartBody.innerHTML = "";


    let total = 0;


    cart.forEach(item => {

        total +=
            item.price *
            item.quantity;


        const div =
            document.createElement("div");

        div.className =
            "cart-item";


        div.innerHTML = `

            <img
                src="${item.image}"
                alt="${item.name}"
            >


            <div class="cart-item-info">

                <h6>
                    ${item.name}
                </h6>

                <div class="cart-item-price">
                    ₹${item.price}
                </div>


                <div class="quantity">

                    <button
                        onclick="changeQuantity(${item.id}, -1)"
                    >
                        −
                    </button>

                    <strong>
                        ${item.quantity}
                    </strong>

                    <button
                        onclick="changeQuantity(${item.id}, 1)"
                    >
                        +
                    </button>

                </div>

            </div>


            <button
                class="remove-btn"
                onclick="removeFromCart(${item.id})"
            >
                <i class="bi bi-trash"></i>
            </button>

        `;


        cartBody.appendChild(div);

    });


    cartTotal.textContent =
        `₹${total}`;

}


/* =========================================
   OPEN CART
========================================= */

function openCart() {

    cartSidebar.classList.add("open");

    cartOverlay.classList.add("show");

    document.body.style.overflow =
        "hidden";

}


/* =========================================
   CLOSE CART
========================================= */

function closeCart() {

    cartSidebar.classList.remove("open");

    cartOverlay.classList.remove("show");

    document.body.style.overflow =
        "";

}


/* =========================================
   CHECKOUT
========================================= */

function checkout() {

    if (cart.length === 0) {

        showToast(
            "Your cart is empty!"
        );

        return;

    }


    const total =
        cart.reduce(
            (sum, item) =>
                sum +
                item.price *
                item.quantity,
            0
        );


    alert(
        `Order placed successfully!\n\nTotal: ₹${total}\n\nThank you for ordering from Foodie!`
    );


    cart = [];

    saveCart();

    updateCartUI();

    closeCart();

}


/* =========================================
   FOOD DETAILS
========================================= */

function showFoodDetails(id) {

    const food =
        foods.find(item => item.id === id);

    if (!food) return;


    const price =
        getFoodPrice(food);


    const modalContent =
        document.getElementById(
            "modalContent"
        );


    modalContent.innerHTML = `

        <div class="row g-0">

            <div class="col-lg-5">

                <img
                    src="${food.image}"
                    class="modal-food-img"
                    alt="${food.name}"
                >

            </div>


            <div class="col-lg-7">

                <div class="modal-body-custom">

                    <div
                        class="text-danger fw-semibold"
                    >
                        ${food.cuisine || "Delicious Food"}
                    </div>

                    <h2 class="mt-2">
                        ${food.name}
                    </h2>


                    <div class="rating my-3">

                        <i class="bi bi-star-fill"></i>

                        ${food.rating?.toFixed(1) || "4.5"}

                        <span class="text-muted">
                            (${food.reviewCount || 100} reviews)
                        </span>

                    </div>


                    <h4 class="text-danger">
                        ₹${price}
                    </h4>


                    <p class="text-muted mt-3">

                        Delicious ${food.name}
                        prepared with fresh ingredients
                        and authentic flavors.

                    </p>


                    <h6 class="mt-4">
                        Ingredients
                    </h6>


                    <div class="ingredients mt-2">

                        ${food.ingredients
                            .map(
                                ingredient =>
                                    `<span>${ingredient}</span>`
                            )
                            .join("")}

                    </div>


                    <button
                        class="btn-main mt-4"
                        onclick="addToCart(${food.id})"
                        data-bs-dismiss="modal"
                    >
                        <i class="bi bi-bag-plus"></i>
                        Add to Cart
                    </button>

                </div>

            </div>

        </div>

    `;


    const modal =
        new bootstrap.Modal(
            document.getElementById("foodModal")
        );


    modal.show();

}


/* =========================================
   FAVORITE
========================================= */

function toggleFavorite(button) {

    const icon =
        button.querySelector("i");


    if (
        icon.classList.contains(
            "bi-heart"
        )
    ) {

        icon.classList.remove(
            "bi-heart"
        );

        icon.classList.add(
            "bi-heart-fill"
        );

        button.style.color =
            "#ff4d30";

        showToast(
            "Added to favorites ❤️"
        );

    } else {

        icon.classList.remove(
            "bi-heart-fill"
        );

        icon.classList.add(
            "bi-heart"
        );

        button.style.color =
            "#777";

    }

}


/* =========================================
   TOAST
========================================= */

function showToast(message) {

    const toastElement =
        document.getElementById(
            "liveToast"
        );


    toastElement.querySelector(
        ".toast-body"
    ).textContent =
        message;


    const toast =
        new bootstrap.Toast(
            toastElement
        );


    toast.show();

}


/* =========================================
   NEWSLETTER
========================================= */

document
    .getElementById("newsletterForm")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            showToast(
                "Successfully subscribed! 🎉"
            );

            this.reset();

        }
    );


/* =========================================
   DARK MODE
========================================= */

const themeBtn =
    document.getElementById(
        "themeBtn"
    );


const savedTheme =
    localStorage.getItem(
        "foodieTheme"
    );


if (savedTheme === "dark") {

    document.body.classList.add("dark");

    themeBtn.innerHTML =
        `<i class="bi bi-sun"></i>`;

}


themeBtn.addEventListener(
    "click",
    function() {

        document.body.classList.toggle(
            "dark"
        );


        const dark =
            document.body.classList.contains(
                "dark"
            );


        localStorage.setItem(
            "foodieTheme",
            dark ? "dark" : "light"
        );


        themeBtn.innerHTML =
            dark
                ? `<i class="bi bi-sun"></i>`
                : `<i class="bi bi-moon"></i>`;

    }
);


/* =========================================
   INITIALIZE
========================================= */

loadFoods();

updateCartUI();