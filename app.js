// Loading data for table
async function initClient () {
    //await data.storeData();
    await view.createTable();
    view.createFilter();
}


// Store localStorage "data" as variable
let globalData = '';

const data = (() => {

    let allData = '';

    return {
        // Retrieve data from API
        // Work out what the promise and the resolve exactly are doing, because you have .then and a resolve 
        getAll: () => {
            console.log('getall');
            
            return new Promise (resolve => {
                let xhttp;
                xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        rawData = JSON.parse(this.responseText).Documents;
                        console.log(rawData);

                        // Turn data into array, so can be used by view table functions
                        allData = rawData.map(doc => Object.values(doc));
                        console.log(allData);

                        //Removing unwanted properties
                        console.log('splicing');
                        for (i = 0; i < allData.length; i++) {
                            allData[i].splice(17,5);
                        }

                        // Save data in localStorage
                        localStorage.setItem("data",JSON.stringify(allData));

                        console.log(allData);
                        resolve(allData);
                    } else {
                        console.log (`${this.status}: ${this.statusText}`);
                        resolve(null);
                    }
                };
                xhttp.open("POST", "URL", false);
                xhttp.send();
            }) 
        },

        // Store data from localStorage. If empty, call API. ANd return data
        storeData: async () => {
            console.log('storeData');
            console.log(allData);
            if (allData !== '' && allData !== null) {
                console.log('return from variable')
                return allData;
            } else {
                console.log('call getAll')
                allData = await data.getAll()
                if (allData === null) {
                    console.log('Retrieve data from local storage')
                    allData = JSON.parse(localStorage.getItem("data"));
                }
                return allData;
            }
        },

        // For testing - clear all data from variable allData
        clearAllData: () => {
            allData = null;
            console.log('allData is null')
        }
    }
})();

// Create table filled with data from the sheet
const view = (() => {
    return {
        createTable: async () => {
            console.log('create table')

            const fullTable = await data.storeData();
            console.log(fullTable);

            const headings = ['Acquired', 'Age Group', 'Author', 'Date', 'First Published', 'Format', 'Genre', 'ISBN/ASIN', 'Length', 'Location', 'New/Used', 'Physical/Digital', 'Pages', 'Publisher','Read', 'Series', 'Title'];
            console.log(headings);

            const books = fullTable;
            console.log(books);

            // start table and add caption
            let tablehtml = "<table><caption id=title-caption>Books</caption>";

            // insert row of headings
            tablehtml  += "<thead> <tr>";
            for(let heading of headings)
            {
                tablehtml  += `<th>${heading}</th>`;
            }
            tablehtml += "</tr> </thead>";

            // iterate data and add row of cells for each
            for(let book of books)
            {
                tablehtml  += "<tr>";
        
                for(i = 0; i < 17; i++)
                {
                    if (book[i]) {
                        tablehtml  += `<td>${book[i]}</td>`;
                    } else {
                        tablehtml += '<td></td>'
                    }
                }
        
                tablehtml  += "</tr>";
            }

             // end of table
            tablehtml += "</table>";

            // add table to the empty div
            document.getElementById("tablediv").innerHTML = tablehtml;
        },

        // Initiate TableFilter
        createFilter: () => {
            console.log('run table')
            var filtersConfig = {
                base_path: 'node_modules/tablefilter/dist/tablefilter/',
                col_4: 'select',
                col_6: 'select',
                highlight_keywords: true,
                rows_counter: true,
                col_types: [
                    'string', 'string', 'string',
                    'string', 'string', 'string',
                    'string', 'string', 'string',
                    'string', 'string', 'string',
                    'string', 'string', 'string',
                    'string', 'string'
                ]
            };
        
            var tf = new TableFilter('tablediv', filtersConfig);
            tf.init();  
        }
    }
})();

initClient();
