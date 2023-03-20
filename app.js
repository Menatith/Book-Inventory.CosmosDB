// Loading data for table
async function initClient () {
    //await data.storeData();
    await view.createTable();
    view.createFilter();
    await bookAttributes.displayTopAttributeInstances("author", -10);
    await bookAttributes.displayTopAttributeInstances("genre", -5);
    bookAttributes.filterByAuthor();
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
                //console.log("data")
                //console.log(data)

                // Save data in localStorage and allData variable
                localStorage.setItem("data",JSON.stringify(data));
                allData = data;
                //console.log("AllData");
                //console.log(allData);
                
                return data.Documents;
            })
            .catch((error) => {
                console.log(error);
            })

            //console.log("cosmosDbData");
            //console.log(cosmosDbData);
            return cosmosDbData;
        },

        // Store data from localStorage. If empty, call API. Return data
        storeData: async () => {
            console.log('storeData');
            //console.log(allData);
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
    let tf;

    return {
        createTable: async () => {
            console.log('create table');

            let books = await data.storeData();
            //console.log("books");
            //console.log(books);

            const headings = Object.keys(books[0]).splice(0, 17);
            //console.log("Headings")
            //console.log(headings);

            // start table and add caption
            let tablehtml = "<table><caption id=title-caption>Books</caption>";

            // insert row of headings
            tablehtml  += "<thead> <tr>";
            headings.forEach(heading => tablehtml  += `<th>${heading}</th>`)
            tablehtml += "</tr> </thead>";

            // iterate data and add row of cells for each
            books.forEach(book => {
                tablehtml  += "<tr>";

                headings.forEach(heading => {
                    tablehtml  += `<td>${book[heading]}</td>`
                });

                tablehtml  += "</tr>";
            });

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
                col_16: 'select',
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
        
            tf = new TableFilter('tablediv', filtersConfig);
            tf.init();  
        },

        filterActivate: (index, value) => {
            console.log("filterActive");
            tf.clearFilters();
            tf.activateFilter(index);
    
            // act
            tf.setFilterValue(index, value);
            tf.filter();
        }
    }
})();

// Is this approach leaky?
const bookAttributes = (() => {
    return {
        // Count how many books are listed by the passed attribute(genre/author)
        count: (books, attribute, name) => {
            //console.log("count")
            //console.log(name)
            return books.filter((currentBook) => currentBook[attribute] == name).length;
        },

        // Return the ten instances of an attribute with the most books listed by them
        countTopAttributeInstances: async (attribute, amount) => {
            console.log("countTopAttributeInstances");
            console.log(attribute);
            let topAttributeInstances = [];
            const books = await data.storeData();
            let attributeInstancesList = [];

            books.forEach(book => {
                attributeInstancesList.push(book[attribute]);
            });
            
            const uniqueAttributeInstances = new Set(attributeInstancesList);
            console.log("uniqueAttributeInstances");
            console.log(uniqueAttributeInstances);

            uniqueAttributeInstances.forEach (name => {
                //console.log("CountTopAttributeInstances for loop");
                //console.log(attribute);
                let attributeInstanceCount = bookAttributes.count(books, attribute, name);
                //console.log(`Attribute: ${attribute}, count: ${attributeInstanceCount}`)
                topAttributeInstances.push({attribute: `${name}`, count: attributeInstanceCount});
            })

            topAttributeInstances.sort((a,b) => {return a.count - b.count});
            //console.log ("TopAttributeInstances");
            //console.log(topAttributeInstances);

            const topAmountAttributeInstances = topAttributeInstances.slice(amount).reverse();
            console.log("Top instances attribute")
            console.log(topAmountAttributeInstances);

            return topAmountAttributeInstances
        },

        // Display the attribute instances with the most books on the page in div attribute-body
        displayTopAttributeInstances: async (attribute, amount) => {
            console.log("displayTopAttributeInstances")
            console.log(attribute)
            const topAmountAttributeInstances = await bookAttributes.countTopAttributeInstances(attribute, amount);
            let listAttributeInstances = document.createElement("ol");
            listAttributeInstances.setAttribute("id", `${attribute}-list`);
            let listCount = document.createElement("ol");
            listCount.setAttribute("class", "count-list");

            // Place top attribute instances ordered list
            console.log("topAmountAttributeInstances");
            console.log(topAmountAttributeInstances);
            topAmountAttributeInstances.forEach(name => {
                listAttributeInstances.innerHTML += `<li> <button type=button class=top-${attribute}>${name.attribute}</button></li>`
                listCount.innerHTML += `<li>${name.count}</li>`
            })

            // Add list of authors with most books to author-body div 
            document.getElementById(`${attribute}-body`).appendChild(listAttributeInstances);
            document.getElementById(`${attribute}-body`).appendChild(listCount);
        },

        // Adjust tablefilter to only show books by author clicked from top ten list
        filterByAuthor: () => {
            console.log("filterByAuthor")
            document.querySelectorAll(".top-author").forEach(item => {
                item.addEventListener('click', function(){ 
                    view.filterActivate(2, item.textContent);
                })
            })
        }
    }
})();

initClient();