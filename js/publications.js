// publications.js
document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector('#publications-container .left-align-content');
    
    fetch('data/publications.json')
        .then(response => response.json())
        .then(publications => {
            const ol = document.createElement('ol'); // Create an ordered list element
            
            publications.forEach(publication => {
                const li = document.createElement('li'); // Create a list item element
                
                 // Create a link element for the title
                 const titleLink = document.createElement('a');
                 titleLink.href = publication.link; // Assuming your JSON has a link property for each publication
                 titleLink.textContent = publication.title;
                 titleLink.target = "_blank"; // Optional: Opens the link in a new tab
 
                 const title = document.createElement('h2');
                 title.appendChild(titleLink); // Append the link to the title
                 li.appendChild(title); // Append the title to the list item
 
                 const authors = document.createElement('p');
                 authors.textContent = `Authors: ${publication.authors}`;
                 li.appendChild(authors); // Append the authors to the list item
                 
                
                const journal = document.createElement('p'); // Create a paragraph element for the journal
                journal.textContent = `Journal: ${publication.journal}`; // Assuming your JSON has a journal property for each publication
                li.appendChild(journal); // Append the journal to the list item
                
                // ... any other elements you want to append to the list item ...
                
                ol.appendChild(li); // Append the list item to the ordered list
            });
            
            container.appendChild(ol); // Append the ordered list to the container
        })
        .catch(error => console.error('Error fetching publication data:', error));
});
