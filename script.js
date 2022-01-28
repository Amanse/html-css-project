// js for webpage
"use strict";

function strfmt() {
    return [...arguments].reduce((p, c) => p.replace(/%s/, c), this);
};
String.prototype.format = strfmt;

function createElement(element, props, ...children) {
    let ele = document.createElement(element);
    for (const k in props)
        ele[k] = props[k];
    if (children.length > 0)
        ele.replaceChildren(...children);
    return ele;
}

function iincludes(sub) {
    return this.toLowerCase().includes(sub.toLowerCase());
}
String.prototype.iincludes = iincludes;

function logoutUser() {
    sessionStorage.clear();
    navigateTo("index");
}

function navigateTo(page) {
    sessionStorage.page = page;
    displayAccount();
    display(page);
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
    let item = Math.floor(Math.random() * category.items.length);
    return createElement("div", {
            className: "categoryItem",
            onclick: () => navigateTo("category-%s".format(category.id)),
        },
        createElement("img", {
                src: "./images/%s/%s".format(category.id, category.items[item].image),
                alt: category.name,
        }),
        createElement("p", {}, category.name),
    );
}

function onSaleCartClick(e, item, category) {
    addToCart(item, category);
    e.target.previousSibling.innerText = countInCart(item, category);
}

function newSaleItem(item, category) {
    if (!item || !category) return;
    return createElement("div", { className: "saleItem", },
        createElement("img", {
                src: "./images/%s/%s".format(category.id, item.image),
                alt: item.name,
        }),
        createElement("p", {}, item.name),
        createElement("p", {}, item.price),
        createElement("div", {},
            createElement("span", {}, "In cart: "),
            createElement("span", {}, countInCart(item.id, category.id)),
            createElement("button",
                { onclick: (e) => onSaleCartClick(e, item.id, category.id), },
                "Add to cart"
            ),
        ),
    );
}

function onCartRemClick(e, item, category) {
    removeFromCart(item, category);
    let c = countInCart(item, category);
    if (c > 0) {
        e.target.nextSibling.innerText = c
    } else {
        // remove cart item from DOM
        e.target.closest(".cartItem").remove();
    }
}

function newCartItem(item, category) {
    if (!item || !category) return;
    return createElement("div", { className: "cartItem", },
        createElement("img", {
                src: "./images/%s/%s".format(category.id, item.image),
                alt: item.name,
        }),
        createElement("div", {},
            createElement("p", {}, item.name),
            createElement("p", {}, item.price),
        ),
        createElement("div", {},
            createElement("span", {}, "In cart: "),
            createElement("button",
                { onclick: (e) => onCartRemClick(e, item.id, category.id), },
                "-"
            ),
            createElement("span", {}, countInCart(item.id, category.id)),
            createElement("button",
                { onclick: (e) => onSaleCartClick(e, item.id, category.id), },
                "+"
            ),
        ),
    );
}

// find and return item and its category from their ids
function findItem(item, category, database) {
    let c = database.filter(c => c.id == category)[0]
    let i = c.items.filter(i => i.id == item)[0]
    return [i, c]
}

// find and return item and its category matching a query
function searchItems(query, database) {
    query = query.trim();
    let l = [];
    let cmatch, match;
    for (const category of database) {
        cmatch = category.name.iincludes(query);
        for (const item of category.items) {
            match = cmatch || item.name.iincludes(query);
            if (match) {
                l.push({ item: item.id, category: category.id });
            }
        }
    }
    return l;
}

function onSearchClick(event) {
    let searchBox = document.getElementById("search");
    if (!searchBox.value) return;
    sessionStorage.query = searchBox.value;
    navigateTo("search");
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

    let abbr = createElement("abbr", { title: account.email, },
        "Welcome %s %s!".format(account.fname, account.lname),
    );
    widget.append(abbr);

    let li = createElement("li", { onclick: logoutUser, },
        createElement("div", {}, "Logout"),
    );
    navbarList.append(li);

    let mLi = createElement("li", { onclick: logoutUser, },
        createElement("div", {}, "Logout"),
    );
    mobileNavBarList.append(mLi);

}

async function display(page) {

    let cont = document.getElementById("main-content");
    cont.replaceChildren();

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
        for (const category of database) {
            cont.append(newCategoryItem(category));
        }
        return;
    }

    if (RegExp("^category-.+").test(page)) {
        let pageSuff = page.replace(RegExp("^category-"), "");
        let category = database.filter(e => (e.id == pageSuff))[0];
        for (const item of category.items) {
            cont.append(newSaleItem(item, category));
        }
        return;
    }

    if (page == "cart") {
        let cart = JSON.parse(sessionStorage.cart);
        if (cart.length == 0) {
            let div = createElement("div", { className: "errorText", },
                createElement("p", {}, "Your cart is empty!"),
                createElement("p", {}, "Go and give us some business already, you cheapo!"),
            );
            cont.append(div);
            return;
        }
        for (const i of cart) {
            let item = findItem(i.item, i.category, database);
            cont.append(newCartItem(item[0], item[1]));
        }
        let buyBtn = createElement("button", { className: "buyBtn", }, "Buy now!");
        cont.append(buyBtn);
        return;
    }

    if (page == "search") {
        let query = sessionStorage.query;
        let res = searchItems(query, database);
        if (res.length == 0) {
            let div = createElement("div", { className: "errorText", },
                createElement("p", {}, "No results for query!"),
                createElement("p", {}, "Maybe try searching for something that's still in fashion?"),
            );
            cont.append(div);
            return;
        }
        for (const i of res) {
            let item = findItem(i.item, i.category, database);
            cont.append(newSaleItem(item[0], item[1]));
        }
        return;
    }

    // 404
    let div = createElement("div", { className: "errorText", },
        createElement("p", {}, "Page not found!"),
        createElement("p", {}, "Did you get lost, weary traveller?"),
    );
    cont.append(div);
}

async function loadPizza() {
    await (function (file) {
        let [ p, r ] = (function() {
            let resolver;
            let promise = new Promise(resolve => resolver = resolve);
            return [ promise, resolver ];
        }());
        let script = createElement("script", {
                src: file,
                defer: true,
                onload: r,
        });
        document.getElementsByTagName("head")[0].append(script);
        return p;
    }("./pizza.js"));
    let cont = document.getElementById("main-content");
    let p = displayPizza();
    let div = createElement("div",
        { style: "margin: 0px 100%; flex-basis: 100%; align-self: flex-start;", },
        p.canvas
    );
    cont.append(div);
    return p;
}

async function main() {

    // loading icon
    let pizza = await loadPizza();
    pizza.start();

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
    document.getElementById("search-btn").addEventListener("click", onSearchClick);

    // append dom elements
    displayAccount();
    display(sessionStorage.page);

    // loading icon end
    await new Promise(r => setTimeout(r, 500));
    pizza.stop();
    pizza.remove();

}

main();
