// Loading data for table
async function initClient () {
    //await data.storeData();
    await view.createTable();
    view.createFilter();
}


// Store localStorage "data" as variable

const data = (() => {
    // Stores data from API response to prevent unecessary API calls
    let allData = '';

    return {
        // Retrieve data from API
        // Improve error catching
        getAll: async () => {
            console.log('getall');
            
            const cosmosDbData = await fetch(URL,{method:"POST"})
            .then((response) => {
                if (response.ok) {
                    //console.log("Response")
                    //console.log(response)
                    rawData = response.json();
                    // console.log("rawData")
                    //console.log(rawData);
                    return rawData;
                } else {
                    throw new Error (`Something went wrong with the request.`);
                }
            })
            .then((data) => {
                console.log("data")
                console.log(data)

                // Save data in localStorage and allData variable
                localStorage.setItem("data",JSON.stringify(data));
                allData = data;
                console.log("AllData");
                console.log(allData);
                
                return data;
            })
            .catch((error) => {
                console.log(error);
            })

            console.log("cosmosDbData");
            console.log(cosmosDbData);
            return cosmosDbData;
        },

        // Store data from localStorage. If empty, call API. Return data
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
            console.log('create table');

            let books = await data.storeData();
            books = books.Documents;
            console.log("books");
            console.log(books);

            // Collect headings
            let headings = Object.keys(books[0]).splice(0, 17);

            // start table and add caption
            let tablehtml = "<table><caption id=title-caption>Books</caption>";

            // iterate data and add row of cells for each
            books.forEach(book => {
                tablehtml  += "<tr>";

                headings.forEach(heading => {
                    tablehtml  += `<td>${book[heading]}</td>`
                });

                tablehtml  += "</tr>";
            });

            // format headings to be more readable
            // must be after books because books are collected by original heading
            for (let i = 0; i < headings.length; i++) {
                headings[i] = headings[i][0].toUpperCase() + headings[i].substring(1);
            }
            const needEdits = ["Age_group","First_published","Id","New_used","P_d"];
            const newHeadings = ["Age group", "First published","ISBN / ASIN", "New / Used", "Phys / Dig"];
            for(i=0; i<needEdits.length; i++) {
                view.replaceHeadings(headings,needEdits[i], newHeadings[i]);
            }
            console.log("Headings after")
            console.log(headings);

            // insert row of headings
            tablehtml  += "<thead> <tr>";
            headings.forEach(heading => tablehtml  += `<th>${heading}</th>`)
            tablehtml += "</tr> </thead>";

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
                col_4: 'checklist',
                col_6: 'select',
                col_15: 'select',
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
        },

        replaceHeadings: (headingArray, oldHeading, newHeading) => {
            console.log("replaceHeadings")
            //console.log(headingArray);
            const index = headingArray.indexOf(oldHeading);
            headingArray[index] = newHeading
        }
    }
})();

initClient();
