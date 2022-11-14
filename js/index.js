const main = (function(){
    // Varibales
    const base_url = 'http://localhost:3000/api/products'

// DomCache

    // Page Reload Dom Elements
    const reload_elements_nodelist = document.querySelectorAll('.reload')
    const reload_elements = Array.prototype.slice.call(reload_elements_nodelist)
    console.log(reload_elements);
    // Product Rendering Dom Elements
    const main = document.querySelector('main')
    const section_products = main.children[0]
    const products_div = document.querySelector('#products')

    // Pagination DOM Elements
    const page_selection = document.querySelector('#pages')
    const pages = page_selection.children[0]

    // Filter DOM Elements
    const filters = document.querySelector('#filter')

    // Search DOM Elements
    const search = document.querySelector('form')
    const search_input = search.children[0]
    const search_button = document.querySelector('#search_button')

    // Category DOM Elements
    const category_nodelist = document.querySelectorAll('.product')
    const categories = Array.prototype.slice.call(category_nodelist)

    // Init
    async function init(){
        filter.options.selectedIndex = 0
        const page_number = window.location.search
        if(page_number === '') window.location.search = '?page=1'

        renderSpinner()
        const products = await getProducts()
        if(products && products.length> 0){
            renderProducts(products)
            renderPagination(products)
        }
        else renderNotFound('Error al cargar los productos, intente nuevamente...')
    }

    // Event handlers
    search.addEventListener('submit', searchProduct)
    search_button.addEventListener('click', searchProduct)
    pages.addEventListener('click', changePage)
    filters.addEventListener('change', selectFilter)

    categories.forEach(category =>{
        category.addEventListener('click', getCategory)
    })

    reload_elements.forEach(element => {
        element.addEventListener('click', reloadPage)
    })

    // Event Listeners
    async function searchProduct(e){
        e.preventDefault()
        const search_text = search_input.value
        if(search_text === '') window.location.href = './'
        const products = await apiSearch(search_text)
        if(products && products.length> 0 ){
            renderProducts(products)
            renderPagination(products)
        }
        else renderNotFound()
    }

    async function selectFilter(e){
        e.preventDefault()
        const active_filter = e.target.selectedOptions[0].value.split('-')

        const new_url = new URL(window.location)
        new_url.searchParams.set('page', 1)
        history.pushState({}, '', new_url)

        const page = window.location.search.slice(6,7)
        await searchByFilter(active_filter, page)
    }

    async function changePage(e){
        e.preventDefault()
        const new_page = e.target.name
        console.log(new_page);
        if(e.target.localName === 'a') {
            const new_url = new URL(window.location)
            new_url.searchParams.set('page', new_page)
            history.pushState({}, '', new_url)
            const active_filter = document.querySelector('#filter').selectedOptions[0].value.split('-')
            await searchByFilter(active_filter, new_page)
        }
    }

    async function getCategory(e){
        e.preventDefault()
        const category_button = e.target
        categories.forEach(category => {
            category.classList.remove('active')
        })
        const category_links = categories.filter(category => category.name === category_button.name)
        category_links.forEach(category => {
            category.classList.add('active')
        })
        const products = await getProductsByCategory(category_button.name)
        if(products && products.length> 0){
            renderProducts(products)
            renderPagination(products)
        }
        else renderNotFound('Error al cargar los productos, intente nuevamente...')
    }

    function reloadPage(e){
        e.preventDefault()
        if(e.target.localName === 'a'){
            window.location.href = './'
        }
    }

    // Api Requests
    async function getProducts(order = '', by = '', page = ''){
        try {
            const response = await fetch(`${base_url}?page=${page}&order=${order}&by=${by}`)
            const {products} = await response.json()
            return products
        } catch (error) {
            console.log(error.message)
        }
    }

    async function apiSearch(search, order = '', by = '', page = ''){
        try {
            const response = search === '' 
                ? await fetch(`${base_url}`)
                : await fetch(`${base_url}/search/${search}?page=${page}&order=${order}&by=${by}`)

            const {products} = await response.json()
            return products
        } catch (error) {
            console.log(error.message)
        }
    }

    async function getDefaultProducts(page = ''){
        const products = await getProducts('', '', page)
        if(products && products.length> 0){
            renderProducts(products)
            renderPagination(products)
            return products
        }
        else renderNotFound('Error al cargar los productos, intente nuevamente...')
    }

    async function getProductsByCategory(category, order = '', by = '', page = ''){
        try {
            const response = await fetch(`${base_url}/category/${category}?page=${page}&order=${order}&by=${by}`)
            const {products} = await response.json()
            return products
        } catch (error) {
            console.log(error.message)
        }
    }

    // Functions
    async function searchByFilter(active_filter, page = ''){
        const current_category_nodelist = document.querySelectorAll('.product')
        const current_categories = Array.prototype.slice.call(current_category_nodelist)
        const active_button = categoryIsActive(current_categories)

        if(active_filter[0] !== 'Filtrar por' && active_button.active === false){
            if(search_input.value === ''){
                const products = await getProducts(active_filter[1], active_filter[0], page)
                if(products && products.length> 0 ){
                    renderProducts(products)
                    renderPagination(products)    
                }
                else renderNotFound()
            }
            else if(search_input.value !== ''){
                console.log(search_input.value, active_button) ;
                const search_text = search_input.value
                const products = await apiSearch(search_text, active_filter[1], active_filter[0], page)
                if(products && products.length> 0 ){
                    renderProducts(products)
                    renderPagination(products)    
                }
                else renderNotFound()
            }
        }
        else if (active_button.active){
                const category_button = active_button.button
                categories.forEach(category => {
                    category.classList.remove('active')
                })
                const category_links = categories.filter(category => category.name === category_button.name)
                category_links.forEach(category => {
                    category.classList.add('active')
                })

                const products = await getProductsByCategory(category_button.name, active_filter[1], active_filter[0], page)
                if(products && products.length> 0){
                    renderProducts(products)
                    renderPagination(products)
                }
                else renderNotFound('Error al cargar los productos, intente nuevamente...')
        }
        else if(search_input.value !== ''){
                console.log(search_input.value, active_button) ;
                const search_text = search_input.value
                const products = await apiSearch(search_text, active_filter[1], active_filter[0], page)
                if(products && products.length> 0 ){
                    renderProducts(products)
                    renderPagination(products)    
                }
                else renderNotFound()
            }
        else {
            await getDefaultProducts(page)
        }
    }

    function categoryIsActive(categories){
        let active = []
        categories.forEach(category => {
            if(category.classList.contains('active')) active.push({active:true, button: category}) 
        })
        return (active.length>0) ? active[0] : {active: false}
    }

    // Render
    async function renderProducts(products){
        const html = []
        products.forEach(product => {
            const img = product.url_image
                ? `<img class="" width="100%" height="220" src="${product.url_image}">`
                : `<svg class="bd-placeholder-img card-img-top" width="100%" height="220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Placeholder: Thumbnail" preserveAspectRatio="xMidYMid slice" focusable="false">
                     <title>Imágen no disponible</title>
                     <rect width="100%" height="100%" fill="#55595c"></rect>
                     <text fill="#dee2e6" x="18%" y="50%">Imágen no disponible</text>
                   </svg>`

            const price = (product.discount > 0)
                ? ` <div class="row text-end">
                        <h5 class="text-danger text-decoration-line-through">$${product.price}</h5>
                        <h5 class="text-success">$${product.price - product.discount}</h5>
                    </div>`
                : `<h5 class="text-success">$${product.price}</h5>`

            const product_card = `
            <div class="col">
                <div class="card shadow-sm">
                    ${img}
                    <div class="card-body flex-column">
                        <h5 class="">${product.name}</h5>
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="btn-group">
                                <button id="${product.id}" type="button" class="btn btn-sm btn-outline-secondary">Comprar</button>
                            </div>
                            ${price}
                        </div>
                    </div>
                </div>
            </div>`
            html.push(product_card)
        });
        products_div.innerHTML = html
        removeClassLists()
    }

    function renderSpinner(){
        addClassLists()
        const spinner = `
            <div class="spinner-border text-secondary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        `
        products_div.innerHTML = spinner
    }

    function renderPagination(products){
        const page = Number(window.location.search.slice(6,7))
        let html

        if(products.length < 20 && page - 1 <= 1){ 
            html = `<li class="page-item disabled"><a name="${page}" class="page-link" href="#">${page}</a></li>`
        }
        else if (products.length < 20 && page - 1 > 1){
            html = `<li class="page-item">
                        <a name="${page-1}" class="page-link">Anterior</a>
                    </li>
                    <li class="page-item disabled"><a name="${page}" class="page-link" href="#">${page}</a></li>`
        }
        else if (products.length === 20 && page - 1 < 1){
            html = `<li class="page-item disabled"><a name="${page}" class="page-link" href="#">${page}</a></li>
                    <li class="page-item">
                        <a name="${page+1}" class="page-link" href="#">Siguiente</a>
                    </li>`
        }
        else if (products.length === 20 && page > 1){
            html = `<li class="page-item">
                        <a name="${page-1}" class="page-link">Anterior</a>
                    </li>
                    <li class="page-item disabled"><a name="${page}" class="page-link" href="#">${page}</a></li>
                    <li class="page-item">
                        <a name="${page+1}" class="page-link" href="#">Siguiente</a>
                    </li>`
        }
        
        pages.innerHTML = html
    }

    function addClassLists(){
        main.classList.add('vh-100')
        section_products.classList.add('vh-100')
        section_products.children[0].classList.add('vh-100')
        products_div.classList.add('vh-100')
        page_selection.classList.add('d-none')
        filter.classList.add('d-none')
    }
    function removeClassLists(){
        main.classList.remove('vh-100')
        section_products.classList.remove('vh-100')
        section_products.children[0].classList.remove('vh-100')
        products_div.classList.remove('vh-100')
        page_selection.classList.remove('d-none')
        filter.classList.remove('d-none')
    }

    function renderNotFound(error = ''){
        addClassLists()
        const message = error === ''
            ? 'No se encontraron resultados...'
            : error
        products_div.innerHTML = `<div class="col-12 text-center"><h2>${message}</h2></div>`
    }

    return {init:init}
})()


main.init()