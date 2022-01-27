// js for webpage
"use strict";

function strfmt() {
    return [...arguments].reduce((p, c) => p.replace(/%s/, c), this);
};
String.prototype.format = strfmt;

function logoutUser() {
    sessionStorage.clear();
    navigateTo("index");
}

function navigateTo(page) {
    sessionStorage.page = page;
    document.location.reload();
    document.documentElement.scrollTop = 0;
}

function addToCart(item, category) {
    let cart = JSON.parse(sessionStorage.cart);
    let i = cart.findIndex(e => (e.item == item && e.category == category));
    if (i > -1) {
        cart[i].count += 1;
    } else {
        cart.push({ item: item, category: category, count: 1 });
    }
    sessionStorage.cart = JSON.stringify(cart);
}

function removeFromCart(item, category) {
    let cart = JSON.parse(sessionStorage.cart);
    let i = cart.findIndex(e => (e.item == item && e.category == category));
    if (i > -1) {
        if (cart[i].count > 1) {
            cart[i].count -= 1;
        } else {
            cart.splice(i, 1);
        }
        sessionStorage.cart = JSON.stringify(cart);
        if (cart.length == 0) {
            navigateTo("cart");
        }
    }
}

function countInCart(item, category) {
    let cart = JSON.parse(sessionStorage.cart);
    let i = cart.findIndex(e => (e.item == item && e.category == category));
    if (i > -1) {
        return cart[i].count;
    } else {
        return 0;
    }
}

function newCategoryItem(category) {
    if (!category) return;
    let img = document.createElement("img");
    let item = Math.floor(Math.random() * category.items.length);
    img.src = "./images/%s/%s".format(category.id, category.items[item].image);
    img.alt = category.name;
    let p = document.createElement("p");
    p.innerText = category.name;
    let div = document.createElement("div");
    div.className = "categoryItem";
    div.dataset.category = category.id;
    div.append(img, p);
    // goto category page
    div.addEventListener("click", function () { navigateTo("category-%s".format(category.id)); });
    return div;
}

function onSaleCartClick(item, category, counter) {
    addToCart(item, category);
    counter.innerText = countInCart(item, category);
}

function newSaleItem(item, category) {
    if (!item || !category) return;
    let img = document.createElement("img");
    img.src = "./images/%s/%s".format(category.id, item.image);
    img.alt = item.name;
    let p1 = document.createElement("p");
    p1.innerText = item.name;
    let p2 = document.createElement("p");
    p2.innerText = item.price;
    let cartLabel = document.createElement("span");
    cartLabel.innerText = "In cart: ";
    let cartCount = document.createElement("span");
    cartCount.innerText = countInCart(item.id, category.id);
    let button = document.createElement("button");
    button.innerText = "Add to cart";
    // add to cart
    button.addEventListener("click", function () { onSaleCartClick(item.id, category.id, cartCount); });
    let cartStuff = document.createElement("div");
    cartStuff.append(cartLabel, cartCount, button);
    let div = document.createElement("div");
    div.className = "saleItem";
    div.dataset.item = item.id;
    div.dataset.category = category.id;
    div.append(img, p1, p2, cartStuff);
    return div;
}

function onCartRemClick(item, category, counter) {
    removeFromCart(item, category);
    let c = countInCart(item, category);
    if (c > 0) {
        counter.innerText = c
    } else {
        // remove cart item from DOM
        counter.closest(".cartItem").remove();
    }
}

function newCartItem(item, category) {
    if (!item || !category) return;
    let img = document.createElement("img");
    img.src = "./images/%s/%s".format(category.id, item.image);
    img.alt = item.name;
    let p1 = document.createElement("p");
    p1.innerText = item.name;
    let p2 = document.createElement("p");
    p2.innerText = item.price;
    let detailStuff = document.createElement("div");
    detailStuff.append(p1, p2);
    let cartLabel = document.createElement("span");
    cartLabel.innerText = "In cart: ";
    let cartCount = document.createElement("span");
    cartCount.innerText = countInCart(item.id, category.id);
    let buttonRem = document.createElement("button");
    buttonRem.innerText = "-";
    // remove from cart
    buttonRem.addEventListener("click", function () { onCartRemClick(item.id, category.id, cartCount); });
    let buttonAdd = document.createElement("button");
    buttonAdd.innerText = "+";
    // add to cart
    buttonAdd.addEventListener("click", function () { onSaleCartClick(item.id, category.id, cartCount); });
    let cartStuff = document.createElement("div");
    cartStuff.append(cartLabel, buttonRem, cartCount, buttonAdd);
    let div = document.createElement("div");
    div.className = "cartItem";
    div.dataset.item = item.id;
    div.dataset.category = category.id;
    div.append(img, detailStuff, cartStuff);
    return div;
}

