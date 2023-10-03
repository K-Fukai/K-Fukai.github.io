document.addEventListener('DOMContentLoaded', function () {
    fetch('data/talks.json')
        .then(response => response.json())
        .then(talks => {
            const publishedContainer = document.getElementById('published-container');
            const preprintsContainer = document.getElementById('preprints-container');
            
            talks.forEach(talk => {
                const li = document.createElement('li');
                 // Create a link element for the title
                 const titleLink = document.createElement('a');
                 titleLink.href = talk.link; // Assuming your JSON has a link property for each talk
                 titleLink.textContent = talk.title;
                 titleLink.target = "_blank"; // Optional: Opens the link in a new tab
 
                 const title = document.createElement('h2');
                 title.className = 'talk-title';
                 title.appendChild(titleLink); // Append the link to the title
                 li.appendChild(title); // Append the title to the list item
 
                 const authors = document.createElement('p');
                 authors.className = 'talk-authors';
                 authors.textContent = `${talk.authors}`;
                 li.appendChild(authors); // Append the authors to the list item
                 
               
                
                // Append the list item to the correct container based on talk type
                if (talk.type === 'published') {
                    const citation = document.createElement('p');
                    citation.className = 'talk-citation';
                    
                    citation.innerHTML = `${talk.journal}, <span class='bold'>${talk.volume}</span>, ${talk.page} (${talk.year}).`;
                    li.appendChild(citation);

                    const ol = publishedContainer.querySelector('ol') || document.createElement('ol');
                    if (!publishedContainer.contains(ol)) publishedContainer.appendChild(ol);
                    ol.appendChild(li);
                } else if (talk.type === 'preprint') {

                    const citation = document.createElement('p');
                    citation.className = 'talk-citation';
                   
                    citation.innerHTML = `${talk.journal} (${talk.year}).`;
                    li.appendChild(citation);


                    const ol = preprintsContainer.querySelector('ol') || document.createElement('ol');
                    if (!preprintsContainer.contains(ol)) preprintsContainer.appendChild(ol);
                    ol.appendChild(li);
                }
            });
        })
        .catch(error => console.error('Error fetching talk data:', error));
});


