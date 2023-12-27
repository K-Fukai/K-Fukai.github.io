document.addEventListener('DOMContentLoaded', function () {
    fetch('data/publications.json')
        .then(response => response.json())
        .then(publications => {
            const publishedContainer = document.getElementById('published-container');
            const preprintsContainer = document.getElementById('preprints-container');
            
            publications.forEach(publication => {
                const li = document.createElement('li');
                 // Create a link element for the title
                 const titleLink = document.createElement('a');
                 titleLink.href = publication.link; // Assuming your JSON has a link property for each publication
                 titleLink.textContent = publication.title;
                 titleLink.target = "_blank"; // Optional: Opens the link in a new tab
 
                 const title = document.createElement('h2');
                 title.className = 'publication-title';
                 title.appendChild(titleLink); // Append the link to the title
                 li.appendChild(title); // Append the title to the list item
 
                 const authors = document.createElement('p');
                 authors.className = 'publication-authors';
                 authors.textContent = `${publication.authors}`;
                 li.appendChild(authors); // Append the authors to the list item
                 
               
                
                // Append the list item to the correct container based on publication type
                if (publication.type === 'published') {
                    const citation = document.createElement('p');
                    citation.className = 'publication-citation';
                    
                    citation.innerHTML = `${publication.journal} <span class='bold'>${publication.volume}</span>, ${publication.page} (${publication.year}).`;
                    li.appendChild(citation);

                    const ol = publishedContainer.querySelector('ol') || document.createElement('ol');
                    if (!publishedContainer.contains(ol)) publishedContainer.appendChild(ol);
                    ol.appendChild(li);
                } else if (publication.type === 'preprint') {

                    const citation = document.createElement('p');
                    citation.className = 'publication-citation';
                   
                    citation.innerHTML = `${publication.journal} (${publication.year}).`;
                    li.appendChild(citation);


                    const ol = preprintsContainer.querySelector('ol') || document.createElement('ol');
                    if (!preprintsContainer.contains(ol)) preprintsContainer.appendChild(ol);
                    ol.appendChild(li);
                }
            });
        })
        .catch(error => console.error('Error fetching publication data:', error));
});


