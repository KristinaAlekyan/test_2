const { database } = require('firebase-admin');
const fs = require('fs');
const path = require('path');


async function getData() {
    const csvPath = path.join(__dirname, '20210802162236-assets-overview.csv');
    const csv_data = fs.readFileSync(csvPath, 'utf8');

    let refCurncy = 'usd';
    let totalMktVal;
    const currency = [];
    const quantity = [];
    const costPrice = [];
    const cashArr = [];
    const cashCurrency = [];
    const securts = [];
    const table = csv_data.split('\n');

    // Currency rates
    const rates = {
        'EUR/USD': 1.04,
        'PLN/USD': 0.22,
        'HKD/USD': 0.03
    }
   
    
    table.forEach(row => {
        const columns = row.split(';');
        if (columns[0] === "Short-term investments") {
            cashArr.push(parseFloat(columns[4].replace(/(?!-)[^0-9.]/g, ""))) ///cash
            cashCurrency.push(columns[3]) //cash Currency
        }
        if ((columns[0] == "Bonds") || (columns[0] == "Equities")) {
            costPrice.push(columns[7])
            quantity.push(parseFloat(columns[4].replace(/(?!-)[^0-9.]/g, "")))
        }
        currency.push(columns[3])
    })

    // Creating object from costPrice and  quantity arrays
    costPrice.forEach((num1, index) => {
        const num2 = quantity[index];
        securts.push(
            {
                costPrice: num1,
                quantity: num2
            }
        )
    });

    // Object containening currency : amount pairs
    const cash = cashCurrency.reduce((accumulator, element, index) => {
        return { ...accumulator, [element]: cashArr[index] };
    }, {});

    // Calculating totalMktVal according exchange rates based on refCurncy
    totalMktVal = cash.USD + rates['EUR/USD'] * cash.EUR + rates['PLN/USD'] * cash.PLN + rates['HKD/USD'] * cash.HKD
    totalMktVal = Math.floor(totalMktVal * 100) / 100;
  
    return {
        cash,
        refCurncy,
        securts,
        totalMktVal
    }
    
}

exports.getData = getData



