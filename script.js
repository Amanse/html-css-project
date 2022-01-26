// js for webpage
"use strict";

function strfmt() {
    return [...arguments].reduce((p,c) => p.replace(/%s/,c), this);
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
    div.addEventListener("click", function() { navigateTo("category-%s".format(category.id)); });
    return div;
}

function onSaleCartClick(event) {
    // TODO
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
    let div = document.createElement("div");
    div.className = "saleItem";
    div.dataset.item = item.id;
    div.dataset.category = category.id;
    div.append(img, p1, p2);
    // add to cart
    // TODO listen to button instead of whole card
    div.addEventListener("click", onSaleCartClick);
    return div;
}

async function display(page) {

    let cont = document.getElementById("main-content");

    // TODO add about page

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

    // TODO make search work??

    // TODO render 404 fancily
    cont.append("404!!!");
}

async function main() {

    // TODO loading icon

    // setup sessionStorage for first launch
    if (!sessionStorage.page) {
        sessionStorage.page = "index";
    }

    // set event listeners on navigation buttons
    document.getElementById("logo").addEventListener("click", function() { navigateTo("index"); });

    // append dom elements
    display(sessionStorage.page);

}
main();