// find and return item and its category from their ids
function findItem(item, category, database) {
    let c = database.filter(c => c.id == category)[0]
    let i = c.items.filter(i => i.id == item)[0]
    return [i, c]
}

function onSignupSubmit(event) {
    event.preventDefault();
    let fname = document.getElementById("form-fname").value;
    let lname = document.getElementById("form-lname").value;
    let email = document.getElementById("form-email").value;
    sessionStorage.account = JSON.stringify({ fname: fname, lname: lname, email: email });
    navigateTo("index");
}

function displayAccount() {

    let widget = document.getElementById("account-widget");
    let navbarList = document.getElementById("nav-list");
    let mobileNavBarList = document.getElementById("nav-list-mobile");

    if (!sessionStorage.account) {
        widget.innerText = "Sign Up";
        widget.addEventListener("click", function () { navigateTo("signup"); });
        return;
    }

    let account = JSON.parse(sessionStorage.account);

    let abbr = document.createElement("abbr");
    abbr.title = account.email;
    abbr.innerText = "Welcome %s %s!".format(account.fname, account.lname);
    widget.append(abbr);

    let div = document.createElement("div");
    div.innerText = "Logout";
    let li = document.createElement("li");
    li.append(div);
    li.addEventListener("click", logoutUser);
    navbarList.append(li);
    mobileNavBarList.append(li);

}

async function display(page) {

    let cont = document.getElementById("main-content");

    if (page == "about") {
        let about = await fetch('about.html').then(response => response.text());
        let aboutDOM = new DOMParser().parseFromString(about, "text/html");
        cont.innerHTML = aboutDOM.getElementsByTagName("body")[0].innerHTML;
        return;
    }

    if (page == "signup") {
        let signup = await fetch('signup.html').then(response => response.text());
        let signupDOM = new DOMParser().parseFromString(signup, "text/html");
        cont.innerHTML = signupDOM.getElementsByTagName("body")[0].innerHTML;
        document.getElementById("form-fname").required = true;
        document.getElementById("form-lname").required = true;
        document.getElementById("form-email").required = true;
        document.getElementById("signup-form").addEventListener("submit", onSignupSubmit);
        return;
    }

    // all pages below this will need the database
    let database = await fetch('data.json').then(response => response.json());

    if (page == "index") {
        for (let i = 0; i < database.length; i++) {
            cont.append(newCategoryItem(database[i]));
        }
        return;
    }

    if (RegExp("^category-.+").test(page)) {
        let pageSuff = page.replace(RegExp("^category-"), "");
        let category = database.filter(e => (e.id == pageSuff))[0];
        for (let i = 0; i < category.items.length; i++) {
            cont.append(newSaleItem(category.items[i], category));
        }
        return;
    }

    if (page == "cart") {
        let cart = JSON.parse(sessionStorage.cart);
        if (cart.length == 0) {
            let p1 = document.createElement("p");
            p1.innerText = "Your cart is empty!";
            let p2 = document.createElement("p");
            p2.innerText = "Go and give us some business already, you cheapo!";
            let div = document.createElement("div");
            div.className = "errorText";
            div.append(p1, p2);
            cont.append(div);
            return;
        }
        for (let i = 0; i < cart.length; i++) {
            let item = findItem(cart[i].item, cart[i].category, database);
            cont.append(newCartItem(item[0], item[1]));
        }
        let buyBtn = document.createElement("button");
        buyBtn.className = "buyBtn";
        buyBtn.innerText = "Buy now!"
        cont.append(buyBtn);
        return;
    }

    // TODO make search work??

    // 404
    let p1 = document.createElement("p");
    p1.innerText = "Page not found!";
    let p2 = document.createElement("p");
    p2.innerText = "Did you get lost, weary traveller?";
    let div = document.createElement("div");
    div.className = "errorText";
    div.append(p1, p2);
    cont.append(div);
}

async function main() {

    // TODO loading icon

    // setup sessionStorage for first launch
    if (!sessionStorage.page) {
        sessionStorage.page = "index";
    }
    if (!sessionStorage.cart) {
        sessionStorage.cart = JSON.stringify([]);
    }

    // set event listeners on navigation buttons
    document.getElementById("logo").addEventListener("click", function () { navigateTo("index"); });
    document.getElementById("navbar-about").addEventListener("click", function () { navigateTo("about"); });
    document.getElementById("navbar-mobile-about").addEventListener("click", function () { navigateTo("about"); });
    document.getElementById("navbar-cart").addEventListener("click", function () { navigateTo("cart"); });
    document.getElementById("navbar-mobile-cart").addEventListener("click", function () { navigateTo("cart"); });

    // append dom elements
    displayAccount();
    display(sessionStorage.page);

}

main();
