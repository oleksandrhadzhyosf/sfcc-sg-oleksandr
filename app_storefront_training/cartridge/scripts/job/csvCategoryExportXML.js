'use strict'

const Status = require('dw/system/Status');
const Logger = require('dw/system/Logger');

const app = require('app_storefront_controllers/cartridge/scripts/app');
const CatalogMgr = require('dw/catalog/CatalogMgr');
const ProductSearchModel = require('dw/catalog/ProductSearchModel');

function execute(args) { 
    let statusOk = true;
    let productCategory = args.productCategory;
    //let products = CatalogMgr.getCategory(args.productCategory).getProducts();
    let productSearchModel = new ProductSearchModel();
    productSearchModel.setCategoryID(args.productCategory);
    productSearchModel.search();
    let iterator = productSearchModel.productSearchHits;
    let currentProduct;
    while (iterator !== null && iterator.hasNext()) {
        currentProduct = iterator.next();
        let productId = currentProduct.getProductID();
        let string = 'test';
    }
    try {
        if (args.productCategory) {
            let productCategory = args.productCategory;
            let category = CatalogMgr.getCategory(args.productCategory);
            productSearchModel.search();
         //   let products = category.getProducts();
            let string = 'test';
        }
    } catch (error) {
        statusOk = false;
        Logger.error('AutomaticCategoryAssignation.js > execute crashed on l.{0}. ERROR: {1}', error.lineNumber, error.message);
    }

    if (statusOk) {
        return new  Status(Status.OK, 'OK');
    } else {
        return new  Status(Status.ERROR, 'ERROR');
    }
}

exports.execute = execute;
