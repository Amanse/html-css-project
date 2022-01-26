// js for webpage
"use strict";

function strfmt() {
    return [...arguments].reduce((p, c) => p.replace(/%s/, c), this);
};
String.prototype.format = strfmt;

function navigateTo(page) {
    sessionStorage.page = page;
    document.location.reload();
    document.documentElement.scrollTop = 0;
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

function onSaleCartClick(item, category) {
    let cart = JSON.parse(sessionStorage.cart);
    cart.push({ item: item, category: category });
    sessionStorage.cart = JSON.stringify(cart);
}

function removeFromCart(itemToRemove) {
    let cart = JSON.parse(sessionStorage.cart);
    cart = cart.filter((item) => item.item != itemToRemove);
    sessionStorage.cart = JSON.stringify(cart);
    navigateTo("cart");
}

function newSaleItem(item, category, isCart = false) {
    if (!item || !category) return;
    let img = document.createElement("img");
    img.src = "./images/%s/%s".format(category.id, item.image);
    img.alt = item.name;
    let p1 = document.createElement("p");
    p1.innerText = item.name;
    let p2 = document.createElement("p");
    p2.innerText = item.price;
    let button = document.createElement("span");
    if (!isCart) {
        button = document.createElement("button");
        button.innerText = "Add to cart";
        // add to cart
        button.addEventListener("click", function () { onSaleCartClick(item.id, category.id); this.innerHTML = "Added to cart"; });
    } else {
        button = document.createElement("button");
        button.innerText = "Remove from cart";
        button.addEventListener("click", () => { removeFromCart(item.id) });
    }
    let div = document.createElement("div");
    div.className = "saleItem";
    div.dataset.item = item.id;
    div.dataset.category = category.id;
    div.append(img, p1, p2, button);
    return div;
}

// find and return item and its category from their ids
function findItem(item, category, database) {
    let c = database.filter(c => c.id == category)[0]
    let i = c.items.filter(i => i.id == item)[0]
    return [i, c]
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
        for (let i = 0; i < cart.length; i++) {
            let item = findItem(cart[i].item, cart[i].category, database);
            cont.append(newSaleItem(item[0], item[1], true));
        }
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
    document.getElementById("navbar-cart").addEventListener("click", function () { navigateTo("cart"); });
    document.getElementById("navbar-signup").addEventListener("click", function () { navigateTo("signup"); });

    // append dom elements
    display(sessionStorage.page);

}
main();
