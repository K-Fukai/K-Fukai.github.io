document.addEventListener('DOMContentLoaded', function () {
    fetch('data/talks.json')
        .then(response => response.json())
        .then(talks => {
            
            const oral_domestic_Container = document.getElementById('oral-domestic-container');
            const oral_international_Container = document.getElementById('oral-international-container');
            const poster_domestic_Container = document.getElementById('poster-domestic-container');
            const poster_international_Container = document.getElementById('poster-international-container');
            const seminer_Container = document.getElementById('seminer-container');
            
            talks.forEach(talk => {
                const li = document.createElement('li');

 
          


                const speaker = document.createElement('p');
                speaker.className = 'talk-speaker';
                let titleContent = talk.link ? `<a href="${talk.link}">${talk.title}</a>` : `${talk.title}`;
                speaker.innerHTML = `<span class="underline">${talk.speaker}</span>${talk.authors ? ', ' + talk.authors : ''}, "${titleContent}"`;
                li.appendChild(speaker); // Append the authors to the list item






                const conference = document.createElement('p');
                conference.className = 'talk-conference';
                conference.textContent = `${talk.conference}${talk.place ? ', ' + talk.place : ''}${talk.number ? ', ' + talk.number : ''}, ${talk.year}`;
                li.appendChild(conference); // Append the authors to the list item

                 


               
                
                let targetContainer;
                if (talk.type === 'oral' && talk.nationality === 'domestic') {
                    targetContainer = oral_domestic_Container;
                } else if (talk.type === 'oral' && talk.nationality === 'international') {
                    targetContainer = oral_international_Container;
                } else if (talk.type === 'poster' && talk.nationality === 'international') {
                    targetContainer = poster_international_Container;
                } else if (talk.type === 'poster' && talk.nationality === 'domestic') {
                    targetContainer = poster_domestic_Container;
                } else if (talk.type === 'seminer') {
                    targetContainer = seminer_Container;
                }

                if (targetContainer) {
                    const ol = targetContainer.querySelector('ol') || document.createElement('ol');
                    if (!targetContainer.contains(ol)) targetContainer.appendChild(ol);
                    ol.appendChild(li);
                }
            });
        })
        .catch(error => console.error('Error fetching talk data:', error));
});


