// Loading data for table
async function initClient () {
    //await data.storeData();
    await view.createTable();
    view.createFilter();
    authors.displayTopAuthors();
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
        
            var tf = new TableFilter('tablediv', filtersConfig);
            tf.init();  
        }
    }
})();

// Is this approach leaky?
const authors = (() => {
    return {
        // Count how many books are listed by the passed author
        count: (books, author) => {
            console.log("count")
            //console.log(author)
            return books.filter((currentBook) => currentBook.author == author).length;
        },

        // Return the ten authors with the most books listed by them
        countTopAuthors: async () => {
            console.log("countTopAuthors");
            let topAuthors = [];
            const books = await data.storeData();
            let authorList = [];

            books.forEach(book => {
                authorList.push(book.author);
            });
            
            const uniqueAuthors = new Set(authorList);
            //console.log("uniqueAuthors");
            //console.log(uniqueAuthors);

            uniqueAuthors.forEach (author => {
                //console.log("CountTopAuthors for loop");
                //console.log(`${author}`);
                let authorCount = authors.count(books, author);
                //console.log(`Author: ${author}, count: ${authorCount}`)
                topAuthors.push({author: `${author}`, count: authorCount});
            })

            topAuthors.sort((a,b) => {return a.count - b.count});
            //console.log ("TopAuthors");
            //console.log(topAuthors);

            const topTenAuthors = topAuthors.slice(-10).reverse();
            console.log("Top ten authors")
            console.log(topTenAuthors);

            return topTenAuthors
        },

        // Display the ten authors with the most books on the page in div author-body
        displayTopAuthors: async () => {
            const topTenAuthors = await authors.countTopAuthors();
            let listAuthor = "<ol id=\"author-list\"> ";
            let listCount = document.createElement("ol");
            listCount.setAttribute("id", "count-list");

            // Place top authors in ordered list
            topTenAuthors.forEach(author => {
                listAuthor += `<li>${author.author}</li>`
                listCount.innerHTML += `<li>${author.count}</li>`
            })
            listAuthor += "</ol>"

            // Add list of authors with most books to author-body div 
            document.getElementById("author-body").innerHTML = listAuthor;
            document.getElementById("author-body").appendChild(listCount);
        }
    }
})();

initClient();
