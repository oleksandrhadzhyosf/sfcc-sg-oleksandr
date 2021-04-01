'use strict'

const Status = require('dw/system/Status');
const Logger = require('dw/system/Logger');

const app = require('app_storefront_controllers/cartridge/scripts/app');
const CatalogMgr = require('dw/catalog/CatalogMgr');
const ProductSearchModel = require('dw/catalog/ProductSearchModel');

const File = require('dw/io/File');
const FileWriter = require('dw/io/FileWriter');
const FileReader = require('dw/io/FileReader');
const CSVStreamWriter = require('dw/io/CSVStreamWriter');
const CVStreamReader = require('dw/io/CSVStreamReader');
const XMLStreamWriter = require('dw/io/XMLStreamWriter');

function execute(args) { 
    let statusOk = true;
    if (args.productCategory) {
        try {
            let productSearchModel = new ProductSearchModel();
            productSearchModel.setCategoryID(args.productCategory);
            productSearchModel.search();

            if (productSearchModel.count > 0) {
                let csvFile = new File(File.IMPEX + File.SEPARATOR + 'csvProducts.csv');

                if (!csvFile.exists()) {
                    csvFile.createNewFile();
                }

                if (csvFile.exists()) {
                    let iterator = productSearchModel.productSearchHits;
                    let csvFileWriter = new FileWriter(csvFile);
                    let csvw = new CSVStreamWriter(csvFileWriter);
                    let i = 0;
                    csvw.writeNext(['product name', 'product id', 'short description', 'product price']);
                    while (iterator !== null && iterator.hasNext() && i < 10) {
                        let currentProduct = iterator.next().getProduct();
                        csvw.writeNext([currentProduct.getName(), currentProduct.getID(), currentProduct.getShortDescription().toString() , currentProduct.getPriceModel().getMaxPrice().getValue().toString()]);
                        i++;
                    }
                    csvw.close();
                    csvFileWriter.close();

                    let stringList = null;
                    let csvReader = new FileReader(csvFile);
                    let csvr = new CVStreamReader(csvReader);

                    if (csvr.readNext()) {
                        let xmlFile = new File(File.IMPEX + File.SEPARATOR + 'csvProducts.xml');

                        if (!xmlFile.exists()) {
                            xmlFile.createNewFile();
                        }

                        if(xmlFile.exists()) {
                            let xmlFileWriter = new FileWriter(xmlFile, 'UTF-8');
                            let xsw = new XMLStreamWriter(xmlFileWriter);
                            xsw.writeStartDocument();
                            xsw.writeStartElement('catalog');
                            xsw.writeAttribute('xmlns', 'http://www.demandware.com/xml/impex/catalog/2021-01-01');
                            xsw.writeAttribute('catalog-id', 'storefront-catalog-m-en');
                            xsw.writeAttribute('category-id', args.productCategory);
                                xsw.writeStartElement("products");
                                while (stringList = csvr.readNext()) {
                                    let product = stringList;
                                    xsw.writeStartElement("product");
                                    xsw.writeAttribute("id", product[1]);
                                        xsw.writeStartElement("name");
                                            xsw.writeCharacters(product[0]);
                                        xsw.writeEndElement();
                                        xsw.writeStartElement("description");
                                            xsw.writeCharacters(product[2]);
                                        xsw.writeEndElement();
                                        xsw.writeStartElement("price");
                                            xsw.writeCharacters(product[3]);
                                        xsw.writeEndElement();
                                    xsw.writeEndElement();
                                }
                                xsw.writeEndElement();
                            xsw.writeEndElement();
                            xsw.writeEndDocument();
                            xsw.close();
                            xmlFileWriter.close();
                        }
                    }
                    csvr.close(); 
                    csvReader.close();
                }
                
            }

        } catch (error) {
            statusOk = false;
            Logger.error('AutomaticCategoryAssignation.js > execute crashed on l.{0}. ERROR: {1}', error.lineNumber, error.message);
        }
    }

    if (statusOk) {
        return new  Status(Status.OK, 'OK');
    } else {
        return new  Status(Status.ERROR, 'ERROR');
    }
}

exports.execute = execute;
